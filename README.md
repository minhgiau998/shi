# SHI (Smart Home Inventory)

SHI is a modern, mobile application designed to help users manage their household inventory, track expiration dates, and reduce food waste. Built with Expo, React Native, TypeScript, and localized for multiple languages, it offers a seamless and proactive experience for keeping your pantry and medicine cabinet organized.

## ✨ Highlights

- **Smart Expiration Tracking**: Automatic status updates (Fresh, Expiring Soon, Expired) with visual indicators and countdowns.
- **Multilingual Support**: Fully localized in Vietnamese and English, with language preferences saved to the user profile.
- **Recipe Matching**: Intelligent suggestions for meals based on items that are expiring soon.
- **Offline-First Storage**: Local database persistence using Drizzle ORM and SQLite via `expo-sqlite`.
- **Barcode Integration**: Quick item lookup and scanning capabilities using `expo-camera`.
- **Proactive Notifications**: Customizable lead times for different categories to remind you before items hit their expiration date.
- **Modern UI**: Built with Gluestack UI for a sleek, responsive design with full Dark Mode support.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Expo Go** app on your mobile device (for development testing) or a configured Android/iOS emulator.

## 🛠️ Installation

### 1. Clone or Extract the Project

Extract the project files to your desired location.

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### 3. Start the Development Server

```bash
npx expo start
```

Scan the QR code with your Expo Go app or press `a` for Android / `i` for iOS to start on an emulator.

## 📜 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Build and run the app on an Android device/emulator
- `npm run ios` - Build and run the app on an iOS device/simulator
- `npm run web` - Start the app in a web browser

## 🚀 Deployment & Store Submission

SHI is built using Expo, making deployment straightforward via EAS (Expo Application Services).

### 1. Prerequisites for Store
- **Apple Developer Program**: Required for iOS App Store.
- **Google Play Console**: Required for Google Play Store.
- **EAS Account**: Create an account at [expo.dev](https://expo.dev).

### 2. Configure EAS
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 3. Build for Production (App Store / Play Store)

These commands will generate the production binaries (`.aab` for Android, `.ipa` for iOS) by default.

#### **Android (Generate AAB)**
```bash
eas build --platform android --profile production
```
*Note: This generates an Android App Bundle (AAB), which is the standard format for Google Play.*

#### **iOS (Generate IPA)**
```bash
eas build --platform ios --profile production
```
*Note: You will need to select/create a Distribution Certificate and Provisioning Profile during this process.*

### 4. Submit to Stores

Once the builds are finished, you can submit them directly from your terminal:

```bash
# Submit the latest Android build
eas submit --platform android

# Submit the latest iOS build
eas submit --platform ios
```

### 5. Over-the-Air (OTA) Updates
Use Expo Updates to push fixes instantly without re-submitting to the stores:
```bash
# Publish update
eas update --branch production --message "Fixed translation bug"
```

## 🏗️ Project Structure

```
shi/
├── app/                         # Expo Router Pages
│   ├── (tabs)/                  # Main tab navigation (if applicable)
│   ├── item/                    # Item detail screens
│   ├── recipe/                  # Recipe detail and listing screens
│   ├── _layout.tsx              # Root layout with providers (UI, i18n, DB init)
│   └── index.tsx                # Dashboard / Home screen
├── src/
│   ├── assets/                  # Static data (recipes.json, icons)
│   ├── constants/               # App-wide constants (Category types, UI tokens)
│   ├── db/                      # Database schema and SQLite client (Drizzle)
│   ├── features/                # Domain-specific components (User, Inventory)
│   ├── i18n/                    # Localization setup and locale files (en.json, vi.json)
│   ├── store/                   # Zustand state management (userStore, inventoryStore)
│   ├── types/                   # TypeScript interfaces and types
│   └── utils/                   # Helpers (Notification service, date logic, barcode helpers)
├── package.json                 # Project dependencies
└── tsconfig.json                # TypeScript configuration
```

## 🛠️ Tech Stack

- **Expo 54** - Universal React framework
- **React Native 0.81** - Mobile UI framework
- **TypeScript** - Static typing
- **Gluestack UI** - Modern UI components & styling
- **Drizzle ORM** - Type-safe SQL client
- **SQLite** - Local storage
- **i18next** - Internationalization
- **Zustand** - Global state management
- **Lucide React Native** - Icon library

## 🔧 Configuration

### Localization
Locales are managed in `src/i18n/locales/`. To add a new language, create a new JSON file and register it in `src/i18n/i18n.ts`.

### Database Schema
Database changes should be updated in `src/db/schema.ts`. Migrations/Initialization logic is handled in `src/db/client.ts`.

## 📝 Notes & Next Steps

- **Barcode Database**: Currently, barcode scanning fills the data field. Integrating a global food database API would enable automatic name/category population.
- **Cloud Sync**: The current version is local-only. Future updates could include Supabase or Firebase integration for multi-device syncing.
- **Notifications**: Ensure you have granted notification permissions on your device to receive expiration alerts based on your configured lead times.
- **Recipes**: The recipe suggestion engine matches keywords in item names. More complex matching based on quantities could be implemented.
