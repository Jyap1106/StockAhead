# Starting Prompt
Act as a Senior Product Manager with prior experiences as a fullstack engineer, senior frontend developer and senior backend developer 

Now you're my business partner and developer to help me to develop my new app idea 
App name: Inventory Control (Name needs to be revamped)
Problem statement: We need a reminder app to keep track of our current stocks/materials and a reminder to tell the users when to buy and prepare according to the next double month digit sales such as 1.1,2.2, 3.3,4.4, etc etc 

Mechanics: 
Product: Face cleanser 
Usage period: 3 months (Takes 3 months to use finish) 
If I just bought a new face cleanser now, meaning that I'll need to buy again in the 3 months time, however 3 months from now is September, so I would need to buy it at 8.8 
After buying it at 8.8, I should have a refreshed timer on when I should buy again 
Meaning that I don't overhorde my materials but I have a stash of these materials so that I can utilize the special promotions on these double digit periods 

So the user flow would be 
I input a product and the usage period, the current stock I have, then it should autogenerate on the next best date, if lets say I have 2 more stock while having a usage period of 3 months that means I'm safe for the next 6 months 
Then I can input as many products as I need and even categorize them into folder or click options for clean UIUX 
At my dashboard, I'll have a nice view of what I need to prepare next or what new product to add 
Then similarly it should also calculate for me how much I'd need to spend on which month on these essential goods 

Ask me 10 questions you need to clarify this idea before planning how to build this app, we'll be building the app from Github then setup to deploy, so all the codes will be on github, this will be a mobile application, perhaps cross hybrid development (React Native or Flutter or anything better) so that it can be posted in the playstore or Apple store in the future 

For now I want to use it myself first 
So what's more important for now would be the mathematics and the core idea before building any code or markdown file, etc etc 

## 10 Questions 
1. What exactly counts as “stock”?

When you say:

“I have 2 more stock”

Do you mean:

A. 2 unopened units, excluding the one currently in use?
B. 2 total units, including the one currently in use?
C. User should be able to mark one item as “currently using” and the rest as backup stock?

This matters because the calculation changes a lot.

Example:

1 cleanser currently open
2 unopened cleansers
usage period: 3 months each

The user may actually be covered for 9 months, not 6 months, depending on whether the opened item counts.

2. Should the app always recommend buying on the last double-digit sale before stock runs out?

Using your example:

Bought face cleanser now
Usage period: 3 months
Finish date: around September
Recommended buy date: 8.8

This implies the rule is:

Pick the closest double-digit sale date before the product runs out.

Is that correct?

For example:

If stock runs out on September 20, should the app recommend 9.9?
If stock runs out on September 5, should the app recommend 8.8?
If stock runs out on September 9 itself, should it recommend 9.9 or 8.8?
3. Do we need a safety buffer before the item runs out?

Should the app avoid recommending a purchase date that is too close to the run-out date?

Example:

Product runs out on September 10
9.9 sale is one day before
Delivery may take 3–5 days

Should the app still recommend 9.9, or should it recommend 8.8 because 9.9 is too risky?

This affects whether we need a setting like:

“Remind me to buy at least X days before I run out.”

4. Should delivery/shipping time be part of the calculation?

For example, if I buy on 8.8, the item might arrive on:

8.10
8.15
8.20
later, depending on platform and seller

Should the app calculate based on:

A. Purchase date only
or
B. Expected arrival date

Because if the app only tracks the purchase date, the user may still run out before the item arrives.

5. When the user buys again, how should the timer refresh?

Let’s say:

Face cleanser usage period: 3 months
User has 1 currently open
User buys 1 more on 8.8
The new item arrives on 8.12

Should the app refresh the stock automatically when the user marks it as bought, or only when the user marks it as received?

Possible states:

Planned to buy
Bought
Delivered / Added to stock
Opened / Started using
Finished

For personal use MVP, we can keep this simple, but we need to decide the minimum required flow.

6. Should the user buy only enough to survive until the next best sale, or always buy a fixed quantity?

This is a big one.

Example:

Cleanser lasts 3 months
User has no backup
Next best sale is 8.8
After 8.8, the next sales are 9.9, 10.10, 11.11, 12.12

Should the app recommend:

A. Buy 1 unit only
Because one cleanser lasts 3 months.

B. Buy enough to reach the next major sale
For example, buy enough during 8.8 to survive until 11.11.

C. Let the user set target stock level
For example, “always keep 1 backup unit.”

This affects whether the app is just a reminder app or a stock optimization app.

7. Are all double-digit sales equal, or are some more important?

Should the app treat all these dates equally?

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

Or should some dates be weighted as better sales?

For example:

11.11 may be the biggest
12.12 may be strong
6.6 or 9.9 may be moderate
2.2 may be weaker depending on region/platform

If we want smarter recommendations later, we may need “sale importance” or “preferred campaign dates.”

8. Should the app consider expiry dates or product degradation?

Some products can be safely stored for a long time. Others should not be overstocked.

For example:

Face cleanser: probably okay for a while
Vitamins: expiry-sensitive
Skincare actives: may degrade
Food items: expiry-sensitive
Medicine: expiry-sensitive
Cleaning products: usually less sensitive

Should each item have an optional expiry rule?

Example:

“Do not recommend buying more than 2 units because the product expires in 12 months.”

This is important because your problem statement specifically says you do not want to over-hoard.

9. How should monthly spending forecasts work?

For the dashboard, you mentioned:

“It should calculate for me how much I’d need to spend on which month.”

For that, each product likely needs a price.

Should the app support:

A. Fixed estimated price per unit
Example: face cleanser = RM45 each.

B. Normal price and sale price
Example: normal price RM60, sale price RM45.

C. Price history over time
Example: bought at RM42 on 8.8, RM39 on 11.11.

For the MVP, I would suggest starting with estimated sale price per unit, then later adding price history.

10. What is the main personal-use MVP outcome you want first?

For the very first version, what is the most valuable thing the app must do for you?

Choose the closest one:

A. Tell me when to buy each item next
Core reminder and next purchase date.

B. Tell me what I need to buy for the upcoming sale
Example: “For 8.8, prepare to buy cleanser, shampoo, and detergent.”

C. Tell me how much money to prepare each month
Example: “August estimated essentials spending: RM240.”

D. Prevent overstocking
Example: “You already have enough cleanser until December, don’t buy during 8.8.”

E. All of the above, but with the simplest possible manual inputs

My current assumption is that the MVP should prioritize E, but the real core should be:

“Given my current stock, usage period, and upcoming double-digit sales, tell me the safest and most cost-efficient purchase month without overstocking.”

## Answer
1) There should be an option to include the detail of existing stock and unopened stock, so it can be counted as in use/backup stock 
But regardlessly, the logic for this app is to be prepared in advance
For your example if 
1 cleanser currently open
2 unopened cleansers
usage period: 3 months each
The question to be prompted is the current stock Full/3 quarters/half/last quarter, the UI can be "Full", "3/4", 2/4", "1/4"
So it'll be 6 months + etc depending on which fullness 

2) Yes, pick the closest double-digit sale date before the product runs out 
 
3) yes there should be a 3-5 days buffer 

4) Nope you can leave the shipping time calculation out for now, maybe in the future development model

5) Once the dates has passed, this should be at the front dashboard page, so the user can just click bought or postponed or delete notification 

6) If the user has bought it then there should be a prompt to ask how many bought, because sometimes buying more is cheaper 

7) For simplicity sake, let's just put it all the same 

8) Nope do not consider the expiration date, but the user should have an option to select that they have thrown the product away, or open new one earlier, just in case let's say the product like a toothbrush fell into the toilet bowl, so we'll just throw that away 

9) Allow the user to input what's the estimate price, so it can be like price checker/comparison as well 
But I like the ABC function that you mentioned, for the MVP let's just do B first 

10) In order or importance 
B, A, C

Potential ideas to add in the future to see how much cost has been saved 
