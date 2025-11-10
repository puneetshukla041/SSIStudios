'use client'
import { useState, useEffect } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loggedIn = localStorage.getItem('ssi-authenticated') === 'true'
    setIsAuthenticated(loggedIn)
    setLoading(false)
  }, [])

  const login = () => {
    localStorage.setItem('ssi-authenticated', 'true')
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('ssi-authenticated')
    setIsAuthenticated(false)
  }

  return { isAuthenticated, loading, login, logout }
}
