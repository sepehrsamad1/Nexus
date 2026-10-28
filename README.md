# NEXUS.GG - Ultimate Gaming Platform

A complete, full-stack Next.js 15 application combining:
1. **Metacritic-style Game Grading** (Weighted scoring for Critics, Streamers, and Users).
2. **Reddit-style Nested Discussions** (Infinite reply trees, upvotes, and karma).
3. **E-Commerce Gear & Key Store** (Persistent Zustand cart, instant digital key delivery, and cross-selling).

---

## 🏗️ Architecture & Tech Stack
* **Framework:** Next.js 15 (App Router, Server Actions, TypeScript)
* **Styling:** Tailwind CSS + Lucide Icons (Dark Gaming Theme)
* **Database:** SQLite (local dev) / PostgreSQL (production ready) via **Prisma ORM**
* **State Management:** Zustand (Client-side persistent cart)
* **Auth:** Role-Based Access Control via mocked session hooks (simulating NextAuth v5)

## 🗄️ Database Schema Overview
* **`User`**: Tracks profiles, roles (`USER`, `STREAMER`, `EXPERT`, `ADMIN`), and Twitch/YouTube links.
* **`Game`**: Stores metadata, auto-calculated scores (`expertScore`, `streamerScore`, `userScore`), and digital stock keys.
* **`Review`**: The core grading model (0-100 score). Tracks `roleAtCreation` so scores weigh correctly. Supports VOD URL embeds.
* **`Comment`**: Features a self-relation (`parentId`) to allow infinitely nested Reddit-style thread replies.
* **`Vote`**: Tracks `+1` / `-1` karma on Reviews and Comments with unique composite constraints to prevent duplicate voting.
* **`Product` & `Order`**: Handles physical gear stock tracking and instant digital key delivery.

## 🔐 Role-Based Access Control (RBAC)
The platform uses a rapid-testing Role Switcher located in the top navigation bar. 
* **User (Regular):** Can write standard community reviews, buy gear/keys, and comment/vote on threads.
* **Verified Streamer:** Unlocks the ability to embed YouTube/Twitch VOD URLs into reviews. Their scores contribute to the distinct "Streamer" Metascore.
* **Expert Critic:** Represents gaming journalists. Their scores contribute to the "Critic" Metascore.
* **Platform Admin:** Has exclusive access to the `/admin` dashboard to monitor KPIs, manage inventory, restock digital keys, and verify new Streamers/Experts.

---

## 🚀 Local Quickstart (Zero Configuration)

Everything you need to run the application locally is pre-configured. No external database installation is required (uses local SQLite).

### First-Time Setup
1. Ensure you have **Node.js (v18+)** and **Git** installed.
2. Run the initial setup:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   npm run dev
   ```

### Daily Launch
To start the site at any time, just run the master script:
```powershell
.\start-site.ps1
```
*(Or simply run `npm run dev` in your terminal).*

Site will be live at: **http://localhost:3000**
