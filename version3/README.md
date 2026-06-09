# StockAhead MVP V3

StockAhead is a local-first Expo React Native app for tracking daily-use essentials, estimating run-out dates, and aligning restock decisions with double-digit sale dates.

## What is included in V3

- Expo React Native + TypeScript app
- Mobile-first dark blue gradient design
- Frozen bottom tab bar with 5 functions:
  - Home
  - Finance unavailable placeholder
  - Add Product modal
  - Calendar
  - Settings
- Home page uses the Inventory-Control layout:
  - Tracked Products summary
  - Total Stock summary
  - Low Stock summary
  - Buy Soon summary
- Next Event Summary appears after the inventory health cards
- Only sale dates with products are shown in the next-event list
- Only one sale month opens at a time by default
- Settings > View has a toggle to allow more than one sale month to stay open
- Product cards are collapsed by default and expand when tapped
- Add Product modal with:
  - Product name
  - Category selection or new category entry
  - Usage period in months
  - Opened stock fullness, including 0
  - Backup stock hidden and cleared when fullness is 0
  - Price
- Removed estimated sale price and default planned purchase quantity from the Add Product form
- Calendar with outlined event markers:
  - Blue outline: Entry / Add product
  - Green outline: Bought something
  - Yellow outline: Postponed
  - Red outline: Discarded backup
- Calendar legends are placed below the calendar
- Local device persistence with AsyncStorage

## Run locally

```bash
npm install
npx expo start -c
```

Then choose one of the Expo options:

```bash
npm run web
npm run android
npm run ios
```

You can also run web from the Expo terminal by pressing `w`.

## Upload into your GitHub repository

Extract the zip, open the extracted folder, and upload the contents into the root of your GitHub repository or into a version folder such as `version3`.

After pulling locally:

```bash
npm install
npx expo start -c
```

## Notes

- Data stays on the user's device.
- There is no login, backend, cloud sync, push notification, price scraping, barcode scanning, or store integration in this MVP.
- The default safety buffer is 5 days.
- Valid sale dates are 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8, 9.9, 10.10, 11.11, and 12.12.
