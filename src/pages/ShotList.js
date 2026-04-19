import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { exportShotList } from '../lib/export'

const SHOT_TYPES = ['WS', 'LS', 'MS', 'MCU', 'CU', 'ECU', 'OTS', 'POV', 'Insert', 'Aerial', 'Two-Shot']
const MOVEMENTS = ['Static', 'Pan L', 'Pan R', 'Tilt Up', 'Tilt Down', 'Dolly In', 'Dolly Out', 'Tracking', 'Handheld', 'Crane', 'Gimbal']

export default function ShotList({ project }) {
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [blank, setBlank] = useState(emptyShot())

  function emptyShot() {
    return { scene_number: '', shot_id: '', description: '', shot_type: 'MS', lens: '', movement: 'Static', estimated_time: '', notes: '' }
  }

  useEffect(() => { if (project) fetchShots() }, [project])

  async function fetchShots() {
    setLoading(true)
    const { data } = await supabase.from('shots')
      .select('*').eq('project_id', project.id).order('order_index').order('shot_id')
    setShots(data || [])
    setLoading(false)
  }

  async function addShot() {
    const { data } = await supabase.from('shots').insert({
      ...blank, project_id: project.id, order_index: shots.length
    }).select().single()
    if (data) { setShots(prev => [...prev, data]); setBlank(emptyShot()); setShowAdd(false) }
  }

  async function updateShot(id, field, value) {
    setShots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
    await supabase.from('shots').update({ [field]: value }).eq('id', id)
  }

  async function deleteShot(id) {
    await supabase.from('shots').delete().eq('id', id)
    setShots(prev => prev.filter(s => s.id !== id))
  }

  async function duplicateShot(shot) {
    const { id, created_at, ...rest } = shot
    const { data } = await supabase.from('shots').insert({
      ...rest, shot_id: rest.shot_id + '_copy', order_index: rest.order_index + 0.5
    }).select().single()
    if (data) {
      const idx = shots.findIndex(s => s.id === shot.id)
      const next = [...shots]
      next.splice(idx + 1, 0, data)
      setShots(next)
    }
  }

  // Group by scene
  const scenes = shots.reduce((acc, shot) => {
    const key = shot.scene_number || 'Unassigned'
    if (!acc[key]) acc[key] = []
    acc[key].push(shot)
    return acc
  }, {})

  const totalTime = shots.reduce((acc, s) => {
    const match = (s.estimated_time || '').match(/(\d+)/)
    return acc + (match ? parseInt(match[1]) : 0)
  }, 0)

  if (!project) return <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(240,235,224,0.3)' }}>Select a project first.</div>
  if (loading) return <div style={{ padding: '2rem', color: '#C9A84C' }}>Loading shot list...</div>

  return (
    <div style={{ padding: '1.5rem 1.75rem', color: '#F0EBE0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>Shot List</h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.4)', marginTop: '3px' }}>{project.title}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowAdd(true)} style={btnGold}>+ Add Shot</button>
          <button onClick={() => exportShotList(shots, project.title)} style={btnGhost}>Export PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Shots', value: shots.length },
          { label: 'Scenes', value: Object.keys(scenes).length },
          { label: 'Est. Shoot Time', value: `${totalTime} min` },
          { label: 'Shot Types', value: [...new Set(shots.map(s => s.shot_type).filter(Boolean))].join(', ') || '—' }
        ].map(stat => (
          <div key={stat.label} style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(240,235,224,0.3)', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: stat.label === 'Shot Types' ? '0.72rem' : '1.2rem', fontWeight: 500, color: stat.label === 'Shot Types' ? 'rgba(240,235,224,0.5)' : '#C9A84C' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Add shot form */}
      {showAdd && (
        <div style={{ background: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '8px' }}>
            {[['scene_number','Scene #'],['shot_id','Shot ID'],['lens','Lens/Angle'],['estimated_time','Est. Time']].map(([f,l]) => (
              <div key={f}>
                <div style={labelStyle}>{l}</div>
                <input style={cellInput} value={blank[f]} onChange={e => setBlank(p => ({...p,[f]:e.target.value}))} placeholder={l} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <div style={labelStyle}>Description</div>
              <input style={cellInput} value={blank.description} onChange={e => setBlank(p => ({...p,description:e.target.value}))} placeholder="Shot description" />
            </div>
            <div>
              <div style={labelStyle}>Shot Type</div>
              <select style={cellInput} value={blank.shot_type} onChange={e => setBlank(p => ({...p,shot_type:e.target.value}))}>
                {SHOT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={labelStyle}>Movement</div>
              <select style={cellInput} value={blank.movement} onChange={e => setBlank(p => ({...p,movement:e.target.value}))}>
                {MOVEMENTS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={labelStyle}>Notes</div>
            <input style={cellInput} value={blank.notes} onChange={e => setBlank(p => ({...p,notes:e.target.value}))} placeholder="Additional notes" />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={addShot} style={btnGold}>Add Shot</button>
            <button onClick={() => setShowAdd(false)} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {/* Shot table by scene */}
      {Object.entries(scenes).map(([scene, sceneShots]) => (
        <div key={scene} style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Scene {scene}
            <span style={{ color: 'rgba(240,235,224,0.3)', fontWeight: 400, letterSpacing: 0 }}>{sceneShots.length} shot{sceneShots.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
                  {[['Shot','8%'],['Description','28%'],['Type','8%'],['Lens','10%'],['Movement','10%'],['Time','8%'],['Notes','20%'],['','8%']].map(([h,w]) => (
                    <th key={h} style={{ textAlign:'left', padding:'0.5rem 0.75rem', fontSize:'9px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(240,235,224,0.3)', fontWeight:400, width:w }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sceneShots.map(shot => (
                  <tr key={shot.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', padding: '1px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 500 }}>
                        {shot.shot_id || '—'}
                      </span>
                    </td>
                    {['description','shot_type','lens','movement','estimated_time','notes'].map(field => (
                      <td key={field} style={{ padding: '0.5rem 0.75rem' }}>
                        {field === 'shot_type' ? (
                          <select value={shot[field] || ''} onChange={e => updateShot(shot.id, field, e.target.value)}
                            style={{ background: '#1E1E1E', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,224,0.7)', fontSize: '0.75rem', borderRadius: '3px', padding: '2px 4px', fontFamily: 'inherit', width: '100%' }}>
                            {SHOT_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        ) : field === 'movement' ? (
                          <select value={shot[field] || ''} onChange={e => updateShot(shot.id, field, e.target.value)}
                            style={{ background: '#1E1E1E', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,224,0.7)', fontSize: '0.75rem', borderRadius: '3px', padding: '2px 4px', fontFamily: 'inherit', width: '100%' }}>
                            {MOVEMENTS.map(m => <option key={m}>{m}</option>)}
                          </select>
                        ) : (
                          <input value={shot[field] || ''} onChange={e => updateShot(shot.id, field, e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(240,235,224,0.7)', fontSize: '0.78rem', fontFamily: 'inherit', width: '100%', outline: 'none', padding: '2px 0' }}
                            onFocus={e => e.target.style.borderBottom = '0.5px solid rgba(201,168,76,0.4)'}
                            onBlur={e => e.target.style.borderBottom = 'none'} />
                        )}
                      </td>
                    ))}
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => duplicateShot(shot)} title="Duplicate" style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,224,0.4)', fontSize: '0.68rem', borderRadius: '3px', padding: '2px 5px', cursor: 'pointer' }}>⧉</button>
                        <button onClick={() => deleteShot(shot.id)} title="Delete" style={{ background: 'transparent', border: '0.5px solid rgba(226,75,74,0.2)', color: 'rgba(226,75,74,0.6)', fontSize: '0.68rem', borderRadius: '3px', padding: '2px 5px', cursor: 'pointer' }}>×</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {shots.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,235,224,0.25)', fontSize: '0.85rem' }}>
          No shots yet. <span style={{ color: '#C9A84C', cursor: 'pointer' }} onClick={() => setShowAdd(true)}>Add your first shot →</span>
        </div>
      )}
    </div>
  )
}

const labelStyle = { fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.3)', marginBottom: '4px' }
const cellInput = { width: '100%', background: '#252525', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '0.4rem 0.6rem', color: '#F0EBE0', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none' }
const btnGold = { background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.45rem 1rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhost = { background: 'transparent', color: 'rgba(240,235,224,0.5)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '0.45rem 1rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }
