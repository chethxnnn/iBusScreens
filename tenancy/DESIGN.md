# Tenancy Master: iBUS

Built from Tenancy_Master_1.xlsx (Screen Design, Sheet1 = table ZSD_TENANCY_MASTER, Approval Screen), in the same design system as Site Master and Developed Area Master.

## Screens
Manage screen
- Filters: Customer ID (F4), Tenancy ID (F4), Sequence Effective Date (date), Created By (F4), Created On (date), Reference Contract ID (F4). Go, Clear.
- Create opens the create screen.
- Table: Tenancy ID, Reference Site ID, Customer ID, On-Air Date, Current Tenancy Sequence, Sequence Effective Date, Reference Contract ID, Billable Area, Billing Frequency, Rent Applicable, Rental Basis ID, P & F Applicable, P & F Derivation, Tenancy Status, Change History (opens list), History (opens created/changed info), Active Indicator, Edit. Tenancy ID and Edit stay pinned while scrolling sideways.

Create screen
- Tenancy details: Customer ID (F4), On-Air Date, Reference Site ID (F4), Current Tenancy Sequence (dropdown), Reference Contract ID (F4), Sequence Effective Date.
- Billing and charges: Billable Area, Rental Basis ID (Yes / No), Billing Frequency, P & F Applicable, Rent Applicable, P & F Derivation.
- Attachments: multiple documents, each under 1 MB.

Approval screen
- Opening a tenancy in status Created or Under Customer Approval shows all fields read-only with Approve and Reject (with a confirm step).

## Field logic (Sheet1)
| Field | Tech name | App behaviour |
|---|---|---|
| Tenancy ID | ZTENANCY_ID | Number range TENAN + 5 digits (sample TENAN09778), read-only |
| Reference Site ID | Z (TBC) | F4 from Site Master |
| Customer ID | ZCUSTOMER_ID | F4 from customer master, name shown below |
| On-Air Date | ZAIR_DATE | Date |
| Current Tenancy Sequence | ZTENANCY_FRQ | Dropdown T1 to T4 |
| Sequence Effective Date | ZSEQ_DATE | Date |
| Reference Contract ID | ZCONTRACT_ID | F4 from MSA / Site Agreement, filtered to the selected customer |
| Billable Area | ZBILLABLE_AREA | Text, max 50 |
| Billing Frequency | ZBILLING_FREQUENCY | Dropdown (Monthly / Quarterly / Half Yearly / Yearly, Advance or Arrears) |
| Rent Applicable | ZRENT_APPLICABLE | Dropdown: As per builder, Fixed, FOC |
| Rental Basis ID | ZBASIS_ID | Yes / No indicator |
| P & F Applicable | ZP&F_APPLICABLE | Dropdown: Applicable, FOC |
| P & F Derivation | ZP&F_DERIVATION | Text (type not given in the sheet) |
| Tenancy Status | ZSTATUS_ID | Created on save; Approved / Rejected from the approval screen |
| Change History | - | New entry (sequence, effective date, changed on/by) on create and whenever sequence or effective date changes |
| Created / Changed On / By | ZCREATE_ON / ZCREATE_BY / ZCHANGE_ON / ZCHANGE_BY | Set by the system |

Required (*): all fields except Rental Basis ID and P & F Derivation.

## Assumptions to confirm
- Active Indicator is not in the table: shown as Active when status is Approved.
- No action in the spec moves a tenancy to Under Customer Approval; both Created and Under Customer Approval can be approved or rejected.
- Editing does not change the status.
- Billing Frequency list beyond "Monthly Advance, Year Advance etc." is a proposal.
- Changing the customer clears a contract that belongs to another customer.

## Backend hook-up
All data calls are in src/services/tenancyService.js (mock). Replace with OData on ZSD_TENANCY_MASTER and the customer, Site Master and contract entities. CURRENT_USER and today() stand in for SY-UNAME and SY-DATUM.

## Tested
1440, 1280, 1024, 768, 430, 390, 360, 320 px: filters and F4, date filters, change history and history dialogs, create with validation, all F4s, dropdowns, Yes / No, attachments (over 1 MB rejected), approve, reject, edit with change history entry. No horizontal overflow, no console errors.

## Run
npm install
npm run dev
npm run build   (dist/* is already copied into approuter/resources in this zip)
