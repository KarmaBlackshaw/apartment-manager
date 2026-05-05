import React, { createContext, useContext, useState } from 'react'

interface TenantSearchContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const TenantSearchContext = createContext<TenantSearchContextType | null>(null)

export function TenantSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <TenantSearchContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </TenantSearchContext.Provider>
  )
}

export function useTenantSearch(): TenantSearchContextType {
  const ctx = useContext(TenantSearchContext)
  if (!ctx) throw new Error('useTenantSearch must be used within TenantSearchProvider')
  return ctx
}
