import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { exportScript } from '../lib/export'
import ProjectPicker from '../components/ProjectPicker'

const FORMATS = {
  scene:      { label: 'Scene Heading', style: { textTransform: 'uppercase', fontWeight: 'bold', color: '#E8C97A', borderBottom: '0.5px solid rgba(255,255,255,0.1)', paddingBottom: '2px' } },
  action:     { label: 'Action',        style: { color: '#F0EBE0' } },
  character:  { label: 'Character',     style: { textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', color: '#F0EBE0', paddingLeft: '35%' } },
  dialogue:   { label: 'Dialogue',      style: { paddingLeft: '20%', paddingRight: '20%', color: '#F0EBE0' } },
  parenthetical: { label: 'Parenthetical', style: { paddingLeft: '28%', color: 'rgba(240,235,224,0.5)', fontStyle: 'italic' } },
  transition: { label: 'Transition',    style: { textAlign: 'right', textTransform: 'uppercase', fontWeight: 'bold', color: 'rgba(240,235,224,0.5)' } },
}

export default function ScriptEditor({ project, onSelectProject }) {
  const { profile } = useAuth()
  const [scripts, setScripts] = useState([])
  const [activeScript, setActiveScript] = useState(null)
  const [content, setContent] = useState('')
  const [activeFmt, setActiveFmt] = useState('action')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [showNewScript, setShowNewScript] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const editorRef = useRef(null)
  const saveTimer = useRef(null)

  useEffect(() => { if (project) fetchScripts() }, [project])

  async function fetchScripts() {
    const { data } = await supabase.from('scripts')
      .select('*').eq('project_id', project.id).order('updated_at', { ascending: false })
    setScripts(data || [])
    if (data?.length) loadScript(data[0])
  }

  function loadScript(script) {
    setActiveScript(script)
    setContent(script.content || '')
    setSaved(true)
  }

  async function createScript() {
    if (!newTitle.trim()) return
    const { data } = await supabase.from('scripts').insert({
      project_id: project.id, title: newTitle.trim(), content: '', created_by: profile.id
    }).select().single()
    if (data) {
      setScripts(prev => [data, ...prev])
      loadScript(data)
      setShowNewScript(false)
      setNewTitle('')
    }
  }

  function handleContentChange(e) {
    setContent(e.target.value)
    setSaved(false)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(e.target.value), 1500)
  }

  async function autoSave(val) {
    if (!activeScript) return
    setSaving(true)
    await supabase.from('scripts').update({
      content: val, updated_at: new Date().toISOString()
    }).eq('id', activeScript.id)
    setSaving(false)
    setSaved(true)
  }

  async function saveNow() {
    clearTimeout(saveTimer.current)
    await autoSave(content)
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const fmtKeys = Object.keys(FORMATS)
      const idx = fmtKeys.indexOf(activeFmt)
      setActiveFmt(fmtKeys[(idx + 1) % fmtKeys.length])
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      saveNow()
    }
  }

  // Word & page count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const pageCount = Math.max(1, Math.ceil(content.split('\n').length / 55))

  if (!project) return <ProjectPicker toolName="Script Editor" onSelect={onSelectProject} />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%', minHeight: '100vh' }}>
      {/* Script list sidebar */}
      <div style={{ background: '#111', borderRight: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.9rem 1rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(240,235,224,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>
            {project.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.5)', fontWeight: 500 }}>Scripts</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {scripts.map(sc => (
            <div key={sc.id} onClick={() => loadScript(sc)} style={{
              padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.8rem',
              borderBottom: '0.5px solid rgba(255,255,255,0.04)',
              background: activeScript?.id === sc.id ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: activeScript?.id === sc.id ? '#C9A84C' : 'rgba(240,235,224,0.55)',
              borderLeft: activeScript?.id === sc.id ? '2px solid #C9A84C' : '2px solid transparent'
            }}>
              {sc.title}
              <div style={{ fontSize: '0.68rem', color: 'rgba(240,235,224,0.25)', marginTop: '2px' }}>
                v{sc.version}
              </div>
            </div>
          ))}
        </div>
        {showNewScript ? (
          <div style={{ padding: '0.75rem' }}>
            <input style={{ width: '100%', background: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.3)', borderRadius: '4px', padding: '0.4rem 0.6rem', color: '#F0EBE0', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', marginBottom: '6px' }}
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createScript()}
              placeholder="Script title" autoFocus />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={createScript} style={{ flex: 1, background: '#C9A84C', color: '#0D0D0D', border: 'none', borderRadius: '3px', fontSize: '0.72rem', padding: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>Create</button>
              <button onClick={() => setShowNewScript(false)} style={{ flex: 1, background: 'transparent', color: 'rgba(240,235,224,0.4)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '3px', fontSize: '0.72rem', padding: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowNewScript(true)} style={{ margin: '0.75rem', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,224,0.4)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            + New Script
          </button>
        )}
      </div>

      {/* Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#0D0D0D' }}>
        {/* Toolbar */}
        <div style={{ padding: '0.6rem 1rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#F0EBE0', fontWeight: 500, marginRight: '4px' }}>{activeScript?.title || 'No script selected'}</span>
          <div style={{ flex: 1 }} />
          {Object.entries(FORMATS).map(([key, val]) => (
            <button key={key} onClick={() => setActiveFmt(key)} style={{
              padding: '0.25rem 0.6rem', borderRadius: '3px', fontSize: '0.7rem',
              cursor: 'pointer', fontFamily: 'inherit', border: '0.5px solid rgba(255,255,255,0.08)',
              background: activeFmt === key ? '#C9A84C' : 'transparent',
              color: activeFmt === key ? '#0D0D0D' : 'rgba(240,235,224,0.5)'
            }}>{val.label}</button>
          ))}
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '0.7rem', color: saved ? 'rgba(59,109,17,0.8)' : '#C9A84C' }}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : '● Unsaved'}
          </span>
          <button onClick={saveNow} style={{ padding: '0.25rem 0.7rem', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,224,0.5)' }}>
            Save
          </button>
          <button onClick={() => activeScript && exportScript({ ...activeScript, content }, project.title)} style={{ padding: '0.25rem 0.7rem', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', background: '#C9A84C', border: 'none', color: '#0D0D0D', fontWeight: 500 }}>
            Export PDF
          </button>
        </div>

        {/* Page */}
        {activeScript ? (
          <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '680px' }}>
              {/* Screenplay page */}
              <div style={{ background: '#fff', borderRadius: '2px', padding: '2.5rem 3rem', minHeight: '800px', boxShadow: '0 0 0 1px rgba(0,0,0,0.3)' }}>
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={handleContentChange}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: '100%', minHeight: '700px', border: 'none', outline: 'none',
                    resize: 'none', fontFamily: "'Courier New', Courier, monospace",
                    fontSize: '12pt', lineHeight: '1.9', color: '#111',
                    background: 'transparent', ...FORMATS[activeFmt]?.style
                  }}
                  placeholder={`${FORMATS[activeFmt]?.label} — start typing...\n\nTip: Press Tab to cycle formats. Cmd/Ctrl+S to save.`}
                />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.3)' }}>~{pageCount} page{pageCount !== 1 ? 's' : ''}</span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(240,235,224,0.3)' }}>{wordCount} words</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,235,224,0.25)', fontSize: '0.85rem' }}>
            {scripts.length === 0 ? 'Create a script to get started' : 'Select a script from the sidebar'}
          </div>
        )}
      </div>
    </div>
  )
}
