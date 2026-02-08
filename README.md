# DailyForge 
Forge Your Future, One Strike at a Time.

## Project Overview
DailyForge is a rugged, blacksmith-inspired habit-tracking application built to turn the abstract concept of **"discipline"** into a visual craft. Unlike standard productivity apps, DailyForge treats every habit as a piece of iron that must be struck daily to stay hot.

The application includes secure authentication, full CRUD functionality, state management, navigation, and cloud-based data persistence using Firebase. This project is developed as the **final coursework for ITS 2127 – Advanced Mobile Developer (AMD)**.

---
## Screenshots Preview

1. [Signin](./assets/images/signin.jpeg)
2. [Home](./assets/images/home.jpeg)
3. [New-Habit](./assets/images/new-habit.jpeg)
4. [Uddate-Delete-Habit](./assets/images/edit-delete-habit.jpeg)
5. [Habit-Details](./assets/images/habit-detail.jpeg)
6. [Community](./assets/images/community.jpeg)
7. [Progress](./assets/images/progress.jpeg)
8. [Settings](./assets/images/settings.jpeg)
9. [Edit-User](./assets/images/edit-user.jpeg)

---

## Features
1. The Forge (Habit Management)
- Create, Update, and Delete habits with a custom category system.
- Track current streaks and "Best Heat" (all-time streaks).
- Real-time synchronization across devices via Firebase.

2. The Forge Ledger (Analytics)
- Visual Heat Map: A contribution grid inspired by GitHub that visualizes habit intensity.
- Embers Logic: Squares glow brighter orange the more habits you complete in a single day.
- Stat Cards: Instant feedback on total wins and tool durability.

3. The Public Anvil (Community)
- Share "Sparks" (updates) with the community.
- Social Proof: Integrated camera to take and post photos of your progress.
- Sparking (Likes): Support other smiths by "sparking" their posts.
---

## Technology Stack

### Frontend
- React Native
- Expo
- JavaScript / TypeScript
- React Navigation (Stack & Tab)

### Backend
- Firebase Authentication
- Firebase Firestore / Realtime Database
- Firebase Cloud Functions (optional for AI logic)

### State Management
- React Context API + Hooks

### Icons
- Expo Vector Icons (MaterialIcons)

### Charts
- React Native Chart Kit

---
```
    DailyForge/
    ├── app/                  # Expo Router screens
    │   ├── (auth)/           # Login & Register flows
    │   └── (dashboard)/      # Habit, Community, and Progress screens
    ├── components/           # Reusable UI (StatCards, HabitCards, etc.)
    ├── service/              # Firebase configuration and API logic
    │   ├── firebase.config.ts
    │   ├── habitService.ts
    │   └── communityService.ts
    ├── types/                # TypeScript interfaces
    └── global.css            # NativeWind styling
```
## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/DailyForge.git
cd DailyForge
```

2. Install dependencies:
```bash
npx expo install
```

3. Setup Firebase:
- Create a project in the Firebase Console.
- Add a Web App to get your config object.
- Paste your config into service/firebase.config.ts.

4. Start the Forge:
```bash
npx expo start
```

---

## Academic Details
- **Module:** ITS 2127 – Advanced Mobile Developer  
- **Course:** Graduate Diploma in Software Engineering  
- **Student:** Sasuni Wijerathne  
- **Project Type:** Final Examination Assignment  
- **Framework:** React Native (Expo)  
- **Backend:** Firebase  


## Author
- **Sasuni Wijerathne**