# Lapor Aman - User Flow Guide

Visual guide to how users interact with Lapor Aman.

## 1. Authentication Flow

### New User Registration

```
┌──────────────────┐
│ Visit App        │
│ (http://...)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Not Authenticated?       │
│ → Redirect to /login     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Click "Create Account"   │
│ → Go to /register        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Fill Registration Form:          │
│ - Name                           │
│ - Email                          │
│ - Phone                          │
│ - Role (Masyarakat/Petugas/Admin)│
│ - Password                       │
│ - Confirm Password              │
└────────┬───────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Submit Registration          │
│ → Firebase creates user      │
│ → Firestore creates profile  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ ✅ Account Created       │
│ → Redirect to Dashboard  │
│ → User logged in         │
└──────────────────────────┘
```

### Existing User Login

```
┌──────────────────────────┐
│ Fill Login Form:         │
│ - Email                  │
│ - Password               │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Submit Login             │
│ → Firebase authenticates │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Fetch User Profile       │
│ from Firestore           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ ✅ Login Successful      │
│ → Redirect to Dashboard  │
│ → Show Sidebar           │
└──────────────────────────┘
```

## 2. Masyarakat (Community Member) Flow

### Create and Track Report

```
┌─────────────────────────────────┐
│ 1. View Dashboard               │
│    (My Reports page)            │
│    → Shows all my reports       │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ 2. Click "New Report"                │
│    → Opens CreateReportForm          │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ 3. Fill Report Details:              │
│    - Title                           │
│    - Description                     │
│    - Category (Keamanan/Kriminal)   │
│    - Priority (Normal/Darurat)      │
│    - Location                        │
│    - Photo (Optional)                │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ 4. Click "Create Report"             │
│    → Upload image if selected        │
│    → Save to Firestore               │
│    → Show success message            │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ 5. View Report                       │
│    - Appears in "My Reports"         │
│    - Status: Menunggu (Pending)      │
│    - Can refresh to see updates      │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ 6. Receive Officer Response          │
│    - Status changes to "Diproses"    │
│    - Officer adds response           │
│    - Community member sees update    │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ 7. Report Resolved                   │
│    - Status: "Selesai" (Completed)   │
│    - Final officer response visible  │
│    - Report archived in history      │
└──────────────────────────────────────┘
```

## 3. Petugas (Officer) Flow

### Manage and Respond to Reports

```
┌──────────────────────────────────┐
│ 1. Login as Petugas              │
│    → Sidebar shows extra options │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 2. View "All Reports"            │
│    → See all reports from system │
│    → Can filter by status        │
│    → Can filter by priority      │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 3. Select a Report               │
│    → View full details           │
│    → See photo if attached       │
│    → View existing responses     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 4. Update Status                 │
│    - From: Menunggu              │
│    - To: Diproses               │
│    → Status updated immediately  │
│    → Reporter sees update        │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 5. Add Response                  │
│    - Type response message       │
│    - Provide details/next steps  │
│    - Click "Send Response"       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 6. Continue Responding           │
│    - Add multiple responses      │
│    - Keep reporter informed      │
│    - Update status as needed     │
│    - Mark as "Selesai" when done │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 7. Complete Report               │
│    - Status: "Selesai"           │
│    - Final response added        │
│    - Case closed                 │
└──────────────────────────────────┘
```

## 4. Admin Flow

### View Statistics and Manage System

```
┌──────────────────────────────────┐
│ 1. Login as Admin                │
│    → Sidebar shows Statistics    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 2. Access Statistics             │
│    → View all dashboards         │
│    → Can also manage reports     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 3. View Analytics Cards:         │
│    - Total Reports               │
│    - Pending Reports             │
│    - In Progress                 │
│    - Completed Reports           │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 4. View Charts:                  │
│    - Status Distribution (Pie)   │
│    - Category Breakdown (Bar)    │
│    - Priority Distribution       │
│    - Summary Statistics          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 5. Make Decisions Based on Data: │
│    - High emergency count?       │
│    - Low completion rate?        │
│    - Many pending reports?       │
│    - Resource allocation         │
└──────────────────────────────────┘
```

## 5. Report Status Workflow

```
Created by Masyarakat
         │
         ▼
    ┌─────────────┐
    │ MENUNGGU    │  Waiting for officer response
    │ (Pending)   │
    └──────┬──────┘
           │
    Officer reviews
    and starts work
           │
           ▼
    ┌─────────────┐
    │ DIPROSES    │  Officer is handling the report
    │ (In Progress)│
    └──────┬──────┘
           │
    Officer completes
    investigation
           │
           ▼
    ┌─────────────┐
    │ SELESAI     │  Report resolved
    │ (Completed) │
    └─────────────┘
```

## 6. Permission Levels

### Masyarakat (Community Member)
```
✅ Can:
   - Create reports
   - View own reports
   - View responses to own reports
   - Update own profile
   - Upload photos with reports
   - Track report status

❌ Cannot:
   - View other people's reports
   - Update report status
   - Add responses
   - View statistics
   - Access admin features
```

### Petugas (Officer)
```
✅ Can:
   - Do everything Masyarakat can do
   - View ALL reports in system
   - Filter reports by status/priority
   - Update report status
   - Add responses to reports
   - See report details and photos

❌ Cannot:
   - View statistics
   - Manage users
   - Delete reports
   - Access admin features
```

### Admin (Administrator)
```
✅ Can:
   - Do everything Petugas can do
   - View system statistics
   - View analytics and charts
   - Generate reports
   - Monitor system health
   - Manage all data

❌ Cannot:
   - (Full system access with all permissions)
```

## 7. Report Creation Workflow

```
User navigates to Reports page
            ↓
Clicks "New Report" button
            ↓
Form appears with fields:
  ├─ Title (required)
  ├─ Description (required)
  ├─ Category dropdown
  ├─ Priority dropdown
  ├─ Location (required)
  └─ Photo upload (optional)
            ↓
User fills in all required fields
            ↓
Optionally uploads photo
  ├─ Select image file
  ├─ Preview appears
  └─ File ready to upload
            ↓
User clicks "Create Report"
            ↓
System validates form
            ↓
If file selected:
  ├─ Upload to Firebase Storage
  ├─ Get download URL
  └─ Include in report
            ↓
Save report to Firestore with:
  ├─ User ID
  ├─ All form data
  ├─ Photo URL (if exists)
  ├─ Status: "menunggu"
  ├─ Created timestamp
  └─ Updated timestamp
            ↓
Show success message
            ↓
Refresh reports list
            ↓
Report appears in "My Reports"
```

## 8. Response Workflow

```
Officer views report in "All Reports"
            ↓
Clicks on report to select it
            ↓
Details panel appears showing:
  ├─ Report information
  ├─ Photo (if attached)
  ├─ Existing responses
  └─ Response input field
            ↓
Officer (Petugas/Admin) can:
  ├─ Update status dropdown
  └─ Type response message
            ↓
Click "Send Response"
            ↓
System saves response to Firestore:
  ├─ pengaduanId
  ├─ petugasId (officer's ID)
  ├─ Response text
  └─ Created timestamp
            ↓
Response appears immediately
            ↓
Community member sees:
  ├─ Response in report details
  └─ Status update notification
```

## 9. Navigation Paths

### Masyarakat Navigation
```
Home (/) 
  ↓
Login → Dashboard → My Reports (default)
          ↓
        Sidebar
          ├─ My Reports (current)
          └─ Logout
```

### Petugas Navigation
```
Home (/)
  ↓
Login → Dashboard → My Reports (default)
          ↓
        Sidebar
          ├─ My Reports
          ├─ All Reports
          └─ Logout
```

### Admin Navigation
```
Home (/)
  ↓
Login → Dashboard → My Reports (default)
          ↓
        Sidebar
          ├─ My Reports
          ├─ All Reports
          ├─ Statistics
          └─ Logout
```

## 10. Error Handling

### Login Errors
```
Invalid Email/Password
        ↓
Show error message:
"Invalid email or password"
        ↓
User can:
├─ Retry with correct credentials
└─ Click "Create Account" to register
```

### Report Creation Errors
```
Validation fails / Upload fails
        ↓
Show error notification:
"Failed to create report"
        ↓
User can:
├─ Check all required fields
├─ Verify image format/size
└─ Retry
```

### Permission Errors
```
Unauthorized access attempt
        ↓
User redirected to dashboard
        ↓
Show message:
"Access denied"
        ↓
User can:
├─ Navigate to allowed pages
└─ Contact admin for access
```

---

These flows represent the complete user journeys through Lapor Aman. Each role has specific capabilities that create a secure and efficient reporting system.

For more details, see:
- README.md - Feature descriptions
- ARCHITECTURE.md - Technical implementation
- QUICKSTART.md - Getting started guide
