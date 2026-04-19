import { useState } from 'react'

const RESOURCES = {
  templates: [
    { title: 'Screenplay Template (Short Film)', desc: 'Properly formatted short film screenplay ready to fill in.', icon: '📄', action: 'Open Script Editor', color: '#FAEEDA', link: 'script' },
    { title: 'Call Sheet Template', desc: 'Full production day call sheet with crew, schedule, and equipment.', icon: '📋', action: 'Open Call Sheet', color: '#E6F1FB', link: 'callsheet' },
    { title: 'Shot List Template', desc: 'Standard shot list with type, angle, movement, and time estimates.', icon: '🎥', action: 'Open Shot List', color: '#EAF3DE', link: 'shotlist' },
    { title: 'Micro-Budget Planner', desc: 'Simple budget tracker for no-budget and micro-budget short films.', icon: '💰', action: 'Download CSV', color: '#EEEDFE', download: true },
    { title: 'Script Coverage Template', desc: "Standard coverage form for giving feedback on others' scripts.", icon: '📝', action: 'Download PDF', color: '#E1F5EE', download: true },
    { title: 'Production Schedule', desc: 'Day-by-day pre-production schedule template.', icon: '📅', action: 'Download CSV', color: '#FAEEDA', download: true },
  ],
  guides: [
    { title: "Beginner's Guide to Screenplay Format", desc: 'How to properly format scene headings, action lines, dialogue and transitions. Includes examples from Caribbean-set films.', icon: '🎬', read: '8 min read', tags: ['Writing', 'Beginner'] },
    { title: 'Shot Types & Camera Angles', desc: 'Visual guide to WS, MS, CU, ECU, OTS, POV and more — with practical examples for shooting on smartphones.', icon: '📷', read: '6 min read', tags: ['Camera', 'Beginner'] },
    { title: 'Recording Clean Audio on a Budget', desc: 'How to capture usable sound with minimal equipment. Covers lavaliers, boom mics, and even earbuds as a last resort.', icon: '🎙', read: '10 min read', tags: ['Audio', 'Beginner'] },
    { title: 'Editing Basics with DaVinci Resolve', desc: 'A beginner walkthrough of the free editing software. Covers importing, cutting, color grading and exporting.', icon: '✂️', read: '15 min read', tags: ['Editing', 'Beginner'] },
    { title: 'Directing Actors: A First-Timers Guide', desc: 'How to communicate with actors, run rehearsals, and get the performance you need — especially when working with non-actors.', icon: '🎭', read: '12 min read', tags: ['Directing', 'Intermediate'] },
    { title: 'Shooting in Natural Light', desc: "How to use the Caribbean's natural light to your advantage — golden hour, shade, overcast, and harsh midday sun.", icon: '☀️', read: '7 min read', tags: ['Camera', 'Lighting'] },
    { title: 'From Idea to Short Film: The Full Process', desc: 'A complete overview of the filmmaking pipeline from concept to finished product — specifically for members starting out.', icon: '🗺', read: '20 min read', tags: ['Overview', 'Beginner'] },
    { title: 'Submitting to Film Festivals', desc: 'How to prepare your film for Caribbean and international festival submissions, including CaribbeanTales and CARIFESTA.', icon: '🏆', read: '9 min read', tags: ['Distribution', 'Advanced'] },
  ],
  links: [
    { title: 'CaribbeanTales International Film Festival', desc: 'Regional network and festival for Caribbean filmmakers.', url: 'https://caribbeantalesfilmfestival.com', category: 'Festival' },
    { title: 'CARIFESTA', desc: 'Caribbean Festival of Arts — regional cultural platform.', url: 'https://carifesta.net', category: 'Festival' },
    { title: 'DaVinci Resolve (Free Download)', desc: 'Professional-grade editing software, completely free.', url: 'https://www.blackmagicdesign.com/products/davinciresolve', category: 'Software' },
    { title: 'No Film School', desc: 'Free filmmaking education, tutorials and industry news.', url: 'https://nofilmschool.com', category: 'Education' },
    { title: 'Film Freeway', desc: 'Submit your films to festivals worldwide. Free to use.', url: 'https://filmfreeway.com', category: 'Distribution' },
    { title: 'Epidemic Sound', desc: 'Royalty-free music for film and video.', url: 'https://www.epidemicsound.com', category: 'Music' },
    { title: 'Pexels / Unsplash', desc: 'Free stock footage and photos for B-roll and mood boards.', url: 'https://www.pexels.com', category: 'Assets' },
  ]
}

export default function Resources({ onNavigate }) {
  const [tab, setTab] = useState('guides')
  const [search, setSearch] = useState('')

  function filterItems(items) {
    if (!search) return items
    return items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()))
  }

  return (
    <div style={{ padding: '1.5rem 1.75rem', color: '#F0EBE0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>Resources</h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.4)', marginTop: '3px' }}>Templates, guides & tools for filmmakers</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..."
          style={{ background: '#1E1E1E', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem 0.8rem', color: '#F0EBE0', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', width: '200px' }} />
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem' }}>
        {['guides', 'templates', 'links'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.3rem 0.9rem', borderRadius: '4px', fontSize: '0.75rem',
            cursor: 'pointer', fontFamily: 'inherit', border: '0.5px solid rgba(255,255,255,0.08)',
            background: tab === t ? '#C9A84C' : 'transparent',
            color: tab === t ? '#0D0D0D' : 'rgba(240,235,224,0.5)'
          }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {tab === 'guides' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '10px' }}>
          {filterItems(RESOURCES.guides).map(item => (
            <div key={item.title} style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.1rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
              <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#F0EBE0', marginBottom: '5px' }}>{item.title}</div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.45)', lineHeight: 1.6, marginBottom: '10px' }}>{item.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {item.tags.map(tag => (
                    <span key={tag} style={{ background: '#252525', color: 'rgba(240,235,224,0.4)', fontSize: '9px', padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.05em' }}>{tag}</span>
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.3)' }}>{item.read}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '10px' }}>
          {filterItems(RESOURCES.templates).map(item => (
            <div key={item.title} style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.1rem' }}>
              <div style={{ width: 36, height: 36, background: item.color, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: '0.7rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#F0EBE0', marginBottom: '5px' }}>{item.title}</div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.45)', lineHeight: 1.6, marginBottom: '12px' }}>{item.desc}</p>
              <button onClick={() => item.link && onNavigate && onNavigate(item.link)} style={{ background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                {item.action}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'links' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filterItems(RESOURCES.links).map(item => (
            <a key={item.title} href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#F0EBE0', marginBottom: '3px' }}>{item.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.4)' }}>{item.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#252525', color: 'rgba(240,235,224,0.4)', fontSize: '9px', padding: '2px 8px', borderRadius: '20px' }}>{item.category}</span>
                <span style={{ color: '#C9A84C', fontSize: '0.8rem' }}>↗</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
