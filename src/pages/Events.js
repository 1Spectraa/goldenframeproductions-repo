import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Events() {
  const { profile, can, isAdmin } = useAuth()
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '', event_type: 'public' })
  const [tab, setTab] = useState('upcoming')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: ev }, { data: rv }] = await Promise.all([
      supabase.from('events').select('*, profiles(full_name)').order('event_date'),
      supabase.from('event_rsvps').select('*').eq('profile_id', profile.id)
    ])
    setEvents(ev || [])
    const map = {}
    ;(rv || []).forEach(r => { map[r.event_id] = r.status })
    setRsvps(map)
    setLoading(false)
  }

  async function rsvp(eventId, status) {
    const existing = rsvps[eventId]
    if (existing === status) {
      await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('profile_id', profile.id)
      setRsvps(prev => { const n = { ...prev }; delete n[eventId]; return n })
    } else {
      await supabase.from('event_rsvps').upsert({ event_id: eventId, profile_id: profile.id, status })
      setRsvps(prev => ({ ...prev, [eventId]: status }))
    }
  }

  async function createEvent() {
    if (!form.title.trim()) return
    const { data } = await supabase.from('events').insert({ ...form, created_by: profile.id }).select('*, profiles(full_name)').single()
    if (data) { setEvents(prev => [...prev, data].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))); setShowNew(false); setForm({ title: '', description: '', event_date: '', location: '', event_type: 'public' }) }
  }

  async function deleteEvent(id) {
    if (!window.confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const now = new Date()
  const filtered = events.filter(e => {
    const d = new Date(e.event_date)
    if (tab === 'upcoming') return d >= now
    if (tab === 'past') return d < now
    if (tab === 'mine') return rsvps[e.id]
    return true
  })

  const typeColors = { public: { bg: '#EAF3DE', color: '#27500A' }, members: { bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' }, active_members: { bg: '#E6F1FB', color: '#0C447C' } }
  const typeLabels = { public: 'Open to All', members: 'Members Only', active_members: 'Active Members' }

  if (loading) return <div style={{ padding: '2rem', color: '#C9A84C' }}>Loading events...</div>

  return (
    <div style={{ padding: '1.5rem 1.75rem', color: '#F0EBE0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>Events</h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.4)', marginTop: '3px' }}>Screenings, workshops & meetings</p>
        </div>
        {(can('events.create') || isAdmin()) && (
          <button onClick={() => setShowNew(true)} style={btnGold}>+ New Event</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem' }}>
        {['upcoming', 'past', 'mine', 'all'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem',
            cursor: 'pointer', fontFamily: 'inherit', border: '0.5px solid rgba(255,255,255,0.08)',
            background: tab === t ? '#C9A84C' : 'transparent',
            color: tab === t ? '#0D0D0D' : 'rgba(240,235,224,0.5)'
          }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {showNew && (
        <div style={{ background: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.25)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.88rem', color: '#F0EBE0', marginBottom: '1rem' }}>New Event</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {[['title','Title'],['location','Location']].map(([f,l]) => (
              <div key={f}>
                <div style={lbl}>{l}</div>
                <input style={inp} value={form[f]} onChange={e => setForm(p => ({...p,[f]:e.target.value}))} />
              </div>
            ))}
            <div>
              <div style={lbl}>Date & Time</div>
              <input type="datetime-local" style={inp} value={form.event_date} onChange={e => setForm(p => ({...p,event_date:e.target.value}))} />
            </div>
            <div>
              <div style={lbl}>Access</div>
              <select style={inp} value={form.event_type} onChange={e => setForm(p => ({...p,event_type:e.target.value}))}>
                <option value="public">Open to All</option>
                <option value="members">Members Only</option>
                <option value="active_members">Active Members Only</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={lbl}>Description</div>
            <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({...p,description:e.target.value}))} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={createEvent} style={btnGold}>Create Event</button>
            <button onClick={() => setShowNew(false)} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(event => {
          const tc = typeColors[event.event_type] || typeColors.public
          const myRsvp = rsvps[event.id]
          const d = event.event_date ? new Date(event.event_date) : null
          const isPast = d && d < now
          return (
            <div key={event.id} style={{ background: '#161616', border: `0.5px solid ${myRsvp === 'going' ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '1.1rem', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '1rem', alignItems: 'center', opacity: isPast ? 0.6 : 1 }}>
              <div style={{ textAlign: 'center' }}>
                {d ? (
                  <>
                    <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#C9A84C', lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(240,235,224,0.35)' }}>{d.toLocaleString('default', { month: 'short' })}</div>
                  </>
                ) : <span style={{ color: 'rgba(240,235,224,0.25)', fontSize: '0.72rem' }}>TBD</span>}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 500, color: '#F0EBE0' }}>{event.title}</span>
                  <span style={{ background: tc.bg, color: tc.color, fontSize: '9px', padding: '1px 7px', borderRadius: '20px' }}>{typeLabels[event.event_type]}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240,235,224,0.4)', marginBottom: '4px' }}>
                  {[event.location, d?.toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })].filter(Boolean).join(' · ')}
                </div>
                {event.description && <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.45)', lineHeight: 1.5 }}>{event.description}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                {!isPast && (can('events.rsvp') || isAdmin()) && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['going','maybe','not_going'].map(s => (
                      <button key={s} onClick={() => rsvp(event.id, s)} style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem',
                        cursor: 'pointer', fontFamily: 'inherit',
                        background: myRsvp === s ? '#C9A84C' : 'transparent',
                        color: myRsvp === s ? '#0D0D0D' : 'rgba(240,235,224,0.45)',
                        border: `0.5px solid ${myRsvp === s ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`,
                        fontWeight: myRsvp === s ? 500 : 400
                      }}>{s === 'going' ? 'Going' : s === 'maybe' ? 'Maybe' : 'Can\'t go'}</button>
                    ))}
                  </div>
                )}
                {(isAdmin() || event.created_by === profile.id) && (
                  <button onClick={() => deleteEvent(event.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(226,75,74,0.4)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>Delete</button>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,235,224,0.25)', fontSize: '0.85rem' }}>No events in this view.</div>
        )}
      </div>
    </div>
  )
}

const btnGold = { background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.45rem 1rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhost = { background: 'transparent', color: 'rgba(240,235,224,0.5)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '0.45rem 1rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }
const lbl = { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.35)', marginBottom: '5px' }
const inp = { width: '100%', background: '#252525', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.5rem 0.7rem', color: '#F0EBE0', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }
