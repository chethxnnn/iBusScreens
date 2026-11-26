// Mock service layer. Swap these for OData calls on ZSD_CUSTOMER_AGREEMENT and the
// customer master. The sheet says the team will confirm the OData logic for Contract ID.
import { CUSTOMERS, MOCK_AGREEMENTS } from '../data/mockAgreements'

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const clone = (o) => JSON.parse(JSON.stringify(o))

let agreements = clone(MOCK_AGREEMENTS)

// SY-UNAME / BTP user id in the real system
export const CURRENT_USER = 'IBUS_OPS01'

// SY-DATUM
export const today = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export async function fetchAgreements() {
  await wait()
  return clone(agreements)
}

export async function fetchAgreement(id) {
  await wait(120)
  const a = agreements.find((x) => x.contractId === id)
  return a ? clone(a) : null
}

export async function fetchCustomers() {
  await wait(80)
  return clone(CUSTOMERS)
}

// Contract ID: CONTRA + 9 digits (sample CONTRA890678900). Placeholder until the OData logic is confirmed.
export function getNextContractId() {
  const max = agreements.reduce((m, a) => Math.max(m, parseInt(a.contractId.slice(6), 10) || 0), 0)
  return `CONTRA${String(max + 1).padStart(9, '0')}`
}

const blobs = new Map()
export const getAttachmentBlob = (id) => blobs.get(id) || null

const strip = (atts) =>
  (atts || []).map(({ id, name, size, type, file }) => {
    if (file) blobs.set(id, file)
    return { id, name, size, type }
  })

export async function createAgreement(values) {
  await wait(500)
  const record = {
    ...values,
    contractId: getNextContractId(),
    status: 'Created',
    attachments: strip(values.attachments),
    createdOn: today(),
    createdBy: CURRENT_USER,
    changedOn: '',
    changedBy: '',
  }
  agreements = [record, ...agreements]
  return clone(record)
}

export async function saveAgreement(id, values) {
  await wait(500)
  const idx = agreements.findIndex((a) => a.contractId === id)
  if (idx < 0) return null
  const record = {
    ...agreements[idx],
    ...values,
    contractId: id,
    status: agreements[idx].status,
    attachments: strip(values.attachments),
    changedOn: today(),
    changedBy: CURRENT_USER,
  }
  agreements[idx] = record
  return clone(record)
}

// Approval screen: Approve / Reject
export async function setAgreementStatus(id, status) {
  await wait(450)
  const idx = agreements.findIndex((a) => a.contractId === id)
  if (idx < 0) return null
  agreements[idx] = { ...agreements[idx], status, changedOn: today(), changedBy: CURRENT_USER }
  return clone(agreements[idx])
}
