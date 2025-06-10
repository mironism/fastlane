### **MVP Specification: QR Code Ordering System (QuickSip)**

* **Project:** A web application for in-person food and drink ordering via QR codes.
* **Tech Stack:** Next.js, Vercel, Supabase, Stripe

---

### **1. Core Objective**

To validate the core user journey: a customer can scan a QR code, view a vendor's profile and categorized menu, order, and pay seamlessly, while a vendor can easily manage their profile, menu, and verify payments in real-time.

---

### **2. Technology Stack & Roles**

* **Frontend & Backend Logic:** Next.js
* **Hosting & Deployment:** Vercel
* **Database, Auth, & File Storage:** Supabase
* **Payments:** Stripe

---

### **3. Supabase Backend Setup**

#### **3.1. Database (Supabase Postgres)**

Four tables are required:

1.  **`vendors`**
    * `id` (uuid, primary key)
    * `name` (text)
    * `description` (text)
    * `location` (text)
    * `profile_picture_url` (text)
    * `created_at` (timestamp with time zone)

2.  **`categories`**
    * `id` (uuid, primary key)
    * `vendor_id` (foreign key to `vendors.id`)
    * `name` (text)

3.  **`menu_items`**
    * `id` (uuid, primary key)
    * `vendor_id` (foreign key to `vendors.id`)
    * `category_id` (foreign key to `categories.id`)
    * `title` (text)
    * `description` (text)
    * `price` (numeric)
    * `image_url` (text)

4.  **`orders`**
    * `id` (uuid, primary key)
    * `vendor_id` (foreign key to `vendors.id`)
    * `customer_email` (text)
    * `order_details` (jsonb) - *Acts as a permanent snapshot of the cart. See section 5.5 for structure.*
    * `total_price` (numeric)
    * `is_paid` (boolean, default: `false`)
    * `is_fulfilled` (boolean, default: `false`)
    * `created_at` (timestamp with time zone)

#### **3.2. Authentication (Supabase Auth)**

* Manages secure email/password login exclusively for the Vendor Portal.
* Access to vendor pages/APIs will be protected via Supabase Auth helpers in Next.js.

#### **3.3. Storage (Supabase Storage)**

* A single public bucket will store all media files: vendor profile pictures and menu item images.

---

### **4. Vendor Portal (Built with Next.js)**

A set of protected pages under a route like `/admin` or `/dashboard`.

* **4.1. Login Page:** A simple form for vendors to log in.
* **4.2. Profile Management Page (`/admin/profile`):**
    * Allows vendors to manage their public-facing information.
    * Includes forms to upload/change their **profile picture**, and edit their **description** and **location** text.
* **4.3. Menu Management Page (`/admin/menu`):**
    * **Category Management:** An interface for vendors to create, rename, and delete their own custom categories (e.g., "Appetizers," "Main Courses," "Drinks").
    * **Item Management:** Displays all menu items. The form to add/edit an item includes fields for **Image Upload**, **Title**, **Description**, **Price**, and a **dropdown to assign it to a created category**.
* **4.4. Live Order Verification Page (`/admin/orders`):**
    * The primary operational screen for staff.
    * Displays a live list of paid but unfulfilled orders (`is_paid = true`, `is_fulfilled = false`).
    * Features a prominent **"Scan to Verify"** button that activates the device camera to scan the customer's QR code.
    * On a successful scan, the system updates the order to `is_fulfilled = true` and shows a clear "PAYMENT CONFIRMED" message.

---

### **5. Customer Flow (Built with Next.js)**

A set of public-facing, mobile-first pages.

* **5.1. Scan QR Code:** The vendor's physical QR code links to a dynamic Next.js page: **`https://your-app.com/vendor/[vendorId]`**.
* **5.2. View Vendor Profile & Menu:**
    * The page header displays the vendor's **profile picture, name, description, and location**.
    * The menu below is **grouped by category**. Items are listed under their respective category headings for easy navigation.
* **5.3. Order & Checkout:**
    * Customers tap items to add them to a simple cart. The cart interface allows for adjusting item **quantities** (e.g., via `+` and `-` buttons), consolidating multiple orders of the same item into a single line item with an updated quantity.
    * The checkout process uses Stripe Elements, with Apple Pay and standard card entry enabled.
* **5.4. Receive Payment Proof:** Upon successful payment, the page displays a unique QR code containing the `order.id`.
* **5.5. `order_details` JSON Structure:** The JSON stored in the database for each order will be an array of objects, capturing the exact state of the cart at the moment of purchase, including quantities.
    ```json
    [
      {
        "menu_item_id": "caffee-latte-id-123",
        "quantity": 3,
        "name": "Latte",
        "price_at_purchase": 5.00
      },
      {
        "menu_item_id": "croissant-id-456",
        "quantity": 1,
        "name": "Croissant",
        "price_at_purchase": 3.00
      }
    ]
    ```

---

### **6. MVP Limitations & Manual Processes**

* **No Self-Service Onboarding:** Vendors are created manually in the Supabase backend by the platform admin. Credentials are provided to them directly.
* **No Automated Payouts:** All customer payments are collected into the platform's central Stripe account. Payouts to vendors will be calculated and performed manually based on the `orders` data.
* **No Customer Accounts:** The customer flow is entirely session-based, with no user logins or saved order history.
* **No Vendor Analytics:** The vendor portal will not feature a dashboard for sales history or other analytics.