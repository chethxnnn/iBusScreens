// Field catalogue for table ZSD_CUSTOMER_AGREEMENT (Customer_Agreement__1.xlsx, Sheet1)
//
// type:
//   auto      system generated, read-only
//   customer  F4 from customer master
//   parent    F4 from existing contracts (only for a site agreement)
//   select    dropdown
//   date      manual date (stored ISO yyyy-mm-dd, shown dd.mm.yyyy)
//   text      manual text

export const OPTIONS = {
  contractType: ['Permanent', 'Temporary', 'Long Term'],
}

export const STATUSES = ['Created', 'Under Approval', 'Approved', 'Rejected']
export const PENDING_STATUSES = ['Created', 'Under Approval']

// Create Screen layout: left column / right column
export const FIELDS = [
  { key: 'customerId', label: 'Customer ID', tech: 'ZCUSTOMER_ID', type: 'customer', length: 20, mandatory: true },
  { key: 'validFrom', label: 'Valid From', tech: 'ZFROM_DT', type: 'date', mandatory: true },
  { key: 'contractType', label: 'Contract Type', tech: 'ZCONRACT_TYPE', type: 'select', options: 'contractType', mandatory: true },
  { key: 'validTo', label: 'Valid To', tech: 'ZTO_DT', type: 'date', mandatory: true },
  { key: 'parentContract', label: 'Parent Contract', tech: 'ZPARENT', type: 'parent', length: 20 },
  { key: 'rateCard', label: 'Rate Card', tech: '(not in table)', type: 'text', length: 40, mandatory: true },
]

export const MANDATORY_KEYS = FIELDS.filter((f) => f.mandatory).map((f) => f.key)
export const MAX_FILE_BYTES = 1024 * 1024

export const emptyAgreement = (contractId) => ({
  contractId,
  customerId: '',
  contractType: '',
  parentContract: '',
  validFrom: '',
  validTo: '',
  rateCard: '',
  status: 'Created',
  attachments: [],
  createdOn: '',
  createdBy: '',
  changedOn: '',
  changedBy: '',
})

// Active indicator is not a stored field: active when approved and today is inside the validity period
export const isActive = (a, todayIso) =>
  a.status === 'Approved' && (!a.validFrom || a.validFrom <= todayIso) && (!a.validTo || a.validTo >= todayIso)

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

export const statusTone = (s) =>
  ({ Created: 'progress', 'Under Approval': 'hold', Approved: 'done', Rejected: 'rejected' })[s] || 'closed'
