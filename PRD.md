# Product Requirements Document: StockAhead

## 1. Product Summary

### Working App Name

StockAhead

### Previous App Name

Inventory Control

### Product Category

Personal inventory reminder and sale-aligned replenishment planner.

### One-Sentence Description

StockAhead helps users track essential daily-use products, estimate when they will run out, and recommend the best upcoming double-digit sale date to restock before running out.

### Core Product Idea

The user enters products they use regularly, such as face cleanser, toothpaste, shampoo, skincare, household goods, or other essentials.

For each product, the app tracks:

- how long one full unit lasts
- how much of the current opened unit remains
- how many unopened backup units the user has
- normal price
- estimated sale price
- default purchase quantity

The app then calculates:

- how long the user is covered
- the estimated run-out date
- the safe purchase deadline
- the best double-digit sale date before the user runs out
- how much money the user should prepare for each sale month

The app should help the user avoid both:

- running out of essential goods
- over-hoarding unnecessary stock

---

## 2. Product Vision

StockAhead should become a personal essentials planning app that helps users buy replenishable products at the right time.

The long-term vision is:

- Track what the user currently owns.
- Predict when each product will run out.
- Match restocking needs with double-digit sales such as 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8, 9.9, 10.10, 11.11, and 12.12.
- Estimate monthly spending.
- Later, track how much money the user saved by buying during sale periods.

The app should feel like a smart personal stock planner, not a warehouse inventory system.

---

## 3. Target User

### Primary User

A person who regularly buys household, personal care, skincare, beauty, health, hygiene, or lifestyle essentials online and wants to buy them during promotional sale periods.

### Example User Behavior

The user may buy items from platforms such as Shopee, Lazada, Amazon, TikTok Shop, or other online retailers.

They often know that items are cheaper during double-digit sale campaigns, but they do not want to buy too much too early.

### User Goals

The user wants to know:

1. What should I buy for the upcoming sale?
2. When should I buy each product before I run out?
3. How much money should I prepare for each sale month?
4. Am I overstocking?
5. Which products are safe and which products are urgent?

---

## 4. Problem Statement

Users often use essential products on a predictable cycle.

Example:

- Product: Face cleanser
- Usage period: 3 months
- Current stock: 1 full unit
- Backup stock: 0 units

If the user starts using the cleanser now, they will run out in about 3 months.

If the run-out month is September, the app should not wait until September to tell the user to buy.

Instead, the app should recommend the closest double-digit sale date before the item runs out, with a small safety buffer.

Example:

- Run-out date: September 8
- Safety buffer: 5 days
- Safe deadline: September 3
- 9.9 is too late
- 8.8 is the best sale date
- Recommendation: Buy on 8.8

The app must make this decision automatically.

---

## 5. MVP Priority Order

The MVP should prioritize the following in this order:

1. Show what the user needs to buy for the upcoming sale.
2. Show when the user needs to buy each product.
3. Show how much money the user should prepare for each sale month.

This means the dashboard should be sale-focused first, not just a long inventory list.

---

## 6. MVP Scope

### In Scope for MVP

The MVP must include:

- Add product
- Edit product
- Delete product
- Track product category or folder
- Track usage period
- Track current opened stock fullness
- Track unopened backup stock
- Track normal price
- Track estimated sale price
- Track default planned purchase quantity
- Calculate estimated stock coverage
- Calculate estimated run-out date
- Apply a default safety buffer
- Calculate the recommended double-digit sale date
- Group products by sale month
- Show estimated sale spending per sale month
- Mark product as bought
- Ask how many units were bought
- Ask actual price paid per unit
- Update stock after buying
- Postpone reminder
- Dismiss reminder
- Discard current opened stock
- Discard unopened backup stock
- Open a new unit early
- Save data locally on the device
- Work on mobile through Expo
- Work as a web preview for testing

### Out of Scope for MVP

The MVP must not include yet:

- User login
- Cloud sync
- Multi-device sync
- Family sharing
- Push notifications
- Shipping time calculation
- Product expiry date calculation
- Automatic price scraping
- Barcode scanning
- Receipt scanning
- AI product recognition
- Store/platform integration
- Currency exchange
- Sale importance weighting
- Inventory expiry optimization
- Complex analytics
- Paid subscription logic

---

## 7. Important Product Rules

### Rule 1: The app is preparation-first

The app should not wait until the product is empty.

It should recommend a restock date before the product runs out.

### Rule 2: The app should align with sale dates

The app should recommend the latest valid double-digit sale date before the user runs out.

### Rule 3: The app should avoid over-hoarding

If the user has enough stock to last many months, the app should not recommend buying in the next sale.

### Rule 4: User actions update the calculation

When the user buys, discards, opens, or edits a product, the app must recalculate the next recommended sale date.

### Rule 5: The dashboard is the main reminder surface

For MVP, reminders are shown inside the app dashboard.

Push notifications are not required for MVP.

---

## 8. Glossary

### Product

A trackable item that the user consumes over time.

Examples:

- face cleanser
- toothpaste
- shampoo
- laundry detergent
- toothbrush
- moisturizer

### Unit

One full item or package.

Example:

- 1 bottle of cleanser
- 1 tube of toothpaste
- 1 pack of detergent

### Opened Stock

The current unit the user is already using.

### Backup Stock

Unopened units that the user has not started using.

### Usage Period

How long one full unit lasts.

Example:

- 1 face cleanser lasts 3 months
- 1 toothpaste lasts 2 months

### Current Fullness

How much of the currently opened unit remains.

Allowed MVP values:

- Full
- 3/4
- 2/4
- 1/4

### Stock Coverage

How long the user can continue using the product before running out.

### Run-Out Date

The estimated date when all opened and backup stock reaches zero.

### Safety Buffer

The number of days before the run-out date that the app considers unsafe.

Default MVP value:

- 5 days

### Safe Purchase Deadline

The latest safe date to buy before running out.

Formula:

- Safe purchase deadline = Run-out date - Safety buffer days

### Double-Digit Sale

A sale date where the month and day number match.

Valid MVP sale dates:

- 1.1
- 2.2
- 3.3
- 4.4
- 5.5
- 6.6
- 7.7
- 8.8
- 9.9
- 10.10
- 11.11
- 12.12

### Recommended Sale Date

The latest upcoming double-digit sale date that happens on or before the safe purchase deadline.

### Urgent

A product is urgent when there is no valid upcoming double-digit sale before the safe purchase deadline.

---

## 9. User Stories

### US-001: Add Product

As a user, I want to add a product so that the app can track when I need to buy it again.

Acceptance criteria:

- User can enter product name.
- User can enter category or folder.
- User can enter usage period in months.
- User can select current opened stock fullness.
- User can enter unopened backup quantity.
- User can enter normal price.
- User can enter estimated sale price.
- User can enter default planned purchase quantity.
- Product appears on the dashboard after saving.
- App calculates run-out date and recommended sale date immediately.

---

### US-002: View Upcoming Sale Preparation

As a user, I want to see what I need to prepare for the next sale so that I know what to buy.

Acceptance criteria:

- Dashboard shows the next sale event first.
- Dashboard shows products recommended for that sale.
- Dashboard shows estimated spending for that sale.
- Dashboard shows product run-out dates.
- Products with urgent status appear above future sale items.

---

### US-003: View Product Details

As a user, I want to see how much stock I have left so that I understand why the app recommends a sale date.

Acceptance criteria:

Each product card should show:

- product name
- category
- current opened fullness
- estimated backup stock
- estimated coverage duration
- run-out date
- safe purchase deadline
- recommended sale date
- normal price
- estimated sale price
- estimated planned spend

---

### US-004: Mark Product as Bought

As a user, I want to mark a product as bought so that the app updates my stock and recalculates the next sale.

Acceptance criteria:

- User taps Bought.
- App asks how many units were bought.
- App asks actual price paid per unit.
- App adds bought quantity to current remaining stock.
- App stores the actual purchase price.
- App recalculates stock coverage.
- App recalculates the next recommended sale date.
- Product moves to the correct future sale group after update.

---

### US-005: Postpone Reminder

As a user, I want to postpone a product to a later sale if I decide not to buy it now.

Acceptance criteria:

- User taps Postpone.
- App moves the product to the next double-digit sale date.
- If the postponed date is after the safe purchase deadline, app marks it as risky.
- App should still allow the user to postpone if they confirm.

---

### US-006: Dismiss Reminder

As a user, I want to dismiss a reminder without deleting the product.

Acceptance criteria:

- User taps Dismiss.
- Product reminder is hidden for the current sale event.
- Product itself is not deleted.
- Product can reappear later if calculation requires a new reminder.

---

### US-007: Discard Current Opened Stock

As a user, I want to discard the currently opened unit if it is spoiled, lost, or unusable.

Acceptance criteria:

- User taps Discard Current.
- App removes the remaining opened fraction from stock.
- App recalculates run-out date.
- App recalculates recommended sale date.

Example:

- Current opened stock: 2/4
- Usage period: 3 months
- Remaining opened stock equals 0.5 unit
- Discarding current removes 0.5 unit from available stock

---

### US-008: Discard Backup Stock

As a user, I want to discard an unopened backup unit if it is no longer usable.

Acceptance criteria:

- User taps Discard Backup.
- App removes 1 unopened unit from backup stock.
- If no backup stock exists, app shows an error or warning.
- App recalculates run-out date.
- App recalculates recommended sale date.

---

### US-009: Open New Unit Early

As a user, I want to open a new unit early if the current unit is thrown away or unusable.

Acceptance criteria:

- User taps Open New.
- App requires at least 1 unopened backup unit.
- App removes the remaining current opened fraction.
- App treats one backup unit as the new full opened unit.
- Total available stock decreases only by the discarded current fraction.
- App recalculates all dates.

---

### US-010: View Monthly Spending Forecast

As a user, I want to see how much I need to prepare for each sale month.

Acceptance criteria:

- App groups products by recommended sale date.
- App calculates estimated spend per sale event.
- Formula:
  - Estimated spend = estimated sale price x default planned purchase quantity
- Dashboard shows at least the next 4 sale events with estimated spending.

---

## 10. Core Calculation Logic

This section is extremely important.

The coding agent must implement this logic clearly and consistently.

---

### 10.1 Current Fullness Mapping

The app must convert UI fullness labels into numeric fractions.

| UI Label | Fraction |
|---|---:|
| Full | 1.00 |
| 3/4 | 0.75 |
| 2/4 | 0.50 |
| 1/4 | 0.25 |

---

### 10.2 Total Stock Units

Formula:

- Total stock units = current opened fullness fraction + unopened backup quantity

Example:

- Current opened stock: 2/4
- Current opened fraction: 0.5
- Unopened backup quantity: 2
- Total stock units = 0.5 + 2 = 2.5 units

---

### 10.3 Stock Coverage

Formula:

- Coverage months = usage period months x total stock units

Example:

- Usage period: 3 months
- Total stock units: 2.5
- Coverage months = 3 x 2.5 = 7.5 months

The user is covered for approximately 7.5 months.

---

### 10.4 Date Math Rule

For MVP, date math should be understandable and consistent.

Recommended implementation:

1. Calculate coverage months as a decimal.
2. Split coverage months into:
   - whole months
   - fractional months
3. Add whole months using calendar month addition.
4. Convert fractional month into days using:
   - 1 month = 30.4375 days
5. Add those days to the date.
6. When adding calendar months, clamp invalid dates to the last day of the target month.

Example:

- Start date: January 31
- Add 1 calendar month
- Result should be February 28 or February 29 during leap year
- It should not overflow into March

---

### 10.5 Run-Out Date

Formula:

- Run-out date = today + coverage months

Example:

- Today: June 8, 2026
- Usage period: 3 months
- Current opened stock: Full
- Backup stock: 0
- Total stock units: 1
- Coverage months: 3
- Run-out date: September 8, 2026

---

### 10.6 Safety Buffer

Default MVP buffer:

- 5 days

Formula:

- Safe purchase deadline = run-out date - 5 days

Example:

- Run-out date: September 8, 2026
- Safety buffer: 5 days
- Safe purchase deadline: September 3, 2026

---

### 10.7 Double-Digit Sale Calendar

The app must generate double-digit sale dates for the current year and future years.

Sale dates:

| Month | Sale Date |
|---|---|
| January | January 1 |
| February | February 2 |
| March | March 3 |
| April | April 4 |
| May | May 5 |
| June | June 6 |
| July | July 7 |
| August | August 8 |
| September | September 9 |
| October | October 10 |
| November | November 11 |
| December | December 12 |

The app must generate enough future years to support long stock coverage.

MVP requirement:

- Generate sale dates for current year plus at least 5 future years.

---

### 10.8 Recommended Sale Date

Formula:

- Recommended sale date = latest sale date where:
  - sale date is today or later
  - sale date is on or before safe purchase deadline

If there is no valid sale date:

- status = Urgent
- recommended label = Buy Now

Example:

- Today: June 8, 2026
- Run-out date: September 8, 2026
- Safe deadline: September 3, 2026
- Upcoming sale dates:
  - July 7, 2026
  - August 8, 2026
  - September 9, 2026
- September 9 is after safe deadline
- August 8 is the latest valid sale
- Recommendation: Buy on 8.8

---

### 10.9 Urgent Logic

A product should be marked as urgent if:

- total stock is 0
- run-out date is today or earlier
- no upcoming double-digit sale exists before the safe purchase deadline

Urgent products should appear at the top of the dashboard.

Urgent label:

- Buy Now

---

### 10.10 Overdue Logic

If a recommended sale date has passed and the user has not marked the product as bought, postponed, or dismissed:

- the product should remain visible on the dashboard
- the product should be labeled as overdue or buy now
- the app should allow:
  - Bought
  - Postpone
  - Dismiss

MVP can simplify this by showing it as:

- Buy Now

---

### 10.11 Postpone Logic

When the user postpones a product:

1. Find the next double-digit sale date after the current recommended sale date.
2. Assign the product to that postponed sale.
3. Check if postponed sale date is after safe purchase deadline.
4. If after safe purchase deadline:
   - mark status as Risky
   - show warning message
5. Allow the user to confirm risky postponement.

---

### 10.12 Dismiss Logic

When the user dismisses a reminder:

- Do not delete the product.
- Hide this reminder for the current sale event.
- Store the dismissed sale key.
- The product may reappear when a future sale calculation changes.

Sale key format:

- YYYY-MM-DD

Example:

- August 8, 2026 = 2026-08-08

---

### 10.13 Bought Logic

When the user marks an item as bought:

Inputs:

- quantity bought
- actual price paid per unit
- purchase date

Steps:

1. Calculate current remaining stock at the time of purchase.
2. Add quantity bought to current remaining stock.
3. Save new stock quantity.
4. Save stock update date.
5. Save actual purchase price.
6. Clear dismissed status.
7. Clear postponed status.
8. Recalculate run-out date.
9. Recalculate recommended sale date.

Formula:

- Updated stock units = current remaining stock units + quantity bought

Example:

Before buying:

- Current remaining stock: 0.4 units
- Bought quantity: 2 units

After buying:

- Updated stock units = 0.4 + 2 = 2.4 units

---

## 11. Data Requirements

### 11.1 Product Data Model

The MVP should store product data locally.

Recommended TypeScript shape:

```ts
type Product = {
  id: string;
  name: string;
  category: string;
  usagePeriodMonths: number;
  stockUnitsAtUpdate: number;
  stockUpdatedAt: string;
  normalPrice: number;
  estimatedSalePrice: number;
  defaultPurchaseQuantity: number;
  bufferDays?: number;
  postponedUntilSaleKey?: string | null;
  dismissedSaleKeys: string[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
};
```

Field explanation:

| Field | Description |
|---|---|
| id | Unique product ID |
| name | Product name |
| category | Folder/category name |
| usagePeriodMonths | How many months one full unit lasts |
| stockUnitsAtUpdate | Current available stock units at last update |
| stockUpdatedAt | Date when stock quantity was last updated |
| normalPrice | Usual non-sale price |
| estimatedSalePrice | Expected sale price |
| defaultPurchaseQuantity | Quantity user usually buys during sale |
| bufferDays | Optional per-product buffer, default 5 |
| postponedUntilSaleKey | Optional postponed sale date |
| dismissedSaleKeys | Sale reminders dismissed by user |
| createdAt | Product creation date |
| updatedAt | Last product edit date |
| archived | Soft delete flag if needed later |

---

### 11.2 Purchase Record Data Model

The MVP should store purchase records if technically simple.

This helps future savings tracking.

Recommended TypeScript shape:

```ts
type PurchaseRecord = {
  id: string;
  productId: string;
  purchaseDate: string;
  saleKey?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
};
```

Field explanation:

| Field | Description |
|---|---|
| id | Unique purchase record ID |
| productId | Product that was bought |
| purchaseDate | Date bought |
| saleKey | Sale event related to purchase, if any |
| quantity | Number of units bought |
| unitPrice | Actual price paid per unit |
| totalPrice | quantity x unitPrice |
| createdAt | Record creation date |

---

### 11.3 Future Inventory Event Data Model

This can be added later if more detailed tracking is needed.

```ts
type InventoryEvent = {
  id: string;
  productId: string;
  type: 'created' | 'edited' | 'bought' | 'discard_current' | 'discard_backup' | 'open_new_early' | 'postponed' | 'dismissed';
  quantityChange?: number;
  note?: string;
  createdAt: string;
};
```

This is not required for MVP unless the implementation is already structured for it.

---

## 12. Derived Product Analysis Model

The app should calculate these fields dynamically.

They do not all need to be stored permanently.

```ts
type ProductAnalysis = {
  productId: string;
  totalStockUnits: number;
  openedFraction: number;
  unopenedUnitsEstimate: number;
  coverageMonths: number;
  runOutDate: string;
  safePurchaseDeadline: string;
  recommendedSaleDate: string | null;
  saleKey: string | null;
  saleLabel: string;
  status: 'safe' | 'scheduled' | 'urgent' | 'overdue' | 'risky' | 'dismissed';
  estimatedSpend: number;
};
```

---

## 13. UI and UX Requirements

### 13.1 Design Direction

The UI should feel:

- professional
- futuristic
- clean
- rounded
- dark mode first
- mobile-first
- calm and premium
- not cluttered

The visual theme should be inspired by dark blue digital dashboards.

### 13.2 Suggested Theme Colors

Use these as the initial theme palette:

| Token | Color |
|---|---|
| Background start | #050720 |
| Background middle | #101A55 |
| Background end | #1F55A5 |
| Card background | #121536 |
| Soft card background | #191E4A |
| Light card background | #232A62 |
| Primary accent | #4CA8FF |
| Soft accent | #7CCBFF |
| Main text | #F7F8FF |
| Muted text | #98A7C8 |
| Very muted text | #657397 |
| Success | #65E6A3 |
| Warning | #FFB85C |
| Danger | #FF6B8A |

### 13.3 Shape and Spacing

MVP design should use:

- rounded cards
- large border radius
- soft borders
- clear spacing
- large readable text
- no tiny cramped labels
- mobile-friendly touch targets

Recommended minimum touch target:

- 44px height

Recommended card radius:

- 20px to 30px

---

## 14. Screen Requirements

### 14.1 Dashboard Screen

The dashboard is the main screen.

It should show:

1. App title
2. Short tagline
3. Add product button
4. Next event summary
5. Next budget summary
6. Forecast summary
7. Priority sale card
8. Upcoming sale forecast
9. Product cards

The dashboard should prioritize what the user needs to buy next.

---

### 14.2 Add Product Flow

The add product form should include:

- product name
- category or folder
- usage period in months
- current opened stock fullness
- unopened backup stock
- normal price
- estimated sale price
- default purchase quantity

After save:

- product appears on dashboard
- app calculates run-out date
- app calculates recommended sale date
- app groups product under correct sale event

---

### 14.3 Edit Product Flow

The edit product form should allow changing:

- name
- category
- usage period
- current stock
- backup stock
- normal price
- estimated sale price
- default purchase quantity

After save:

- all calculations must refresh

---

### 14.4 Bought Flow

The bought flow should ask:

- how many units did you buy?
- what was the actual price paid per unit?

After confirm:

- stock increases
- purchase record is stored if supported
- estimated sale price can optionally update to latest actual price
- recommendation recalculates

---

### 14.5 Product Card

Each product card should show:

- product name
- category
- buy recommendation
- stock coverage remaining
- opened stock fullness
- backup quantity
- run-out date
- safe deadline
- normal price
- estimated sale spend
- action buttons

Required actions:

- Bought
- Postpone
- Dismiss
- Edit
- Discard current
- Discard backup
- Open new
- Delete

---

## 15. Dashboard Grouping Logic

Products should be grouped by sale event.

Example dashboard grouping:

- Buy Now
  - Toothpaste
  - Shampoo

- 8.8 Sale
  - Face cleanser
  - Laundry detergent

- 9.9 Sale
  - Moisturizer

Each group should show:

- sale label
- number of products
- total estimated spend

Formula:

- Group spend = sum of each product estimated spend

Product estimated spend formula:

- Estimated spend = estimated sale price x default purchase quantity

---

## 16. Example Calculations

### Example 1: One Full Cleanser

Input:

- Today: June 8, 2026
- Product: Face cleanser
- Usage period: 3 months
- Current opened stock: Full
- Backup stock: 0
- Buffer: 5 days

Calculation:

- Current opened fraction = 1
- Total stock units = 1 + 0 = 1
- Coverage months = 3 x 1 = 3 months
- Run-out date = September 8, 2026
- Safe deadline = September 3, 2026
- Valid sale dates before safe deadline:
  - July 7, 2026
  - August 8, 2026
- September 9, 2026 is too late
- Recommended sale date = August 8, 2026

Output:

- Buy on 8.8

---

### Example 2: Half-Used Cleanser with Two Backups

Input:

- Today: June 8, 2026
- Product: Face cleanser
- Usage period: 3 months
- Current opened stock: 2/4
- Backup stock: 2
- Buffer: 5 days

Calculation:

- Current opened fraction = 0.5
- Total stock units = 0.5 + 2 = 2.5
- Coverage months = 3 x 2.5 = 7.5 months
- Run-out date is approximately January 23, 2027
- Safe deadline is approximately January 18, 2027
- Latest valid sale before safe deadline = January 1, 2027

Output:

- Buy on 1.1 '27

---

### Example 3: No Valid Sale Before Running Out

Input:

- Today: June 8, 2026
- Product: Toothpaste
- Usage period: 1 month
- Current opened stock: 1/4
- Backup stock: 0
- Buffer: 5 days

Calculation:

- Current opened fraction = 0.25
- Coverage months = 1 x 0.25 = 0.25 months
- Run-out date is around June 16, 2026
- Safe deadline is around June 11, 2026
- Next sale date is July 7, 2026
- July 7 is too late

Output:

- Status = Urgent
- Label = Buy Now

---

### Example 4: Buying More Than Planned

Before buying:

- Current remaining stock = 0.8 units
- Default planned quantity = 1
- User buys 3 units

After buying:

- Updated stock units = 0.8 + 3 = 3.8 units
- App recalculates run-out date
- App recalculates next recommended sale date

Expected behavior:

- App should not block bulk buying.
- App should simply update the stock and push the next reminder further into the future.

---

## 17. Technical Requirements

### 17.1 Preferred Framework

Use Expo React Native.

### 17.2 Language

Use TypeScript.

### 17.3 Platforms

MVP should run on:

- iOS through Expo Go or simulator
- Android through Expo Go or emulator
- Web preview through Expo web

### 17.4 Storage

MVP should use local device storage.

Recommended storage:

- AsyncStorage

No backend is required for MVP.

### 17.5 Repository Structure

When the app grows beyond a single file, use this structure:

```text
src/components
src/screens
src/navigation
src/theme
src/data
src/lib
src/types
src/assets
```

Recommended purpose:

| Folder | Purpose |
|---|---|
| src/components | Reusable UI components |
| src/screens | Full app screens |
| src/navigation | Navigation setup |
| src/theme | Colors, spacing, typography |
| src/data | Mock data or seed data |
| src/lib | Calculation logic and helpers |
| src/types | Shared TypeScript types |
| src/assets | Images, icons, fonts |

---

## 18. Recommended Implementation Modules

The logic should eventually be separated into modules.

### 18.1 inventoryMath.ts

Responsible for:

- stock unit calculation
- stock coverage calculation
- run-out date calculation
- safe deadline calculation
- product analysis

### 18.2 saleCalendar.ts

Responsible for:

- generating double-digit sale dates
- formatting sale labels
- finding latest valid sale before deadline
- finding next sale after a date

### 18.3 storage.ts

Responsible for:

- loading products
- saving products
- loading purchase records
- saving purchase records

### 18.4 formatters.ts

Responsible for:

- formatting dates
- formatting currency
- formatting month duration
- formatting sale labels

---

## 19. Non-Functional Requirements

### 19.1 Performance

The app should feel instant for personal use.

MVP target:

- support at least 200 products without noticeable slowdown

### 19.2 Offline Support

The app must work offline.

MVP data should be stored locally.

### 19.3 Privacy

Product and purchase data should remain on the user’s device for MVP.

No analytics, tracking, login, or cloud upload is required.

### 19.4 Accessibility

The app should use:

- readable font sizes
- strong contrast
- touchable buttons with enough height
- clear labels
- simple language

### 19.5 Reliability

The app should never delete product data without user confirmation.

Delete product action must require confirmation.

Dismiss reminder must not delete the product.

---

## 20. Agentic AI Implementation Instructions

An Agentic AI coding agent should follow these rules when implementing this PRD:

1. Build the MVP first.
2. Do not add backend services unless explicitly requested.
3. Use Expo React Native with TypeScript.
4. Keep dependencies minimal.
5. Do not implement out-of-scope features.
6. Prioritize correct calculation logic over advanced UI effects.
7. Use clear file names.
8. Keep calculation logic testable and separate when possible.
9. Make all user-facing labels simple.
10. Preserve user data when editing UI.
11. Do not remove existing features unless instructed.
12. Avoid creating multiple competing implementations.
13. If refactoring, keep behavior the same unless the PRD says otherwise.
14. When unsure, follow the calculation logic in Section 10.
15. Always make the dashboard sale-focused.

---

## 21. Acceptance Criteria for MVP Completion

The MVP is considered complete when all of the following are true:

### Product Management Criteria

- User can add a product.
- User can edit a product.
- User can delete a product.
- User can categorize a product.
- User can input usage period.
- User can input current opened fullness.
- User can input unopened backup stock.
- User can input normal price.
- User can input estimated sale price.
- User can input default purchase quantity.

### Calculation Criteria

- App calculates total stock units correctly.
- App calculates coverage months correctly.
- App calculates run-out date correctly.
- App applies 5-day safety buffer correctly.
- App generates valid double-digit sale dates.
- App recommends the latest valid sale before safe deadline.
- App marks product as urgent when no valid sale exists.
- App recalculates after every product update.

### Dashboard Criteria

- Dashboard shows next sale event.
- Dashboard shows products to buy for the next sale.
- Dashboard shows estimated spend for the next sale.
- Dashboard shows upcoming sale forecast.
- Dashboard prioritizes urgent products.

### Action Criteria

- Bought action updates stock.
- Bought action asks for quantity.
- Bought action asks for actual price.
- Postpone action moves product to next sale.
- Risky postpone is clearly marked.
- Dismiss action hides current reminder without deleting product.
- Discard current action reduces stock correctly.
- Discard backup action reduces stock correctly.
- Open new action works only when backup stock exists.

### Persistence Criteria

- Products remain after closing and reopening the app.
- Purchase records remain after closing and reopening the app if implemented.
- User data does not reset unless explicitly cleared.

### Platform Criteria

- App runs in Expo Go.
- App runs on web preview.
- App has no critical TypeScript errors.
- App has no startup crash.

---

## 22. Future Features

These are not part of MVP but should be considered later.

### 22.1 Savings Tracker

The app can calculate how much money the user saved.

Formula:

- Savings = (normal price - actual price paid) x quantity bought

Example:

- Normal price: RM60
- Actual price: RM42
- Quantity: 2
- Savings = (60 - 42) x 2 = RM36

Future dashboard:

- You saved RM36 on 8.8
- You saved RM220 this year
- Best recorded cleanser price: RM39

---

### 22.2 Price History

The app can show:

- lowest bought price
- average bought price
- last bought price
- normal price vs sale price
- best month to buy

---

### 22.3 Notifications

Future local notifications can remind the user:

- a few days before a sale
- on sale day
- when product is urgent
- when monthly spending forecast is high

---

### 22.4 Sale Importance Weighting

Future versions can rank sale dates.

Example:

- 11.11 may be more important than 8.8
- 12.12 may be stronger than 2.2

MVP treats all sale dates equally.

---

### 22.5 Shipping Time

Future versions can include expected delivery time.

Example:

- User buys on 8.8
- Shipping takes 5 days
- App checks whether item arrives before run-out date

MVP does not include shipping time.

---

### 22.6 Expiry Date

Future versions can include expiry dates to prevent buying too much.

MVP does not include expiry date logic.

---

### 22.7 Cloud Sync

Future versions can include account login and multi-device sync.

MVP is local-first only.

---

## 23. Final MVP Summary

StockAhead MVP should answer these questions clearly:

1. What should I buy for the upcoming sale?
2. When should I buy it?
3. How much should I prepare?
4. How long will my current stock last?
5. What happens if I bought more, postponed, dismissed, or discarded stock?

The core loop is:

1. User adds product.
2. App calculates stock coverage.
3. App finds best sale date before run-out.
4. App shows product on sale-focused dashboard.
5. User buys, postpones, dismisses, or updates stock.
6. App recalculates everything.
