# Lapor Aman - Deployment Guide

Complete guide for deploying Lapor Aman to production on Vercel.

## Prerequisites

- GitHub account with the repository
- Firebase project set up
- Vercel account
- Environment variables ready

## Step 1: Prepare Your Code

### 1.1 Update Environment Variables

1. Rename `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all Firebase credentials from your Firebase Console:
   - Go to Project Settings in Firebase
   - Copy your web app config
   - Paste into `.env.local`

3. Test locally:
   ```bash
   npm run dev
   ```

### 1.2 Test All Features Locally

1. Create test accounts with each role:
   - Masyarakat: citizen@test.com
   - Petugas: officer@test.com
   - Admin: admin@test.com

2. Create test reports and verify:
   - Report creation works
   - Status updates work
   - Responses can be added
   - Statistics display correctly

3. Verify all routes are protected:
   - Try accessing `/dashboard` without logging in
   - Should redirect to `/login`

## Step 2: Prepare Firebase for Production

### 2.1 Create Production Firestore Database

1. In Firebase Console:
   - Go to Firestore Database
   - Create a new database (or use existing)
   - Select Production mode for security

2. Create collections:
   ```
   - users
   - pengaduan
   - tanggapan
   ```

3. Create indexes:
   - Collection: `pengaduan`
   - Fields: `userId` (Asc), `createdAt` (Desc)
   - Fields: `status` (Asc), `createdAt` (Desc)

### 2.2 Set Security Rules

1. Go to Firestore Rules tab
2. Copy rules from `FIRESTORE_RULES.md`
3. Paste into the Rules Editor
4. Click "Publish"

### 2.3 Enable Required Firebase Services

- Authentication (Email/Password)
- Firestore Database
- Cloud Storage

### 2.4 Set Up Cloud Storage

1. Go to Storage tab
2. Create a bucket
3. Update security rules:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /lapor-aman/pengaduan/{userId}/{allPaths=**} {
         allow read, write: if request.auth.uid == userId;
         allow read: if request.auth.uid != null;
       }
     }
   }
   ```

## Step 3: Deploy to Vercel

### 3.1 Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the repository branch to deploy

### 3.2 Configure Environment Variables

1. In Vercel Project Settings:
   - Go to Environment Variables
   - Add all variables from `.env.local`:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY = [your_api_key]
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = [your_auth_domain]
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = [your_project_id]
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = [your_storage_bucket]
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = [your_sender_id]
   NEXT_PUBLIC_FIREBASE_APP_ID = [your_app_id]
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = [optional]
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = [optional]
   ```

2. Set environment for all deployments (Production, Preview, Development)

### 3.3 Deploy

1. Click "Deploy"
2. Vercel will:
   - Build your Next.js app
   - Run tests
   - Deploy to production
   - Provide a deployment URL

3. Wait for build to complete
4. Visit your deployment URL

## Step 4: Post-Deployment Configuration

### 4.1 Update Firebase CORS Settings

For image uploads to work from your deployed domain:

1. In Firebase Console → Storage:
   - Add your Vercel domain to CORS configuration
   
2. In Google Cloud Console:
   - Enable Cloud Storage API
   - Configure CORS if using Cloud Functions

### 4.2 Configure Firebase Authentication

1. In Firebase Console → Authentication:
   - Go to Settings
   - Add your Vercel domain to Authorized domains:
     - `yourdomain.vercel.app`
     - `www.yourdomain.vercel.app` (if using custom domain)

2. Enable Email/Password provider if not done

### 4.3 Configure Custom Domain (Optional)

To use a custom domain instead of `*.vercel.app`:

1. In Vercel Project Settings:
   - Go to Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. In Firebase Console:
   - Add custom domain to Authorized domains

## Step 5: Security Hardening

### 5.1 Enable Firebase Security Features

- [ ] Email verification for new users
- [ ] Strong password requirements
- [ ] Account lockout after failed attempts
- [ ] Two-factor authentication (optional)

### 5.2 Configure Firestore Backups

1. Enable automated backups
2. Set retention policy (30 days recommended)
3. Test backup restoration

### 5.3 Set Up Monitoring

1. Enable Firebase Performance Monitoring
2. Enable Crashlytics
3. Set up alerts for:
   - High error rates
   - Quota limits approaching
   - Unusual activity

### 5.4 Configure Rate Limiting

For production, consider adding rate limiting to prevent abuse:
- Firebase Realtime Database rules include rate limiting
- Consider Cloudflare for DDoS protection

## Step 6: Performance Optimization

### 6.1 Enable Firebase Caching

1. Go to Firestore Settings
2. Enable persistent caching
3. Configure cache size (10-100 MB)

### 6.2 Optimize Images

- Ensure images are optimized before upload
- Consider implementing image compression
- Use Next.js Image optimization

### 6.3 Database Optimization

- Create indexes for frequently queried fields
- Archive old reports periodically
- Monitor database size

## Step 7: Monitoring and Maintenance

### 7.1 Set Up Analytics

1. Enable Google Analytics in Firebase
2. Track:
   - User registration and login
   - Report creation
   - User engagement

### 7.2 Monitor System Health

Weekly checks:
- [ ] Check Firestore quota usage
- [ ] Review error logs
- [ ] Monitor response times
- [ ] Check storage usage

Monthly tasks:
- [ ] Review user activity
- [ ] Analyze report trends
- [ ] Update security rules if needed
- [ ] Test backup restoration

### 7.3 Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Audit for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Troubleshooting Deployment Issues

### Build Fails

```bash
# Clear cache and rebuild
vercel --prod --force

# Check build logs in Vercel dashboard
# Look for environment variable issues
```

### Firebase Connection Issues

1. Verify all environment variables are set in Vercel
2. Check Firebase Console for API restrictions
3. Ensure Firebase APIs are enabled

### Image Upload Not Working

1. Check Firebase Storage bucket URL
2. Verify CORS configuration
3. Check browser console for specific errors
4. Ensure bucket has proper security rules

### Slow Performance

1. Check Firestore read/write operations
2. Review database indexes
3. Monitor Vercel serverless functions
4. Check network tab in browser DevTools

### Authentication Issues

1. Verify Firebase Auth is enabled
2. Check authorized domains
3. Clear browser cookies and try again
4. Check Firebase Console for blocked IPs

## Rollback Procedure

If deployment has issues:

1. In Vercel Dashboard:
   - Go to Deployments
   - Click on a previous successful deployment
   - Click "Promote to Production"

2. This immediately reverts to the previous version
3. Investigate issues in development before redeploying

## Production Checklist

- [ ] All environment variables configured
- [ ] Firebase security rules updated
- [ ] CORS configured for custom domain
- [ ] Authorized domains added to Firebase
- [ ] Backups enabled
- [ ] Monitoring configured
- [ ] Rate limiting implemented
- [ ] Error logging enabled
- [ ] Performance optimized
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Custom domain configured (if using)
- [ ] Admin account created for support
- [ ] Documentation updated with prod URLs
- [ ] User onboarding prepared
- [ ] Support email configured

## Scaling Considerations

As your user base grows:

1. **Database Scaling**
   - Consider Firebase's pricing model
   - Implement data archival strategy
   - Monitor quota limits

2. **Storage Scaling**
   - Implement image compression
   - Consider CDN for image delivery
   - Set storage quotas

3. **Authentication Scaling**
   - Consider custom authentication if many users
   - Implement social login options
   - Add admin user management interface

## Support and Resources

- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Deployment Complete!** Your Lapor Aman application is now live in production.
