# QuickSip MVP: Implementation Plan

This document breaks down the development of the QuickSip MVP into a series of phases and actionable steps. We will use this as a living document to track our progress.

---

### **Phase 1: Backend & Project Setup**

- [✅] **1.1. Supabase Project Initialization**
    - [✅] Create a new project in Supabase.
    - [✅] Copy the Project URL and `anon` key into a new `.env.local` file.

- [✅] **1.2. Database Schema Setup**
    - [✅] Create the `vendors` table.
    - [✅] Create the `categories` table with a foreign key to `vendors`.
    - [✅] Create the `menu_items` table with foreign keys to `vendors` and `categories`.
    - [✅] Create the `orders` table with a foreign key to `vendors`.

- [✅] **1.3. Supabase Storage**
    - [✅] Create a single public bucket named `media` for images (profile pictures, menu item photos).

- [✅] **1.4. Row Level Security (RLS)**
    - [✅] Define initial RLS policies for all tables to ensure data is protected.
        - *Example: Vendors should only be able to access their own menu items and orders.*

- [✅] **1.5. Local Project Setup**
    - [✅] Initialize Next.js project.
    - [✅] Install Supabase client library (`@supabase/supabase-js`).
    - [✅] Install Shadcn UI.
    - [✅] Install Stripe client library (`@stripe/stripe-js`, `@stripe/react-stripe-js`).

---

### **Phase 2: Vendor Portal**

- [✅] **2.1. Authentication**
    - [✅] Create an autg page (`/auth` or similar).
    - [✅] Implement login + signup form and logic using Supabase Auth (email/password).
    - [✅] Create a middleware to protect all routes under the `/admin` path.

- [ ] **2.2. Profile Management (`/admin/profile`)**
    - [ ] Build a form to view and edit the vendor's `name`, `description`, and `location`.
    - [ ] Implement file upload for `profile_picture_url`, uploading to the `media` bucket in Supabase Storage.
    - [ ] Hook up the form to fetch and update the vendor's data in the `vendors` table.

- [ ] **2.3. Menu Management (`/admin/menu`)**
    - [ ] **Category CRUD:**
        - [ ] UI to display a list of existing categories.
        - [ ] Form to create a new category.
        - [ ] Functionality to edit and delete existing categories.
    - [ ] **Menu Item CRUD:**
        - [ ] UI to display all menu items, perhaps grouped by category.
        - [ ] A comprehensive form to add/edit a menu item, including:
            - [ ] Text inputs for `title` and `description`.
            - [ ] Number input for `price`.
            - [ ] A dropdown to select the `category`.
            - [ ] File upload for the item `image_url`.

- [ ] **2.4. Order Verification (`/admin/orders`)**
    - [ ] UI to display a list of paid but unfulfilled orders (`is_paid = true`, `is_fulfilled = false`).
    - [ ] Set up a Supabase Realtime subscription to automatically fetch new orders as they come in.
    - [ ] Add a "Scan to Verify" button that opens the device camera.
    - [ ] Integrate a QR code scanning library.
    - [ ] On a successful scan, find the order by its ID, update `is_fulfilled` to `true`, and provide clear visual feedback (e.g., "Success!").

---

### **Phase 3: Customer Flow**

- [ ] **3.1. Vendor Public Page (`/vendor/[vendorId]`)**
    - [ ] Create the dynamic route.
    - [ ] On page load, fetch and display the specific vendor's profile data (`name`, `description`, `profile_picture_url`).
    - [ ] Fetch all menu items for that vendor, grouped by their categories.
    - [ ] Display the menu in a clean, mobile-first layout.

- [ ] **3.2. Shopping Cart & State Management**
    - [ ] Implement a client-side state management solution (e.g., Zustand or React Context) for the cart.
    - [ ] Add "Add to Cart" buttons on menu items.
    - [ ] Create a cart component that shows selected items, their quantities, and the total price.
    - [ ] Implement `+` and `-` buttons in the cart to adjust item quantities.

- [ ] **3.3. Checkout & Payment**
    - [ ] Create a Next.js API route (e.g., `/api/checkout`) to handle the creation of a Stripe Payment Intent. This route will receive the cart details and calculate the final amount.
    - [ ] Integrate Stripe Elements into the checkout page for card entry.
    - [ ] On the client, after the Stripe payment is confirmed, create the final record in the `orders` table in Supabase. The `order_details` JSON should be a snapshot of the cart contents.

- [ ] **3.4. Order Confirmation & QR Code**
    - [ ] After the order record is saved, transition the UI to a confirmation page.
    - [ ] Generate and display a QR code containing the unique `order.id` from the newly created database record.

---

### **Phase 4: Finalization**

- [ ] **4.1. Styling & UI/UX**
    - [ ] Ensure a consistent and polished UI using Shadcn components and TailwindCSS.
    - [ ] Test and verify responsiveness on common mobile and desktop screen sizes.
- [ ] **4.2. Seed Data**
    - [ ] Create a script or manually add at least one sample vendor with a few categories and menu items for testing.
- [ ] **4.3. Deployment**
    - [ ] Configure environment variables in Vercel.
    - [ ] Deploy the project to Vercel.
    - [ ] Conduct final end-to-end testing on the live environment. 