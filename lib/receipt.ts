import type { BillWithTenant, AppSettings } from '../types'

interface ReceiptData {
  bill: BillWithTenant
  unitNumber: string
  settings: AppSettings
  includeInternet: boolean
}

export function generateReceiptHTML({ bill, unitNumber, settings, includeInternet }: ReceiptData): string {
  const waterUsage = (bill.water_previous != null && bill.water_current != null)
    ? bill.water_current - bill.water_previous : null
  const elecUsage = (bill.electricity_previous != null && bill.electricity_current != null)
    ? bill.electricity_current - bill.electricity_previous : null
  const waterCharge   = waterUsage != null ? (waterUsage * settings.water_rate).toFixed(2) : null
  const elecCharge    = elecUsage  != null ? (elecUsage  * settings.electricity_rate).toFixed(2) : null
  const internetCharge = includeInternet ? settings.internet_rate.toFixed(2) : null

  const readingDays = (() => {
    const s = new Date(bill.period_start), e = new Date(bill.period_end)
    return Math.round((e.getTime() - s.getTime()) / 86400000) + 1
  })()

  const utilityTotal = parseFloat(waterCharge ?? '0') + parseFloat(elecCharge ?? '0') + parseFloat(internetCharge ?? '0')
  const rentAmount = (bill.amount - utilityTotal).toFixed(2)

  const breakdownSection = (waterCharge != null && elecCharge != null) ? `
    <div class="section-title">Meter Reading Dates</div>
    <div class="row"><span>Previous Reading:</span><span>${bill.period_start}</span></div>
    <div class="row"><span>Current Reading:</span><span>${bill.period_end}</span></div>
    <div class="row"><span>Reading Period:</span><span>${readingDays} days</span></div>
    <hr/>
    <div class="section-title">Breakdown</div>
    <div class="row"><span>Rent</span><span>PHP ${rentAmount}</span></div>
    <div class="subsection-title">Water (PHP ${settings.water_rate}/cu.m)</div>
    <div class="indent">Previous: ${bill.water_previous} &nbsp; Current: ${bill.water_current}</div>
    <div class="row indent-row"><span>Usage: ${waterUsage} cu.m</span><span>PHP ${waterCharge}</span></div>
    <div class="subsection-title">Electricity (PHP ${settings.electricity_rate}/kWh)</div>
    <div class="indent">Previous: ${bill.electricity_previous} &nbsp; Current: ${bill.electricity_current}</div>
    <div class="row indent-row"><span>Usage: ${elecUsage} kWh</span><span>PHP ${elecCharge}</span></div>
    <div class="row"><span>Internet</span><span>${internetCharge ? 'PHP ' + internetCharge : 'Free'}</span></div>
  ` : `
    <div class="section-title">Breakdown</div>
    <div class="row"><span>Rent</span><span>PHP ${bill.amount.toFixed(2)}</span></div>
    <div class="row"><span>Internet</span><span>${internetCharge ? 'PHP ' + internetCharge : 'Free'}</span></div>
  `

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Arial, sans-serif; font-size:14px; color:#111; padding:40px; max-width:600px; margin:auto; }
  h1   { text-align:center; font-size:22px; letter-spacing:2px; margin-bottom:4px; }
  .sub { text-align:center; color:#555; font-size:13px; margin-bottom:24px; }
  .row { display:flex; justify-content:space-between; margin:4px 0; }
  .section-title  { font-weight:bold; margin-top:16px; margin-bottom:8px; }
  .subsection-title { font-weight:bold; margin-top:12px; margin-bottom:4px; }
  .indent { margin-left:16px; color:#444; }
  .indent-row { margin-left:16px; display:flex; justify-content:space-between; }
  hr { border:none; border-top:1px solid #ccc; margin:16px 0; }
  .total { display:flex; justify-content:space-between; font-weight:bold; font-size:16px; margin-top:8px; }
</style>
</head>
<body>
  <h1>BILLING STATEMENT</h1>
  <p class="sub">${settings.apartment_name}${settings.owner_name ? ' · ' + settings.owner_name : ''}</p>
  <div class="row"><span>Date:</span><span>${bill.period_end}</span></div>
  <div class="row"><span>Rentee:</span><span>${bill.tenant.full_name}</span></div>
  <div class="row"><span>Unit:</span><span>${unitNumber}</span></div>
  <div class="row"><span>Billing Period:</span><span>${bill.period_start} ~ ${bill.period_end}</span></div>
  <hr/>
  ${breakdownSection}
  <hr/>
  <div class="total"><span>Total</span><span>PHP ${bill.amount.toFixed(2)}</span></div>
</body>
</html>`
}
