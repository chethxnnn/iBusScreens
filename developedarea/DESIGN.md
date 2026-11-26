# Developed Area Master: iBUS

Built from Developed_Area_Master.xlsx (Screen Design + table ZSD_DEVELOP_AREA), in the same design system as Site Master (see ../sitemaster).

## Screens (as per the Screen Design sheet)
Manage screen
- Filters: Area ID, RFIB Date, Created By, Created On, each with F4 value help. Go, Clear.
- Create button opens the create screen.
- Table: Area ID, Reference Site ID, Developed Area, UOM, RFIB Date (+ Edit, same as Site Master).

Create screen
- Area ID | RFIB Date
- Reference Site ID | UOM
- Developed Area
- Attachments panel: multiple documents, each under 1 MB. Larger files are rejected with a message.
- Save (Create) and Cancel.

## Field logic (Sheet1)
| Field | Tech name | Type | Logic in the app |
|---|---|---|---|
| Area ID | ZAREA_ID | Automatic, CHAR 10 | Number range DA + 8 digits, shown read-only |
| Reference Site ID | ZREF_ST_ID | From Site Master, CHAR 10 | F4 value help listing Site Master sites |
| Developed Area | ZDEV_AREA | Manual, CHAR 30 | Text input, max 30 characters |
| UoM | ZUOM | Automatic | Filled from the selected site (DAS area UoM). Source still to be confirmed: change `uomFromSite` in src/data/areaFields.js |
| RFIB Date | ZRFIB_DT | Manual, DATS | Date picker, shown dd.mm.yyyy |
| Created On / By | ZCREATE_ON / ZCREATE_BY | Automatic | Set on create (SY-DATUM / BTP user) |
| Changed On / By | ZCHANGE_ON / ZCHANGE_BY | Automatic | Set on save (SY-DATUM / BTP user) |

Required (*): Reference Site ID, Developed Area, RFIB Date.

## Backend hook-up
All data calls are in src/services/areaService.js (mock). Replace with OData calls to ZSD_DEVELOP_AREA and the Site Master entity. CURRENT_USER and today() stand in for SY-UNAME and SY-DATUM.

## Run
npm install
npm run dev
npm run build   (dist/* is already copied into approuter/resources in this zip)
