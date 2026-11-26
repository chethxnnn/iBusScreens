# Site Master: iBUS redesign

Same skeleton, fields, data layer and BTP deployment (mta.yaml, approuter, xs-security) as before. Only the presentation layer changed.

## Look
- Colours: iBUS navy #003A6C and crimson #CB0046, sampled from the logo.
- Brand device: the diagonal cut of the iBUS "i" mark (list header and site header card).
- Background: the "connected dots" network from the iBUS office wall. Faint on every page (src/assets/mesh-light.svg), stronger inside the navy headers (src/assets/mesh-dark.svg). Regenerate with any seed if needed; opacity is set in styles.css (.app::before, .band::before, .hero-top::before).
- Type: SAP 72 font bundled in src/assets/fonts. Every font size uses an SAP Horizon token (--sapFontSize, --sapFontSmallSize, --sapFontLargeSize, --sapFontHeader2Size to --sapFontHeader5Size).
- No app header. The Work Zone shell header is used.

## List
- Header: Back button, Site Master title, Create button.
- Filter bar with inline value help (F4 key works). On phones it collapses into a "Filters" bar with an active filter count.
- Table on every screen size. On phones it scrolls sideways with Site ID pinned left and Edit pinned right.

## View / edit
- Sticky top bar. Site title appears on scroll; unsaved change counter in edit mode.
- Header card with lifecycle stepper and DAS coverage ring (both computed from existing fields).
- Sliding section tabs, fill meter per section, inline validation that jumps to the first missing field.
- Phones: compact header card (edit mode shows only ID, status and name), read mode in two columns, Cancel and Save in a bottom bar.

## Tested widths
320, 360, 375, 390, 414, 430, 768, 1024, 1440. No horizontal overflow on any screen.

## Files
- src/styles.css: full theme, tokens at the top
- src/ui/status.js: status to tone and lifecycle stage mapping (UI only)
- src/components/StatusBits.jsx: StatusPill, Lifecycle, CoverageRing, BrandSlash
- siteFields.js, mockSites.js, siteService.js: unchanged

## Run
npm install
npm run dev
npm run build   (then copy dist/* into approuter/resources for the mbt build; already done in this zip)
