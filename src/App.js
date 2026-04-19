import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import RoleManager from './pages/RoleManager'
import Members from './pages/Members'
import Projects from './pages/Projects'
import ScriptEditor from './pages/ScriptEditor'
import ShotList from './pages/ShotList'
import CallSheet from './pages/CallSheet'
import Events from './pages/Events'
import Resources from './pages/Resources'

function Dashboard({ navigate }) {
  const { profile, role, can, isAdmin } = useAuth()
  const tools = [
    { label: 'Projects', desc: 'Your film projects', icon: '🎬', to: '/projects', show: can('projects.view') || isAdmin() },
    { label: 'Script Editor', desc: 'Write screenplays', icon: '📄', to: '/scripts', show: can('scripts.view') || isAdmin() },
    { label: 'Shot List', desc: 'Plan every shot', icon: '🎥', to: '/shotlist', show: can('tools.shot_list') || isAdmin() },
    { label: 'Call Sheet', desc: 'Production day docs', icon: '📋', to: '/callsheet', show: can('tools.call_sheet') || isAdmin() },
    { label: 'Events', desc: 'Screenings & workshops', icon: '📅', to: '/events', show: can('events.view') || isAdmin() },
    { label: 'Resources', desc: 'Guides & templates', icon: '📚', to: '/resources', show: can('resources.view') || isAdmin() },
    { label: 'Members', desc: 'Manage membership', icon: '👥', to: '/members', show: isAdmin() },
    { label: 'Role Manager', desc: 'Permissions & access', icon: '🔐', to: '/roles', show: isAdmin() },
  ].filter(t => t.show)

  return (
    <div style={{ padding: '1.5rem 1.75rem', color: '#F0EBE0' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 500, margin: 0 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0] || 'Member'}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'rgba(240,235,224,0.4)', marginTop: '4px' }}>
          Golden Frame Productions · {role?.name || 'Member'}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', gap: '10px' }}>
        {tools.map(tool => (
          <div key={tool.label} onClick={() => navigate(tool.to)}
            style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.1rem', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
            <div style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{tool.icon}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#F0EBE0' }}>{tool.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.35)', marginTop: '2px' }}>{tool.desc}</div>
          </div>
        ))}
      </div>
      {profile?.status === 'pending' && (
        <div style={{ marginTop: '1.5rem', background: 'rgba(201,168,76,0.07)', border: '0.5px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '1rem', fontSize: '0.82rem', color: 'rgba(201,168,76,0.7)' }}>
          Your account is pending approval. An admin will review and activate your access soon.
        </div>
      )}
    </div>
  )
}

function AppShell() {
  const { profile, role, can, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeProject, setActiveProject] = useState(null)

  async function handleSignOut() { await signOut(); navigate('/') }
  function openProject(project, tool) { setActiveProject(project); navigate(`/${tool}`) }

  const activeStyle = { color: '#C9A84C', borderLeftColor: '#C9A84C', background: 'rgba(201,168,76,0.08)' }
  const linkStyle = { display: 'block', padding: '0.5rem 1.2rem', fontSize: '0.83rem', color: 'rgba(240,235,224,0.55)', textDecoration: 'none', borderLeft: '2px solid transparent', transition: 'all 0.15s' }

  const navGroups = [
    { label: 'Workspace', items: [
      { to: '/dashboard', label: 'Dashboard', show: true },
      { to: '/projects', label: 'Projects', show: can('projects.view') || isAdmin() },
      { to: '/events', label: 'Events', show: can('events.view') || isAdmin() },
      { to: '/resources', label: 'Resources', show: can('resources.view') || isAdmin() },
    ]},
    { label: 'Production', items: [
      { to: '/scripts', label: 'Script Editor', show: can('scripts.view') || isAdmin() },
      { to: '/shotlist', label: 'Shot List', show: can('tools.shot_list') || isAdmin() },
      { to: '/callsheet', label: 'Call Sheet', show: can('tools.call_sheet') || isAdmin() },
    ]},
    { label: 'Admin', adminOnly: true, items: [
      { to: '/members', label: 'Members', show: can('members.view_directory') || isAdmin() },
      { to: '/roles', label: 'Role Manager', show: can('roles.view') || isAdmin() },
    ]},
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: '#111', borderRight: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>
        <div style={{ padding: '1.1rem 1.2rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 30, height: 30, background: '#C9A84C', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0D0D0D', flexShrink: 0 }}>GF</div>
          <div style={{ fontFamily: 'serif', fontSize: '0.78rem', color: '#C9A84C', lineHeight: 1.3 }}>Golden Frame<br />Productions</div>
        </div>

        {activeProject && (
          <div style={{ padding: '0.7rem 1.2rem', background: 'rgba(201,168,76,0.06)', borderBottom: '0.5px solid rgba(201,168,76,0.15)' }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: '2px' }}>Active Project</div>
            <div style={{ fontSize: '0.78rem', color: '#C9A84C', fontWeight: 500 }}>{activeProject.title}</div>
            <button onClick={() => setActiveProject(null)} style={{ fontSize: '0.62rem', color: 'rgba(240,235,224,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px', fontFamily: 'inherit' }}>Clear ×</button>
          </div>
        )}

        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {navGroups.map(group => {
            const visible = group.items.filter(i => i.show)
            if (!visible.length) return null
            if (group.adminOnly && !isAdmin()) return null
            return (
              <div key={group.label}>
                <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.22)', padding: '0.65rem 1.2rem 0.3rem' }}>{group.label}</div>
                {visible.map(item => (
                  <NavLink key={item.to} to={item.to} style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        <div style={{ padding: '0.9rem 1.2rem', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '0.5px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#C9A84C', fontWeight: 500 }}>
              {(profile?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#F0EBE0', lineHeight: 1.2 }}>{profile?.full_name}</div>
              <div style={{ fontSize: '0.65rem', color: role?.color || '#C9A84C' }}>{role?.name || 'Member'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => navigate('/')} style={{ flex: 1, background: 'transparent', border: '0.5px solid rgba(255,255,255,0.07)', color: 'rgba(240,235,224,0.3)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Home
            </button>
            <button onClick={handleSignOut} style={{ flex: 1, background: 'transparent', border: '0.5px solid rgba(255,255,255,0.07)', color: 'rgba(240,235,224,0.35)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main style={{ background: '#0D0D0D', overflow: 'auto' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard navigate={navigate} />} />
          <Route path="/projects" element={<ProtectedRoute permission="projects.view"><Projects onOpenProject={openProject} /></ProtectedRoute>} />
          <Route path="/scripts" element={<ProtectedRoute permission="scripts.view"><ScriptEditor project={activeProject} onSelectProject={p => { setActiveProject(p) }} /></ProtectedRoute>} />
          <Route path="/shotlist" element={<ProtectedRoute permission="tools.shot_list"><ShotList project={activeProject} onSelectProject={p => { setActiveProject(p) }} /></ProtectedRoute>} />
          <Route path="/callsheet" element={<ProtectedRoute permission="tools.call_sheet"><CallSheet project={activeProject} onSelectProject={p => { setActiveProject(p) }} /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute permission="events.view"><Events /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute permission="resources.view"><Resources onNavigate={navigate} /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute permission="members.view_directory"><Members /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute permission="roles.view"><RoleManager /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#0D0D0D', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
