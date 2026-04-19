import jsPDF from 'jspdf'
import 'jspdf-autotable'

const GOLD = [201, 168, 76]
const BLACK = [13, 13, 13]
const DARK = [30, 30, 30]
const LIGHT = [240, 235, 224]
const MUTED = [120, 120, 110]

function addHeader(doc, title, subtitle) {
  doc.setFillColor(...BLACK)
  doc.rect(0, 0, 210, 22, 'F')
  doc.setFillColor(...GOLD)
  doc.rect(0, 22, 210, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...GOLD)
  doc.text('GOLDEN FRAME PRODUCTIONS', 14, 10)
  doc.setFontSize(9)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'normal')
  doc.text('St. Kitts & Nevis', 14, 16)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text(title.toUpperCase(), 14, 32)
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(subtitle, 14, 38)
  }
  return subtitle ? 44 : 38
}

function addFooter(doc) {
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFillColor(...BLACK)
    doc.rect(0, 285, 210, 12, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.setFont('helvetica', 'normal')
    doc.text('Golden Frame Productions · St. Kitts & Nevis · Confidential', 14, 292)
    doc.text(`Page ${i} of ${pages}`, 196, 292, { align: 'right' })
  }
}

// ── SCRIPT EXPORT ──────────────────────────────────────────
export function exportScript(script, projectTitle) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.setFillColor(...BLACK)
  doc.rect(0, 0, 210, 297, 'F')

  // Title page
  doc.setFillColor(...GOLD)
  doc.rect(85, 100, 40, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...LIGHT)
  doc.text(script.title || projectTitle || 'Untitled', 105, 130, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...MUTED)
  doc.text('Written by', 105, 145, { align: 'center' })
  doc.setTextColor(...LIGHT)
  doc.setFontSize(13)
  doc.text('Golden Frame Productions', 105, 154, { align: 'center' })
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 105, 270, { align: 'center' })
  doc.text('Draft', 105, 277, { align: 'center' })

  // Script pages
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, 210, 297, 'F')

  const content = script.content || ''
  const lines = content.split('\n')
  let y = 20
  const leftMargin = 25
  const dialogMargin = 55
  const charMargin = 80
  const maxWidth = 160

  doc.setFontSize(11)

  for (const line of lines) {
    if (y > 270) { doc.addPage(); y = 20; doc.setFillColor(255,255,255); doc.rect(0,0,210,297,'F') }
    const trimmed = line.trim()
    if (!trimmed) { y += 4; continue }

    // Detect line type by content patterns
    const isScene = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/.test(trimmed)
    const isTransition = /TO:$/.test(trimmed) || trimmed === 'FADE IN:' || trimmed === 'FADE OUT.' || trimmed === 'CUT TO:'
    const isAllCaps = trimmed === trimmed.toUpperCase() && trimmed.length < 40 && /^[A-Z\s\(\)\.]+$/.test(trimmed)
    const isParenthetical = trimmed.startsWith('(') && trimmed.endsWith(')')

    if (isScene) {
      if (y > 20) y += 4
      doc.setFont('courier', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...BLACK)
      doc.setFillColor(240, 240, 235)
      doc.rect(leftMargin - 2, y - 5, maxWidth + 4, 7, 'F')
      doc.text(trimmed, leftMargin, y)
      y += 8
    } else if (isTransition) {
      doc.setFont('courier', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...MUTED)
      doc.text(trimmed, 170, y, { align: 'right' })
      y += 7
    } else if (isAllCaps && !isScene) {
      // Character name
      y += 2
      doc.setFont('courier', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...BLACK)
      doc.text(trimmed, charMargin, y)
      y += 6
    } else if (isParenthetical) {
      doc.setFont('courier', 'italic')
      doc.setFontSize(10)
      doc.setTextColor(...MUTED)
      doc.text(trimmed, dialogMargin, y)
      y += 5
    } else {
      // Action or dialogue - check indent level
      const isDialog = line.startsWith('      ')
      doc.setFont('courier', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(...BLACK)
      const xPos = isDialog ? dialogMargin : leftMargin
      const wrapWidth = isDialog ? 100 : maxWidth
      const wrapped = doc.splitTextToSize(trimmed, wrapWidth)
      for (const wl of wrapped) {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(wl, xPos, y)
        y += 6
      }
    }
  }

  addFooter(doc)
  doc.save(`${script.title || 'script'}.pdf`)
}

// ── CALL SHEET EXPORT ──────────────────────────────────────
export function exportCallSheet(callSheet, projectTitle) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = addHeader(doc, 'Call Sheet', projectTitle)
  y += 4

  // Production info box
  doc.setFillColor(245, 245, 240)
  doc.rect(14, y, 182, 38, 'F')
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.5)
  doc.rect(14, y, 182, 38, 'S')

  const col1 = 18, col2 = 80, col3 = 120, col4 = 170
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)

  const info = [
    ['SHOOT DATE', callSheet.shoot_date || '—', 'GENERAL CALL', callSheet.general_call || '—'],
    ['LOCATION', callSheet.location || '—', 'DIRECTOR', '—'],
    ['PROJECT', projectTitle || '—', 'WEATHER', '—'],
  ]

  info.forEach((row, i) => {
    const rowY = y + 7 + i * 11
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...MUTED)
    doc.text(row[0], col1, rowY)
    doc.text(row[2], col3, rowY)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...BLACK)
    doc.text(String(row[1]), col2, rowY)
    doc.text(String(row[3]), col4, rowY)
  })
  y += 44

  // Schedule
  if (callSheet.schedule?.length) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...GOLD)
    doc.text('SCHEDULE', 14, y); y += 4
    doc.autoTable({
      startY: y,
      head: [['Time', 'Activity']],
      body: callSheet.schedule.map(s => [s.time, s.activity]),
      theme: 'striped',
      headStyles: { fillColor: BLACK, textColor: GOLD, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9, textColor: BLACK },
      alternateRowStyles: { fillColor: [248, 247, 243] },
      columnStyles: { 0: { cellWidth: 35, fontStyle: 'bold' } },
      margin: { left: 14, right: 14 }
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Crew
  if (callSheet.crew?.length) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...GOLD)
    doc.text('CREW & CAST', 14, y); y += 4
    doc.autoTable({
      startY: y,
      head: [['Name', 'Role', 'Call Time', 'Contact']],
      body: callSheet.crew.map(c => [c.name, c.role, c.call_time, c.contact || '—']),
      theme: 'striped',
      headStyles: { fillColor: BLACK, textColor: GOLD, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9, textColor: BLACK },
      alternateRowStyles: { fillColor: [248, 247, 243] },
      columnStyles: { 2: { fontStyle: 'bold', textColor: [180, 100, 20] } },
      margin: { left: 14, right: 14 }
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Equipment
  if (callSheet.equipment?.length) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...GOLD)
    doc.text('EQUIPMENT CHECKLIST', 14, y); y += 5
    const cols = 2
    callSheet.equipment.forEach((item, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const xPos = 14 + col * 90
      const yPos = y + row * 7
      doc.setFillColor(item.checked ? ...GOLD : 220, 220, 215)
      doc.rect(xPos, yPos - 3, 4, 4, 'F')
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...BLACK)
      doc.text(item.label, xPos + 6, yPos)
    })
  }

  if (callSheet.notes) {
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 20
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...GOLD)
    doc.text('NOTES', 14, y); y += 5
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...BLACK)
    const noteLines = doc.splitTextToSize(callSheet.notes, 182)
    doc.text(noteLines, 14, y)
  }

  addFooter(doc)
  doc.save(`call-sheet-${callSheet.shoot_date || 'draft'}.pdf`)
}

// ── SHOT LIST EXPORT ────────────────────────────────────────
export function exportShotList(shots, projectTitle) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  let y = addHeader(doc, 'Shot List', projectTitle)
  y += 6

  const grouped = shots.reduce((acc, shot) => {
    const key = `Scene ${shot.scene_number || '?'}`
    if (!acc[key]) acc[key] = []
    acc[key].push(shot)
    return acc
  }, {})

  for (const [scene, sceneShots] of Object.entries(grouped)) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...GOLD)
    doc.text(scene.toUpperCase(), 14, y); y += 3

    doc.autoTable({
      startY: y,
      head: [['#', 'Description', 'Type', 'Lens / Angle', 'Movement', 'Est. Time', 'Notes']],
      body: sceneShots.map(s => [
        s.shot_id || '—',
        s.description || '—',
        s.shot_type || '—',
        s.lens || '—',
        s.movement || '—',
        s.estimated_time || '—',
        s.notes || ''
      ]),
      theme: 'striped',
      headStyles: { fillColor: BLACK, textColor: GOLD, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: BLACK },
      alternateRowStyles: { fillColor: [248, 247, 243] },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: 'bold' },
        1: { cellWidth: 80 },
        2: { cellWidth: 18 },
        3: { cellWidth: 28 },
        4: { cellWidth: 28 },
        5: { cellWidth: 22 },
        6: { cellWidth: 50 }
      },
      margin: { left: 14, right: 14 }
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // Summary
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...MUTED)
  doc.text(`Total shots: ${shots.length}  ·  Scenes: ${Object.keys(grouped).length}  ·  Exported: ${new Date().toLocaleDateString()}`, 14, y)

  addFooter(doc)
  doc.save(`shot-list-${projectTitle?.toLowerCase().replace(/\s+/g, '-') || 'project'}.pdf`)
}
