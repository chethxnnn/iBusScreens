// Field catalogue for table ZSD_TENANCY_MASTER (Tenancy_Master_1.xlsx, Sheet1)
//
// type:
//   auto      system generated, read-only
//   customer  F4 from customer master
//   site      F4 from Site Master
//   contract  F4 from MSA / Site Agreement
//   date      manual date (stored ISO yyyy-mm-dd, shown dd.mm.yyyy)
//   select    dropdown (options below)
//   text      manual text
//   yesno     Yes / No indicator

export const OPTIONS = {
  sequence: ['T1', 'T2', 'T3', 'T4'],
  billingFrequency: [
    'Monthly Advance',
    'Monthly Arrears',
    'Quarterly Advance',
    'Quarterly Arrears',
    'Half Yearly Advance',
    'Yearly Advance',
  ],
  rentApplicable: ['As per builder', 'Fixed', 'FOC'],
  pfApplicable: ['Applicable', 'FOC'],
}

export const STATUSES = ['Created', 'Under Customer Approval', 'Approved', 'Rejected']
export const PENDING_STATUSES = ['Created', 'Under Customer Approval']

// Grouped the way the Create Screen lays them out (4 columns of 3)
export const SECTIONS = [
  {
    id: 'tenancy',
    title: 'Tenancy details',
    note: 'Customer, site, contract and tenancy sequence',
    icon: 'layers',
    fields: [
      { key: 'customerId', label: 'Customer ID', tech: 'ZCUSTOMER_ID', type: 'customer', length: 10, mandatory: true },
      { key: 'onAirDate', label: 'On-Air Date', tech: 'ZAIR_DATE', type: 'date', mandatory: true },
      { key: 'refSiteId', label: 'Reference Site ID', tech: 'Z', type: 'site', length: 14, mandatory: true },
      { key: 'sequence', label: 'Current Tenancy Sequence', tech: 'ZTENANCY_FRQ', type: 'select', options: 'sequence', mandatory: true },
      { key: 'contractId', label: 'Reference Contract ID', tech: 'ZCONTRACT_ID', type: 'contract', length: 14, mandatory: true },
      { key: 'seqEffectiveDate', label: 'Sequence Effective Date', tech: 'ZSEQ_DATE', type: 'date', mandatory: true },
    ],
  },
  {
    id: 'billing',
    title: 'Billing and charges',
    note: 'Billable area, rent and P & F',
    icon: 'briefcase',
    fields: [
      { key: 'billableArea', label: 'Billable Area', tech: 'ZBILLABLE_AREA', type: 'text', length: 50, mandatory: true },
      { key: 'rentalBasis', label: 'Rental Basis ID', tech: 'ZBASIS_ID', type: 'yesno' },
      { key: 'billingFrequency', label: 'Billing Frequency', tech: 'ZBILLING_FREQUENCY', type: 'select', options: 'billingFrequency', mandatory: true },
      { key: 'pfApplicable', label: 'P & F Applicable', tech: 'ZP&F_APPLICABLE', type: 'select', options: 'pfApplicable', mandatory: true },
      { key: 'rentApplicable', label: 'Rent Applicable', tech: 'ZRENT_APPLICABLE', type: 'select', options: 'rentApplicable', mandatory: true },
      { key: 'pfDerivation', label: 'P & F Derivation', tech: 'ZP&F_DERIVATION', type: 'text', length: 50 },
    ],
  },
]

export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields)
export const MANDATORY_KEYS = ALL_FIELDS.filter((f) => f.mandatory).map((f) => f.key)

export const MAX_FILE_BYTES = 1024 * 1024

export const emptyTenancy = (tenancyId) => ({
  tenancyId,
  customerId: '',
  refSiteId: '',
  contractId: '',
  onAirDate: '',
  sequence: '',
  seqEffectiveDate: '',
  billableArea: '',
  billingFrequency: '',
  rentApplicable: '',
  rentalBasis: false,
  pfApplicable: '',
  pfDerivation: '',
  status: 'Created',
  changeHistory: [],
  attachments: [],
  createdOn: '',
  createdBy: '',
  changedOn: '',
  changedBy: '',
})

// Active indicator is not a stored field in the spec: shown as Active once approved
export const isActive = (t) => t.status === 'Approved'

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
  ({ Created: 'progress', 'Under Customer Approval': 'hold', Approved: 'done', Rejected: 'rejected' })[s] || 'closed'
