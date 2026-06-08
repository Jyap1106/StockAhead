# StockAhead Implementation Plan

## 1. Purpose of This Document

This document converts the StockAhead PRD into a practical build plan for an Agentic AI coding agent.

The coding agent should use this document together with:

```text
docs/PRD.md
```

The PRD explains what the product should do.

This implementation plan explains how to build it in phases.

---

## 2. Product Build Goal

Build the MVP version of StockAhead.

StockAhead is a personal essentials replenishment planner that helps users:

1. Track current opened stock.
2. Track unopened backup stock.
3. Estimate when products will run out.
4. Recommend the best double-digit sale date before the user runs out.
5. Group products by sale month.
6. Estimate how much the user should prepare for each sale.
7. Update stock when products are bought, postponed, dismissed, discarded, or opened early.

---

## 3. Technical Direction

### Framework

Use:

```text
Expo React Native
```

### Language

Use:

```text
TypeScript
```

### Storage

Use local storage first:

```text
AsyncStorage
```

### Target Platforms

MVP should run on:

```text
iOS through Expo Go
Android through Expo Go
Web through Expo web
```

### Backend

Do not build a backend for MVP.

### Authentication

Do not build login or sign-up for MVP.

### Cloud Sync

Do not build cloud sync for MVP.

---

## 4. Implementation Priorities

Build in this order:

1. Project setup
2. Theme system
3. Type definitions
4. Sale date logic
5. Inventory math logic
6. Local storage logic
7. Dashboard screen
8. Product form
9. Product card actions
10. Bought flow
11. Forecast grouping
12. Manual QA
13. Web deployment setup

Do not start advanced features until the MVP is stable.

---

## 5. Agentic AI Rules

The coding agent must follow these rules:

1. Read `docs/PRD.md` before making product decisions.
2. Do not add features that are listed as out of scope in the PRD.
3. Do not add unnecessary dependencies.
4. Keep the app beginner-friendly and easy to maintain.
5. Prefer clear code over clever code.
6. Keep calculation logic separate from UI where possible.
7. Do not break existing working features while refactoring.
8. Do not delete user data without confirmation.
9. Use TypeScript types for products, purchase records, and analysis results.
10. Keep all date and sale calculations testable.
11. Keep the dashboard sale-focused.
12. All user-facing labels should use simple language.
13. Do not introduce a backend unless explicitly requested.
14. Do not implement push notifications in MVP.
15. Do not implement expiry date logic in MVP.
16. Do not implement price scraping in MVP.
17. Do not implement barcode scanning in MVP.
18. Do not implement user accounts in MVP.
19. If there is uncertainty, follow the PRD calculation logic.
20. If implementing in stages, leave the app runnable after every stage.

---

## 6. Recommended Folder Structure

The project should eventually use this structure:

```text
StockAhead
├── App.tsx
├── index.ts
├── app.json
├── package.json
├── tsconfig.json
├── netlify.toml
├── README.md
├── docs
│   ├── PRD.md
│   └── IMPLEMENTATION_PLAN.md
└── src
    ├── assets
    ├── components
    ├── data
    ├── lib
    ├── screens
    ├── theme
    └── types
```

Folder purpose:

| Folder | Purpose |
|---|---|
| `src/assets` | Static images, icons, and future font assets |
| `src/components` | Reusable UI components |
| `src/data` | Seed data and mock data |
| `src/lib` | Calculation logic, storage helpers, formatters |
| `src/screens` | Full app screens |
| `src/theme` | Colors, spacing, typography, layout constants |
| `src/types` | Shared TypeScript types |

---

## 7. MVP File Plan

The MVP should be organized into these files.

```text
src/theme/theme.ts
src/types/product.ts
src/data/seedProducts.ts
src/lib/dateMath.ts
src/lib/saleCalendar.ts
src/lib/inventoryMath.ts
src/lib/formatters.ts
src/lib/storage.ts
src/components/AppButton.tsx
src/components/MetricCard.tsx
src/components/SectionHeader.tsx
src/components/ForecastCard.tsx
src/components/ProductCard.tsx
src/components/ProductFormModal.tsx
src/components/BuyModal.tsx
src/screens/DashboardScreen.tsx
App.tsx
```

If the app currently exists in one large `App.tsx`, the agent should refactor carefully into these files without changing behavior.

---

## 8. Phase 1 — Project Setup

### Goal

Create a runnable Expo React Native TypeScript project.

### Required Root Files

```text
package.json
index.ts
app.json
tsconfig.json
netlify.toml
.gitignore
README.md
App.tsx
```

### Required Dependencies

Use these dependencies:

```text
expo
react
react-native
react-dom
react-native-web
@expo/metro-runtime
expo-linear-gradient
@react-native-async-storage/async-storage
typescript
@types/react
```

### Required Scripts

`package.json` should include:

```text
npm run start
npm run web
npm run android
npm run ios
npm run build:web
```

### Acceptance Criteria

Phase 1 is complete when:

- `npm install` works.
- `npx expo start` works.
- `npm run web` works.
- App loads without crashing.
- App displays a basic StockAhead screen.

---

## 9. Phase 2 — Theme System

### Goal

Create a reusable theme file so the UI is consistent.

### File to Create

```text
src/theme/theme.ts
```

### Theme Requirements

The theme should include:

```text
colors
spacing
radius
font sizes
font weights
shadows
```

### Required Color Palette

```text
Background start: #050720
Background middle: #101A55
Background end: #1F55A5
Card background: #121536
Soft card background: #191E4A
Light card background: #232A62
Primary accent: #4CA8FF
Soft accent: #7CCBFF
Main text: #F7F8FF
Muted text: #98A7C8
Very muted text: #657397
Success: #65E6A3
Warning: #FFB85C
Danger: #FF6B8A
```

### UI Style Requirements

The app should feel:

```text
professional
futuristic
rounded
dark mode
clean
premium
mobile-first
```

### Acceptance Criteria

Phase 2 is complete when:

- Colors are no longer hardcoded everywhere.
- Components use the shared theme.
- UI has dark blue gradient background.
- Cards have rounded edges.
- Buttons have clear touch areas.

---

## 10. Phase 3 — Type Definitions

### Goal

Create clear TypeScript types for products, purchases, and calculated analysis.

### File to Create

```text
src/types/product.ts
```

### Required Types

The file should include these types:

```text
FullnessOption
Product
PurchaseRecord
ProductAnalysis
SaleGroup
DraftProductInput
```

### Product Fields

A product should include:

```text
id
name
category
usagePeriodMonths
stockUnitsAtUpdate
stockUpdatedAt
normalPrice
estimatedSalePrice
defaultPurchaseQuantity
bufferDays
postponedUntilSaleKey
dismissedSaleKeys
createdAt
updatedAt
archived
```

### Purchase Record Fields

A purchase record should include:

```text
id
productId
purchaseDate
saleKey
quantity
unitPrice
totalPrice
createdAt
```

### Product Analysis Fields

Product analysis should include:

```text
product
totalStockUnits
openedFraction
unopenedUnitsEstimate
coverageMonths
daysLeft
runOutDate
safePurchaseDeadline
recommendedSaleDate
saleKey
saleLabel
status
isRisky
isDismissed
estimatedSpend
```

### Acceptance Criteria

Phase 3 is complete when:

- Product-related data uses shared types.
- UI files import types instead of redefining them.
- TypeScript has no type errors.

---

## 11. Phase 4 — Date Math Logic

### Goal

Create reusable date helpers.

### File to Create

```text
src/lib/dateMath.ts
```

### Required Functions

```text
startOfDay(date)
addDays(date, days)
subtractDays(date, days)
addMonthsClamped(date, months)
addDecimalMonths(date, months)
daysBetween(startDate, endDate)
toDateKey(date)
fromDateKey(dateKey)
```

### Important Rule

When adding calendar months, clamp invalid dates to the last valid day of the target month.

Example:

```text
January 31 + 1 month = February 28
January 31 + 1 month during leap year = February 29
```

### Fractional Month Rule

Use:

```text
1 month = 30.4375 days
```

### Acceptance Criteria

Phase 4 is complete when:

- Date helpers work independently.
- Date helpers do not depend on React.
- Run-out date math is predictable.
- Month-end dates do not overflow incorrectly.

---

## 12. Phase 5 — Sale Calendar Logic

### Goal

Create double-digit sale date utilities.

### File to Create

```text
src/lib/saleCalendar.ts
```

### Required Sale Dates

The app must support:

```text
1.1
2.2
3.3
4.4
5.5
6.6
7.7
8.8
9.9
10.10
11.11
12.12
```

### Required Functions

```text
generateSaleDates(today, yearsAhead)
getSaleKey(date)
parseSaleKey(saleKey)
formatSaleLabel(date, today)
findLatestSaleBefore(deadline, today)
findNextSaleAfter(date, today)
isSaleDate(date)
```

### Sale Key Format

Use:

```text
YYYY-MM-DD
```

Example:

```text
2026-08-08
```

### Acceptance Criteria

Phase 5 is complete when:

- Sale dates are generated for current year plus at least 5 future years.
- The app can find the latest sale before a deadline.
- The app can find the next sale after a date.
- Sale labels display as `8.8`, `9.9`, `10.10`, `11.11`, etc.
- Sale labels include year suffix when needed, such as `1.1 '27`.

---

## 13. Phase 6 — Inventory Math Logic

### Goal

Create the core stock calculation engine.

### File to Create

```text
src/lib/inventoryMath.ts
```

### Required Functions

```text
getFullnessFraction(labelOrValue)
calculateTotalStockUnits(openedFraction, backupQuantity)
calculateCoverageMonths(usagePeriodMonths, totalStockUnits)
calculateRunOutDate(today, coverageMonths)
calculateSafePurchaseDeadline(runOutDate, bufferDays)
getCurrentUnits(product, today)
getOpenedFraction(unitsRemaining)
getUnopenedUnitsEstimate(unitsRemaining)
analyzeProduct(product, today)
groupAnalysesBySaleEvent(analyses)
```

### Core Formula

```text
Total stock units = current opened fullness fraction + unopened backup quantity
```

```text
Coverage months = usage period months x total stock units
```

```text
Run-out date = today + coverage months
```

```text
Safe purchase deadline = run-out date - buffer days
```

```text
Recommended sale date = latest sale date on or before safe purchase deadline
```

### Default Buffer

Use:

```text
5 days
```

### Status Logic

Supported statuses:

```text
safe
scheduled
urgent
overdue
risky
dismissed
```

For MVP, the most important statuses are:

```text
scheduled
urgent
risky
dismissed
```

### Acceptance Criteria

Phase 6 is complete when these test cases pass:

#### Test Case 1

Input:

```text
Today: June 8, 2026
Usage period: 3 months
Current opened: Full
Backup: 0
Buffer: 5 days
```

Expected:

```text
Coverage: 3 months
Run-out date: September 8, 2026
Safe deadline: September 3, 2026
Recommended sale: 8.8
```

#### Test Case 2

Input:

```text
Today: June 8, 2026
Usage period: 3 months
Current opened: 2/4
Backup: 2
Buffer: 5 days
```

Expected:

```text
Total stock units: 2.5
Coverage: 7.5 months
Recommended sale: 1.1 '27
```

#### Test Case 3

Input:

```text
Today: June 8, 2026
Usage period: 1 month
Current opened: 1/4
Backup: 0
Buffer: 5 days
```

Expected:

```text
Status: urgent
Label: Buy Now
```

---

## 14. Phase 7 — Local Storage

### Goal

Save products and purchase records locally.

### File to Create

```text
src/lib/storage.ts
```

### Storage Keys

Use:

```text
@stockahead/products-v1
@stockahead/purchases-v1
```

### Required Functions

```text
loadProducts()
saveProducts(products)
loadPurchaseRecords()
savePurchaseRecords(records)
clearAllLocalData()
```

### MVP Rule

The app should use seed products only if no saved products exist.

### Acceptance Criteria

Phase 7 is complete when:

- Products remain after app reload.
- Bought updates remain after app reload.
- Product edits remain after app reload.
- Deleted products stay deleted after reload.
- Storage failures do not crash the app.

---

## 15. Phase 8 — Seed Data

### Goal

Create starter products for first app launch.

### File to Create

```text
src/data/seedProducts.ts
```

### Required Seed Products

Include at least:

```text
Face cleanser
Toothpaste
```

### Example Seed Product 1

```text
Name: Face cleanser
Category: Skincare
Usage period: 3 months
Stock units: 1
Normal price: RM60
Estimated sale price: RM45
Default purchase quantity: 1
```

### Example Seed Product 2

```text
Name: Toothpaste
Category: Bathroom
Usage period: 2 months
Stock units: 1.25
Normal price: RM18
Estimated sale price: RM13
Default purchase quantity: 2
```

### Acceptance Criteria

Phase 8 is complete when:

- First launch shows sample products.
- Second launch does not duplicate sample products.
- User can delete sample products.

---

## 16. Phase 9 — Formatter Helpers

### Goal

Create shared formatting functions.

### File to Create

```text
src/lib/formatters.ts
```

### Required Functions

```text
formatCurrency(value, currency)
formatDate(date)
formatMonths(months)
formatStockLabel(openedFraction, unopenedUnits)
formatPricePerUnit(quantity, price)
```

### Currency Rule

Default currency:

```text
RM
```

### Acceptance Criteria

Phase 9 is complete when:

- Currency displays consistently.
- Dates display consistently.
- Coverage duration displays clearly.
- Sale labels are readable.

---

## 17. Phase 10 — Reusable UI Components

### Goal

Create reusable UI building blocks.

### Files to Create

```text
src/components/AppButton.tsx
src/components/MetricCard.tsx
src/components/SectionHeader.tsx
src/components/ForecastCard.tsx
```

### AppButton Requirements

Variants:

```text
primary
ghost
danger
warning
```

### MetricCard Requirements

Used for dashboard metrics:

```text
Next event
Next budget
4-event forecast
```

### SectionHeader Requirements

Used before dashboard sections:

```text
Upcoming sale forecast
Products
```

### ForecastCard Requirements

Used in horizontal sale forecast list.

### Acceptance Criteria

Phase 10 is complete when:

- Dashboard uses reusable components.
- Buttons have consistent styling.
- Metric cards have consistent styling.
- Forecast cards have consistent styling.

---

## 18. Phase 11 — Product Card Component

### Goal

Create a reusable product card.

### File to Create

```text
src/components/ProductCard.tsx
```

### Required Props

```text
analysis
onBought
onPostpone
onDismiss
onEdit
onDiscardCurrent
onDiscardBackup
onOpenNew
onDelete
```

### Product Card Must Show

```text
Product name
Category
Recommendation status
Coverage remaining
Opened stock fullness
Backup stock estimate
Run-out date
Safe deadline
Normal price
Estimated sale spend
Action buttons
```

### Required Actions

```text
Bought
Postpone
Dismiss
Edit
Discard current
Discard backup
Open new
Delete
```

### Acceptance Criteria

Phase 11 is complete when:

- Each product displays correctly.
- Each action button calls the correct handler.
- Urgent, risky, dismissed, and scheduled products have different visual labels.
- Card looks good on narrow mobile screens.

---

## 19. Phase 12 — Product Form Modal

### Goal

Allow user to add and edit products.

### File to Create

```text
src/components/ProductFormModal.tsx
```

### Required Fields

```text
Product name
Category or folder
Usage period in months
Current opened stock fullness
Unopened backup stock
Normal price
Estimated sale price
Default purchase quantity
```

### Current Opened Stock Options

```text
Full
3/4
2/4
1/4
```

### Validation Rules

```text
Product name is required
Usage period must be more than 0
Unopened backup stock cannot be negative
Normal price cannot be negative
Estimated sale price cannot be negative
Default purchase quantity must be at least 1
```

### Save Behavior

When adding:

```text
Create new product
Set createdAt
Set updatedAt
Set stockUpdatedAt
Calculate stock units from opened fullness + backup quantity
```

When editing:

```text
Update existing product
Reset stock units based on form
Set updatedAt
Set stockUpdatedAt
Clear postponed status
Clear dismissed sale keys
Recalculate dashboard
```

### Acceptance Criteria

Phase 12 is complete when:

- User can add product.
- User can edit product.
- Invalid products cannot be saved.
- Product appears immediately after saving.
- Product calculations update immediately after saving.

---

## 20. Phase 13 — Bought Modal

### Goal

Allow user to mark a product as bought.

### File to Create

```text
src/components/BuyModal.tsx
```

### Required Fields

```text
Quantity bought
Actual price paid per unit
```

### Validation Rules

```text
Quantity bought must be at least 1
Actual price cannot be negative
```

### Confirm Behavior

When user confirms:

```text
Calculate current remaining stock
Add bought quantity
Update stockUnitsAtUpdate
Update stockUpdatedAt
Update estimatedSalePrice if actual price is provided
Update defaultPurchaseQuantity to latest bought quantity if desired
Clear postponed status
Clear dismissed sale keys
Create purchase record if purchase history is implemented
Recalculate dashboard
```

### Acceptance Criteria

Phase 13 is complete when:

- User can mark product as bought.
- Stock increases correctly.
- Next recommendation moves further into future.
- Modal closes after update.
- Dashboard refreshes immediately.

---

## 21. Phase 14 — Dashboard Screen

### Goal

Build the main dashboard screen.

### File to Create

```text
src/screens/DashboardScreen.tsx
```

### Dashboard Must Include

```text
App title
Tagline
Add product button
Next event metric
Next budget metric
4-event forecast metric
Priority dashboard card
Horizontal upcoming sale forecast
Product list
Product action handlers
Product form modal
Bought modal
```

### Dashboard Priority Order

Display in this order:

1. Urgent products
2. Next sale event
3. Upcoming sale forecast
4. Product list

### Grouping Rule

Products should be grouped by recommended sale event.

Group label examples:

```text
Buy Now
8.8 Sale
9.9 Sale
10.10 Sale
1.1 '27 Sale
```

### Budget Formula

```text
Estimated product spend = estimated sale price x default purchase quantity
```

```text
Group spend = sum of estimated product spend for products in that group
```

### Acceptance Criteria

Phase 14 is complete when:

- Dashboard clearly shows what to buy next.
- Next event is visually prominent.
- Estimated budget is visible.
- Forecast shows upcoming sale groups.
- Product cards are scrollable.
- Add product flow works.
- Bought flow works.
- Postpone flow works.
- Dismiss flow works.
- Discard actions work.
- Delete action asks for confirmation.

---

## 22. Phase 15 — Main App Composition

### Goal

Connect the app root to the dashboard.

### File to Update

```text
App.tsx
```

### App Responsibilities

`App.tsx` should:

```text
Load theme background
Render SafeAreaView
Render DashboardScreen
Keep root app simple
```

### Acceptance Criteria

Phase 15 is complete when:

- `App.tsx` is small and readable.
- Main dashboard loads correctly.
- App has no startup crash.
- App works on web and mobile.

---

## 23. Phase 16 — Manual Product Actions

### Goal

Implement all product action behaviors.

### Required Actions

#### Bought

```text
Open bought modal
Ask quantity
Ask actual price
Update stock
Recalculate next sale
```

#### Postpone

```text
Move product to next double-digit sale
Warn if risky
Allow user to confirm risky postpone
```

#### Dismiss

```text
Hide product for current sale key
Do not delete product
Allow future reminders to reappear
```

#### Edit

```text
Open product form with current values
Save changes
Recalculate
```

#### Discard Current

```text
Remove current opened fraction from available stock
Recalculate
```

#### Discard Backup

```text
Remove 1 unopened unit if available
Show warning if no backup exists
Recalculate
```

#### Open New

```text
Require at least 1 backup unit
Discard remaining opened fraction
Treat backup as new opened unit
Recalculate
```

#### Delete

```text
Ask confirmation
Remove product from list
Save storage
```

### Acceptance Criteria

Phase 16 is complete when all required actions work correctly and persist after reload.

---

## 24. Phase 17 — Purchase History Preparation

### Goal

Prepare for future savings tracking without overbuilding.

### Recommended File

```text
src/types/product.ts
```

Include `PurchaseRecord`.

### Optional Storage

```text
@stockahead/purchases-v1
```

### MVP Behavior

If simple to implement, save purchase records when user marks a product as bought.

If not simple, postpone full purchase history to future development.

### Future Savings Formula

```text
Savings = (normal price - actual unit price) x quantity bought
```

### Acceptance Criteria

Phase 17 is complete if:

- Bought flow can store purchase record, or
- Code structure can support purchase history later without major rewrite.

---

## 25. Phase 18 — Web Deployment Setup

### Goal

Allow free web preview deployment.

### Required File

```text
netlify.toml
```

### Required Build Command

```text
npm run build:web
```

### Required Publish Directory

```text
dist
```

### Netlify Settings

If Netlify asks manually:

```text
Build command: npm run build:web
Publish directory: dist
```

### Acceptance Criteria

Phase 18 is complete when:

- App builds for web.
- Netlify can deploy from GitHub.
- Netlify preview link opens the app.
- Refreshing the Netlify page does not break routing.

---

## 26. Phase 19 — Manual QA Checklist

The coding agent or user should test these flows manually.

### Add Product Test

Steps:

```text
Tap +
Enter product name: Shampoo
Category: Bathroom
Usage period: 2
Current opened stock: Full
Backup stock: 1
Normal price: 35
Estimated sale price: 25
Usually buy quantity: 1
Save
```

Expected:

```text
Product appears on dashboard
Coverage is about 4 months
Recommended sale date is calculated
Estimated spend is RM25
```

---

### Edit Product Test

Steps:

```text
Tap Edit on Shampoo
Change backup stock from 1 to 2
Save
```

Expected:

```text
Coverage increases
Run-out date moves later
Recommended sale date moves later
```

---

### Bought Test

Steps:

```text
Tap Bought
Quantity bought: 2
Actual price: 22
Confirm
```

Expected:

```text
Stock increases by 2 units
Estimated sale price updates to RM22 if implemented
Next reminder moves further into future
Dashboard budget updates
```

---

### Postpone Test

Steps:

```text
Tap Postpone
```

Expected:

```text
Product moves to next sale event
If unsafe, app shows warning
Risky product is visually marked
```

---

### Dismiss Test

Steps:

```text
Tap Dismiss
```

Expected:

```text
Product reminder hides for current sale event
Product is not deleted
```

---

### Discard Current Test

Steps:

```text
Set current opened stock to 2/4
Tap Discard current
```

Expected:

```text
0.5 unit is removed
Coverage decreases
Recommendation recalculates
```

---

### Discard Backup Test

Steps:

```text
Make sure product has backup stock
Tap Discard backup
```

Expected:

```text
Backup decreases by 1
Coverage decreases
Recommendation recalculates
```

---

### Open New Test

Steps:

```text
Make sure product has backup stock
Tap Open new
```

Expected:

```text
Current opened remainder is discarded
A backup unit becomes the active opened stock
Coverage decreases only by discarded opened remainder
Recommendation recalculates
```

---

### Delete Test

Steps:

```text
Tap Delete
Confirm delete
```

Expected:

```text
Product disappears
Product does not return after reload
```

---

### Persistence Test

Steps:

```text
Add a product
Close app
Reopen app
```

Expected:

```text
Product is still there
```

---

## 27. Core Math Test Cases

The coding agent should validate these cases.

### Case 1: Full Cleanser

Input:

```text
Today: 2026-06-08
Usage period: 3 months
Current opened: Full
Backup: 0
Buffer: 5 days
```

Expected:

```text
Total stock units: 1
Coverage months: 3
Run-out date: 2026-09-08
Safe deadline: 2026-09-03
Recommended sale: 2026-08-08
Sale label: 8.8
Status: scheduled
```

---

### Case 2: Half Cleanser with Two Backups

Input:

```text
Today: 2026-06-08
Usage period: 3 months
Current opened: 2/4
Backup: 2
Buffer: 5 days
```

Expected:

```text
Total stock units: 2.5
Coverage months: 7.5
Recommended sale: 2027-01-01
Sale label: 1.1 '27
Status: scheduled
```

---

### Case 3: Almost Empty Toothpaste

Input:

```text
Today: 2026-06-08
Usage period: 1 month
Current opened: 1/4
Backup: 0
Buffer: 5 days
```

Expected:

```text
Total stock units: 0.25
Coverage months: 0.25
No valid sale before safe deadline
Sale label: Buy Now
Status: urgent
```

---

### Case 4: Bought More Than Planned

Input before bought action:

```text
Current remaining stock: 0.8 units
Bought quantity: 3
```

Expected:

```text
Updated stock units: 3.8
Run-out date moves later
Recommended sale date recalculates
```

---

### Case 5: Postpone Beyond Safe Deadline

Input:

```text
Recommended sale: 2026-08-08
Safe deadline: 2026-09-03
User postpones to: 2026-09-09
```

Expected:

```text
Status: risky
Warning is shown
User can still confirm
```

---

## 28. Local Run Commands

Use PowerShell on Windows.

### First-Time Setup

```text
cd Desktop
git clone https://github.com/Jyap1106/StockAhead.git
cd StockAhead
npm install
npx expo start
```

### If Project Already Exists Locally

```text
cd Desktop
cd StockAhead
git pull
npm install
npx expo start
```

### Run Web Preview

```text
npm run web
```

### Clear Expo Cache

```text
npx expo start --clear
```

### Build Web Output

```text
npm run build:web
```

---

## 29. GitHub Workflow for Beginner User

The user prefers this workflow:

1. AI gives full files.
2. User pastes files into GitHub.
3. User commits on GitHub.
4. User pulls locally.
5. User runs the app.

The coding agent should therefore provide future changes like this:

```text
STEP 1 — File action
CREATE, REPLACE, or EDIT exact file path.

STEP 2 — Full copy-and-paste code
Provide complete file content.

STEP 3 — What this file does
Explain simply.

STEP 4 — Run commands
Provide exact PowerShell commands.

STEP 5 — What the user should see
Explain expected screen.
```

Do not provide partial snippets unless the user specifically asks for a small fix.

---

## 30. Deployment Workflow

### Netlify Deployment

Use this flow:

1. Go to Netlify.
2. Choose Add New Project.
3. Choose Import Existing Project.
4. Connect GitHub.
5. Select the StockAhead repo.
6. Netlify should read `netlify.toml`.

If manual settings are needed:

```text
Build command: npm run build:web
Publish directory: dist
```

### After Deployment

Expected result:

```text
Netlify gives a public preview URL
App opens in the browser
Dashboard appears
Data saves locally in browser storage
```

---

## 31. Common Errors and Preferred Fixes

### Error: Repository Not Found

Likely cause:

```text
Repo is private
Wrong GitHub URL
GitHub authentication issue
```

Preferred fix:

```text
Open repo in browser
Click Code
Copy HTTPS URL
Use that exact URL with git clone
```

---

### Error: npm install fails

Preferred first fix:

```text
npm cache clean --force
npm install
```

---

### Error: Expo port already used

Preferred fix:

```text
npx expo start --clear
```

If asked to use another port:

```text
Type y
Press Enter
```

---

### Error: TypeScript cannot find a file

Likely cause:

```text
File path typo
Wrong capitalization
Missing export
Missing import
```

Preferred fix:

```text
Check exact file path
Check exact import path
Check file capitalization
```

---

### Error: App opens blank on web

Likely cause:

```text
Runtime error
Broken import
Invalid component export
```

Preferred fix:

```text
Check terminal error
Check browser console
Fix first listed error
Restart with npm run web
```

---

## 32. MVP Definition of Done

The MVP is done when all of these are true.

### App Startup

```text
App runs with npx expo start
App runs with npm run web
App does not crash on load
```

### Dashboard

```text
Dashboard shows StockAhead title
Dashboard shows next sale event
Dashboard shows next budget
Dashboard shows 4-event forecast
Dashboard shows priority sale card
Dashboard shows upcoming sale forecast
Dashboard shows product list
```

### Product Management

```text
User can add product
User can edit product
User can delete product
User can categorize product
User can input usage period
User can select opened stock fullness
User can input backup stock
User can input normal price
User can input estimated sale price
User can input default purchase quantity
```

### Calculation

```text
App calculates total stock units
App calculates coverage months
App calculates run-out date
App applies 5-day buffer
App finds latest valid double-digit sale before safe deadline
App marks product urgent when no valid sale exists
App recalculates after every update
```

### Actions

```text
Bought action works
Postpone action works
Dismiss action works
Discard current action works
Discard backup action works
Open new action works
Delete action confirms before deleting
```

### Persistence

```text
Products remain after reload
Edited products remain after reload
Deleted products do not return after reload
Bought updates remain after reload
```

### Deployment

```text
npm run build:web works
Netlify deploy works
Web preview opens successfully
```

---

## 33. Future Development Plan

After MVP is stable, build these in order.

### Future Phase 1 — Refined Navigation

Add navigation only when there are multiple screens.

Potential screens:

```text
Dashboard
Products
Budget
History
Settings
```

Recommended package later:

```text
@react-navigation/native
```

Do not add navigation before it is needed.

---

### Future Phase 2 — Category Folders

Add folder/category filtering.

Features:

```text
View all products
Filter by category
Show category spending
Edit category names
```

---

### Future Phase 3 — Purchase History

Add purchase history screen.

Features:

```text
List past purchases
Show date bought
Show quantity
Show unit price
Show total price
Show related sale event
```

---

### Future Phase 4 — Savings Tracker

Add savings calculation.

Formula:

```text
Savings = (normal price - actual price paid) x quantity
```

Dashboard examples:

```text
You saved RM36 on 8.8
You saved RM220 this year
Best recorded cleanser price: RM39
```

---

### Future Phase 5 — Notifications

Add local notifications.

Reminder types:

```text
Before sale day
On sale day
Urgent item reminder
Monthly budget reminder
```

Do not build this in MVP.

---

### Future Phase 6 — Cloud Sync

Add backend only after local MVP is useful.

Possible backend options later:

```text
Supabase
Firebase
Appwrite
Custom API
```

Do not build this in MVP.

---

## 34. Final Build Instruction for Agentic AI

Build StockAhead as a local-first Expo React Native TypeScript app.

The most important part is the calculation logic.

The dashboard must answer:

1. What should I buy next?
2. When should I buy it?
3. How much money should I prepare?
4. How long will my current stock last?

Do not overbuild.

Do not add backend features.

Do not add complex automation.

First make the app useful for one personal user.

Once the MVP is stable, future features can be added safely.
