import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LandingPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', membership: 'Active Member', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleJoin(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } }
    })
    if (error) { setError(error.message); setSubmitting(false); return }
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div style={{ background: '#0D0D0D', color: '#F0EBE0', fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2.5rem', background: 'rgba(13,13,13,0.95)', borderBottom: '0.5px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontFamily: 'serif', fontSize: '1rem', color: '#C9A84C', letterSpacing: '0.03em' }}>Golden Frame Productions</div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['About', 'Programs', 'Events', 'Join'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} style={{ color: 'rgba(240,235,224,0.65)', textDecoration: 'none', fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#C9A84C'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,235,224,0.65)'}>{link}</a>
          ))}
          <button onClick={() => navigate('/login')} style={{ background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.45rem 1.1rem', borderRadius: '3px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            Member Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'repeating-linear-gradient(90deg, #C9A84C 0, #C9A84C 18px, transparent 18px, transparent 30px)', opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.5rem' }}>St. Kitts &amp; Nevis · Est. 2025</p>
        <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', lineHeight: 1.05, marginBottom: '0.2em', color: '#fff', maxWidth: '900px' }}>
          Telling Our <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>Stories</em><br />in Golden Light
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'rgba(240,235,224,0.6)', maxWidth: '500px', margin: '1.5rem auto 2.5rem', fontWeight: 300, lineHeight: 1.7 }}>
          A film organization dedicated to nurturing Caribbean storytelling, filmmaking education, and a vibrant screen culture on the islands.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => document.getElementById('join').scrollIntoView({ behavior: 'smooth' })} style={{ background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.85rem 2rem', borderRadius: '2px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            Become a Member
          </button>
          <button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: '#F0EBE0', border: '1px solid rgba(240,235,224,0.25)', padding: '0.85rem 2rem', borderRadius: '2px', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Learn More
          </button>
        </div>
        <p style={{ marginTop: '5rem', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.25)' }}>↓ &nbsp; scroll to discover</p>
      </section>

      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)', maxWidth: '600px', margin: '0 auto' }} />

      {/* ABOUT */}
      <section id="about" style={{ padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Who We Are</p>
            <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.15, color: '#fff', marginBottom: '1.2rem' }}>Cinema Born From the Caribbean</h2>
            <p style={{ color: 'rgba(240,235,224,0.6)', fontSize: '1rem', lineHeight: 1.8, fontWeight: 300, marginBottom: '1.25rem' }}>
              Golden Frame Productions is St. Kitts &amp; Nevis's home for film. We bring together aspiring filmmakers, film lovers, and storytellers to learn, create, and celebrate the power of moving image — rooted in our Caribbean identity.
            </p>
            <p style={{ color: 'rgba(240,235,224,0.5)', fontSize: '0.9rem', lineHeight: 1.8, fontWeight: 300 }}>
              Whether you've never held a camera or you're already shooting short films on your phone, there's a place for you here. We start with what we have and grow together.
            </p>
            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
              {['Filmmaking', 'Appreciation', 'Community', 'Education'].map(tag => (
                <span key={tag} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', padding: '0.3rem 0.9rem', fontSize: '0.78rem', borderRadius: '30px' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ aspectRatio: '4/5', background: '#161616', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
            <div style={{ width: '75%', aspectRatio: '16/9', border: '1.5px solid rgba(201,168,76,0.3)', borderRadius: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontSize: '1.4rem', cursor: 'pointer' }}>▶</div>
            </div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)' }}>Your Story Deserves a Frame</p>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" style={{ padding: '6rem 2rem', background: '#111', borderTop: '0.5px solid rgba(201,168,76,0.08)', borderBottom: '0.5px solid rgba(201,168,76,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>What We Do</p>
          <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#fff', marginBottom: '3rem' }}>Three Pillars of Our Work</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '0.5px solid rgba(201,168,76,0.12)' }}>
            {[
              { num: '01', title: 'Film Education', body: 'Workshops, screenings, and hands-on sessions covering scriptwriting, camera work, editing, and storytelling fundamentals — accessible to all skill levels.' },
              { num: '02', title: 'Production Support', body: 'Collaborative resources for members working on short films and documentaries. Access to shared equipment, mentorship, and peer feedback.' },
              { num: '03', title: 'Community Screenings', body: 'Public film nights celebrating Caribbean and international cinema — building a culture of film appreciation across St. Kitts &amp; Nevis.' },
            ].map((p, i) => (
              <div key={p.num} style={{ padding: '2.5rem 2rem', borderRight: i < 2 ? '0.5px solid rgba(201,168,76,0.12)' : 'none' }}>
                <div style={{ fontFamily: 'serif', fontSize: '3rem', color: 'rgba(201,168,76,0.15)', lineHeight: 1, marginBottom: '1rem' }}>{p.num}</div>
                <h3 style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#fff', marginBottom: '0.75rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(240,235,224,0.5)', lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: p.body }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>What's On</p>
          <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#fff', marginBottom: '0.75rem' }}>Upcoming Events</h2>
          <p style={{ color: 'rgba(240,235,224,0.5)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>From founding meetings to public screenings — stay connected.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {[
              { day: '12', month: 'May', title: 'Founding Members Meeting', meta: 'Basseterre · 6:00 PM · In-person', type: 'Open' },
              { day: '26', month: 'May', title: 'Introduction to Smartphone Filmmaking', meta: 'Basseterre · 5:30 PM · Workshop', type: 'Open' },
              { day: '14', month: 'Jun', title: 'First Public Screening Night', meta: 'Basseterre · 7:00 PM · Caribbean Short Films', type: 'Open' },
              { day: '28', month: 'Jun', title: "Members Script Feedback Circle", meta: 'Location TBC · Members only', type: 'Members' },
            ].map(ev => (
              <div key={ev.title} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontFamily: 'serif', fontSize: '1.8rem', color: '#C9A84C', lineHeight: 1 }}>{ev.day}</span>
                  <span style={{ fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.35)' }}>{ev.month}</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#F0EBE0', fontWeight: 500, marginBottom: '3px' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(240,235,224,0.4)' }}>{ev.meta}</div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.08em', background: ev.type === 'Open' ? 'rgba(59,109,17,0.15)' : 'rgba(201,168,76,0.1)', color: ev.type === 'Open' ? '#97C459' : '#C9A84C', border: `0.5px solid ${ev.type === 'Open' ? 'rgba(59,109,17,0.3)' : 'rgba(201,168,76,0.25)'}`, whiteSpace: 'nowrap' }}>{ev.type}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: '#F0EBE0', border: '1px solid rgba(240,235,224,0.2)', padding: '0.75rem 1.75rem', borderRadius: '2px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Log in to RSVP →
            </button>
          </div>
        </div>
      </section>

      {/* JOIN */}
      <section id="join" style={{ padding: '6rem 2rem', background: '#111', borderTop: '0.5px solid rgba(201,168,76,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Membership</p>
            <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#fff', marginBottom: '1rem' }}>Be Part of the Frame</h2>
            <p style={{ color: 'rgba(240,235,224,0.55)', fontSize: '0.92rem', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 300 }}>
              Golden Frame Productions is built by the community, for the community. Join us as a founding member and help shape what this organization becomes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Community Member', desc: 'For anyone who loves film.', perks: ['Access to public events & screenings', 'Monthly newsletter', 'Community forum access'], featured: false },
                { name: 'Active Member', desc: 'For aspiring filmmakers ready to create.', perks: ['All community benefits', 'Workshop participation', 'Production tools access', 'Project collaboration & feedback', 'Vote on organization decisions'], featured: true },
              ].map(tier => (
                <div key={tier.name} style={{ padding: '1.25rem 1.5rem', border: `1px solid ${tier.featured ? '#C9A84C' : 'rgba(201,168,76,0.12)'}`, borderRadius: '2px', background: tier.featured ? 'rgba(201,168,76,0.04)' : 'transparent', position: 'relative' }}>
                  {tier.featured && <span style={{ position: 'absolute', top: -10, left: '1.25rem', background: '#C9A84C', color: '#0D0D0D', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 10px', borderRadius: '20px' }}>Founding</span>}
                  <div style={{ fontFamily: 'serif', fontSize: '1.05rem', color: '#fff', marginBottom: '0.4rem' }}>{tier.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(240,235,224,0.4)', marginBottom: '0.75rem' }}>{tier.desc}</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {tier.perks.map(p => (
                      <li key={p} style={{ fontSize: '0.8rem', color: 'rgba(240,235,224,0.6)', paddingLeft: '1rem', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#C9A84C', fontSize: '0.7rem' }}>—</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* SIGNUP FORM */}
          <div>
            {submitted ? (
              <div style={{ background: 'rgba(59,109,17,0.1)', border: '1px solid rgba(59,109,17,0.3)', borderRadius: '6px', padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'serif', fontSize: '2rem', color: '#C9A84C', marginBottom: '0.75rem' }}>✦</div>
                <div style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#F0EBE0', marginBottom: '0.5rem' }}>Application Received</div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(240,235,224,0.55)', lineHeight: 1.7 }}>
                  Check your email to confirm your account. Once confirmed, log in and an admin will activate your membership.
                </p>
                <button onClick={() => navigate('/login')} style={{ marginTop: '1.25rem', background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '3px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Go to Login →
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoin} style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.15)', borderRadius: '4px', padding: '2rem' }}>
                <h3 style={{ fontFamily: 'serif', fontSize: '1.1rem', color: '#F0EBE0', marginBottom: '1.25rem' }}>Create Your Account</h3>
                {[['full_name','Full Name','text','Your full name'],['email','Email Address','email','you@example.com'],['password','Password','password','Min. 8 characters']].map(([f, l, t, ph]) => (
                  <div key={f} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.35)', marginBottom: '6px' }}>{l}</label>
                    <input type={t} required placeholder={ph} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                      style={{ width: '100%', background: '#1E1E1E', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '3px', padding: '0.65rem 0.85rem', color: '#F0EBE0', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.35)', marginBottom: '6px' }}>Membership Type</label>
                  <select value={form.membership} onChange={e => setForm(p => ({ ...p, membership: e.target.value }))}
                    style={{ width: '100%', background: '#1E1E1E', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '3px', padding: '0.65rem 0.85rem', color: '#F0EBE0', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }}>
                    <option>Active Member</option>
                    <option>Community Member</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.35)', marginBottom: '6px' }}>Why do you want to join? (optional)</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us a bit about yourself and your interest in film..."
                    style={{ width: '100%', background: '#1E1E1E', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '3px', padding: '0.65rem 0.85rem', color: '#F0EBE0', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', minHeight: '90px', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                {error && <div style={{ background: 'rgba(226,75,74,0.1)', border: '0.5px solid rgba(226,75,74,0.3)', color: '#F09595', padding: '0.6rem 0.85rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</div>}
                <button type="submit" disabled={submitting} style={{ width: '100%', background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.85rem', borderRadius: '3px', fontSize: '0.9rem', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {submitting ? 'Creating account...' : 'Submit Application →'}
                </button>
                <p style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.25)', textAlign: 'center', marginTop: '0.75rem' }}>
                  Already a member? <span onClick={() => navigate('/login')} style={{ color: '#C9A84C', cursor: 'pointer' }}>Log in →</span>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '3.5rem 2rem 2rem', borderTop: '0.5px solid rgba(201,168,76,0.12)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ fontFamily: 'serif', fontSize: '1.1rem', color: '#C9A84C', marginBottom: '0.75rem' }}>Golden Frame Productions</div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(240,235,224,0.4)', lineHeight: 1.75, maxWidth: '280px' }}>A film organization rooted in St. Kitts &amp; Nevis, dedicated to celebrating and cultivating Caribbean storytelling through cinema.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Navigate</h4>
            {['About', 'Programs', 'Events', 'Join'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ display: 'block', color: 'rgba(240,235,224,0.4)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{l}</a>
            ))}
            <span onClick={() => navigate('/login')} style={{ display: 'block', color: '#C9A84C', fontSize: '0.85rem', marginTop: '0.5rem', cursor: 'pointer' }}>Member Login</span>
          </div>
          <div>
            <h4 style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Contact</h4>
            {['info@goldenframeproductions.com', 'Basseterre, St. Kitts', 'Instagram', 'Facebook'].map(c => (
              <div key={c} style={{ color: 'rgba(240,235,224,0.4)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '2rem', borderTop: '0.5px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'rgba(136,136,136,0.5)' }}>© 2025 Golden Frame Productions · St. Kitts &amp; Nevis</span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(201,168,76,0.3)', letterSpacing: '0.1em' }}>STORYTELLING FROM THE CARIBBEAN</span>
        </div>
      </footer>

    </div>
  )
}
