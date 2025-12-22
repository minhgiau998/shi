# Product Requirement Document: Smart Home Inventory (SHI)

**Version:** 1.0
**Platform:** React Native (iOS & Android)
**Architecture:** Offline-First (Local Storage only)

## 1. Project Overview
**Smart Home Inventory (SHI)** is a minimalist mobile application designed to help users track household inventory (Food, Medicine, Cosmetics).
*   **Problem:** Waste due to expiration and overbuying due to lack of visibility.
*   **Goal:** Minimize waste, save money, and organize household management.
*   **Target Audience:** Busy householders and minimalists valuing efficiency and aesthetics.

## 2. Technical Stack & Architecture
*   **Framework:** **React Native** (CLI or Expo).
*   **Database:** Local Storage only (e.g., `AsyncStorage` for settings, `SQLite` or `Realm` for inventory data to allow efficient querying/filtering).
*   **State Management:** React Context API or Redux Toolkit.
*   **Device Features:** Camera (Photo/Barcode), Local Push Notifications, File System (for exports).
*   **Network:** **None.** The app must function 100% offline.

---

## 3. Design System (UI/UX)
**Theme:** "Cleanliness," "Organization," "Peace of Mind."

### **3.1 Color Palette**
*   **Primary:** Soft Sage Green (`#9CAF88`) – *Freshness/Food*
*   **Secondary:** Calming Blue (`#A0C4D0`) – *Medicine/Hygiene*
*   **Alert:** Soft Coral Red (`#E57373`) – *Expired (Non-aggressive)*
*   **Warning:** Soft Orange (`#FFB74D`) – *Expiring Soon*
*   **Background:** Off-white / Pale Grey (`#F5F5F5`)

### **3.2 Typography & Visuals**
*   **Font:** Modern Sans-Serif (Inter, Roboto, or Open Sans). High readability for dates.
*   **Iconography:** Feather style (thin outlines).
*   **Components:** Rounded corners (12px-16px), Card-based lists, Floating Action Button (FAB).

---

## 4. Data Structure (Schema)

### **4.1 Item Schema (Inventory)**
```typescript
interface InventoryItem {
  id: string;             // UUID
  name: string;           // Text
  type: 'Food' | 'Medicine' | 'Cosmetics';
  expirationDate: string; // ISO 8601 Date String
  barcode?: string;       // Optional: Scanned number string
  imageUri?: string;      // Local path to compressed thumbnail
  status: 'Fresh' | 'Expiring Soon' | 'Expired'; // Computed property
  createdAt: string;
}
```

### **4.2 User Profile Schema (Settings)**
```typescript
interface UserProfile {
  isOnboarded: boolean;
  userName: string;
  avatarId: string;       // ID of the pre-defined asset
  notificationSettings: {
    foodLeadTime: number;      // Default: 3
    medicineLeadTime: number;  // Default: 7
    cosmeticsLeadTime: number; // Default: 7
  };
}
```

---

## 5. App Flows & Functional Specifications

### **5.1 Onboarding Flow (First Run Only)**
*   **Logic:** On App Launch $\rightarrow$ Check `UserProfile.isOnboarded`. If `false`, show Onboarding. If `true`, go to Dashboard.
*   **UI Elements:**
    *   **Greeting:** "Welcome to SHI! Let's get to know you."
    *   **Input:** "What should we call you?" (Text Field).
    *   **Avatar Grid:** Selection of 6-8 minimalist outline icons (House, Cat, Leaf, Coffee, etc.). Selected state highlights in Sage Green.
    *   **Button:** "Start Organizing" $\rightarrow$ Saves profile $\rightarrow$ Navigates to Dashboard.

### **5.2 Dashboard (Home Screen)**
*   **Header Section:**
    *   **Greeting:** "Hello, **[Name]**! You have **[X]** items expiring soon." (If 0: "Everything is fresh!").
    *   **Avatar:** Display selected user avatar in top-right (Tap $\rightarrow$ Navigate to Settings).
*   **Filter Chips (Tabs):**
    *   Horizontal scroll or fixed row: `[All]` `[Food]` `[Medicine]` `[Cosmetics]`.
*   **Inventory List:**
    *   **Card UI:**
        *   Left: Small compressed thumbnail image.
        *   Center: Item Name + Expiration Date.
        *   Right: Color-coded border or small dot icon indicating status (Green/Orange/Red).
*   **Smart Feature (Recipes):**
    *   If items are flagged "Expiring Soon" (Food type), inject a "Suggestion Card" at the top of the list: *"Use your Eggs in an Omelet!"*

### **5.3 Add Item Screen**
*   **Fields:**
    1.  **Photo Input:** Tap generic icon $\rightarrow$ Camera $\rightarrow$ Snap $\rightarrow$ **Compress/Resize** $\rightarrow$ Save locally.
    2.  **Item Name:** Text Input.
    3.  **Type:** Dropdown (Food, Medicine, Cosmetics).
    4.  **Expiration Date:** Date Picker.
    5.  **Barcode:** Text Field + "Scan" Button.
        *   *Action:* Opens Camera $\rightarrow$ Detects Barcode $\rightarrow$ Fills Text Field. **No API/Database lookup.**
*   **Logic:**
    *   On Save: Calculate `notificationDate` based on `Type` defaults (e.g., Expiration Date minus 3 days for Food).
    *   Schedule Local Notification.

### **5.4 Smart Logic: Offline Recipe Suggestions**
*   **Database:** A local `recipes.json` file bundled with the app.
*   **Algorithm:**
    1.  Scan inventory for items with status `Expiring Soon` AND Type `Food`.
    2.  **Primary Match:** Check if `Item.name` contains keywords found in `Recipe.ingredients`.
    3.  **Fallback Match:** If no keyword match, look for `Recipe.category_tags` (e.g., "Vegetable") matching item tags.
    4.  Display the result on the Dashboard.

### **5.5 Settings & Data Management**
*   **Notification Preferences:**
    *   Sliders/Inputs to adjust Global Default Lead Time for Food vs. Medicine/Cosmetics.
*   **Data Export (Share Sheet):**
    *   **Export CSV:** Generates text-only table (Name, Type, Date, Status). Best for printing/Excel.
    *   **Export JSON:** Full dump including user settings. Images excluded (or Base64 if small) to keep it lightweight.
    *   *Implementation:* Use `react-native-fs` to write file $\rightarrow$ `react-native-share` to open system dialog.

---

## 6. Logic Descriptions (Pseudo-Code)

### **6.1 Notification Scheduler**
```javascript
// Function triggered when adding/editing an item
async function scheduleNotification(item, userSettings) {
  let daysBefore = 3; // Default fallback

  // Apply Category Defaults
  if (item.type === 'Food') daysBefore = userSettings.foodLeadTime;
  if (item.type === 'Medicine' || item.type === 'Cosmetics') {
    daysBefore = userSettings.medicineLeadTime;
  }

  const alertDate = subtractDays(item.expirationDate, daysBefore);

  // Use React Native Push Notification Library
  PushNotification.localNotificationSchedule({
    id: item.id,
    title: "SHI Alert: Use it or lose it!",
    message: `${item.name} is expiring in ${daysBefore} days.`,
    date: alertDate, // Date object
    allowWhileIdle: true,
  });
}
```

### **6.2 Offline Recipe Matcher**
```javascript
const localRecipes = [
  { name: "Omelet", ingredients: ["egg", "cheese", "milk"], tag: "protein" },
  { name: "Stir Fry", ingredients: ["chicken", "tofu"], tag: "vegetable" }
];

function getSuggestion(expiringItems) {
  for (let item of expiringItems) {
    // 1. Keyword Match
    const exactMatch = localRecipes.find(r => 
      r.ingredients.some(ing => item.name.toLowerCase().includes(ing))
    );
    if (exactMatch) return `Try making a ${exactMatch.name} with your ${item.name}!`;

    // 2. Fallback Logic
    if (item.name.toLowerCase().includes("vegetable")) {
      return "How about a Vegetable Stir Fry?";
    }
  }
  return null;
}
```