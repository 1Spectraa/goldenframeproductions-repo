import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) setError(error.message)
      else navigate('/dashboard')
    } else {
      const { error } = await signUp(form.email, form.password, form.fullName)
      if (error) setError(error.message)
      else setError('Check your email to confirm your account, then log in.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0D0D0D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, background: '#C9A84C', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 700, color: '#0D0D0D',
            margin: '0 auto 1rem'
          }}>GF</div>
          <h1 style={{ fontFamily: 'serif', fontSize: '1.4rem', color: '#F0EBE0', margin: 0 }}>
            Golden Frame Productions
          </h1>
          <p style={{ color: 'rgba(240,235,224,0.4)', fontSize: '0.82rem', marginTop: '6px' }}>
            Member Portal · St. Kitts &amp; Nevis
          </p>
        </div>

        <div style={{
          background: '#161616', border: '0.5px solid rgba(201,168,76,0.2)',
          borderRadius: '12px', padding: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '4px', background: '#1E1E1E', borderRadius: '6px', padding: '3px', marginBottom: '1.5rem' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null) }} style={{
                flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none',
                background: mode === m ? '#252525' : 'transparent',
                color: mode === m ? '#F0EBE0' : 'rgba(240,235,224,0.4)',
                fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit'
              }}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} type="text" required
                  value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Your full name" />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" required
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" required
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'} />
            </div>

            {error && (
              <div style={{
                background: error.includes('Check your email') ? 'rgba(59,109,17,0.15)' : 'rgba(227,75,74,0.1)',
                border: `0.5px solid ${error.includes('Check your email') ? 'rgba(59,109,17,0.4)' : 'rgba(227,75,74,0.3)'}`,
                color: error.includes('Check your email') ? '#97C459' : '#F09595',
                padding: '0.6rem 0.9rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem'
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: '#C9A84C', color: '#0D0D0D',
              border: 'none', padding: '0.75rem', borderRadius: '6px',
              fontSize: '0.88rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'inherit'
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          {mode === 'signup' && (
            <p style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.3)', textAlign: 'center', marginTop: '1rem' }}>
              New accounts start as Community Members. An admin will review and upgrade your access.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '0.72rem', letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'rgba(240,235,224,0.4)', marginBottom: '6px'
}
const inputStyle = {
  width: '100%', background: '#252525', border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '6px', padding: '0.65rem 0.9rem', color: '#F0EBE0',
  fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
}
