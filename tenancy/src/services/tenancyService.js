// Mock service layer. Swap these for OData calls on ZSD_TENANCY_MASTER and the
// customer, Site Master and contract (MSA / Site Agreement) entities.
import { CONTRACTS, CUSTOMERS, MOCK_TENANCIES, REF_SITES } from '../data/mockTenancy'

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const clone = (o) => JSON.parse(JSON.stringify(o))

let tenancies = clone(MOCK_TENANCIES)

// SY-UNAME / BTP user id in the real system
export const CURRENT_USER = 'IBUS_OPS01'

// SY-DATUM
export const today = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export async function fetchTenancies() {
  await wait()
  return clone(tenancies)
}

export async function fetchTenancy(id) {
  await wait(120)
  const t = tenancies.find((x) => x.tenancyId === id)
  return t ? clone(t) : null
}

export async function fetchMasters() {
  await wait(80)
  return clone({ customers: CUSTOMERS, sites: REF_SITES, contracts: CONTRACTS })
}

// Number range: TENAN + 5 digits (sample TENAN09778)
export function getNextTenancyId() {
  const max = tenancies.reduce((m, t) => Math.max(m, parseInt(t.tenancyId.slice(5), 10) || 0), 0)
  return `TENAN${String(max + 1).padStart(5, '0')}`
}

// Uploaded file blobs kept in memory so the mock can still download them
const blobs = new Map()
export const getAttachmentBlob = (id) => blobs.get(id) || null

const strip = (atts) =>
  (atts || []).map(({ id, name, size, type, file }) => {
    if (file) blobs.set(id, file)
    return { id, name, size, type }
  })

// Change History: a new entry whenever Tenancy Sequence or Sequence Effective Date changes
const historyEntry = (values) => ({
  sequence: values.sequence,
  effectiveDate: values.seqEffectiveDate,
  changedOn: today(),
  changedBy: CURRENT_USER,
})

export async function createTenancy(values) {
  await wait(500)
  const record = {
    ...values,
    tenancyId: getNextTenancyId(),
    status: 'Created',
    attachments: strip(values.attachments),
    changeHistory: [historyEntry(values)],
    createdOn: today(),
    createdBy: CURRENT_USER,
    changedOn: '',
    changedBy: '',
  }
  tenancies = [record, ...tenancies]
  return clone(record)
}

export async function saveTenancy(id, values) {
  await wait(500)
  const idx = tenancies.findIndex((t) => t.tenancyId === id)
  if (idx < 0) return null
  const prev = tenancies[idx]
  const seqChanged = prev.sequence !== values.sequence || prev.seqEffectiveDate !== values.seqEffectiveDate
  const record = {
    ...prev,
    ...values,
    tenancyId: id,
    status: prev.status,
    attachments: strip(values.attachments),
    changeHistory: seqChanged ? [...(prev.changeHistory || []), historyEntry(values)] : prev.changeHistory,
    changedOn: today(),
    changedBy: CURRENT_USER,
  }
  tenancies[idx] = record
  return clone(record)
}

// Approval screen: Approve / Reject
export async function setTenancyStatus(id, status) {
  await wait(450)
  const idx = tenancies.findIndex((t) => t.tenancyId === id)
  if (idx < 0) return null
  tenancies[idx] = { ...tenancies[idx], status, changedOn: today(), changedBy: CURRENT_USER }
  return clone(tenancies[idx])
}
