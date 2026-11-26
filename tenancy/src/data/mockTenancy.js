// Customer master (ZCUSTOMER_ID value help)
export const CUSTOMERS = [
  { customerId: '1000020', name: 'Vodafone Idea Ltd' },
  { customerId: '1000021', name: 'Bharti Airtel Ltd' },
  { customerId: '1000022', name: 'Reliance Jio Infocomm Ltd' },
  { customerId: '1000023', name: 'Bharat Sanchar Nigam Ltd' },
]

// Site Master reference (Reference Site ID value help)
export const REF_SITES = [
  { siteId: 'SITE100001', siteName: 'Phoenix Marketcity Bengaluru', cityName: 'Bengaluru' },
  { siteId: 'SITE100002', siteName: 'Mindspace IT Park, Airoli', cityName: 'Mumbai' },
  { siteId: 'SITE100003', siteName: 'Max Super Speciality Hospital, Saket', cityName: 'New Delhi' },
  { siteId: 'SITE100004', siteName: 'Novotel Hyderabad Convention Centre', cityName: 'Hyderabad' },
  { siteId: 'SITE100005', siteName: 'Sobha Neopolis, Panathur', cityName: 'Bengaluru' },
  { siteId: 'SITE100006', siteName: 'Sardar Patel Bhawan, Patna', cityName: 'Patna' },
  { siteId: 'SITE100007', siteName: 'IndiQube Golf Course Road', cityName: 'Gurugram' },
  { siteId: 'SITE100008', siteName: 'Express Avenue, Royapettah', cityName: 'Chennai' },
]

// MSA / Site Agreement contracts (Reference Contract ID value help)
export const CONTRACTS = [
  { contractId: 'CONTRACT3456', type: 'MSA', customerId: '1000020' },
  { contractId: 'CONTRACT3457', type: 'Site Agreement', customerId: '1000020' },
  { contractId: 'CONTRACT4102', type: 'MSA', customerId: '1000021' },
  { contractId: 'CONTRACT4118', type: 'Site Agreement', customerId: '1000021' },
  { contractId: 'CONTRACT5021', type: 'MSA', customerId: '1000022' },
  { contractId: 'CONTRACT5040', type: 'Site Agreement', customerId: '1000022' },
  { contractId: 'CONTRACT6007', type: 'MSA', customerId: '1000023' },
]

const doc = (name, size, type) => ({ id: `${name}-${size}`, name, size, type })
const ch = (sequence, effectiveDate, changedOn, changedBy) => ({ sequence, effectiveDate, changedOn, changedBy })

export const MOCK_TENANCIES = [
  {
    tenancyId: 'TENAN09771', refSiteId: 'SITE100001', customerId: '1000020', contractId: 'CONTRACT3456',
    onAirDate: '2024-11-25', sequence: 'T2', seqEffectiveDate: '2025-04-01',
    billableArea: 'L1 to L3 common areas', billingFrequency: 'Monthly Advance', rentApplicable: 'Fixed',
    rentalBasis: true, pfApplicable: 'Applicable', pfDerivation: 'Per sq. ft. of billable area',
    status: 'Approved',
    changeHistory: [ch('T1', '2024-11-25', '2024-11-20', 'IBUS_OPS01'), ch('T2', '2025-04-01', '2025-03-28', 'IBUS_PM02')],
    attachments: [doc('Tenancy_Agreement_VIL_BLR.pdf', 640000, 'application/pdf')],
    createdOn: '2024-11-20', createdBy: 'IBUS_OPS01', changedOn: '2025-03-28', changedBy: 'IBUS_PM02',
  },
  {
    tenancyId: 'TENAN09772', refSiteId: 'SITE100001', customerId: '1000021', contractId: 'CONTRACT4102',
    onAirDate: '2025-04-01', sequence: 'T2', seqEffectiveDate: '2025-04-01',
    billableArea: 'L1 to L3 common areas', billingFrequency: 'Quarterly Advance', rentApplicable: 'As per builder',
    rentalBasis: true, pfApplicable: 'Applicable', pfDerivation: 'Shared with T1 tenant',
    status: 'Approved',
    changeHistory: [ch('T2', '2025-04-01', '2025-03-28', 'IBUS_PM02')],
    attachments: [],
    createdOn: '2025-03-28', createdBy: 'IBUS_PM02', changedOn: '', changedBy: '',
  },
  {
    tenancyId: 'TENAN09773', refSiteId: 'SITE100002', customerId: '1000021', contractId: 'CONTRACT4118',
    onAirDate: '2025-07-15', sequence: 'T1', seqEffectiveDate: '2025-07-15',
    billableArea: 'Towers A and B', billingFrequency: 'Monthly Arrears', rentApplicable: 'Fixed',
    rentalBasis: false, pfApplicable: 'FOC', pfDerivation: '',
    status: 'Under Customer Approval',
    changeHistory: [ch('T1', '2025-07-15', '2025-07-10', 'IBUS_OPS03')],
    attachments: [doc('Site_Agreement_Airoli.pdf', 512000, 'application/pdf'), doc('Billing_Sheet.xlsx', 41000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')],
    createdOn: '2025-07-10', createdBy: 'IBUS_OPS03', changedOn: '', changedBy: '',
  },
  {
    tenancyId: 'TENAN09774', refSiteId: 'SITE100004', customerId: '1000022', contractId: 'CONTRACT5021',
    onAirDate: '2025-10-01', sequence: 'T3', seqEffectiveDate: '2026-01-01',
    billableArea: 'Convention halls and basement', billingFrequency: 'Yearly Advance', rentApplicable: 'FOC',
    rentalBasis: false, pfApplicable: 'Applicable', pfDerivation: 'Fixed monthly P & F',
    status: 'Approved',
    changeHistory: [ch('T2', '2025-10-01', '2025-09-26', 'IBUS_PM02'), ch('T3', '2026-01-01', '2025-12-22', 'IBUS_PM02')],
    attachments: [],
    createdOn: '2025-09-26', createdBy: 'IBUS_PM02', changedOn: '2025-12-22', changedBy: 'IBUS_PM02',
  },
  {
    tenancyId: 'TENAN09775', refSiteId: 'SITE100007', customerId: '1000020', contractId: 'CONTRACT3457',
    onAirDate: '2026-02-10', sequence: 'T1', seqEffectiveDate: '2026-02-10',
    billableArea: 'Office floors 2 to 6', billingFrequency: 'Monthly Advance', rentApplicable: 'Fixed',
    rentalBasis: true, pfApplicable: 'Applicable', pfDerivation: 'Per floor',
    status: 'Rejected',
    changeHistory: [ch('T1', '2026-02-10', '2026-02-03', 'IBUS_OPS01')],
    attachments: [],
    createdOn: '2026-02-03', createdBy: 'IBUS_OPS01', changedOn: '2026-02-12', changedBy: 'IBUS_PM02',
  },
  {
    tenancyId: 'TENAN09776', refSiteId: 'SITE100008', customerId: '1000023', contractId: 'CONTRACT6007',
    onAirDate: '2026-03-20', sequence: 'T1', seqEffectiveDate: '2026-03-20',
    billableArea: 'Mall atrium and parking', billingFrequency: 'Half Yearly Advance', rentApplicable: 'As per builder',
    rentalBasis: true, pfApplicable: 'FOC', pfDerivation: '',
    status: 'Approved',
    changeHistory: [ch('T1', '2026-03-20', '2026-03-16', 'IBUS_OPS03')],
    attachments: [doc('MSA_BSNL.pdf', 720000, 'application/pdf')],
    createdOn: '2026-03-16', createdBy: 'IBUS_OPS03', changedOn: '', changedBy: '',
  },
  {
    tenancyId: 'TENAN09777', refSiteId: 'SITE100006', customerId: '1000022', contractId: 'CONTRACT5040',
    onAirDate: '2026-06-30', sequence: 'T1', seqEffectiveDate: '2026-06-30',
    billableArea: 'Ground and first floor', billingFrequency: 'Quarterly Arrears', rentApplicable: 'Fixed',
    rentalBasis: false, pfApplicable: 'Applicable', pfDerivation: 'Per sq. ft. of billable area',
    status: 'Created',
    changeHistory: [ch('T1', '2026-06-30', '2026-06-24', 'IBUS_PM02')],
    attachments: [],
    createdOn: '2026-06-24', createdBy: 'IBUS_PM02', changedOn: '', changedBy: '',
  },
  {
    tenancyId: 'TENAN09778', refSiteId: 'SITE100003', customerId: '1000020', contractId: 'CONTRACT3456',
    onAirDate: '2026-03-20', sequence: 'T1', seqEffectiveDate: '2026-06-30',
    billableArea: 'UIPBIKL', billingFrequency: 'Monthly Advance', rentApplicable: 'As per builder',
    rentalBasis: true, pfApplicable: 'Applicable', pfDerivation: 'Per sq. ft. of billable area',
    status: 'Under Customer Approval',
    changeHistory: [ch('T1', '2026-06-30', '2026-06-26', 'IBUS_OPS01')],
    attachments: [],
    createdOn: '2026-06-26', createdBy: 'IBUS_OPS01', changedOn: '', changedBy: '',
  },
]
