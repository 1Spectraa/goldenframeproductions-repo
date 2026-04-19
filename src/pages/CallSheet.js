import ProjectPicker from '../components/ProjectPicker'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { exportCallSheet } from '../lib/export'

export default function CallSheet({ project, onSelectProject }) {
  const [sheets, setSheets] = useState([])
  const [active, setActive] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newDate, setNewDate] = useState('')

  useEffect(() => { if (project) fetchSheets() }, [project])

  async function fetchSheets() {
    const { data } = await supabase.from('call_sheets')
      .select('*').eq('project_id', project.id).order('shoot_date', { ascending: false })
    setSheets(data || [])
    if (data?.length) setActive(data[0])
  }

  async function createSheet() {
    const { data } = await supabase.from('call_sheets').insert({
      project_id: project.id,
      shoot_date: newDate || null,
      general_call: '07:00',
      location: '',
      notes: '',
      crew: [
        { name: '', role: 'Director', call_time: '06:30', contact: '' },
        { name: '', role: 'Camera Operator', call_time: '06:30', contact: '' },
        { name: '', role: 'Sound', call_time: '06:30', contact: '' },
      ],
      schedule: [
        { time: '06:30', activity: 'Crew call & setup' },
        { time: '07:00', activity: 'First shot' },
        { time: '12:00', activity: 'Lunch break' },
        { time: '13:00', activity: 'Afternoon scenes' },
        { time: '17:00', activity: 'Wrap' },
      ],
      equipment: [
        { label: 'Camera / smartphone rig', checked: false },
        { label: 'Tripod / gimbal', checked: false },
        { label: 'Lavalier microphones', checked: false },
        { label: 'Boom mic', checked: false },
        { label: 'Reflector / diffuser', checked: false },
        { label: 'Extra batteries', checked: false },
        { label: 'Memory cards (formatted)', checked: false },
        { label: 'Power bank', checked: false },
      ]
    }).select().single()
    if (data) { setSheets(prev => [data, ...prev]); setActive(data); setShowNew(false) }
  }

  async function save(updated) {
    if (!updated) return
    setSaving(true)
    await supabase.from('call_sheets').update(updated).eq('id', updated.id)
    setSaving(false); setSaved(true)
    setSheets(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  function update(field, value) {
    const updated = { ...active, [field]: value }
    setActive(updated)
    setSaved(false)
    save(updated)
  }

  function updateCrew(idx, field, value) {
    const crew = active.crew.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    update('crew', crew)
  }
  function addCrewRow() { update('crew', [...(active.crew || []), { name: '', role: '', call_time: '', contact: '' }]) }
  function removeCrewRow(idx) { update('crew', active.crew.filter((_, i) => i !== idx)) }

  function updateSchedule(idx, field, value) {
    const schedule = active.schedule.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    update('schedule', schedule)
  }
  function addScheduleRow() { update('schedule', [...(active.schedule || []), { time: '', activity: '' }]) }
  function removeScheduleRow(idx) { update('schedule', active.schedule.filter((_, i) => i !== idx)) }

  function toggleEquipment(idx) {
    const equipment = active.equipment.map((e, i) => i === idx ? { ...e, checked: !e.checked } : e)
    update('equipment', equipment)
  }
  function addEquipment() { update('equipment', [...(active.equipment || []), { label: 'New item', checked: false }]) }

  if (!project) return <ProjectPicker toolName="Call Sheet" onSelect={onSelectProject} />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ background: '#111', borderRight: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.9rem 1rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '0.68rem', color: 'rgba(240,235,224,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>{project.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.5)', fontWeight: 500 }}>Call Sheets</div>
        </div>
        <div style={{ flex: 1 }}>
          {sheets.map(sheet => (
            <div key={sheet.id} onClick={() => setActive(sheet)} style={{
              padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.78rem',
              borderBottom: '0.5px solid rgba(255,255,255,0.04)',
              background: active?.id === sheet.id ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: active?.id === sheet.id ? '#C9A84C' : 'rgba(240,235,224,0.55)',
              borderLeft: active?.id === sheet.id ? '2px solid #C9A84C' : '2px solid transparent'
            }}>
              {sheet.shoot_date ? new Date(sheet.shoot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Undated'}
              <div style={{ fontSize: '0.65rem', color: 'rgba(240,235,224,0.25)', marginTop: '2px' }}>{sheet.location || 'No location'}</div>
            </div>
          ))}
        </div>
        {showNew ? (
          <div style={{ padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(240,235,224,0.3)', marginBottom: '4px' }}>Shoot Date</div>
            <input type="date" style={{ width: '100%', background: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.3)', borderRadius: '4px', padding: '0.4rem 0.5rem', color: '#F0EBE0', fontSize: '0.75rem', fontFamily: 'inherit', outline: 'none', marginBottom: '6px' }}
              value={newDate} onChange={e => setNewDate(e.target.value)} />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={createSheet} style={{ flex: 1, background: '#C9A84C', color: '#0D0D0D', border: 'none', borderRadius: '3px', fontSize: '0.72rem', padding: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>Create</button>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, background: 'transparent', color: 'rgba(240,235,224,0.4)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '3px', fontSize: '0.72rem', padding: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowNew(true)} style={{ margin: '0.75rem', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,224,0.4)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            + New Call Sheet
          </button>
        )}
      </div>

      {/* Editor */}
      {active ? (
        <div style={{ overflow: 'auto', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: saved ? 'rgba(59,109,17,0.8)' : '#C9A84C' }}>
              {saving ? 'Saving...' : saved ? '✓ Saved' : '● Unsaved'}
            </div>
            <button onClick={() => exportCallSheet(active, project.title)} style={{ background: '#C9A84C', color: '#0D0D0D', border: 'none', padding: '0.45rem 1.1rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              Export PDF
            </button>
          </div>

          {/* Production Info */}
          <Section title="Production Info">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {[['shoot_date','Shoot Date','date'],['general_call','General Call','time'],['location','Location','text']].map(([f,l,t]) => (
                <Field key={f} label={l}>
                  <input type={t} style={inp} value={active[f] || ''} onChange={e => update(f, e.target.value)} />
                </Field>
              ))}
            </div>
            <Field label="Notes">
              <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={active.notes || ''} onChange={e => update('notes', e.target.value)} />
            </Field>
          </Section>

          {/* Schedule */}
          <Section title="Schedule">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={th}>Time</th>
                  <th style={th}>Activity</th>
                  <th style={{ ...th, width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {(active.schedule || []).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '4px 8px', width: '120px' }}>
                      <input type="time" style={cellInp} value={row.time} onChange={e => updateSchedule(i, 'time', e.target.value)} />
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <input style={cellInp} value={row.activity} onChange={e => updateSchedule(i, 'activity', e.target.value)} />
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <button onClick={() => removeScheduleRow(i)} style={delBtn}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addScheduleRow} style={addRowBtn}>+ Add row</button>
          </Section>

          {/* Crew & Cast */}
          <Section title="Crew & Cast">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  {['Name','Role','Call Time','Contact',''].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(active.crew || []).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    {['name','role','call_time','contact'].map(f => (
                      <td key={f} style={{ padding: '4px 8px' }}>
                        {f === 'call_time'
                          ? <input type="time" style={{ ...cellInp, color: '#C9A84C', fontWeight: 500 }} value={row[f]} onChange={e => updateCrew(i, f, e.target.value)} />
                          : <input style={cellInp} value={row[f]} onChange={e => updateCrew(i, f, e.target.value)} placeholder={f} />
                        }
                      </td>
                    ))}
                    <td style={{ padding: '4px 8px' }}>
                      <button onClick={() => removeCrewRow(i)} style={delBtn}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addCrewRow} style={addRowBtn}>+ Add crew / cast</button>
          </Section>

          {/* Equipment */}
          <Section title="Equipment Checklist">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {(active.equipment || []).map((item, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 8px', background: item.checked ? 'rgba(59,109,17,0.1)' : '#1A1A1A', border: `0.5px solid ${item.checked ? 'rgba(59,109,17,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '4px' }}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleEquipment(i)} style={{ accentColor: '#C9A84C' }} />
                  <span style={{ fontSize: '0.8rem', color: item.checked ? '#97C459' : 'rgba(240,235,224,0.6)' }}>{item.label}</span>
                </label>
              ))}
            </div>
            <button onClick={addEquipment} style={{ ...addRowBtn, marginTop: '8px' }}>+ Add item</button>
          </Section>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,235,224,0.25)', fontSize: '0.85rem' }}>
          {sheets.length === 0 ? 'Create a call sheet to get started' : 'Select a call sheet'}
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.1rem', marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.9rem' }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.3)', marginBottom: '5px' }}>{label}</div>
      {children}
    </div>
  )
}

const inp = { width: '100%', background: '#1E1E1E', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.5rem 0.7rem', color: '#F0EBE0', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }
const cellInp = { width: '100%', background: 'transparent', border: 'none', borderBottom: '0.5px solid rgba(255,255,255,0.06)', color: 'rgba(240,235,224,0.7)', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', padding: '3px 0' }
const th = { textAlign: 'left', padding: '4px 8px', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.25)', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.07)' }
const delBtn = { background: 'transparent', border: 'none', color: 'rgba(226,75,74,0.5)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 3px' }
const addRowBtn = { marginTop: '6px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.07)', color: 'rgba(240,235,224,0.35)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }
