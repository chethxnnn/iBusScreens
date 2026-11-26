// Field catalogue for table ZSD_BUILDER_AGREEMENT (Builder_Agreement__1.xlsx, sheet "Builder Master")
//
// type:
//   builder   F4 from builder (vendor) master
//   select    dropdown
//   date      manual date (stored ISO yyyy-mm-dd, shown dd.mm.yyyy)
//   yn        Y / N indicator

export const OPTIONS = {
  contractType: ['Permanent', 'Temporary', 'Long Term'],
}

export const STATUSES = ['Created', 'Under Approval', 'Approved', 'Rejected']
export const PENDING_STATUSES = ['Created', 'Under Approval']

export const FIELDS = [
  { key: 'builderId', label: 'Builder ID', tech: 'ZBUILDER_ID', type: 'builder', length: 20, mandatory: true },
  { key: 'effectiveFrom', label: 'Effective From', tech: 'ZFROM_DT', type: 'date', mandatory: true },
  { key: 'contractType', label: 'Contract Type', tech: 'ZCONRACT_TYPE', type: 'select', options: 'contractType', mandatory: true },
  { key: 'effectiveTo', label: 'Effective To', tech: 'ZTO_DT', type: 'date', mandatory: true },
  { key: 'status', label: 'Status', tech: 'ZACT_IND', type: 'yn', length: 1, mandatory: true },
]

export const MANDATORY_KEYS = FIELDS.filter((f) => f.mandatory).map((f) => f.key)
export const MAX_FILE_BYTES = 1024 * 1024

export const emptyAgreement = (contractId) => ({
  contractId,
  builderId: '',
  contractType: '',
  effectiveFrom: '',
  effectiveTo: '',
  status: 'Y',
  approvalStatus: 'Created',
  attachments: [],
  createdOn: '',
  createdBy: '',
  changedOn: '',
  changedBy: '',
})

/**
 * Field validation (sheet note: "Implement Field validation").
 * Returns { fieldKey: message } for every problem found.
 */
export function validate(form, { builderIds, todayIso }) {
  const errors = {}
  if (!form.builderId) errors.builderId = 'Select a builder'
  else if (!builderIds.includes(form.builderId)) errors.builderId = 'Builder ID not found in the builder master'
  else if (form.builderId.length > 20) errors.builderId = 'Builder ID can have at most 20 characters'

  if (!form.contractType) errors.contractType = 'Select the contract type'
  else if (!OPTIONS.contractType.includes(form.contractType)) errors.contractType = 'Choose a contract type from the list'

  if (!form.effectiveFrom) errors.effectiveFrom = 'Select the effective from date'
  if (!form.effectiveTo) errors.effectiveTo = 'Select the effective to date'
  if (form.effectiveFrom && form.effectiveTo && form.effectiveTo < form.effectiveFrom)
    errors.effectiveTo = 'Effective To must be on or after Effective From'

  if (form.status !== 'Y' && form.status !== 'N') errors.status = 'Select Y or N'
  else if (form.status === 'Y' && form.effectiveTo && form.effectiveTo < todayIso && !errors.effectiveTo)
    errors.status = 'An agreement that has ended cannot be active. Set Status to N or extend Effective To'

  return errors
}

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
