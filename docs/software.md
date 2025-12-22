## 1. Recommended Project Structure (Best Practice)

Instead of dumping everything into `components` or `screens`, we group files by **Domain (Feature)**. This makes it easy to delete or upgrade a specific feature without breaking the whole app.

```text
/
├── app/                        # Expo Router (Navigation layer only)
│   ├── (tabs)/
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── assets/                 # Static images, fonts
│   ├── components/             # Shared UI (Atoms/Molecules)
│   │   ├── ui/                 # Gluestack primitives
│   │   └── CustomButton.tsx    # App-specific shared components
│   ├── config/                 # Env vars, constants, theme config
│   ├── db/                     # Database setup (SQLite/Drizzle)
│   │   ├── schema.ts
│   │   └── client.ts
│   ├── features/               # THE CORE: Grouped by Logic
│   │   ├── inventory/
│   │   │   ├── components/     # InventoryCard, FilterChips
│   │   │   ├── hooks/          # useInventoryList, useAddItem
│   │   │   ├── services/       # inventoryService.ts (DB calls)
│   │   │   └── types.ts
│   │   ├── user/               # Onboarding, Settings, Profile
│   │   └── recipes/            # Logic for suggestions
│   ├── lib/                    # 3rd party wrappers (Axios, Dayjs, etc.)
│   ├── services/               # System services (Camera, FileSystem, Notifs)
│   ├── store/                  # Global State (Zustand)
│   ├── utils/                  # Helper functions (date formatting, validation)
│   └── types/                  # Global TS types
├── tests/                      # Integration/E2E tests
└── package.json
```

---

## 2. Technology Stack Selection (2025 Standards)

*   **Framework:** React Native (Expo SDK 50+)
*   **Language:** TypeScript (Strict Mode)
*   **Navigation:** Expo Router v3
*   **State Management:** **Zustand** (Lightweight, efficient, less boilerplate than Redux).
*   **Local Database:** **Expo SQLite** combined with **Drizzle ORM** (Provides Type-safe SQL, easier migrations, and better maintainability than raw SQL).
*   **Form Handling:** **React Hook Form** + **Zod** (Schema validation).
*   **UI Library:** Gluestack UI v3.
*   **Dates:** `date-fns` (Lightweight).

---

## 3. Phased Development Plan

We will divide the project into **6 Sprints** (approx. 1-2 weeks each).

### **Phase 1: Foundation & Architecture Setup**
*Goal: Create a stable base so developers don't step on each other's toes.*
1.  **Init:** Initialize Expo with TypeScript.
2.  **Tooling:** Configure ESLint, Prettier, and Husky (pre-commit hooks).
3.  **UI Setup:** Install Gluestack UI and configure the Theme (Sage Green/Mint).
4.  **Navigation:** Set up `app/` directory structure and base layouts.
5.  **Database:** Initialize Expo SQLite and set up Drizzle ORM schema for `InventoryItem` and `UserProfile`.
6.  **Store:** Set up the base Zustand store.

### **Phase 2: Core Features - Onboarding & User Profile**
*Goal: Handle user identity and simple persistence.*
1.  **Schema:** Create the User table/collection in DB.
2.  **UI Implementation:**
    *   Build `AvatarGrid` component.
    *   Build Onboarding Screen.
3.  **Logic:**
    *   Create logic to check `isOnboarded` on app launch.
    *   Save user name and avatar to local DB.
    *   Create Settings Screen (Basic UI).

### **Phase 3: Core Features - Inventory Management (CRUD)**
*Goal: The heart of the application.*
1.  **Schema:** Finalize `InventoryItem` schema (handling Images as URIs).
2.  **Device Features:**
    *   Implement **Camera** logic (Expo Camera).
    *   Implement **Image Manipulator** (Resize/Compress image to thumbnail).
    *   Implement **Barcode Scanner** (Expo Camera/BarcodeScanner).
3.  **UI Implementation:**
    *   `AddItem` Screen with Form Validation (Zod).
    *   `Dashboard` List with `FlashList` (Better performance than FlatList).
    *   `ItemDetail` Screen.
4.  **Logic:** Connect Forms to SQLite (Create, Read, Update, Delete).

### **Phase 4: Logic & Filtering**
*Goal: Make the data useful.*
1.  **Filtering:** Implement the Logic to filter by "All", "Food", "Medicine".
2.  **Status Logic:** Create the utility function that compares `expirationDate` vs `today` to return `Fresh`, `Warning`, or `Expired`.
3.  **Visuals:** Bind the status logic to the Item Card border colors.
4.  **Recipe Engine:**
    *   Create `recipes.json`.
    *   Write the keyword matching algorithm.
    *   Inject "Recipe Card" into the Dashboard list if conditions are met.

### **Phase 5: Notifications & System Integration**
*Goal: Background tasks and external communication.*
1.  **Notifications:**
    *   Install `expo-notifications`.
    *   Write the Scheduler Logic (Auto-calc date based on Category).
    *   Trigger notification permission request.
2.  **Data Export:**
    *   Implement `react-native-fs` to write JSON/CSV strings to files.
    *   Implement `react-native-share` to open the iOS/Android share sheet.

### **Phase 6: Quality Assurance & Polish**
*Goal: Production readiness.*
1.  **Performance:** Check render counts on the Dashboard. Optimize images.
2.  **Edge Cases:** Test what happens if Camera permission is denied.
3.  **Offline Test:** Ensure app works perfectly in Airplane mode.
4.  **Splash Screen:** Add a custom splash screen matching the theme.
5.  **App Icon:** Generate assets.

---

## 4. Coding Standards (for the Dev Team)

**1. Strict Typing**
Avoid `any`. Define interfaces for everything, especially API responses (even if local) and Prop types.
```typescript
// Good
interface InventoryItemProps {
  item: InventoryItem; // Imported from centralized types
  onPress: (id: string) => void;
}
```

**2. Absolute Imports**
Don't use `../../components/button`. Configure `tsconfig.json` to use aliases.
```typescript
import { CustomButton } from '@components/ui';
import { useInventory } from '@features/inventory/hooks';
```

**3. Container/Presenter Pattern (Optional but recommended)**
Separate the *Logic* from the *View*.
*   `AddItemContainer.tsx`: Handles form submission, DB calls, validation.
*   `AddItemView.tsx`: Pure UI, receives data and `onSubmit` as props.

**4. Atomic Design for UI**
*   **Atoms:** Text, Icons, simple Buttons.
*   **Molecules:** InputField (Label + Input + Error Message).
*   **Organisms:** InventoryCard, RecipeCard.

**5. Error Boundaries**
Wrap the main app entry and critical feature sections in Error Boundaries to prevent the app from crashing completely if one component fails.

---

## 5. Getting Started (Immediate Next Steps)

1.  **Initialize Project:**
    `npx create-expo-app@latest --template blank-typescript`
2.  **Install Core Deps:**
    `npx expo install @gluestack-ui/themed @expo/vector-icons expo-router react-native-safe-area-context expo-sqlite drizzle-orm`
3.  **Create Folder Structure:**
    Run a script or manually create the folders defined in Section 1.