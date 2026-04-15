# Firestore Security Rules for Lapor Aman

Copy and paste these rules into your Firestore Security Rules panel in Firebase Console.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - Secured access
    match /users/{userId} {
      // Allow users to read and modify their own profile
      allow read, write: if request.auth.uid == userId;
      
      // Allow authenticated users to read other user profiles (needed for officer/admin features)
      allow read: if request.auth.uid != null;
      
      // Prevent deletion of user profiles
      allow delete: if false;
    }

    // Reports (Pengaduan) collection
    match /pengaduan/{reportId} {
      // Anyone authenticated can read all reports
      allow read: if request.auth.uid != null;
      
      // Users can create new reports
      allow create: if request.auth.uid != null && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.status == 'menunggu' &&
                       request.resource.data.judul is string &&
                       request.resource.data.isiLaporan is string;
      
      // Users can update reports they own
      allow update: if request.auth.uid != null && 
                       resource.data.userId == request.auth.uid;
      
      // Admins and officers can update status
      allow update: if request.auth.uid != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['petugas', 'admin'] &&
                       request.resource.data.status in ['menunggu', 'diproses', 'selesai'];
      
      // Only admins can delete reports
      allow delete: if request.auth.uid != null &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Responses (Tanggapan) collection
    match /tanggapan/{responseId} {
      // Anyone authenticated can read responses
      allow read: if request.auth.uid != null;
      
      // Only officers and admins can create responses
      allow create: if request.auth.uid != null &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['petugas', 'admin'] &&
                       request.resource.data.tanggapan is string;
      
      // Allow reading responses for specific reports
      allow read: if request.auth.uid != null;
      
      // Only the officer who created can update their response
      allow update: if request.auth.uid != null &&
                       resource.data.petugasId == request.auth.uid;
      
      // Only admins can delete responses
      allow delete: if request.auth.uid != null &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Rules Explanation

### Users Collection
- Each user can only read and modify their own profile
- Anyone authenticated can view other user profiles (for officer/admin features)
- User profiles cannot be deleted

### Pengaduan (Reports) Collection
- All authenticated users can read all reports
- Users can create new reports, but only with their own userId
- Users can update their own reports
- Officers and admins can update report status
- Only admins can delete reports

### Tanggapan (Responses) Collection
- All authenticated users can read all responses
- Only officers and admins can create responses
- Users can only update their own responses
- Only admins can delete responses

## Testing the Rules

1. **Create a test user with each role:**
   - Masyarakat user
   - Petugas user
   - Admin user

2. **Test report creation:**
   - Masyarakat should be able to create reports
   - All users should be able to read all reports

3. **Test report updates:**
   - Petugas should be able to update status
   - Masyarakat should not be able to update status

4. **Test responses:**
   - Petugas should be able to create responses
   - Masyarakat should not be able to create responses

## Common Issues

### "Permission denied" error
- Check that the user's role in Firestore matches their authentication
- Verify the security rules have been updated
- Clear browser cache and retry

### Cannot create reports
- Ensure the `userId` field matches `request.auth.uid`
- Check that `status` is set to 'menunggu'
- Verify required fields are present

### Cannot update status
- Ensure the user has role 'petugas' or 'admin'
- Check that the new status is valid ('menunggu', 'diproses', 'selesai')

## Best Practices

1. **Always validate on both client and server**
2. **Use Firestore rules for security, not as the only validation**
3. **Test rules thoroughly before deploying to production**
4. **Monitor Firestore logs for suspicious activity**
5. **Update rules when adding new features**
