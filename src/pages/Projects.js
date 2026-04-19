import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_META = {
  idea:             { label: 'Idea',            bg: '#252525', color: '#888' },
  development:      { label: 'Development',      bg: '#EAF3DE', color: '#27500A' },
  pre_production:   { label: 'Pre-Production',   bg: '#FAEEDA', color: '#633806' },
  production:       { label: 'Production',       bg: '#E6F1FB', color: '#0C447C' },
  post_production:  { label: 'Post-Production',  bg: '#EEEDFE', color: '#3C3489' },
  complete:         { label: 'Complete',         bg: '#C9A84C22', color: '#C9A84C' },
}

const PROGRESS = { idea: 5, development: 25, pre_production: 45, production: 65, post_production: 85, complete: 100 }

export default function Projects({ onOpenProject }) {
  const { profile, can, isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', genre: '', format: 'Short Film', logline: '', status: 'idea' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  async function createProject() {
    if (!form.title.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('projects').insert({
      ...form, owner_id: profile.id
    }).select().single()
    if (!error && data) {
      setProjects(prev => [data, ...prev])
      setShowNew(false)
      setForm({ title: '', genre: '', format: 'Short Film', logline: '', status: 'idea' })
    }
    setSaving(false)
  }

  async function deleteProject(id) {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  async function updateStatus(id, status) {
    await supabase.from('projects').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  if (loading) return <div style={s.loading}>Loading projects...</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Projects</h1>
          <p style={s.sub}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {(can('projects.create') || isAdmin()) && (
          <button style={s.btnGold} onClick={() => setShowNew(true)}>+ New Project</button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={s.tabBar}>
        {['all', ...Object.keys(STATUS_META)].map(f => (
          <button key={f} style={{ ...s.tab, ...(filter === f ? s.tabOn : {}) }} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : STATUS_META[f].label}
          </button>
        ))}
      </div>

      {/* New project form */}
      {showNew && (
        <div style={s.formCard}>
          <h3 style={{ color: '#F0EBE0', fontSize: '0.9rem', marginBottom: '1rem' }}>New Project</h3>
          <div style={s.formGrid}>
            <div style={s.fg}>
              <label style={s.label}>Title *</label>
              <input style={s.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Project title" />
            </div>
            <div style={s.fg}>
              <label style={s.label}>Format</label>
              <select style={s.input} value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value }))}>
                {['Short Film', 'Feature Film', 'Documentary', 'Music Video', 'Web Series', 'Commercial'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div style={s.fg}>
              <label style={s.label}>Genre</label>
              <input style={s.input} value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))} placeholder="e.g. Drama, Comedy" />
            </div>
            <div style={s.fg}>
              <label style={s.label}>Stage</label>
              <select style={s.input} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div style={s.fg}>
            <label style={s.label}>Logline</label>
            <textarea style={{ ...s.input, minHeight: '70px', resize: 'vertical' }} value={form.logline}
              onChange={e => setForm(p => ({ ...p, logline: e.target.value }))}
              placeholder="One-sentence description of the story..." />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
            <button style={s.btnGold} onClick={createProject} disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</button>
            <button style={s.btnGhost} onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Project grid */}
      <div style={s.grid}>
        {filtered.map(project => {
          const st = STATUS_META[project.status] || STATUS_META.idea
          const prog = PROGRESS[project.status] || 5
          const isOwner = project.owner_id === profile.id
          return (
            <div key={project.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ width: 42, height: 42, background: '#252525', borderRadius: '6px', border: '0.5px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#C9A84C', fontWeight: 700 }}>
                  {project.title.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ background: st.bg, color: st.color, fontSize: '10px', padding: '2px 8px', borderRadius: '20px' }}>{st.label}</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#F0EBE0', marginBottom: '3px' }}>{project.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(240,235,224,0.4)', marginBottom: '6px' }}>
                {[project.format, project.genre].filter(Boolean).join(' · ')}
              </div>
              {project.logline && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.5)', lineHeight: 1.5, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.logline}
                </p>
              )}
              <div style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.35)', marginBottom: '6px' }}>Progress</div>
              <div style={{ height: 3, background: '#252525', borderRadius: '2px', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${prog}%`, background: '#C9A84C', borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button style={{ ...s.btnSm, flex: 1 }} onClick={() => onOpenProject && onOpenProject(project, 'script')}>Script</button>
                <button style={{ ...s.btnSm, flex: 1 }} onClick={() => onOpenProject && onOpenProject(project, 'shotlist')}>Shot List</button>
                <button style={{ ...s.btnSm, flex: 1 }} onClick={() => onOpenProject && onOpenProject(project, 'callsheet')}>Call Sheet</button>
              </div>
              {(isOwner || isAdmin()) && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <select style={{ flex: 1, background: '#1A1A1A', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,224,0.5)', fontSize: '0.72rem', borderRadius: '4px', padding: '4px 6px', fontFamily: 'inherit', cursor: 'pointer' }}
                    value={project.status} onChange={e => updateStatus(project.id, e.target.value)}>
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button style={{ ...s.btnGhost, padding: '4px 10px', fontSize: '0.72rem', color: '#E24B4A', borderColor: 'rgba(226,75,74,0.2)' }}
                    onClick={() => deleteProject(project.id)}>Delete</button>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'rgba(240,235,224,0.3)', fontSize: '0.85rem' }}>
            No projects yet. {can('projects.create') && <span style={{ color: '#C9A84C', cursor: 'pointer' }} onClick={() => setShowNew(true)}>Create your first one →</span>}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { padding: '1.5rem 1.75rem', color: '#F0EBE0' },
  loading: { padding: '2rem', color: '#C9A84C', textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  h1: { fontSize: '1.1rem', fontWeight: 500, margin: 0 },
  sub: { fontSize: '0.78rem', color: 'rgba(240,235,224,0.4)', marginTop: '3px' },
  tabBar: { display: 'flex', gap: '4px', marginBottom: '1.25rem', flexWrap: 'wrap' },
  tab: { padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', border: '0.5px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(240,235,224,0.5)' },
  tabOn: { background: '#C9A84C', color: '#0D0D0D', border: '0.5px solid #C9A84C' },
  formCard: { background: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.25)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' },
  fg: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.35)', marginBottom: '5px' },
  input: { background: '#252525', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.55rem 0.75rem', color: '#F0EBE0', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  card: { background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.1rem' },
  btnGold: { background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.45rem 1rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'transparent', color: 'rgba(240,235,224,0.5)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '0.45rem 1rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' },
  btnSm: { background: '#1E1E1E', color: 'rgba(240,235,224,0.6)', border: '0.5px solid rgba(255,255,255,0.08)', padding: '0.35rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' },
}
