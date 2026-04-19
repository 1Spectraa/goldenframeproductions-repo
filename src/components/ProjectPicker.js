import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProjectPicker({ toolName, onSelect }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
      setProjects(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const STATUS_COLORS = {
    idea: '#888', development: '#27500A', pre_production: '#633806',
    production: '#0C447C', post_production: '#3C3489', complete: '#C9A84C'
  }
  const STATUS_LABELS = {
    idea: 'Idea', development: 'Development', pre_production: 'Pre-Production',
    production: 'Production', post_production: 'Post-Production', complete: 'Complete'
  }

  return (
    <div style={{ padding: '2.5rem 1.75rem', color: '#F0EBE0' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.4rem' }}>
        Open a Project in {toolName}
      </h2>
      <p style={{ fontSize: '0.8rem', color: 'rgba(240,235,224,0.4)', marginBottom: '1.5rem' }}>
        Select a project below, or{' '}
        <span style={{ color: '#C9A84C', cursor: 'pointer' }} onClick={() => navigate('/projects')}>
          go to Projects to create one →
        </span>
      </p>

      {loading && <p style={{ color: 'rgba(240,235,224,0.3)', fontSize: '0.85rem' }}>Loading projects...</p>}

      {!loading && projects.length === 0 && (
        <div style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(240,235,224,0.3)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            You don't have any projects yet.
          </p>
          <button onClick={() => navigate('/projects')} style={{ background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            Create Your First Project
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
        {projects.map(project => (
          <div key={project.id} onClick={() => onSelect && onSelect(project)}
            style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.1rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <div style={{ width: 38, height: 38, background: '#252525', borderRadius: '6px', border: '0.5px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#C9A84C', fontWeight: 700 }}>
                {project.title.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#1E1E1E', color: STATUS_COLORS[project.status] || '#888' }}>
                {STATUS_LABELS[project.status] || project.status}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#F0EBE0', marginBottom: '3px' }}>{project.title}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.35)' }}>
              {[project.format, project.genre].filter(Boolean).join(' · ') || 'No details yet'}
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open in {toolName} →
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
