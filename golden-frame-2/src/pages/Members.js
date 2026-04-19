import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Members() {
  const { can, isAdmin } = useAuth()
  const [members, setMembers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: m }, { data: r }] = await Promise.all([
      supabase.from('profiles').select('*, roles(id, name, color)').order('joined_at'),
      supabase.from('roles').select('*').order('name')
    ])
    setMembers(m || [])
    setRoles(r || [])
    setLoading(false)
  }

  async function updateRole(memberId, roleId) {
    await supabase.from('profiles').update({ role_id: roleId }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId
      ? { ...m, role_id: roleId, roles: roles.find(r => r.id === roleId) }
      : m
    ))
    showToast('Role updated')
  }

  async function updateStatus(memberId, status) {
    await supabase.from('profiles').update({ status }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status } : m))
    showToast(`Member ${status}`)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = members.filter(m => filter === 'all' ? true : m.status === filter)

  const statusColors = {
    active: { bg: '#EAF3DE', color: '#27500A' },
    pending: { bg: '#FAEEDA', color: '#633806' },
    suspended: { bg: '#FCEBEB', color: '#791F1F' }
  }

  if (loading) return <div style={{ padding: '2rem', color: '#C9A84C' }}>Loading members...</div>

  return (
    <div style={{ padding: '1.5rem 1.75rem', color: '#F0EBE0' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 999,
          background: '#1E1E1E', border: '1px solid #C9A84C', color: '#C9A84C',
          padding: '0.6rem 1.2rem', borderRadius: '6px', fontSize: '0.82rem'
        }}>{toast}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>Members</h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.4)', marginTop: '4px' }}>
            {members.length} total · {members.filter(m => m.status === 'pending').length} pending
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'active', 'pending', 'suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.35rem 0.9rem', borderRadius: '4px', fontSize: '0.78rem',
              cursor: 'pointer', fontFamily: 'inherit', border: '0.5px solid rgba(255,255,255,0.1)',
              background: filter === f ? '#C9A84C' : 'transparent',
              color: filter === f ? '#0D0D0D' : 'rgba(240,235,224,0.55)'
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
              {['Member', 'Role', 'Status', 'Joined', isAdmin() ? 'Actions' : null]
                .filter(Boolean).map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.3)', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(member => {
              const sc = statusColors[member.status] || statusColors.pending
              return (
                <tr key={member.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(201,168,76,0.1)',
                        border: '0.5px solid rgba(201,168,76,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', color: '#C9A84C', fontWeight: 500, flexShrink: 0
                      }}>
                        {(member.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: '#F0EBE0' }}>{member.full_name || 'Unnamed'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {isAdmin() && can('roles.assign') ? (
                      <select
                        value={member.role_id || ''}
                        onChange={e => updateRole(member.id, e.target.value)}
                        style={{
                          background: '#252525', border: '0.5px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px', padding: '0.3rem 0.6rem', color: '#F0EBE0',
                          fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit'
                        }}
                      >
                        <option value="">No role</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.78rem', color: 'rgba(240,235,224,0.6)'
                      }}>
                        {member.roles && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: member.roles.color, display: 'inline-block' }} />
                        )}
                        {member.roles?.name || 'No role'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      background: sc.bg, color: sc.color,
                      padding: '2px 8px', borderRadius: '20px', fontSize: '11px'
                    }}>{member.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'rgba(240,235,224,0.4)', fontSize: '0.75rem' }}>
                    {member.joined_at ? new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  {isAdmin() && (
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {member.status === 'pending' && can('members.approve') && (
                          <button onClick={() => updateStatus(member.id, 'active')} style={{
                            background: '#EAF3DE', color: '#27500A', border: 'none',
                            padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer'
                          }}>Approve</button>
                        )}
                        {member.status === 'active' && can('members.suspend') && (
                          <button onClick={() => updateStatus(member.id, 'suspended')} style={{
                            background: 'transparent', color: 'rgba(240,235,224,0.4)',
                            border: '0.5px solid rgba(255,255,255,0.1)',
                            padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer'
                          }}>Suspend</button>
                        )}
                        {member.status === 'suspended' && can('members.approve') && (
                          <button onClick={() => updateStatus(member.id, 'active')} style={{
                            background: '#E6F1FB', color: '#0C447C', border: 'none',
                            padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer'
                          }}>Reinstate</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(240,235,224,0.3)', fontSize: '0.85rem' }}>No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
