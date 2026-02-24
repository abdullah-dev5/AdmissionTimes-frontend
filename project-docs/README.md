# AdmissionTimes Documentation Index

Welcome! This is the central documentation hub for the AdmissionTimes project.

## 🚀 Quick Start
- **New to the project?** → [START_HERE](../START_HERE.md)
- **Quick reference** → [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)  
- **Troubleshooting** → [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

## 📋 Core Documentation

### System Architecture
- **Overview** [overview.md](overview.md) - High-level system design
- **Tech Stack** [tech-specs.md](tech-specs.md) - Technologies & frameworks
- **Database Schema** [requirements.md](requirements.md) - Data model & ERD

### User Modules
- **Student Module** [student-module.md](student-module.md) - Features & workflows
- **University Module** [university-module.md](university-module.md) - Institution features
- **User Structure** [user-structure.md](user-structure.md) - User types & roles

## 🔄 Active Features

### Recently Implemented ✨
- **Recommendations System** - Smart collaborative filtering ([Backend Guide](../../../admission-times-backend/src/domain/recommendations/README.md))
- **Deadline Reminders** - 3-tier notification system ([Implementation Report](../../../admission-times-backend/DEADLINE_REMINDER_IMPLEMENTATION_REPORT.md))
- **Email Notifications** - Gmail SMTP integration
- **User Preferences** - Email notification controls

## 🛠️ Developer Guides

### Frontend
- **Architecture**: React 18 + TypeScript + Vite
- **State**: Zustand stores (authStore, studentStore, universityStore)
- **UI**: Tailwind CSS with responsive design

### Backend
- **API**: Express.js + TypeScript
- **Database**: PostgreSQL (Supabase)
- **Architecture**: Domain-driven design (admissions, notifications, deadlines, etc.)

## 📊 Project Status
- **Current Phase**: MVP - Core features implemented
- **Status**: [PROJECT_STATUS.md](../PROJECT_STATUS.md)
- **TODO List**: [TODO.md](../TODO.md)

## 🔗 Important Links
- **Frontend Repo**: `e:\fyp\admission-times-frontend`
- **Backend Repo**: `e:\fyp\admission-times-backend`
- **Mobile App**: `e:\fyp\AdmissionTimes-MobileApp`

## 📝 Notes
- All paths are workspace-relative from project root
- For environment setup, see `.env.example` files
- Database migrations are in `supabase/migrations/`

---

**Last Updated**: February 25, 2026
**Status**: Active Development (MVP)

