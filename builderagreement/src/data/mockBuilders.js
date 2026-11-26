// Builder (vendor) master: same builder IDs as the Site Master builder list.
// State code drives the State Code filter.
export const BUILDERS = [
  { builderId: 'BLD-1001', name: 'Sobha Limited', stateCode: 'KA' },
  { builderId: 'BLD-1002', name: 'IndiQube Spaces Limited', stateCode: 'HR' },
  { builderId: 'BLD-1003', name: 'Prestige Estates Projects Limited', stateCode: 'KA' },
  { builderId: 'BLD-1004', name: 'Brigade Enterprises Limited', stateCode: 'TN' },
  { builderId: 'BLD-1005', name: 'RMZ Corp', stateCode: 'MH' },
  { builderId: 'BLD-1006', name: 'Embassy Group', stateCode: 'TS' },
  { builderId: 'BLD-1007', name: 'DLF Limited', stateCode: 'DL' },
  { builderId: 'BLD-1008', name: 'Phoenix Mills Limited', stateCode: 'MH' },
]

const doc = (name, size, type) => ({ id: `${name}-${size}`, name, size, type })
const PDF = 'application/pdf'

export const MOCK_AGREEMENTS = [
  {
    contractId: 'CONTRA890690001', builderId: 'BLD-1008', contractType: 'Long Term',
    effectiveFrom: '2024-04-01', effectiveTo: '2034-03-31', status: 'Y', approvalStatus: 'Approved',
    attachments: [doc('Builder_Agreement_Phoenix_BLR.pdf', 760000, PDF)],
    createdOn: '2024-03-12', createdBy: 'IBUS_OPS01', changedOn: '2024-03-20', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890690002', builderId: 'BLD-1005', contractType: 'Permanent',
    effectiveFrom: '2024-09-01', effectiveTo: '2039-08-31', status: 'Y', approvalStatus: 'Approved',
    attachments: [],
    createdOn: '2024-08-19', createdBy: 'IBUS_PM02', changedOn: '2024-08-26', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890690003', builderId: 'BLD-1002', contractType: 'Temporary',
    effectiveFrom: '2025-01-15', effectiveTo: '2026-01-14', status: 'N', approvalStatus: 'Approved',
    attachments: [doc('IndiQube_Temporary_Access.pdf', 280000, PDF)],
    createdOn: '2025-01-06', createdBy: 'IBUS_OPS03', changedOn: '2026-01-15', changedBy: 'IBUS_OPS03',
  },
  {
    contractId: 'CONTRA890690004', builderId: 'BLD-1006', contractType: 'Long Term',
    effectiveFrom: '2025-07-01', effectiveTo: '2035-06-30', status: 'Y', approvalStatus: 'Approved',
    attachments: [doc('Embassy_Master_Agreement.pdf', 910000, PDF), doc('Annexure_Rates.xlsx', 46000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')],
    createdOn: '2025-06-18', createdBy: 'IBUS_PM02', changedOn: '2025-06-27', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890690005', builderId: 'BLD-1007', contractType: 'Permanent',
    effectiveFrom: '2026-01-01', effectiveTo: '2040-12-31', status: 'Y', approvalStatus: 'Under Approval',
    attachments: [doc('DLF_Agreement_draft.pdf', 640000, PDF)],
    createdOn: '2025-12-15', createdBy: 'IBUS_OPS01', changedOn: '2025-12-22', changedBy: 'IBUS_OPS01',
  },
  {
    contractId: 'CONTRA890690006', builderId: 'BLD-1001', contractType: 'Long Term',
    effectiveFrom: '2026-04-01', effectiveTo: '2036-03-31', status: 'Y', approvalStatus: 'Created',
    attachments: [],
    createdOn: '2026-03-20', createdBy: 'IBUS_OPS03', changedOn: '', changedBy: '',
  },
  {
    contractId: 'CONTRA890690007', builderId: 'BLD-1004', contractType: 'Temporary',
    effectiveFrom: '2026-05-01', effectiveTo: '2027-04-30', status: 'N', approvalStatus: 'Rejected',
    attachments: [doc('Brigade_Proposal.docx', 98000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')],
    createdOn: '2026-04-14', createdBy: 'IBUS_PM02', changedOn: '2026-04-21', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890690008', builderId: 'BLD-1003', contractType: 'Permanent',
    effectiveFrom: '2026-08-01', effectiveTo: '2041-07-31', status: 'Y', approvalStatus: 'Under Approval',
    attachments: [],
    createdOn: '2026-07-22', createdBy: 'IBUS_OPS01', changedOn: '', changedBy: '',
  },
]
