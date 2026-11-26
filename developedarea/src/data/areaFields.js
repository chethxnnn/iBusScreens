// Field catalogue for table ZSD_DEVELOP_AREA (from Developed_Area_Master.xlsx, Sheet1)
//
// type:
//   auto     system generated / fetched, shown read-only
//   refsite  pick a Site ID from Site Master (value help), fills UOM
//   text     manual text input
//   date     manual date (stored ISO yyyy-mm-dd, shown dd.mm.yyyy)

export const AREA_FIELDS = [
  { key: 'areaId', label: 'Area ID', tech: 'ZAREA_ID', type: 'auto', length: 10 },
  { key: 'rfibDate', label: 'RFIB Date', tech: 'ZRFIB_DT', type: 'date', mandatory: true },
  { key: 'refSiteId', label: 'Reference Site ID', tech: 'ZREF_ST_ID', type: 'refsite', length: 10, mandatory: true },
  { key: 'uom', label: 'UOM', tech: 'ZUOM', type: 'auto' },
  { key: 'developedArea', label: 'Developed Area', tech: 'ZDEV_AREA', type: 'text', length: 30, mandatory: true },
]

export const HISTORY_FIELDS = [
  { key: 'createdOn', label: 'Created On', tech: 'ZCREATE_ON', type: 'date' },
  { key: 'createdBy', label: 'Created By', tech: 'ZCREATE_BY' },
  { key: 'changedOn', label: 'Changed On', tech: 'ZCHANGE_ON', type: 'date' },
  { key: 'changedBy', label: 'Changed By', tech: 'ZCHANGE_BY' },
]

export const MANDATORY_KEYS = AREA_FIELDS.filter((f) => f.mandatory).map((f) => f.key)

// Attachments: multiple documents, each under 1 MB
export const MAX_FILE_BYTES = 1024 * 1024

// UOM is automatic. The spec says the source field is still to be confirmed;
// for now it comes from the referenced site's DAS area UoM in Site Master.
// Change this one function when the source is confirmed.
export const uomFromSite = (site) => site?.uom || 'Sq. Ft.'

export const emptyArea = (areaId) => ({
  areaId,
  refSiteId: '',
  developedArea: '',
  uom: '',
  rfibDate: '',
  attachments: [],
  createdOn: '',
  createdBy: '',
  changedOn: '',
  changedBy: '',
})

export const formatDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('-')
  return y && m && d ? `${d}.${m}.${y}` : iso
}

export const formatBytes = (n) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
