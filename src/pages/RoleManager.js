import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const GOLD = '#C9A84C'
const CATEGORY_COLORS = {
  Projects: '#185FA5', Scripts: '#3B6D11', Tools: '#BA7517',
  Events: '#0F6E56', Members: '#993556', Admin: '#534AB7', Resources: '#5F5E5A'
}

export default function RoleManager() {
  const { isFounder } = useAuth()
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [rolePerms, setRolePerms] = useState({})
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showNewRole, setShowNewRole] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '', color: '#C9A84C' })
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: r }, { data: p }, { data: rp }] = await Promise.all([
      supabase.from('roles').select('*').order('created_at'),
      supabase.from('permissions').select('*').order('category,label'),
      supabase.from('role_permissions').select('role_id, permission_id')
    ])
    setRoles(r || [])
    setPermissions(p || [])
    const map = {}
    ;(rp || []).forEach(({ role_id, permission_id }) => {
      if (!map[role_id]) map[role_id] = new Set()
      map[role_id].add(permission_id)
    })
    setRolePerms(map)
    if (r?.length && !selectedRole) setSelectedRole(r[0])
    setLoading(false)
  }

  function hasPerm(roleId, permId) {
    return rolePerms[roleId]?.has(permId) || false
  }

  async function togglePerm(permId) {
    if (!selectedRole) return
    const has = hasPerm(selectedRole.id, permId)
    setRolePerms(prev => {
      const next = { ...prev }
      if (!next[selectedRole.id]) next[selectedRole.id] = new Set()
      else next[selectedRole.id] = new Set(prev[selectedRole.id])
      has ? next[selectedRole.id].delete(permId) : next[selectedRole.id].add(permId)
      return next
    })
  }

  async function savePermissions() {
    if (!selectedRole) return
    setSaving(true)
    const permIds = Array.from(rolePerms[selectedRole.id] || [])
    await supabase.from('role_permissions').delete().eq('role_id', selectedRole.id)
    if (permIds.length) {
      await supabase.from('role_permissions').insert(
        permIds.map(pid => ({ role_id: selectedRole.id, permission_id: pid }))
      )
    }
    showToast('Permissions saved!')
    setSaving(false)
  }

  async function createRole() {
    if (!newRole.name.trim()) return
    const { data, error } = await supabase.from('roles').insert({
      name: newRole.name.trim(),
      description: newRole.description,
      color: newRole.color,
      is_system: false
    }).select().single()
    if (!error && data) {
      setRoles(prev => [...prev, data])
      setRolePerms(prev => ({ ...prev, [data.id]: new Set() }))
      setSelectedRole(data)
      setShowNewRole(false)
      setNewRole({ name: '', description: '', color: '#C9A84C' })
      showToast('Role created!')
    }
  }

  async function deleteRole(role) {
    if (role.is_system) return
    if (!window.confirm(`Delete role "${role.name}"? Members with this role will lose access.`)) return
    await supabase.from('roles').delete().eq('id', role.id)
    setRoles(prev => prev.filter(r => r.id !== role.id))
    if (selectedRole?.id === role.id) setSelectedRole(roles.find(r => r.id !== role.id) || null)
    showToast('Role deleted.')
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const grouped = permissions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  if (loading) return <div style={styles.loading}>Loading roles...</div>

  return (
    <div style={styles.page}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Role Manager</h1>
          <p style={styles.sub}>Create roles and control exactly what each role can access.</p>
        </div>
        {isFounder() && (
          <button style={styles.btnGold} onClick={() => setShowNewRole(true)}>+ New Role</button>
        )}
      </div>

      {showNewRole && (
        <div style={styles.newRoleCard}>
          <h3 style={{ color: '#F0EBE0', marginBottom: '1rem', fontSize: '0.95rem' }}>Create New Role</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role Name</label>
              <input style={styles.input} value={newRole.name}
                onChange={e => setNewRole(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Workshop Leader" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <input type="color" style={{ ...styles.input, height: '38px', padding: '2px 6px', width: '80px' }}
                value={newRole.color}
                onChange={e => setNewRole(p => ({ ...p, color: e.target.value }))} />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <input style={styles.input} value={newRole.description}
              onChange={e => setNewRole(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of this role's purpose" />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
            <button style={styles.btnGold} onClick={createRole}>Create Role</button>
            <button style={styles.btnGhost} onClick={() => setShowNewRole(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={styles.layout}>
        {/* ROLE LIST */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarLabel}>Roles ({roles.length})</div>
          {roles.map(role => (
            <div key={role.id}
              style={{
                ...styles.roleItem,
                ...(selectedRole?.id === role.id ? styles.roleItemActive : {})
              }}
              onClick={() => setSelectedRole(role)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: selectedRole?.id === role.id ? GOLD : '#F0EBE0' }}>
                  {role.name}
                </span>
                {role.is_system && (
                  <span style={styles.sysBadge}>system</span>
                )}
              </div>
              {isFounder() && !role.is_system && (
                <button style={styles.delBtn} onClick={e => { e.stopPropagation(); deleteRole(role) }}>×</button>
              )}
            </div>
          ))}
        </div>

        {/* PERMISSION MATRIX */}
        {selectedRole && (
          <div style={styles.permPanel}>
            <div style={styles.permHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: selectedRole.color }} />
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: '#F0EBE0' }}>{selectedRole.name}</span>
                  {selectedRole.is_system && <span style={styles.sysBadge}>system role</span>}
                </div>
                {selectedRole.description && (
                  <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.45)', marginTop: '4px' }}>
                    {selectedRole.description}
                  </p>
                )}
              </div>
              <button
                style={saving ? styles.btnGold : styles.btnGold}
                onClick={savePermissions}
                disabled={saving || selectedRole.is_system}
              >
                {saving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>

            {selectedRole.is_system && selectedRole.name === 'Founder' && (
              <div style={styles.infoBox}>
                Founders have all permissions by default and cannot be restricted.
              </div>
            )}

            {Object.entries(grouped).map(([category, perms]) => (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <div style={styles.categoryLabel}>
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: CATEGORY_COLORS[category] || '#888', marginRight: '8px'
                  }} />
                  {category}
                </div>
                <div style={styles.permGrid}>
                  {perms.map(perm => {
                    const checked = hasPerm(selectedRole.id, perm.id)
                    const disabled = selectedRole.is_system && selectedRole.name === 'Founder'
                    return (
                      <div key={perm.id}
                        style={{
                          ...styles.permItem,
                          ...(checked ? styles.permItemOn : {}),
                          ...(disabled ? { opacity: 0.5, cursor: 'default' } : { cursor: 'pointer' })
                        }}
                        onClick={() => !disabled && togglePerm(perm.id)}
                      >
                        <div style={styles.permCheck}>
                          {checked && <span style={{ color: GOLD, fontSize: '12px' }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', color: checked ? '#F0EBE0' : 'rgba(240,235,224,0.55)', fontWeight: checked ? 500 : 400 }}>
                            {perm.label}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(240,235,224,0.3)', marginTop: '2px' }}>
                            {perm.description}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '1.5rem 1.75rem', color: '#F0EBE0', fontFamily: 'inherit', position: 'relative' },
  loading: { padding: '2rem', color: '#C9A84C', textAlign: 'center' },
  toast: {
    position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 999,
    background: '#1E1E1E', border: '1px solid #C9A84C', color: '#C9A84C',
    padding: '0.6rem 1.2rem', borderRadius: '6px', fontSize: '0.82rem'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  h1: { fontSize: '1.1rem', fontWeight: 500, color: '#F0EBE0', margin: 0 },
  sub: { fontSize: '0.78rem', color: 'rgba(240,235,224,0.45)', marginTop: '4px' },
  btnGold: {
    background: '#C9A84C', color: '#0D0D0D', border: 'none',
    padding: '0.45rem 1rem', borderRadius: '4px', fontSize: '0.8rem',
    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
  },
  btnGhost: {
    background: 'transparent', color: 'rgba(240,235,224,0.55)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    padding: '0.45rem 1rem', borderRadius: '4px', fontSize: '0.8rem',
    cursor: 'pointer', fontFamily: 'inherit'
  },
  newRoleCard: {
    background: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.3)',
    borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem'
  },
  formRow: { display: 'flex', gap: '1rem' },
  formGroup: { flex: 1, marginBottom: '0.75rem' },
  label: { display: 'block', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.4)', marginBottom: '6px' },
  input: {
    width: '100%', background: '#252525', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '4px', padding: '0.55rem 0.8rem', color: '#F0EBE0',
    fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none'
  },
  layout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem', alignItems: 'start' },
  sidebar: { background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' },
  sidebarLabel: { fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.3)', padding: '0.75rem 1rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)' },
  roleItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', cursor: 'pointer', borderBottom: '0.5px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
  roleItemActive: { background: 'rgba(201,168,76,0.1)' },
  sysBadge: { fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: 'rgba(240,235,224,0.35)', letterSpacing: '0.05em' },
  delBtn: { background: 'transparent', border: 'none', color: 'rgba(240,235,224,0.25)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1, padding: '0 2px' },
  permPanel: { background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.25rem' },
  permHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)' },
  infoBox: { background: 'rgba(201,168,76,0.08)', border: '0.5px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'rgba(201,168,76,0.8)', marginBottom: '1rem' },
  categoryLabel: { fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.35)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' },
  permGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '6px' },
  permItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '0.5px solid rgba(255,255,255,0.06)', background: '#1A1A1A', transition: 'border-color 0.15s, background 0.15s' },
  permItemOn: { background: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.3)' },
  permCheck: { width: 16, height: 16, borderRadius: '3px', border: '0.5px solid rgba(255,255,255,0.15)', background: '#252525', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' },
}
