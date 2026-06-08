# StockAhead MVP

StockAhead is a local-first Expo React Native app for tracking daily-use essentials, estimating run-out dates, and aligning restock reminders with double-digit sale dates.

## What is included

- Expo React Native + TypeScript app
- Mobile-first dark dashboard
- Local device persistence with AsyncStorage
- Add, edit, delete, categorize products
- Track usage period, opened stock fullness, backup stock, normal price, sale price, and planned purchase quantity
- Calculate stock coverage, run-out date, safe purchase deadline, and recommended sale date
- Group products by sale event and show estimated sale spending
- Bought, Postpone, Dismiss, Discard Current, Discard Backup, and Open New actions
- Purchase records stored locally
- Expo Go support for iOS/Android and Expo web preview

## Run locally

```bash
npm install
npm run start
```

Then choose one of the Expo options:

```bash
npm run web
npm run android
npm run ios
```

You can also run web from the Expo terminal by pressing `w`.

## Upload into your GitHub repository

Copy these files into the root of your repository, commit, push, then pull on your local machine.

```bash
git add .
git commit -m "Build StockAhead MVP"
git push
```

After pulling locally:

```bash
npm install
npm run start
```

## Notes

- Data stays on the user's device.
- There is no login, backend, cloud sync, push notification, price scraping, barcode scanning, or store integration in this MVP.
- The default safety buffer is 5 days.
- Valid sale dates are 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8, 9.9, 10.10, 11.11, and 12.12.
