# Lapor Aman - Quick Start Guide

Get Lapor Aman up and running in 15 minutes.

## 5-Minute Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd lapor-aman

# Install dependencies
npm install
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Create a web app
4. Copy your config

### 3. Configure Environment

1. Copy template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### 4. Setup Firebase Services

In Firebase Console:

1. **Authentication**
   - Go to Authentication
   - Click "Get started"
   - Enable "Email/Password"

2. **Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Select "Production mode"
   - Choose your location
   - Click "Enable"

3. **Cloud Storage**
   - Go to Storage
   - Click "Get started"
   - Keep default settings
   - Click "Done"

### 5. Setup Firestore Rules

1. Go to Firestore → Rules
2. Paste rules from `FIRESTORE_RULES.md`
3. Click "Publish"

### 6. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## First Test Run

### Create Test Users

1. **Sign up as Community Member:**
   - Click "Create Account"
   - Name: Test Citizen
   - Email: citizen@test.com
   - Role: Masyarakat
   - Password: Test123!

2. **Sign up as Officer:**
   - Click "Create Account"
   - Name: Test Officer
   - Email: officer@test.com
   - Role: Petugas
   - Password: Test123!

3. **Sign up as Admin:**
   - Click "Create Account"
   - Name: Test Admin
   - Email: admin@test.com
   - Role: Admin
   - Password: Test123!

### Test Features

1. **As Citizen:**
   - Create a new report
   - Add title, description, location
   - Select category and priority
   - Submit report
   - See it in "My Reports"

2. **As Officer:**
   - Go to "All Reports"
   - See the report from citizen
   - Update status to "In Progress"
   - Add a response
   - See response appear

3. **As Admin:**
   - Go to "Statistics"
   - See charts and analytics
   - View completion rate

## Troubleshooting

### Cannot Login

```
❌ "Permission denied" error

✅ Solution:
1. Check user exists in Firebase Console
2. Verify email is correct
3. Clear browser cache
4. Check console for errors
```

### Image Upload Fails

```
❌ "Upload failed" error

✅ Solution:
1. Check file size < 25MB
2. Verify Storage is enabled
3. Check storage rules are updated
4. Try different image format
```

### Pages Won't Load

```
❌ Blank page or redirect loop

✅ Solution:
1. Check env variables are set
2. Verify Firebase config is correct
3. Check console for JavaScript errors
4. Restart npm run dev
```

### Role-Based Access Not Working

```
❌ Can access pages shouldn't have access to

✅ Solution:
1. Log out and log back in
2. Verify user role in Firestore
3. Check security rules
4. Clear localStorage
```

## Project Structure Quick Reference

```
lapor-aman/
├── app/
│   ├── login/          → Login page
│   ├── register/       → Sign up page
│   └── dashboard/
│       ├── reports/    → My reports
│       ├── all-reports/ → All reports (officers)
│       └── statistics/ → Analytics (admin)
├── components/
│   ├── create-report-form.tsx
│   ├── report-card.tsx
│   └── dashboard-sidebar.tsx
├── lib/
│   ├── firebase.ts      → Firebase config
│   ├── auth-context.tsx → Auth state
│   ├── firestore-service.ts → Database
│   └── types.ts         → Types
└── ENV_SETUP.md         → Detailed setup guide
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables |
| `lib/firebase.ts` | Firebase initialization |
| `lib/auth-context.tsx` | Authentication state |
| `lib/firestore-service.ts` | Database operations |
| `FIRESTORE_RULES.md` | Database security rules |

## Next Steps

### After Initial Setup

1. **Customize UI**
   - Edit colors in `app/globals.css`
   - Update logo/branding
   - Modify sidebar menu

2. **Add Your Data**
   - Create real user accounts
   - Import existing reports (if any)
   - Set up admin users

3. **Deploy to Production**
   - Push to GitHub
   - Connect Vercel to repo
   - Follow `DEPLOYMENT.md` guide
   - Test all features in production

### Common Customizations

**Change colors:**
```css
/* app/globals.css */
:root {
  --primary: #your-color;
  --secondary: #your-color;
}
```

**Update text:**
- Edit component files in `app/dashboard/`
- Change strings and labels

**Add features:**
- See `ARCHITECTURE.md` for structure
- Follow existing patterns
- Add new pages in `app/dashboard/`

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Check for issues
npm run lint

# Format code
npm run format

# Install new dependency
npm install <package-name>

# Update all dependencies
npm update
```

## Environment Variables Checklist

Before deployment, verify you have:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Firestore database created
- [ ] Authentication enabled
- [ ] Cloud Storage enabled
- [ ] Security rules applied

## Support Resources

- **Firebase:** https://firebase.google.com/docs
- **Next.js:** https://nextjs.org/docs
- **Tailwind:** https://tailwindcss.com/docs

## Common Errors & Solutions

### "NEXT_PUBLIC_FIREBASE_API_KEY is not set"

**Solution:** Add environment variable to `.env.local`

### "Firebase is not initialized"

**Solution:** Check that all Firebase env variables are correct

### "Rules does not contain any statements"

**Solution:** Paste rules from `FIRESTORE_RULES.md` correctly

### "User does not have permission"

**Solution:** Update Firestore rules (see `FIRESTORE_RULES.md`)

---

**That's it!** You now have a working Lapor Aman installation.

For more detailed information, see:
- `README.md` - Full feature list
- `ENV_SETUP.md` - Detailed setup
- `DEPLOYMENT.md` - Deploy to production
- `ARCHITECTURE.md` - Technical details
