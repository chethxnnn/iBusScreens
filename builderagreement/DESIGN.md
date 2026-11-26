# Builder Agreement: iBUS

Built from Builder_Agreement__1.xlsx (sheet "Builder Master": filters + table ZSD_BUILDER_AGREEMENT + "Implement Field validation" + attachment note; Sheet2 is empty), in the same design system as the other iBUS apps.

The sheet has no drawn Manage, Create or Approval layout, so those follow the Customer Agreement app (its twin table).

## Screens
Manage screen
- Filters: Builder ID (F4), State Code (F4), Created By (F4), Created On (date, no F4 in the sheet). Go, Clear.
- Create opens the create screen.
- Table: Contract ID, Builder ID (+ name), State Code, Contract Type, Effective From, Effective To, Status (Y/N), Approval Status, Edit, History. Contract ID stays pinned when scrolling sideways.
- Contract ID opens the approval screen when the agreement is Created or Under Approval, otherwise the read view.

Create screen
- Builder ID (F4, name and state shown below) | Effective From
- Contract Type (dropdown) | Effective To
- Status (Y / N, default Y)
- Attachments: multiple documents, each under 1 MB. Save (Create) and Cancel.

Approval screen
- Pending list (Created and Under Approval) on the left, agreement on the right: Contract ID, Effective From, Builder ID, Effective To, Contract Type, Status, attachments. Approve / Reject with confirm; moves to the next pending agreement; "All caught up" when done.

## Field logic (table ZSD_BUILDER_AGREEMENT)
| Field | Tech name | App behaviour |
|---|---|---|
| Contract ID | ZCONRACT_ID | Assigned on save as CONTRA + 9 digits (sheet sample CONTRA890678900). Placeholder until the team confirms the OData logic (`getNextContractId`) |
| Contract Type | ZCONRACT_TYPE | Dropdown: Permanent, Temporary, Long Term |
| Builder ID | ZBUILDER_ID | F4 from the builder (vendor) master, same IDs as Site Master's builder list (BLD-1001 to BLD-1008) |
| Effective From / To | ZFROM_DT / ZTO_DT | Dates |
| Status | ZACT_IND | Manual Y / N |
| Approval Status | ZSTATUS | Created on save; Approved / Rejected from the approval screen |
| Created / Changed On / By | ZCREATE_ON / ZCREATE_BY / ZCHANGE_ON / ZCHANGE_BY | Set by the system |
| State Code (filter) | from builder master | Not a table field: taken from the builder's state |

## Field validation ("Implement Field validation")
All rules live in `validate()` in src/data/builderFields.js. Messages show under each field, update live after the first save attempt, and the page jumps to the first problem.
- Builder ID required, must exist in the builder master, max 20 characters.
- Contract Type required, must be one of the list values.
- Effective From and Effective To required; Effective To on or after Effective From (the date picker also blocks earlier dates).
- Status must be Y or N; an agreement whose Effective To is already past cannot be Y.
- Attachments: each file must be under 1 MB; larger files are rejected with their name and size.

## Assumptions to confirm
- Manage table columns, create layout and approval screen are not drawn in the sheet; they mirror Customer Agreement.
- State Code comes from the builder master (no state field in the table).
- Status Y/N is the stored active indicator (ZACT_IND), set manually, default Y.
- Nothing in the spec moves an agreement to Under Approval; Created and Under Approval both appear in the pending list.
- Editing does not change the approval status.

## Backend hook-up
All data calls are in src/services/builderService.js (mock). Replace with OData on ZSD_BUILDER_AGREEMENT and the builder (vendor) master. CURRENT_USER and today() stand in for SY-UNAME and SY-DATUM.

## Tested
1440, 1366, 1280, 1024, 768, 430, 390, 360, 320 px: filters (F4 and date), History dialog, approval screen (switch, approve, reject, empty state), read, edit with each validation rule, create with validation, F4, attachments (over 1 MB rejected). No horizontal overflow, no console errors.

## Run
npm install
npm run dev
npm run build   (dist/* is already copied into approuter/resources in this zip)
