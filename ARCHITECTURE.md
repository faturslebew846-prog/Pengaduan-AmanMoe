# Lapor Aman - Architecture Documentation

## System Overview

Lapor Aman is a full-stack community security reporting system built with modern web technologies. It enables community members to report security incidents and allows officers to respond and manage those reports effectively.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React 19)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages:                                              │   │
│  │  - Login/Register (Public)                          │   │
│  │  - Dashboard (Protected)                            │   │
│  │  - Reports Pages                                    │   │
│  │  - Statistics (Admin Only)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App Router Layer                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  - Routing                                          │   │
│  │  - Server/Client Components                        │   │
│  │  - Image Optimization                              │   │
│  │  - Built-in CORS Support                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Authentication & Data Layer                     │
│  ┌──────────────────┐  ┌──────────────────────────────┐     │
│  │ Firebase Auth    │  │  Firestore Database          │     │
│  │ - Email/Password │  │  - users                     │     │
│  │ - Session Mgmt   │  │  - pengaduan (reports)       │     │
│  │ - User Profiles  │  │  - tanggapan (responses)     │     │
│  └──────────────────┘  └──────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Firebase Storage                                    │   │
│  │ - Image uploads                                    │   │
│  │ - File management                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
RootLayout
├── AuthProvider
│   ├── page.tsx (Redirect)
│   ├── login/
│   │   └── page.tsx (LoginPage)
│   ├── register/
│   │   └── page.tsx (RegisterPage)
│   └── dashboard/
│       ├── layout.tsx (DashboardLayout)
│       │   └── DashboardSidebar
│       ├── page.tsx (Redirect to reports)
│       ├── reports/
│       │   ├── page.tsx (MyReportsPage)
│       │   ├── CreateReportForm
│       │   └── ReportCard (List)
│       ├── all-reports/
│       │   ├── page.tsx (AllReportsPage)
│       │   ├── ReportCard (Interactive)
│       │   └── ResponseUI
│       └── statistics/
│           └── page.tsx (AdminDashboard)
```

## Data Flow

### Authentication Flow

```
User Input (Email/Password)
    ↓
Firebase Auth
    ↓
Auth Success/Failure
    ↓
Fetch User Profile from Firestore
    ↓
Store in AuthContext
    ↓
Update UI Components
```

### Report Creation Flow

```
User Input (Form)
    ↓
Validate Data (Client-side)
    ↓
Upload Image to Firebase Storage
    ↓
Create Firestore Document
    ↓
Return Report ID
    ↓
Refresh List & Show Success
```

### Report Status Update Flow

```
Officer Selects New Status
    ↓
updateReportStatus() called
    ↓
Firestore Document Updated
    ↓
UI Refreshed
    ↓
User Notified
```

## Key Components

### Pages (Server-aware, mostly Client)

1. **app/page.tsx** - Home redirect
2. **app/login/page.tsx** - Login interface
3. **app/register/page.tsx** - Registration interface
4. **app/dashboard/layout.tsx** - Dashboard wrapper with sidebar
5. **app/dashboard/reports/page.tsx** - User's reports
6. **app/dashboard/all-reports/page.tsx** - All reports (Petugas/Admin)
7. **app/dashboard/statistics/page.tsx** - Admin analytics

### Components

1. **DashboardSidebar** - Navigation with role-based menu items
2. **CreateReportForm** - Form for creating new reports
3. **ReportCard** - Displays report information
4. **RouteGuard** - Ensures role-based access (implemented in layout)

### Utilities

1. **firebase.ts** - Firebase initialization
2. **auth-context.tsx** - Authentication state management
3. **firestore-service.ts** - Database operations
4. **types.ts** - TypeScript interfaces
5. **utils.ts** - Helper functions

## State Management

### Authentication State (AuthContext)

```typescript
{
  user: User | null,
  loading: boolean,
  logout: () => Promise<void>
}
```

### Component State Examples

**CreateReportForm:**
- Form data (judul, isiLaporan, etc.)
- File upload state
- Loading/error states

**AllReportsPage:**
- Reports list
- Selected report details
- Responses list
- Status filter

**StatisticsPage:**
- Aggregated statistics
- Chart data
- Loading state

## Database Schema

### Users Collection

```typescript
{
  uid: string;
  nama: string;
  email: string;
  telp: string;
  role: 'masyarakat' | 'petugas' | 'admin';
  createdAt: Timestamp;
}
```

### Pengaduan (Reports) Collection

```typescript
{
  userId: string;
  judul: string;
  isiLaporan: string;
  foto?: string;
  lokasi: string;
  kategori: 'keamanan' | 'kriminal' | 'ketertiban';
  prioritas: 'normal' | 'darurat';
  status: 'menunggu' | 'diproses' | 'selesai';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Tanggapan (Responses) Collection

```typescript
{
  pengaduanId: string;
  petugasId: string;
  tanggapan: string;
  createdAt: Timestamp;
}
```

## API Integration Points

### Firebase Authentication Endpoints
- Email/Password Sign Up
- Email/Password Sign In
- Sign Out
- Session Management

### Firestore Operations
- Create/Read/Update/Delete documents
- Query documents by field
- Real-time listeners (implemented as needed)
- Transaction support

### Firebase Storage Operations
- Upload files
- Generate download URLs
- Delete files (if needed)

## Security Architecture

### Authentication Layer
- Firebase Email/Password authentication
- Secure token management
- Session expiration handling

### Authorization Layer
- Role-based access control (RBAC)
- Route protection via layout
- Firestore security rules

### Data Layer
- Firestore security rules
- Field-level access control
- User isolation
- Admin-only operations

## Performance Optimizations

1. **Client-Side**
   - Image lazy loading
   - Component code splitting
   - Responsive image optimization

2. **Database**
   - Firestore indexes for common queries
   - Efficient data structure
   - Pagination support (can be added)

3. **Network**
   - Vercel Edge Network CDN
   - Automatic compression
   - Caching strategies

## Deployment Architecture

```
GitHub Repository
    ↓
Vercel (CI/CD)
    ↓
Build & Optimize
    ↓
Deploy to Edge Network
    ↓
Firebase (Backend)
    ├── Authentication
    ├── Firestore
    └── Storage
```

## Error Handling Strategy

### Client-Side
- Form validation
- User-friendly error messages
- Loading states
- Fallback UI

### Firebase Errors
- Authentication errors
- Permission denied errors
- Network errors
- Quota exceeded errors

### UI Feedback
- Toast notifications (using Sonner)
- Alert components
- Empty states
- Loading skeletons

## Scalability Considerations

### Current Capacity
- Firestore: Up to thousands of concurrent users
- Storage: Up to 5 GB free tier
- Authentication: Unlimited users

### Future Scaling
- Implement pagination for report lists
- Add database indexing strategies
- Consider caching layer (Redis)
- Implement CDN for images
- Add database partitioning
- Consider read replica strategy

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies (`npm install`)
3. Configure `.env.local`
4. Start dev server (`npm run dev`)
5. Test features locally
6. Commit changes

### Testing
- Manual testing of all features
- Role-based access testing
- Firebase rule testing
- Image upload testing

### Deployment
1. Push to GitHub
2. Vercel automatically builds and deploys
3. Environment variables auto-configured
4. Deployment verified
5. Production monitoring enabled

## Technology Rationale

### Next.js 16
- Full-stack React framework
- Built-in optimizations
- Server components for better performance
- Easy deployment to Vercel

### Firebase
- Managed backend
- Real-time database
- Built-in authentication
- Scalable storage
- No server maintenance needed

### Tailwind CSS
- Rapid UI development
- Responsive design
- Customizable components
- Lightweight CSS framework

### shadcn/ui
- Pre-built, accessible components
- Based on Radix UI
- Highly customizable
- Production-ready

### Recharts
- Interactive charts
- Responsive design
- Easy to integrate
- Good for dashboards

## Future Enhancement Opportunities

1. **Real-time Updates**
   - WebSocket connections
   - Live report status updates
   - Notification system

2. **Advanced Features**
   - Map integration for locations
   - Export reports to PDF
   - Email notifications
   - SMS alerts for emergencies

3. **Analytics**
   - Advanced reporting
   - Trend analysis
   - Predictive analytics
   - Heat maps

4. **Mobile App**
   - React Native or Flutter app
   - Push notifications
   - Location services

5. **Integration**
   - Third-party APIs
   - Social media sharing
   - External databases
   - Payment processing

---

**Architecture Version:** 1.0.0  
**Last Updated:** 2026-01-28  
**Framework Versions:** Next.js 16, React 19, Tailwind CSS 4
