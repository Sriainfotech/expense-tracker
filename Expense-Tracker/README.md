# Capital Control Hub

Build a complete, modern, responsive frontend application called **"Ledgerly – Capital Control Platform"**.

The application must contain:

1. Professional Login Page
2. Administrator Panel
3. Standard User Panel
4. Role-based authentication and routing
5. User-specific investment and expense management

The core financial relationship is:

**User → Investments & Expenses → Remaining Balance**

For each user:

**Remaining Balance = Total Investment − Total Expenses**

Example:

Kavya receives an investment of ₹50,000.

Kavya adds/spends an expense of ₹10,000.

Kavya's remaining balance is:

₹50,000 − ₹10,000 = ₹40,000

The Administrator can see Kavya's complete financial information.

Kavya can see only her own financial information.

==================================================

1. LOGIN PAGE
   ==================================================

Create the login page with the SAME overall layout and visual style as the provided reference image.

Use a full-screen two-column layout.

---

## LEFT SIDE – BRANDING SECTION

Width: approximately 50% of the screen.

Use a dark navy/teal gradient background.

At the top-left display:

[Financial Icon]

Ledgerly

Capital Control Platform

Use a clean professional financial/business style.

Main heading:

Every expense, tied to real capital.

Use large, bold white typography.

Description:

Track investments, manage expenses against remaining balance, and give finance leaders a live view of where the money went — with clear financial visibility.

Below the description, show three horizontal feature cards.

CARD 1:

Icon: financial/graph icon

Title:

Live balance engine

Description:

Investments − Expenses, recalculated instantly.

CARD 2:

Icon: reporting/chart icon

Title:

Board-ready reporting

Description:

Trends, categories and financial summaries in one place.

CARD 3:

Icon: security/shield icon

Title:

Role-based control

Description:

Admins manage users. Users see only their own data.

The feature cards should have:

* Semi-transparent dark/teal background
* Rounded corners
* White/light text
* Clean icons
* Comfortable spacing

---

## RIGHT SIDE – LOGIN SECTION

Width: approximately 50%.

Use a light/off-white background.

Center the login content vertically and horizontally.

Heading:

Sign in to your workspace

Subtitle:

Use a demo account below or your own credentials.

---

## EMAIL FIELD

Label:

Email address

Input placeholder:

[user@example.com](mailto:user@example.com)

Use a clean rounded input with subtle border and shadow.

---

## PASSWORD FIELD

Label:

Password

Password input with:

* Hidden password
* Show/hide eye icon

---

## LOGIN OPTIONS

Display:

Remember me

and:

Forgot password?

The Forgot password text should be clickable.

---

## SIGN IN BUTTON

Large full-width button:

Sign in →

Use the same teal/blue color style as the reference design.

---

## DEMO ACCOUNTS

Below the Sign In button, create a "DEMO ACCOUNTS" card.

The card should contain two clickable demo account rows.

ROW 1:

Administrator

[admin@example.com](mailto:admin@example.com) · admin123

Arrow icon →

ROW 2:

Standard user

[user@example.com](mailto:user@example.com) · user123

Arrow icon →

When the Administrator demo account is clicked:

Automatically populate:

Email:
[admin@example.com](mailto:admin@example.com)

Password:
admin123

When Standard User is clicked:

Automatically populate:

Email:
[user@example.com](mailto:user@example.com)

Password:
user123

Do not require the user to manually type demo credentials.

==================================================
2. LOGIN ROLE BEHAVIOR
======================

Use mock authentication for now.

Administrator credentials:

Email:
[admin@example.com](mailto:admin@example.com)

Password:
admin123

Role:
admin

Standard User credentials:

Email:
[user@example.com](mailto:user@example.com)

Password:
user123

Role:
standard_user

After successful login:

Admin:
→ Navigate to /admin/dashboard

Standard User:
→ Navigate to /user/dashboard

Store the authenticated user's role in frontend state/localStorage for mock authentication.

Protect routes based on role.

A Standard User must not see Admin UI.

An Administrator must have access to the Admin Panel.

==================================================
3. ADMIN PANEL
==============

Create a professional Admin Dashboard using the same design language as the login page.

Admin sidebar:

* Dashboard
* Users
* Investments
* Expenses
* Remaining Balance

The Administrator has full control over users, investments, and expenses.

==================================================
4. ADMIN DASHBOARD
==================

Show financial summary cards:

* Total Investment
* Total Expenses
* Remaining Balance
* Total Users

Example:

Total Investment
₹5,00,000

Total Expenses
₹2,25,000

Remaining Balance
₹2,75,000

Total Users
10

Formula:

Remaining Balance =
Total Investment − Total Expenses

Calculate all financial values dynamically.

==================================================
5. ADMIN – USER MANAGEMENT
==========================

The Administrator must be able to create and manage Standard Users.

Show:

User Management

Button:

* Add User

Display a user table.

Columns:

* User ID
* Full Name
* Email
* Role
* Total Investment
* Total Expenses
* Remaining Balance
* Status
* Created At
* Actions

Example:

Kavya
Investment: ₹50,000
Expenses: ₹10,000
Remaining: ₹40,000

Actions:

* View
* Edit
* Delete

---

## ADD USER

When Admin clicks Add User, open a modal.

Fields:

* Full Name
* Email
* Password
* Confirm Password
* Role
* Status

Role:

Standard User

Status:

Active / Inactive

Validation:

* Full Name is required.
* Email is required and must be valid.
* Password is required.
* Confirm Password must match Password.
* Role is required.
* Status is required.

After the Administrator creates a Standard User, that user can log in using their credentials.

==================================================
6. ADMIN – USER FINANCIAL DETAILS
=================================

When Admin clicks View on a user such as Kavya, open a detailed financial view.

Display:

User:

Kavya

Financial Summary:

Total Investment
₹50,000

Total Expenses
₹10,000

Remaining Balance
₹40,000

Formula:

Remaining Balance =
Total Investment − Total Expenses

Below the summary, display:

Investment History

and:

Expense History

---

## INVESTMENT HISTORY

Columns:

* Investment ID
* Amount
* Date
* Description
* Status
* Created At
* Actions

Admin actions:

* View
* Edit
* Delete

---

## EXPENSE HISTORY

Columns:

* Expense ID
* Category
* Description
* Amount
* Date
* Payment Method
* Status
* Created At
* Actions

Admin actions:

* View
* Edit
* Delete

IMPORTANT:

All records shown in this financial detail view must belong to the selected user.

Example:

Kavya

Investment:
₹50,000

Expense:
₹10,000

Remaining:
₹40,000

The Administrator can manage Kavya's financial records.

==================================================
7. ADMIN – INVESTMENTS
======================

Create an Investment management screen.

Show summary cards:

* Total Investment
* Number of Investments
* Latest Investment

Investment table:

* Investment ID
* User
* Investor/Source
* Amount
* Date
* Description
* Status
* Created At
* Actions

Actions:

* View
* Edit
* Delete

Show:

* Add Investment

---

## ADD INVESTMENT

When Admin clicks Add Investment, open a modal.

Fields:

* User
* Investor/Source
* Investment Amount
* Investment Date
* Description
* Status

IMPORTANT:

The User field is required.

Every investment MUST belong to a specific user.

Example:

User:
Kavya

Investment:
₹50,000

When this investment is created, ₹50,000 must appear in Kavya's financial information.

Validation:

* User is required.
* Investor/Source is required.
* Investment Amount is required.
* Investment Amount must be greater than 0.
* Investment Date is required.
* Description is optional.

Include:

* Search
* User filter
* Date filter
* Status filter
* Pagination

Delete must show a confirmation dialog.

==================================================
8. ADMIN – EXPENSES
===================

Create an Expense management screen.

Show summary cards:

* Total Expenses
* Number of Expenses
* Highest Expense

Expense table:

* Expense ID
* User
* Category
* Description
* Amount
* Date
* Payment Method
* Status
* Created At
* Actions

Actions:

* View
* Edit
* Delete

Show:

* Add Expense

---

## ADD EXPENSE

When Admin clicks Add Expense, open a modal.

Fields:

* User
* Expense Category
* Description
* Amount
* Expense Date
* Payment Method
* Status

IMPORTANT:

The User field is required.

Every expense MUST belong to a specific user.

Example:

User:
Kavya

Expense:
₹10,000

When this expense is created, ₹10,000 must appear in Kavya's financial information.

Validation:

* User is required.
* Expense Category is required.
* Amount is required.
* Amount must be greater than 0.
* Expense Date is required.
* Payment Method is required.

Include:

* Search
* User filter
* Category filter
* Date filter
* Payment Method filter
* Pagination

Delete must show a confirmation dialog.

==================================================
9. ADMIN – REMAINING BALANCE
============================

Create a Remaining Balance screen.

Show overall financial summary:

Total Investment
₹5,00,000

Total Expenses
₹2,25,000

Remaining Balance
₹2,75,000

Formula:

Remaining Balance =
Total Investment − Total Expenses

Also show a user-wise financial summary table:

| User | Investment | Expenses | Remaining |
| Kavya | ₹50,000 | ₹10,000 | ₹40,000 |
| Ravi | ₹75,000 | ₹20,000 | ₹55,000 |

Allow:

* Search users
* Filter users

The Remaining Balance must never be manually entered or edited.

Calculate it dynamically.

==================================================
10. STANDARD USER PANEL
=======================

Create a separate Standard User Dashboard.

The Standard User has access only to their own financial information.

The Standard User must NOT see another user's financial records.

Standard User sidebar:

* Dashboard
* Investments
* Expenses
* Remaining Balance

Do not show:

* User Management
* Admin controls
* Admin financial records

The Standard User has:

* View own investments
* View own expenses
* Add own expenses
* View own remaining balance

==================================================
11. STANDARD USER – DASHBOARD
=============================

Show financial summary cards for the currently logged-in user.

Example for Kavya:

Total Investment
₹50,000

Total Expenses
₹10,000

Remaining Balance
₹40,000

Calculate:

Remaining Balance =
Total Investment − Total Expenses

Update these values automatically whenever the user adds an expense.

==================================================
12. STANDARD USER – INVESTMENT
==============================

Show ONLY the logged-in user's investments.

Summary cards:

* Total Investment
* Number of Investments
* Latest Investment

Display a read-only investment table.

Columns:

* Investment ID
* Investor/Source
* Amount
* Date
* Description
* Status
* Created At
* Action

The Action column should contain:

View only

Do NOT show:

* Add Investment
* Edit
* Delete

The Standard User cannot create, edit, or delete investments.

Include:

* Search
* Date filter
* Status filter
* Pagination

When View is clicked, open a read-only investment details modal.

No editable fields.

No Save button.

No Update button.

No Delete button.

==================================================
13. STANDARD USER – EXPENSES
============================

The Standard User can VIEW and ADD their own expenses.

The Standard User must NOT be able to edit or delete existing expenses.

Show summary cards:

* Total Expenses
* Number of Expenses
* Highest Expense

Display a read-only expense table.

Columns:

* Expense ID
* Category
* Description
* Amount
* Date
* Payment Method
* Status
* Created At
* Action

The Action column should contain:

View only

Do NOT show:

* Edit
* Delete

Show:

* Add Expense

---

## ADD EXPENSE FOR STANDARD USER

When the Standard User clicks Add Expense, open a modal.

Fields:

* Expense Category
* Description
* Amount
* Expense Date
* Payment Method

IMPORTANT:

Do NOT show a User field.

The system must automatically associate the new expense with the currently logged-in user.

Example:

Logged-in User:
Kavya

Kavya enters:

Category:
Travel

Description:
Business travel

Amount:
₹10,000

Date:
13 Aug 2026

Payment Method:
UPI

The system automatically saves this expense against Kavya.

The Standard User must NOT be able to select another user.

Validation:

* Expense Category is required.
* Amount is required.
* Amount must be greater than 0.
* Expense Date is required.
* Payment Method is required.

After successfully adding an expense, automatically update:

* Total Expenses
* Number of Expenses
* Remaining Balance

Example:

Kavya Investment:
₹50,000

Kavya adds Expense:
₹10,000

New values:

Total Investment:
₹50,000

Total Expenses:
₹10,000

Remaining Balance:
₹40,000

The Standard User can view their own expense details but cannot edit or delete an existing expense.

==================================================
14. STANDARD USER – REMAINING BALANCE
=====================================

Show the logged-in user's financial summary.

Example:

Total Investment
₹50,000

Total Expenses
₹10,000

Remaining Balance
₹40,000

Formula:

Remaining Balance =
Total Investment − Total Expenses

The Standard User cannot manually edit the balance.

Show a simple visual flow:

Investment
₹50,000
↓
Expenses
₹10,000
↓
Remaining Balance
₹40,000

==================================================
15. FINANCIAL DATA RELATIONSHIP
===============================

Every Investment belongs to exactly one User.

Every Expense belongs to exactly one User.

Therefore:

User
├── Investments
└── Expenses
↓
Remaining Balance

For each user:

User Total Investment =
Sum of that user's investments.

User Total Expenses =
Sum of that user's expenses.

User Remaining Balance =
User Total Investment − User Total Expenses.

Example:

Kavya:

Investment = ₹50,000

Expenses = ₹10,000

Remaining = ₹40,000

The Administrator can see all users and all financial records.

A Standard User can see only their own financial records.

==================================================
16. DYNAMIC DATA
================

Do NOT hardcode the Remaining Balance.

Calculate it dynamically from investment and expense data.

Example:

Kavya's existing investment:
₹50,000

Admin adds another investment for Kavya:
₹20,000

New Kavya investment:
₹70,000

Kavya adds an expense:
₹10,000

Remaining:

₹70,000 − ₹10,000 = ₹60,000

Update all related summary cards automatically.

If an Admin creates, updates, or deletes an investment or expense, update the affected user's financial summary.

If a Standard User adds an expense, update that user's financial summary immediately.

==================================================
17. ROLE PERMISSIONS
====================

ADMINISTRATOR:

Users:
Create ✓
Read ✓
Update ✓
Delete ✓

Investments:
Create ✓
Read ✓
Update ✓
Delete ✓

Expenses:
Create ✓
Read ✓
Update ✓
Delete ✓

Remaining Balance:
View ✓
Edit ✗
Calculated automatically ✓

STANDARD USER:

Users:
No access

Investments:
View own data ✓
Create ✗
Update ✗
Delete ✗

Expenses:
View own data ✓
Create own expense ✓
Update ✗
Delete ✗

Remaining Balance:
View own balance ✓
Edit ✗
Calculated automatically ✓

IMPORTANT:

A Standard User can create an expense only for themselves.

The Standard User must never be able to:

* Select another user
* Add an expense for another user
* View another user's expense
* View another user's investment
* View another user's balance

==================================================
18. DESIGN SYSTEM
=================

The Login Page, Admin Panel, and Standard User Panel must look like one unified application.

Use the provided reference screenshot as the visual inspiration.

Design characteristics:

* Dark navy/teal branding
* Light dashboard backgrounds
* Teal primary buttons
* White cards
* Subtle borders
* Rounded corners
* Clean shadows
* Professional typography
* Clear spacing
* Simple icons
* Responsive layout

Do not make the UI overly colorful or complicated.

Use a professional finance/business dashboard aesthetic.

==================================================
19. RESPONSIVE DESIGN
=====================

The application must work correctly on:

* Desktop
* Tablet
* Mobile

On smaller screens:

* Sidebar can collapse.
* Tables can become horizontally scrollable.
* Cards can stack vertically.
* Login columns can become a single-column layout.
* Modals must remain usable on small screens.

==================================================
20. FRONTEND TECHNOLOGY
=======================

Use:

* React
* TypeScript
* React Router
* Reusable components
* Appropriate state management
* Mock authentication
* Mock financial data

Use reusable components for:

* Login
* Sidebar
* Header
* Summary cards
* Tabs
* Tables
* Search/filter controls
* Forms
* Modals
* Confirmation dialogs
* Toast notifications

Structure the application so mock API functions can later be replaced with Django REST API calls.

Do not build the backend.

==================================================
21. MOCK AUTHENTICATION
=======================

Use mock authentication for the frontend.

Administrator:

Email:
[admin@example.com](mailto:admin@example.com)

Password:
admin123

Role:
admin

Standard User:

Email:
[user@example.com](mailto:user@example.com)

Password:
user123

Role:
standard_user

After login:

Admin:
→ /admin/dashboard

Standard User:
→ /user/dashboard

Protect routes according to the authenticated user's role.

==================================================
22. MOCK FINANCIAL DATA
=======================

Create realistic mock data for multiple users.

Example:

User: Kavya

Investment:
₹50,000

Expenses:
₹10,000

Remaining:
₹40,000

User: Ravi

Investment:
₹75,000

Expenses:
₹20,000

Remaining:
₹55,000

The Admin should be able to see both users.

The Standard User demo account should see only its own records.

For the Standard User demo account, use Kavya's data:

Investment:
₹50,000

Expenses:
₹10,000

Remaining:
₹40,000

==================================================
23. FINAL APPLICATION FLOW
==========================

LOGIN PAGE
↓
Enter credentials
↓
Role Detection
↓
┌──────────────────────────┐
│                          │
↓                          ↓
ADMINISTRATOR         STANDARD USER
↓                          ↓
ADMIN PANEL             USER PANEL
│                          │
├── Dashboard              ├── Dashboard
├── Users                  ├── Investments
├── Investments            ├── Expenses
├── Expenses               └── Remaining Balance
└── Remaining Balance

Financial relationship:

USER
├── INVESTMENTS
└── EXPENSES
↓
REMAINING BALANCE

Example:

Kavya
├── Investment: ₹50,000
├── Expense: ₹10,000
└── Remaining Balance: ₹40,000

Admin can view and manage Kavya's complete financial information.

Kavya can view her investment, view her expenses, add her own expenses, and view her remaining balance.

Kavya cannot edit or delete existing expenses.

Kavya cannot create, edit, or delete investments.

Generate the complete frontend application with:

* Login Page
* Administrator Panel
* Standard User Panel
* Role-based routing
* User Management
* User-specific Investments
* User-specific Expenses
* Standard User Add Expense functionality
* Dynamic Remaining Balance

Do not create unrelated modules or features.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/84073afd-f9cb-4076-81a0-b214abee3d6d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
