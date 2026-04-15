# Lapor Aman - Environment Setup Guide

## Firebase Configuration

Lapor Aman uses Firebase for authentication and Firestore for data storage. Follow these steps:

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Name it "Lapor Aman"
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Get Firebase Credentials
1. In the Firebase Console, go to Project Settings (gear icon)
2. Under "Your apps", click "Add app" and select "Web"
3. Register the app with a nickname (e.g., "Lapor Aman Web")
4. Copy the Firebase config object

### 3. Environment Variables
Create a `.env.local` file in the root directory with these variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Firebase Setup

### 1. Enable Authentication
1. In Firebase Console, go to Authentication
2. Click "Get started"
3. Enable "Email/Password" authentication method

### 2. Create Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Start in "Production mode"
4. Select your preferred location
5. Click "Enable"

### 3. Set Firestore Rules
Replace the default rules with:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.uid != null; // Officers and admins can read all users
    }

    // Reports collection
    match /pengaduan/{reportId} {
      allow read, write: if request.auth.uid != null;
      allow update: if request.auth.uid != null;
      allow delete: if request.auth.uid == resource.data.userId || 
                      exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    // Responses collection
    match /tanggapan/{responseId} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

## Cloudinary Setup (Optional - for Direct Image Upload)

### 1. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard
4. Note your "Cloud Name"

### 2. Create Upload Preset
1. Go to Settings > Upload
2. Create an unsigned upload preset (for frontend upload)
3. Copy the preset name

### 3. Add to Environment Variables
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

**Note:** The current implementation uses Firebase Storage. Cloudinary integration can be added as an alternative.

## User Roles

Lapor Aman supports three roles:

1. **Masyarakat (Community Member)**
   - Can create and view their own reports
   - Can see responses to their reports

2. **Petugas (Officer)**
   - Can view all reports
   - Can update report status
   - Can add responses to reports

3. **Admin (Administrator)**
   - Full access to all features
   - Can view system statistics
   - Can manage all reports and responses

## Deployment on Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your GitHub repository
4. Add the environment variables from `.env.local`
5. Deploy

## Testing

### Create Test Users
1. Sign up with different roles:
   - Masyarakat: `citizen@example.com`
   - Petugas: `officer@example.com`
   - Admin: `admin@example.com`

### Test Features
- Create reports as Masyarakat
- Respond to reports as Petugas
- View statistics as Admin

## Troubleshooting

### Firebase Connection Issues
- Verify all Firebase config variables are correct
- Check that Firestore database is enabled
- Ensure Authentication is enabled with Email/Password

### Image Upload Not Working
- Check Firebase Storage is enabled
- Verify storage bucket name in config
- Check browser console for errors

### Rules Error When Writing
- Make sure Firestore rules are updated correctly
- Clear browser cache and try again
