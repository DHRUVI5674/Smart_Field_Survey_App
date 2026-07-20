# 🧭 Smart Field Survey

<div align="center">

### 📋 A Modern Mobile Application for Smart Field Survey & Inspection Management

A simple, organized, and efficient solution for creating, managing, tracking, and monitoring field surveys.

<br/>

![React Native](https://img.shields.io/badge/React%20Native-0.86.0-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-Development-000020?style=for-the-badge&logo=expo)

</div>

---

## 📖 About The Project

**Smart Field Survey** is a modern React Native mobile application designed to simplify and digitize the field survey and inspection management process.

Field survey workflows often involve collecting site information, recording client details, tracking inspection locations, managing survey priorities, and maintaining historical records.

**Smart Field Survey** brings these essential operations together in one centralized mobile application.

### The application allows users to:

- 📝 Create and manage field surveys
- 🏢 Record site and project information
- 👤 Store client details
- ⚡ Assign survey priorities
- 📚 Manage survey history
- 📍 Capture current GPS locations
- 📋 Use clipboard utilities for quick data access
- 📞 Manage field-related contacts
- 📊 Monitor survey progress and productivity

---

## 🎯 Project Objective

The main objective of **Smart Field Survey** is to provide a centralized and user-friendly platform for managing field inspection activities.

The application aims to make the survey process:

- ⚡ Faster
- 📋 More organized
- 📍 More accurate
- 🔎 Easier to track
- 📱 More accessible
- 📊 More productive

Instead of depending on paper-based records or multiple applications, users can manage important field survey information from a single mobile application.

---

## ✨ Key Features

### 🏠 Smart Dashboard

- 👋 Personalized welcome experience
- 📊 View today's completed surveys
- 📈 Monitor weekly survey progress
- 🎯 Track weekly survey goals
- 🔥 Monitor active survey streaks
- 🏆 Display goal achievement status
- 👤 Quick access to profile information
- ⚡ Quick access to major application features

---

### 📝 Create New Survey

- 🏢 Add site or project name
- 👤 Add client or organization name
- 📄 Add detailed survey description
- ⚡ Assign survey priority
- 🟢 Low Priority
- 🟠 Medium Priority
- 🔴 High Priority
- 📅 Select survey date
- 🗒️ Add additional notes and observations
- 💾 Save structured survey records

---

### 📚 Survey History

- 🔍 Search surveys by site name
- 👤 Search surveys by client name
- 🆔 Search surveys using Survey ID
- 🎚️ Filter surveys by priority
- 👁️ View complete survey details
- 🗑️ Delete unwanted surveys
- 📅 View survey dates
- 📋 Access previously recorded survey information

---

### 📍 GPS Location Tracking

- 📡 Detect current device location
- 🌐 Display latitude and longitude
- 🎯 Display GPS accuracy
- 🔄 Refresh current location
- 📋 Copy coordinates with one tap
- ✅ Display GPS tracking status

---

### 📋 Clipboard Utilities

- 🆔 Copy Survey ID
- 📞 Copy Contact Number
- 📍 Copy Current Location
- 📝 Paste clipboard content into notes
- 🧹 Clear clipboard data

---

### 📞 Contact Management

- 🔍 Search contacts
- 👤 View contact information
- 📞 Call contacts directly
- 💬 Send messages
- ✏️ Edit contact details
- 🖼️ View contact profile photos

---

### 🎨 Modern UI/UX

- ✨ Clean and modern interface
- 📱 Mobile-first design
- 🃏 Card-based layouts
- 🎨 Color-coded survey priorities
- 🔘 Rounded UI components
- 📐 Consistent spacing and typography
- 🧭 Simple navigation experience
- ⚡ Fast and easy data entry

---

## 🔄 Application Flow

The application follows a simple and beginner-friendly workflow:

```mermaid
flowchart TD

    A([🚀 Start]) --> B[🏠 Open Dashboard]

    B --> C{What do you want to do?}

    C -->|Create Survey| D[📝 Create New Survey]
    C -->|View Surveys| H[📚 Survey History]
    C -->|Use Tools| K[🛠️ Field Utilities]

    D --> E[🏢 Add Site & Client Details]
    E --> F[📝 Add Description & Notes]
    F --> G[⚡ Select Priority & Date]
    G --> I[💾 Save Survey]
    I --> H

    H --> J[🔍 Search or View Survey]

    K --> L[📍 Location]
    K --> M[📋 Clipboard]
    K --> N[📞 Contacts]

    J --> B
    L --> B
    M --> B
    N --> B
