// Customer master (ZCUSTOMER_ID value help)
export const CUSTOMERS = [
  { customerId: '1000020', name: 'Vodafone Idea Ltd' },
  { customerId: '1000021', name: 'Bharti Airtel Ltd' },
  { customerId: '1000022', name: 'Reliance Jio Infocomm Ltd' },
  { customerId: '1000023', name: 'Bharat Sanchar Nigam Ltd' },
]

const doc = (name, size, type) => ({ id: `${name}-${size}`, name, size, type })
const PDF = 'application/pdf'

export const MOCK_AGREEMENTS = [
  {
    contractId: 'CONTRA890678900', customerId: '1000020', contractType: 'Long Term', parentContract: '',
    validFrom: '2024-04-01', validTo: '2034-03-31', rateCard: 'Standard DAS 2024', status: 'Approved',
    attachments: [doc('MSA_Vodafone_Idea_signed.pdf', 820000, PDF), doc('Rate_Card_2024.xlsx', 52000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')],
    createdOn: '2024-03-18', createdBy: 'IBUS_OPS01', changedOn: '2024-03-25', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890678901', customerId: '1000020', contractType: 'Permanent', parentContract: 'CONTRA890678900',
    validFrom: '2024-11-25', validTo: '2034-03-31', rateCard: 'Standard DAS 2024', status: 'Approved',
    attachments: [doc('Site_Agreement_BLR0117.pdf', 455000, PDF)],
    createdOn: '2024-11-15', createdBy: 'IBUS_OPS01', changedOn: '2024-11-19', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890679210', customerId: '1000021', contractType: 'Long Term', parentContract: '',
    validFrom: '2025-01-01', validTo: '2034-12-31', rateCard: 'Metro premium', status: 'Approved',
    attachments: [],
    createdOn: '2024-12-10', createdBy: 'IBUS_PM02', changedOn: '2024-12-20', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890679211', customerId: '1000021', contractType: 'Temporary', parentContract: 'CONTRA890679210',
    validFrom: '2025-07-15', validTo: '2026-07-14', rateCard: 'Event coverage', status: 'Approved',
    attachments: [doc('Temporary_Site_Airoli.pdf', 310000, PDF)],
    createdOn: '2025-07-02', createdBy: 'IBUS_OPS03', changedOn: '2025-07-08', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890680004', customerId: '1000022', contractType: 'Long Term', parentContract: '',
    validFrom: '2025-10-01', validTo: '2035-09-30', rateCard: 'Standard DAS 2025', status: 'Under Approval',
    attachments: [doc('MSA_Jio_draft_v3.pdf', 905000, PDF)],
    createdOn: '2025-09-22', createdBy: 'IBUS_PM02', changedOn: '2025-09-29', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890680005', customerId: '1000022', contractType: 'Permanent', parentContract: 'CONTRA890680004',
    validFrom: '2026-01-01', validTo: '2035-09-30', rateCard: 'Standard DAS 2025', status: 'Created',
    attachments: [],
    createdOn: '2025-12-18', createdBy: 'IBUS_OPS01', changedOn: '', changedBy: '',
  },
  {
    contractId: 'CONTRA890681100', customerId: '1000023', contractType: 'Permanent', parentContract: '',
    validFrom: '2026-03-01', validTo: '2031-02-28', rateCard: 'Government sites', status: 'Rejected',
    attachments: [doc('MSA_BSNL_redline.docx', 120000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')],
    createdOn: '2026-02-10', createdBy: 'IBUS_OPS03', changedOn: '2026-02-20', changedBy: 'IBUS_PM02',
  },
  {
    contractId: 'CONTRA890681101', customerId: '1000020', contractType: 'Temporary', parentContract: 'CONTRA890678900',
    validFrom: '2026-06-30', validTo: '2027-06-29', rateCard: 'Standard DAS 2024', status: 'Under Approval',
    attachments: [],
    createdOn: '2026-06-20', createdBy: 'IBUS_OPS01', changedOn: '', changedBy: '',
  },
]
