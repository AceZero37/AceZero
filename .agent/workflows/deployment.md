---
description: How to deploy the Hemiko Top-Up Website to Render (Backend) and Vercel (Frontend)
---

# 🚀 Deployment Guide

This guide explains how to deploy your **Hemiko Top-Up Shop** to production.

## 1. Prerequisites
- Accounts on [Render.com](https://render.com) and [Vercel](https://vercel.com).
- Push your latest code (including `users` folder and `website-top-up` folder) to GitHub.

---

## 2. Deploy Backend (Render.com)

1.  **Create a New Web Service**:
    - Select "Build and deploy from a Git repository".
    - Connect your `Hemiko` repository.

2.  **Configuration**:
    - **Name**: `hemiko-backend` (or similar)
    - **Root Directory**: `.` (Leave default, meaning the root of the repo)
    - **Environment**: `Node`
    - **Build Command**: `npm install && cd website-top-up/server && npm install`
    - **Start Command**: `node website-top-up/server/index.js`

3.  **Environment Variables** (Add these in the "Environment" tab):
    - `DB`: Your MongoDB connection string.
    - `BAKONG_TOKEN`: Your Bakong API token.
    - `BAKONG_ACCOUNT`: Your Bakong account ID.
    - `ADMIN_KEY`: Your secret admin key.
    - `NODE_ENV`: `production`

4.  **Deploy**: Click "Create Web Service". Wait for it to build and go live.
5.  **Copy URL**: Once live, copy your backend URL (e.g., `https://hemiko-backend.onrender.com`).

---

## 3. Deploy Frontend (Vercel)

1.  **Import Project**:
    - Click "Add New..." -> "Project".
    - Import your `Hemiko` repository.

2.  **Configure Project**:
    - **Framework Preset**: `Vite` (It should detect this automatically).
    - **Root Directory**: Check "Edit" and select `website-top-up`.

3.  **Environment Variables**:
    - Add a new variable:
        - **Name**: `VITE_API_URL`
        - **Value**: Your Render Backend URL **(NO trailing slash)**.
        - Example: `https://hemiko-backend.onrender.com`

4.  **Deploy**: Click "Deploy".

---

## 4. Final Steps

1.  **Discord Developer Portal**:
    - Go to your Application -> OAuth2.
    - Add your **Vercel domain** to the Redirects (e.g., `https://hemiko-shop.vercel.app`).
    - Update your code or `.env` in Render if you use callbacks there (though handling is mostly client-side redirection).

2.  **Testing**:
    - Open your Vercel URL.
    - Login with Discord.
    - Try adding an item to the cart.
    - Ensure it connects to the backend correctly.

🎉 **Done!**
