// Reference sites, as fetched from Site Master (ZREF_ST_ID value help)
export const REF_SITES = [
  { siteId: 'SITE100001', siteName: 'Phoenix Marketcity Bengaluru', cityName: 'Bengaluru', uom: 'Sq. Ft.' },
  { siteId: 'SITE100002', siteName: 'Mindspace IT Park, Airoli', cityName: 'Mumbai', uom: 'Sq. Ft.' },
  { siteId: 'SITE100003', siteName: 'Max Super Speciality Hospital, Saket', cityName: 'New Delhi', uom: 'Sq. Ft.' },
  { siteId: 'SITE100004', siteName: 'Novotel Hyderabad Convention Centre', cityName: 'Hyderabad', uom: 'Sq. Ft.' },
  { siteId: 'SITE100005', siteName: 'Sobha Neopolis, Panathur', cityName: 'Bengaluru', uom: 'Sq. Ft.' },
  { siteId: 'SITE100006', siteName: 'Sardar Patel Bhawan, Patna', cityName: 'Patna', uom: 'Sq. Ft.' },
  { siteId: 'SITE100007', siteName: 'IndiQube Golf Course Road', cityName: 'Gurugram', uom: 'Sq. Ft.' },
  { siteId: 'SITE100008', siteName: 'Express Avenue, Royapettah', cityName: 'Chennai', uom: 'Sq. Ft.' },
]

const doc = (name, size, type) => ({ id: `${name}-${size}`, name, size, type })

export const MOCK_AREAS = [
  {
    areaId: 'DA00000001', refSiteId: 'SITE100001', developedArea: '1250000', uom: 'Sq. Ft.', rfibDate: '2024-11-18',
    attachments: [doc('RFIB_Certificate_BLR0117.pdf', 412000, 'application/pdf'), doc('Floor_Plan_L1-L3.pdf', 865000, 'application/pdf')],
    createdOn: '2024-11-20', createdBy: 'IBUS_OPS01', changedOn: '2025-02-04', changedBy: 'IBUS_PM02',
  },
  {
    areaId: 'DA00000002', refSiteId: 'SITE100002', developedArea: '740000', uom: 'Sq. Ft.', rfibDate: '2025-06-20',
    attachments: [doc('RFIB_Mindspace_Airoli.pdf', 298000, 'application/pdf')],
    createdOn: '2025-06-23', createdBy: 'IBUS_OPS01', changedOn: '', changedBy: '',
  },
  {
    areaId: 'DA00000003', refSiteId: 'SITE100004', developedArea: '310000', uom: 'Sq. Ft.', rfibDate: '2025-09-02',
    attachments: [],
    createdOn: '2025-09-03', createdBy: 'IBUS_PM02', changedOn: '2025-10-11', changedBy: 'IBUS_OPS03',
  },
  {
    areaId: 'DA00000004', refSiteId: 'SITE100007', developedArea: '205000', uom: 'Sq. Ft.', rfibDate: '2025-12-15',
    attachments: [doc('Site_Photos.zip', 990000, 'application/zip'), doc('Handover_Note.docx', 64000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')],
    createdOn: '2025-12-16', createdBy: 'IBUS_OPS03', changedOn: '', changedBy: '',
  },
  {
    areaId: 'DA00000005', refSiteId: 'SITE100008', developedArea: '480000', uom: 'Sq. Ft.', rfibDate: '2026-02-27',
    attachments: [doc('RFIB_Express_Avenue.pdf', 356000, 'application/pdf')],
    createdOn: '2026-03-02', createdBy: 'IBUS_PM02', changedOn: '2026-04-19', changedBy: 'IBUS_PM02',
  },
  {
    areaId: 'DA00000006', refSiteId: 'SITE100003', developedArea: '96000', uom: 'Sq. Ft.', rfibDate: '2026-05-08',
    attachments: [],
    createdOn: '2026-05-08', createdBy: 'IBUS_OPS01', changedOn: '', changedBy: '',
  },
  {
    areaId: 'DA00000007', refSiteId: 'SITE100006', developedArea: '152000', uom: 'Sq. Ft.', rfibDate: '2026-06-20',
    attachments: [doc('Area_Measurement_Sheet.xlsx', 48000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')],
    createdOn: '2026-06-22', createdBy: 'IBUS_OPS03', changedOn: '', changedBy: '',
  },
  {
    areaId: 'DA00000008', refSiteId: 'SITE100001', developedArea: '85000', uom: 'Sq. Ft.', rfibDate: '2026-08-14',
    attachments: [],
    createdOn: '2026-08-14', createdBy: 'IBUS_PM02', changedOn: '', changedBy: '',
  },
]
