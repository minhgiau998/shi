# System Design & Implementation Specification: Smart Home Inventory (SHI)

**Version:** 1.0
**Context:** UI/UX Design & Frontend Architecture
**Framework:** Expo (React Native) + Gluestack-ui v3

## 1. Technical Implementation Stack
*   **Core Framework:** React Native (via **Expo**)
*   **UI Library:** **gluestack-ui v3** (for accessibility, styling, and consistent components)
*   **Navigation:** React Native Screens / Expo Router (Stack Navigation pattern)
*   **Icons:** Lucide Icons / Feather (Outline style)

---

## 2. Visual Design System

### **2.1 Color Palette (Hex Codes)**
A minimalist, nature-inspired palette designed for calmness and clarity.

| Role | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | Sage Green | `#6B9080` | Main actions, active states, branding |
| **Secondary** | Soft Mint | `#E8F4F0` | Card backgrounds, light containers |
| **Tertiary** | Muted Teal | `#A4C3B2` | Accents, highlights, secondary buttons |
| **Typography** | Dark Slate | `#2C3E3F` | Primary text (softer than pure black) |
| **Error** | Warm Red | `#D64545` | Expired items, delete actions |
| **Warning** | Soft Peach | `#E8A87C` | "Expiring Soon" indicators |
| **Success** | Sage Green | `#6B9080` | "Fresh" status indicators |

### **2.2 Theme Modes**
*   **Light Mode:** Default. Uses `Soft Mint` backgrounds and `Dark Slate` text.
*   **Dark Mode:** Supported via Gluestack's theming. Uses darker variants of Sage/Teal with light text to ensure eye comfort at night.

---

## 3. Navigation Architecture

**Pattern:** **Stack Navigation**
*   *Rationale:* Provides a linear, focused flow suitable for a utility app. Reduces clutter compared to bottom tabs.

### **3.1 Sitemap & Routing**
```text
(root)
 ├── /onboarding         (First-time setup only)
 ├── /index              (Dashboard - Main Hub)
 ├── /add-item           (Form to input new inventory)
 ├── /item/[id]          (Dynamic route for Item Details)
 ├── /recipes            (Static list of suggestions)
 └── /settings           (User preferences & Data Export)
```

### **3.2 User Flows**
1.  **New User:** `Splash` -> `Check LocalStorage` -> `Onboarding` -> `Dashboard`.
2.  **Returning User:** `Splash` -> `Dashboard`.

---

## 4. Screen Specifications

### **4.1 Onboarding Screen**
*   **File:** `app/onboarding.tsx`
*   **Key Elements:**
    *   **Welcome Text:** Simple, non-intrusive greeting.
    *   **Name Input:** Standard text field.
    *   **Avatar Grid:** 6-8 minimalist outline icons (e.g., House, Leaf, Cat).
    *   **Interaction:** Selected avatar highlights in `#6B9080` (Primary).
    *   **Action:** "Start Organizing" button commits data to local storage and pushes `/index`.

### **4.2 Dashboard (Home)**
*   **File:** `app/index.tsx`
*   **Layout:**
    *   **Header:** Dynamic greeting ("Hello [Name]") + User Avatar (Top Right). Tapping Avatar navigates to `/settings`.
    *   **Filter Chips:** Horizontal ScrollView (`[All]`, `[Food]`, `[Medicine]`, `[Cosmetics]`).
    *   **Inventory List:** Vertical ScrollView of Item Cards.
    *   **FAB (Floating Action Button):** Located bottom-right. Icon: `+`. Navigates to `/add-item`.
*   **Item Card UI:**
    *   **Visuals:** Thumbnail (Left), Text Details (Center).
    *   **Status Indicators:** Color-coded borders.
        *   🔴 Expired (`#D64545`)
        *   🟠 Expiring Soon (`#E8A87C`)
        *   🟢 Fresh (`#6B9080`)

### **4.3 Add Item Screen**
*   **File:** `app/add-item.tsx`
*   **Form Components:**
    *   **Photo:** Clickable placeholder icon -> Triggers Camera -> Displays compressed preview.
    *   **Barcode:** Input field + "Scan" button icon. (Offline extraction).
    *   **Inputs:** Name (Text), Type (Select/Dropdown), Expiry (Date Picker).
    *   **Action:** "Save Item" button. Validates inputs -> Updates Store -> Pops to Dashboard.

### **4.4 Item Details Screen**
*   **File:** `app/item/[id].tsx`
*   **Route:** Dynamic (uses item ID).
*   **Features:**
    *   Large view of the item photo.
    *   Read-only view of details with "Edit" mode toggle.
    *   **Delete Action:** prominent button (styled with Error color `#D64545`).

### **4.5 Recipes & Tips**
*   **File:** `app/recipes.tsx`
*   **Source:** Local static JSON (offline).
*   **Logic:**
    *   Lists recipes based on `Food` items flagged as "Expiring Soon".
    *   Search/Filter bar at the top.

### **4.6 Settings Screen**
*   **File:** `app/settings.tsx`
*   **Sections:**
    *   **Profile:** Edit Name / Change Avatar.
    *   **Notifications:** Sliders for "Days Before Expiration" (Global/Category).
    *   **Data Management:** "Export Data" buttons (CSV / JSON).
    *   **About:** App version info.

---

## 5. Implementation Notes (Code Quality)
*   **Linting:** Code validated for TypeScript errors.
*   **Styling:** Used `gluestack-ui` components (`Box`, `VStack`, `HStack`, `Text`, `Button`, `Input`) for consistent spacing and theming.
*   **Optimization:** Images are compressed before storage to maintain performance in the offline-first architecture.