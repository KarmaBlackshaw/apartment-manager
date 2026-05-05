import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeDatabase } from '../db'

interface DatabaseContextValue {
  ready: boolean
  error: string | null
}

const DatabaseContext = createContext<DatabaseContextValue>({ ready: false, error: null })

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.resolve(initializeDatabase())
        setReady(true)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Database initialization failed'
        console.error('DB init failed:', e)
        setError(msg)
      }
    }
    init()
  }, [])

  return (
    <DatabaseContext.Provider value={{ ready, error }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  return useContext(DatabaseContext)
}
