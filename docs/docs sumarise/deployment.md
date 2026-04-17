# Internal Deployment Guide

*Note: This document is for the repository owner. It contains the steps to deploy the application and configure third-party services.*

## 1. Deploying to Vercel

Setlists MD is a static Single Page Application (SPA). Vercel is the recommended host for the frontend.

1. Create an account at [Vercel.com](https://vercel.com).
2. Click **Add New > Project**.
3. Import this GitHub repository.
4. Vercel will automatically detect that it's a Vite project.
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Click **Deploy**.
6. *(Optional but recommended)* Go to the project settings in Vercel and assign your custom domain (e.g., `setlistsmd.com`).

## 2. Environment Variables (.env)

The application requires certain environment variables to communicate with third-party APIs (like Google Drive or Supabase).

Create a `.env` file in the root of your local project (do not commit this to Git). You must also add these exact variables to your Vercel Project Settings > Environment Variables.

```env
# Google Drive Sync (For Tier 1 Free Sync)
VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"

# Supabase (For Tier 2/3 Cloud Sync)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

## 3. Getting the Google Client ID
To allow users to sync to their Google Drive for free, you must set up an OAuth app.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project (e.g., "Setlists MD").
3. Go to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Application type: **Web application**.
6. **Authorized JavaScript origins:** Add your local dev URL (`http://localhost:5173`) and your production URL (`https://setlistsmd.com`).
7. Copy the generated **Client ID** and put it in your `.env` file.

## 4. Setting up Supabase (Future Phase)
When you are ready to launch the paid tiers (Private/Team Sync):

1. Go to [Supabase.com](https://supabase.com) and create a project.
2. Go to **Project Settings > API** to get your URL and Anon Key.
3. Use the SQL Editor in Supabase to run the schema creation script found in `docs/monetization.md`.
4. Configure Supabase Auth to allow Email/Password signups.
