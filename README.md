# Premium Expense Tracker (v2.0)

A comprehensive, production-ready full-stack application with a modular React Native mobile frontend and a scalable Node.js/Express backend.

## Features

- **Authentication System:** Secure JWT tokens, bcrypt password hashing, and role-based access control.
- **Backend Architecture:** Modular setup using ES Modules (Controllers, Services, Routes, Models, Middleware).
- **Core Dashboard:** Optimized dashboard views utilizing `FlatList` for scalability and performance.
- **Premium UI Components:** Custom reusable Reanimated / generic UI components for seamless Navigation.
- **Secure File Uploads:** Upload Images and PDFs securely with backend integration using `multer`.
- **Database:** MongoDB connection for fast and scalable operations.

## Project Structure

This project enforces strict separation of concerns without removing original architectural layers.

```
/backend
  /src
    /config      # DB and JWT configurations
    /controllers # Express route controllers
    /middleware  # Auth and Upload middleware
    /models      # Mongoose Schemas (User, Transaction, etc.)
    /routes      # API Endpoints
    /services    # Business Logic

/mobile
  /src
    /components  # Reusable UI (Button, InputField, Card, Loader)
    /navigation  # Stacks (AppNavigator, AuthNavigator)
    /screens     # Splash, Login, Signup, Home, Dashboard
    /services    # Axios intercepts (apiService, authService)
    /utils       # Constants and helper functions
```

## Setup & Running the Application

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` root and configure your variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=your_super_secret_jwt_key
```

Run the backend server:
```bash
npm run dev
```

### 2. Mobile App Setup

Open a new terminal and navigate to the `mobile` directory:

```bash
cd mobile
npm install
```

Ensure your `mobile/src/utils/constants.ts` file points to the correct backend IP. For local testing on an Android Emulator, `10.0.2.2:5000` is used by default. For iOS or physical devices, change this to your computer's local Wi-Fi IP address.

Start the Metro Bundler:
```bash
npx expo start
```

Press `a` to run on an Android emulator, or `i` for an iOS Simulator.

### 3. File Uploads

Ensure a directory named `uploads` exists within the `backend` folder. `multer` will automatically save images and PDFs to this directory. The server is configured to statically serve these files from `/uploads`.
# Expense-Tracker-app2
