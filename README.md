# 💪 Fit Forge

A modern home-workout and fitness application built with **React Native + Expo** and **Supabase**.

Fit Forge creates personalized workout and diet plans based on the user's profile, fitness goals, workout preferences, equipment, and diet preference.

The goal is to provide a **premium fitness-app experience without requiring an expensive subscription**.

---

## 🚀 Features

### 👤 User Profile

- User registration and login
- Personalized profile
- Age, gender, height and weight
- BMI calculation
- Fitness goal selection
- Diet preference
- Workout preferences
- Equipment selection

### 🏋️ Personalized Workouts

- Personalized workout plans
- Beginner, Intermediate and Advanced levels
- Home workouts
- Calisthenics exercises
- Equipment-based exercise selection
- Sets and reps
- Rest periods
- Exercise instructions
- Target muscle information
- Exercise benefits
- Common mistakes
- Exercise images and videos
- Workout completion tracking

### 📅 Smart Workout Schedule

- Weekly workout schedule
- Custom workout days
- Rest days
- Workout rescheduling
- Missed workout handling
- Workout history
- Daily workout tracking
- Workout streaks

### 🍎 Personalized Diet

- Personalized daily meal plans
- Vegetarian / Non-Vegetarian preferences
- Calorie targets
- Protein targets
- Carbohydrates and fat tracking
- Breakfast, lunch, snacks and dinner
- Food nutrition information
- Meal completion tracking
- Daily nutrition progress

### 📊 Progress Tracking

- Weight tracking
- Workout history
- Calories burned
- Calories consumed
- Workout streak
- Progress statistics
- Best streak tracking

### 🎨 Modern UI

- Premium dark fitness theme
- Responsive mobile layout
- Workout-focused dashboard
- Exercise cards
- Nutrition cards
- Progress cards
- Bottom navigation
- Safe-area support
- Smooth mobile experience

---

## 🛠️ Tech Stack

### Frontend

- React Native
- Expo
- JavaScript
- React Navigation
- Expo Vector Icons

### Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Row Level Security (RLS)

### Development

- VS Code
- Git
- GitHub
- Expo Go

---

## 🏗️ Application Architecture

```text
                ┌──────────────────────┐
                │      Fit Forge       │
                │   React Native App   │
                └──────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      Authentication    Workouts          Diet
          │                │                │
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    ┌───────────────┐
                    │   Supabase    │
                    │  PostgreSQL   │
                    └───────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
       Profiles         Exercises        Food Items
          │                │                │
          ▼                ▼                ▼
       Progress      Workout Plans      Diet Plans

Fit Forge
│
├── 🔐 Login
├── 📝 Sign Up
├── 👤 Profile / Onboarding
│
├── 🏠 Home
│   ├── Today's Workout
│   ├── Streak
│   ├── Weight
│   └── Weekly Progress
│
├── 🏋️ Workout
│   ├── Today's Plan
│   ├── Weekly Schedule
│   ├── Exercise Details
│   └── Workout Completion
│
├── 🍎 Diet
│   ├── Daily Nutrition
│   ├── Breakfast
│   ├── Lunch
│   ├── Snacks
│   └── Dinner
│
├── 📊 Progress
│   ├── Weight
│   ├── Workouts
│   ├── Calories
│   └── Streak
│
└── 👤 Profile
    ├── Personal Information
    ├── Fitness Goals
    ├── Diet Preference
    └── Settings

