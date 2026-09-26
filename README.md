# Advanced Manifestation - Assessment Form

A mindful, serene single-page assessment and reflection application designed for the **Advanced Manifestation** program. Seamlessly collects participant responses and synchronizes them directly into Google Sheets in real-time.

---

## ✨ Features

- **Mindful Aesthetic**: Spiritual saffron & sunset palette with glassmorphism, tranquil atmosphere, and warm typography.
- **Mobile-First Responsive Design**: Optimized for mobile devices (320px+), iOS Safari zoom-prevention (`16px` inputs), zero-delay touch targets (`touch-manipulation`), and uncropped responsive banner scaling.
- **Direct Google Sheets Integration**: Supports dual synchronization:
  - Cloudflare Pages Functions / Server-side edge proxy (`/api/submit`).
  - Client-side direct browser fallback with zero CORS barriers.
- **Auto-Draft Saving**: Automatically retains participant answers in local storage if they refresh or close the tab.
- **Dynamic Header Banner**: Proportional banner rendering featuring the custom graphic with no clipping or cropping.
- **Cloudflare Ready**: Built-in `_redirects`, `_headers`, `wrangler.toml`, and Cloudflare Pages Functions (`/functions/api/*`).

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

### 3. Build for Production
```bash
npm run build
```
Build output is saved to the `dist/` directory.

---

## 📦 How to Push to GitHub

Run the following commands in the root directory of this project:

```bash
# Initialize git repository
git init

# Add all prepared files
git add .

# Commit changes
git commit -m "feat: complete Advanced Manifestation app with Cloudflare Pages readiness"

# Rename branch to main
git branch -M main

# Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Push to GitHub
git push -u origin main
```

---

## ☁️ Deploy to Cloudflare Pages (Automatic Deployments)

Cloudflare Pages connects directly to your GitHub repository and automatically deploys every time you push changes.

### Step 1: Connect GitHub in Cloudflare
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left sidebar, click **Compute (Workers & Pages)** > **Create application** > **Pages** tab.
3. Click **Connect to Git** and choose your GitHub account.
4. Select the repository you just pushed (`<your-repo-name>`).

### Step 2: Configure Build Settings
Fill in the configuration fields:
- **Project Name**: `advanced-manifestation` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave blank)

### Step 3: Environment Variables (Optional)
In the **Environment variables** section, you can optionally set:
- `GOOGLE_SHEET_WEBHOOK_URL`: `https://script.google.com/macros/s/AKfycbxpi8z5usCBwIThD8SAg1KmUkqWr1t6mQZyrZlf-EQBoBDdfnCOFJiHfLqirNhyj3et/exec`

### Step 4: Deploy & Add Custom Domain
1. Click **Save and Deploy**. Cloudflare Pages will build the site and provide you with a `*.pages.dev` URL.
2. To link your custom domain (e.g. `reflect.monkhood.in` or `form.yourdomain.com`):
   - In Cloudflare Pages, go to your project > **Custom domains** tab.
   - Click **Set up a custom domain** and enter your domain/subdomain.
   - Cloudflare will automatically provision SSL certificates and update DNS.

---

## 📊 Google Sheets Apps Script Setup

The app is already pre-configured with the Google Apps Script Web App URL:
```
https://script.google.com/macros/s/AKfycbxpi8z5usCBwIThD8SAg1KmUkqWr1t6mQZyrZlf-EQBoBDdfnCOFJiHfLqirNhyj3et/exec
```

If you ever wish to connect a new Google Sheet:
1. Open your Google Sheet.
2. Click **Extensions** > **Apps Script**.
3. Paste the script provided in `src/data/questions.ts`.
4. Click **Deploy** > **New deployment**.
5. Select type: **Web app**.
6. Set:
   - **Execute as**: *Me*
   - **Who has access**: *Anyone*
7. Copy the Web App URL and update it via the in-app modal or environment variables.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Hosting & Edge**: Cloudflare Pages + Pages Functions
- **Backend / Dev Proxy**: Express + Node.js
