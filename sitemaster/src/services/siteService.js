import { MOCK_SITES } from '../data/mockSites'

// UI phase runs on mock data. The CAPM OData service will replace
// these functions later; screens only talk to this layer.
let sites = [...MOCK_SITES]

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchSites() {
  await delay()
  return [...sites]
}

export async function fetchSite(siteId) {
  await delay()
  return sites.find((s) => s.siteId === siteId) || null
}

export function getNextSiteId() {
  const nums = sites
    .map((s) => parseInt(String(s.siteId).replace(/\D/g, ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 100000
  return `SITE${max + 1}`
}

export async function saveSite(siteId, values) {
  await delay(220)
  const today = new Date().toISOString().slice(0, 10)
  sites = sites.map((s) =>
    s.siteId === siteId ? { ...s, ...values, changedBy: 'CHETHAN.P', changedOn: today } : s,
  )
  return sites.find((s) => s.siteId === siteId)
}

export async function createSite(values) {
  await delay(220)
  const today = new Date().toISOString().slice(0, 10)
  const siteId = values.siteId || getNextSiteId()
  const newSite = {
    ...values,
    siteId,
    createdBy: 'CHETHAN.P',
    createdOn: today,
    changedBy: 'CHETHAN.P',
    changedOn: today,
  }
  sites = [newSite, ...sites]
  return newSite
}
