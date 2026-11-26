// Mock service layer. Swap these functions for OData calls on ZSD_DEVELOP_AREA
// (and the Site Master entity for reference sites) when the backend is ready.
import { MOCK_AREAS, REF_SITES } from '../data/mockAreas'

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const clone = (o) => JSON.parse(JSON.stringify(o))

let areas = clone(MOCK_AREAS)

// SY-UNAME / BTP user id in the real system
export const CURRENT_USER = 'IBUS_OPS01'

// SY-DATUM
export const today = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export async function fetchAreas() {
  await wait()
  return clone(areas)
}

export async function fetchArea(areaId) {
  await wait(120)
  const a = areas.find((x) => x.areaId === areaId)
  return a ? clone(a) : null
}

export async function fetchRefSites() {
  await wait(80)
  return clone(REF_SITES)
}

// Number range: DA + 8 digits (10 characters)
export function getNextAreaId() {
  const max = areas.reduce((m, a) => Math.max(m, parseInt(a.areaId.slice(2), 10) || 0), 0)
  return `DA${String(max + 1).padStart(8, '0')}`
}

// Uploaded file blobs kept in memory so the mock can still download them
const blobs = new Map()
export const getAttachmentBlob = (id) => blobs.get(id) || null

const strip = (atts) =>
  (atts || []).map(({ id, name, size, type, file }) => {
    if (file) blobs.set(id, file)
    return { id, name, size, type }
  })

export async function createArea(values) {
  await wait(500)
  const record = {
    ...values,
    areaId: getNextAreaId(),
    attachments: strip(values.attachments),
    createdOn: today(),
    createdBy: CURRENT_USER,
    changedOn: '',
    changedBy: '',
  }
  areas = [record, ...areas]
  return clone(record)
}

export async function saveArea(areaId, values) {
  await wait(500)
  const idx = areas.findIndex((a) => a.areaId === areaId)
  if (idx < 0) return null
  const record = {
    ...areas[idx],
    ...values,
    areaId,
    attachments: strip(values.attachments),
    changedOn: today(),
    changedBy: CURRENT_USER,
  }
  areas[idx] = record
  return clone(record)
}
