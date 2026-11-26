// Presentation helpers for site status. Pure UI: no data or field changes.

export const STAGES = ['Acquired', 'Survey', 'Design', 'Project', 'Deployed']

// stage: index in STAGES, state: 'active' (working on it) | 'done' (stage finished)
const MAP = {
  Acquired: { stage: 0, state: 'done', tone: 'new' },
  'Survey in Progress': { stage: 1, state: 'active', tone: 'progress' },
  'Survey Completed': { stage: 1, state: 'done', tone: 'progress' },
  'Design in Progress': { stage: 2, state: 'active', tone: 'progress' },
  'Design Completed': { stage: 2, state: 'done', tone: 'progress' },
  'Project Created': { stage: 3, state: 'active', tone: 'progress' },
  'Project in Progress': { stage: 3, state: 'active', tone: 'progress' },
  'Partial Deployed': { stage: 4, state: 'active', tone: 'progress' },
  'Completely Deployed': { stage: 4, state: 'done', tone: 'done' },
  'Site on Hold': { stage: -1, state: 'off', tone: 'hold' },
  'Exit Notice': { stage: -1, state: 'off', tone: 'hold' },
  Exited: { stage: -1, state: 'off', tone: 'closed' },
  'Site is lost': { stage: -1, state: 'off', tone: 'closed' },
}

export const statusInfo = (status) => MAP[status] || { stage: 0, state: 'done', tone: 'new' }
export const toneOf = (status) => statusInfo(status).tone

// Bucket used by the pipeline bar on the list page
export const bucketOf = (status) => {
  const { stage, tone } = statusInfo(status)
  if (tone === 'hold' || tone === 'closed') return tone
  return STAGES[stage]
}

export const BUCKETS = [
  { key: 'Acquired', label: 'Acquired' },
  { key: 'Survey', label: 'Survey' },
  { key: 'Design', label: 'Design' },
  { key: 'Project', label: 'Project' },
  { key: 'Deployed', label: 'Deployed' },
  { key: 'hold', label: 'On hold / exit notice' },
  { key: 'closed', label: 'Exited / lost' },
]
