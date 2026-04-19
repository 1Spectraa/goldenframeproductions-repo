import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [permissions, setPermissions] = useState(new Set())
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else {
        setProfile(null)
        setPermissions(new Set())
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    setLoading(true)
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select(`*, roles(id, name, color, is_system)`)
        .eq('id', userId)
        .single()

      if (prof) {
        setProfile(prof)
        setRole(prof.roles)
        await loadPermissions(prof.roles?.id)
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadPermissions(roleId) {
    if (!roleId) { setPermissions(new Set()); return }
    const { data } = await supabase
      .from('role_permissions')
      .select('permissions(key)')
      .eq('role_id', roleId)

    const keys = (data || []).map(rp => rp.permissions?.key).filter(Boolean)
    setPermissions(new Set(keys))
  }

  function can(permKey) {
    return permissions.has(permKey)
  }

  function isAdmin() {
    return role?.name === 'Founder' || role?.name === 'Admin'
  }

  function isFounder() {
    return role?.name === 'Founder'
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signUp(email, password, fullName) {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (session?.user?.id) await loadProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{
      session, profile, role, permissions, loading,
      can, isAdmin, isFounder,
      signIn, signUp, signOut, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
