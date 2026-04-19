import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import RoleManager from './pages/RoleManager'
import Members from './pages/Members'

function Dashboard() {
  const { profile, role, can } = useAuth()
  return (
    <div style={{ padding: '1.5rem 1.75rem', color: '#F0EBE0' }}>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.25rem' }}>
        Welcome, {profile?.full_name?.split(' ')[0] || 'Member'}
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'rgba(240,235,224,0.4)', marginBottom: '1.5rem' }}>
        Golden Frame Productions · {role?.name || 'No role assigned'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '10px' }}>
        {[
          can('projects.view') && { label: 'My Projects', desc: 'Film projects', icon: '🎬' },
          can('tools.call_sheet') && { label: 'Call Sheets', desc: 'Production docs', icon: '📋' },
          can('tools.shot_list') && { label: 'Shot Lists', desc: 'Shot planning', icon: '🎥' },
          can('scripts.view') && { label: 'Scripts', desc: 'Screenplay editor', icon: '📄' },
          can('events.view') && { label: 'Events', desc: 'Screenings & workshops', icon: '📅' },
          can('resources.view') && { label: 'Resources', desc: 'Guides & templates', icon: '📚' },
        ].filter(Boolean).map(item => (
          <div key={item.label} style={{
            background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: '10px', padding: '1rem', cursor: 'pointer'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#F0EBE0' }}>{item.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.4)', marginTop: '2px' }}>{item.desc}</div>
          </div>
        ))}
      </div>
      {profile?.status === 'pending' && (
        <div style={{
          marginTop: '1.5rem', background: 'rgba(201,168,76,0.08)',
          border: '0.5px solid rgba(201,168,76,0.25)', borderRadius: '8px',
          padding: '1rem', fontSize: '0.82rem', color: 'rgba(201,168,76,0.8)'
        }}>
          Your account is pending approval by an admin. Some features may be limited until then.
        </div>
      )}
    </div>
  )
}

function Placeholder({ title }) {
  return <div style={{ padding: '2rem', color: '#F0EBE0', fontSize: '0.9rem' }}>
    <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>{title}</h2>
    <p style={{ color: 'rgba(240,235,224,0.4)', marginTop: '0.5rem', fontSize: '0.82rem' }}>
      This section is ready to be built out. Connect your Supabase backend to see live data.
    </p>
  </div>
}

function AppShell() {
  const { profile, role, can, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', always: true },
    { to: '/projects', label: 'Projects', perm: 'projects.view' },
    { to: '/scripts', label: 'Script Editor', perm: 'scripts.view' },
    { to: '/callsheets', label: 'Call Sheets', perm: 'tools.call_sheet' },
    { to: '/shotlists', label: 'Shot Lists', perm: 'tools.shot_list' },
    { to: '/events', label: 'Events', perm: 'events.view' },
    { to: '/resources', label: 'Resources', perm: 'resources.view' },
  ].filter(item => item.always || can(item.perm) || isAdmin())

  const adminItems = [
    { to: '/members', label: 'Members', perm: 'members.view_directory' },
    { to: '/roles', label: 'Role Manager', perm: 'roles.view' },
  ].filter(item => can(item.perm) || isAdmin())

  const activeStyle = { color: '#C9A84C', borderLeftColor: '#C9A84C', background: 'rgba(201,168,76,0.08)' }
  const linkStyle = {
    display: 'block', padding: '0.5rem 1.2rem', fontSize: '0.83rem',
    color: 'rgba(240,235,224,0.6)', textDecoration: 'none',
    borderLeft: '2px solid transparent', transition: 'all 0.15s'
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: '#111', borderRight: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.1rem 1.2rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 30, height: 30, background: '#C9A84C', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0D0D0D', flexShrink: 0 }}>GF</div>
          <div style={{ fontFamily: 'serif', fontSize: '0.78rem', color: '#C9A84C', lineHeight: 1.3 }}>Golden Frame<br/>Productions</div>
        </div>

        <nav style={{ padding: '0.75rem 0', flex: 1 }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.25)', padding: '0 1.2rem', marginBottom: '0.3rem' }}>Workspace</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
              {item.label}
            </NavLink>
          ))}

          {adminItems.length > 0 && (
            <>
              <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.25)', padding: '0.75rem 1.2rem 0.3rem' }}>Admin</div>
              {adminItems.map(item => (
                <NavLink key={item.to} to={item.to} style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div style={{ padding: '0.9rem 1.2rem', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '0.5px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#C9A84C', fontWeight: 500 }}>
              {(profile?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#F0EBE0', lineHeight: 1.2 }}>{profile?.full_name?.split(' ')[0]}</div>
              <div style={{ fontSize: '0.68rem', color: role?.color || '#C9A84C' }}>{role?.name || 'Member'}</div>
            </div>
          </div>
          <button onClick={handleSignOut} style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,224,0.4)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign Out
          </button>
        </div>
      </aside>

      <main style={{ background: '#0D0D0D', overflow: 'auto' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProtectedRoute permission="projects.view"><Placeholder title="Projects" /></ProtectedRoute>} />
          <Route path="/scripts" element={<ProtectedRoute permission="scripts.view"><Placeholder title="Script Editor" /></ProtectedRoute>} />
          <Route path="/callsheets" element={<ProtectedRoute permission="tools.call_sheet"><Placeholder title="Call Sheets" /></ProtectedRoute>} />
          <Route path="/shotlists" element={<ProtectedRoute permission="tools.shot_list"><Placeholder title="Shot Lists" /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute permission="events.view"><Placeholder title="Events" /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute permission="resources.view"><Placeholder title="Resources" /></ProtectedRoute>} />
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
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
