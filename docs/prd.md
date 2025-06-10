# Product Requirements Document: QR Code Ordering System MVP (QuickSip)

-   **Product:** A web application for in-person food and drink ordering via QR codes.
-   **Status:** Defined for MVP Development

---

### 1. Introduction & Vision

This document outlines the requirements for the Minimum Viable Product (MVP) of a QR code-based ordering system. The vision is to create a frictionless, app-free experience for customers to order and pay at venues like bars, cafes, and food stalls, while providing vendors with a simple, self-manageable digital menu and order verification system.

This MVP aims to validate the core transaction loop: **Scan -> Order -> Pay -> Verify**. Success will be measured by the successful adoption by a pilot group of vendors and positive feedback on the ease of use from their customers.

---

### 2. Target Audience

-   **Customers:** Patrons at busy venues (bars, food trucks, cafes) who want a fast, convenient way to order and pay without waiting for staff or handling physical menus and cash/cards.
-   **Vendors:** Small to medium-sized business owners (e.g., bar managers, cafe owners) who need a low-cost, low-overhead digital solution to streamline their ordering process, especially during peak hours.

---

### 3. Core Features & Functionality

The application is divided into two primary experiences built within a single Next.js application: the **Customer Flow** and the **Vendor Portal**.

| Feature | Description | User Stories |
| :--- | :--- | :--- |
| **Vendor Profile** | Public-facing page displaying vendor information. | VEN-1, CUST-1 |
| **Digital Menu** | A categorized menu of items that vendors can manage. | VEN-2, VEN-3, CUST-2 |
| **Shopping Cart** | A simple interface for customers to build and manage their order. | CUST-3, CUST-4 |
| **Payment Processing** | Secure checkout using Stripe. | CUST-5, VEN-4 |
| **Order QR Code** | A unique QR code generated for the customer as proof of payment. | CUST-6 |
| **Vendor Portal** | A secure, password-protected area for vendors to manage their system. | VEN-5, VEN-6 |
| **Order Verification** | A tool for vendors to scan customer QR codes and confirm payment. | VEN-7, CUST-7 |

---

### 4. User Stories

#### Customer (CUST) Stories

-   **CUST-1: Viewing a Vendor's Profile**
    -   As a customer, when I scan a QR code, I want to see the vendor's name, profile picture, location, and a brief description, so I know I'm ordering from the right place.
-   **CUST-2: Browsing the Menu**
    -   As a customer, I want to see the menu organized into clear categories (e.g., "Drinks," "Snacks"), so I can easily find what I'm looking for.
-   **CUST-3: Ordering Items**
    -   As a customer, I want to tap on a menu item to add it to my cart, so I can begin building my order.
-   **CUST-4: Adjusting Quantities**
    -   As a customer, I want to easily change the quantity of an item in my cart, so I can order multiple units of the same thing.
-   **CUST-5: Paying for the Order**
    -   As a customer, I want to pay for my order quickly and securely using my credit card or Apple Pay, so I don't have to wait for a server.
-   **CUST-6: Receiving Proof of Payment**
    -   As a customer, after I pay, I want to receive a unique QR code on my screen, so I have proof of purchase to show the bartender.
-   **CUST-7: Redeeming the Order**
    -   As a customer, I want to show my QR code to the bartender to be scanned, so I can receive my order.

#### Vendor (VEN) Stories

-   **VEN-1: Managing My Profile**
    -   As a vendor, I want to log in and be able to edit my business's name, description, location, and upload a profile picture, so customers see up-to-date information.
-   **VEN-2: Managing Categories**
    -   As a vendor, I want to be able to create, edit, and delete my own menu categories, so I can organize my offerings in a way that makes sense for my business.
-   **VEN-3: Managing Menu Items**
    -   As a vendor, I want to add, edit, and delete menu items, including their picture, title, description, price, and category, so my digital menu is always accurate.
-   **VEN-4: Receiving Payments**
    -   As a vendor, I want payments from customers to be processed securely and collected in an account, so I can receive my earnings.
-   **VEN-5: Secure Access**
    -   As a vendor, I want to have a secure login (email and password), so only authorized staff can access my portal.
-   **VEN-6: Viewing Paid Orders**
    -   As a vendor, I want to see a live list of newly paid orders on my device, so I know what needs to be prepared.
-   **VEN-7: Verifying Customer Payment**
    -   As a vendor, I want to use my device's camera to scan a customer's QR code and get a clear "Payment Confirmed" message, so I can confidently fulfill their order.

---

### 5. Technical Stack & Architecture

-   **Application Framework:** Next.js
-   **Deployment Platform:** Vercel
-   **Backend Services (BaaS):** Supabase
    -   **Database:** Supabase Postgres
    -   **Authentication:** Supabase Auth
    -   **File Storage:** Supabase Storage
-   **Payment Gateway:** Stripe

---

### 6. Data Models

-   **`vendors`**: `id`, `name`, `description`, `location`, `profile_picture_url`, `created_at`
-   **`categories`**: `id`, `vendor_id`, `name`
-   **`menu_items`**: `id`, `vendor_id`, `category_id`, `title`, `description`, `price`, `image_url`
-   **`orders`**: `id`, `vendor_id`, `customer_email`, `order_details` (jsonb), `total_price`, `is_paid`, `is_fulfilled`, `created_at`

---

### 7. Out of Scope for MVP

The following features will **not** be included in this initial version:

-   **Vendor Self-Service Onboarding:** Admins will onboard vendors manually.
-   **Automated Payouts (Stripe Connect):** Payouts will be handled manually.
-   **Vendor Sales Analytics/Dashboard:** No historical sales data will be presented in the UI.
-   **Customer Accounts & Order History:** The customer experience is entirely session-based.
-   **Menu Item Modifiers:** (e.g., "no ice," "extra shot").
-   **Tipping Functionality.**
-   **Ratings and Reviews.**