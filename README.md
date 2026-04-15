# Lapor Aman - Community Security Reporting System

A professional, full-stack web application for community members to report security incidents and receive timely responses from local authorities.

## Features

### User Roles

- **Masyarakat (Community Member)**: Create and track security reports
- **Petugas (Officer)**: Review, respond to, and manage reports
- **Admin (Administrator)**: System-wide management and analytics

### Core Features

1. **Authentication System**
   - Email/Password registration and login
   - Role-based access control
   - Secure session management with Firebase Auth

2. **Report Management**
   - Create detailed security reports with:
     - Title and description
     - Category (Security, Crime, Order & Conduct)
     - Priority level (Normal, Emergency)
     - Location information
     - Photo upload support
   - Track report status (Pending, In Progress, Completed)
   - View personal or all reports based on role

3. **Response System**
   - Officers can add responses to reports
   - Community members receive real-time updates
   - Response history tracking

4. **Analytics Dashboard**
   - System-wide statistics
   - Report status distribution
   - Category breakdown
   - Priority analysis
   - Completion rate tracking

5. **Responsive Design**
   - Mobile-friendly interface
   - Desktop optimized dashboards
   - Professional dark theme

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage (image uploads)
- **Charts**: Recharts
- **Deployment**: Vercel

## Project Structure

```
lapor-aman/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx            # Dashboard redirect
│   │   ├── reports/            # My Reports page
│   │   ├── all-reports/        # All Reports page (Petugas/Admin)
│   │   └── statistics/         # Statistics page (Admin only)
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── page.tsx                # Home page (redirect)
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── dashboard-sidebar.tsx   # Navigation sidebar
│   ├── create-report-form.tsx  # Report creation form
│   ├── report-card.tsx         # Report display card
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── firebase.ts             # Firebase initialization
│   ├── firebase-auth-context.tsx # Auth context provider
│   ├── firestore-service.ts    # Database operations
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project
- (Optional) Cloudinary account for image uploads

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lapor-aman
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase credentials
   - Add Cloudinary credentials if using Cloudinary

   See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

4. **Configure Firebase**
   - Create Firestore database
   - Enable authentication
   - Set up Storage bucket
   - Apply Firestore security rules

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## Usage

### As a Community Member

1. Register or login with your account
2. Click "New Report" on the dashboard
3. Fill in incident details:
   - Title and description
   - Category and priority
   - Location
   - Optional photo
4. Submit the report
5. Track status and receive officer responses

### As an Officer

1. Login with officer credentials
2. View all reports in "All Reports"
3. Filter by status or priority
4. Click on a report to view details
5. Update report status
6. Add responses to keep reporters informed

### As an Administrator

1. Access all officer features
2. View "Statistics" for system-wide analytics
3. Monitor completion rates
4. Track emergency reports
5. Manage system operations

## Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary (Optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

## Database Schema

### Collections

#### users
- `uid` - Unique user identifier
- `nama` - Full name
- `email` - Email address
- `telp` - Phone number
- `role` - User role (masyarakat/petugas/admin)
- `createdAt` - Creation timestamp

#### pengaduan (Reports)
- `userId` - Reporter's user ID
- `judul` - Report title
- `isiLaporan` - Report description
- `foto` - Photo URL (optional)
- `lokasi` - Location
- `kategori` - Category (keamanan/kriminal/ketertiban)
- `prioritas` - Priority (normal/darurat)
- `status` - Status (menunggu/diproses/selesai)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

#### tanggapan (Responses)
- `pengaduanId` - Related report ID
- `petugasId` - Officer's user ID
- `tanggapan` - Response text
- `createdAt` - Creation timestamp

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Select your repository
5. Add environment variables
6. Click "Deploy"

### Production Checklist

- [ ] All environment variables configured
- [ ] Firebase production settings
- [ ] Firestore security rules updated
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Error logging set up

## Security

### Best Practices Implemented

- Firestore security rules for data access control
- Firebase Authentication for secure login
- Server-side validation
- CORS protection
- Input sanitization
- Role-based access control (RBAC)
- Secure session management

### Additional Recommendations

1. Enable Firebase email verification
2. Implement rate limiting for API calls
3. Regular security audits
4. Monitor Firebase logs
5. Backup critical data

## API Routes

The application uses Firebase SDK directly. No custom API routes needed for:

- Authentication (Firebase Auth)
- Database operations (Firestore)
- File storage (Firebase Storage)

## Performance

- Server-side rendering for optimal loading
- Image optimization
- Database query optimization
- Lazy loading of components
- Responsive images with Next.js Image component

## Testing

### Create Test Data

Use the registration page to create test accounts:

1. Create a citizen account:
   - Email: citizen@example.com
   - Role: Masyarakat
   - Password: TestPass123!

2. Create an officer account:
   - Email: officer@example.com
   - Role: Petugas
   - Password: TestPass123!

3. Create an admin account:
   - Email: admin@example.com
   - Role: Admin
   - Password: TestPass123!

## Troubleshooting

### Authentication Issues
- Clear browser cache and cookies
- Check Firebase console for blocked IPs
- Verify email/password is correct

### Database Errors
- Ensure Firestore is enabled
- Check security rules
- Verify database location matches config

### Image Upload Issues
- Check Firebase Storage is enabled
- Verify browser console for errors
- Ensure file size is under 25MB

### Slow Performance
- Check Firebase quota limits
- Optimize database queries
- Enable CDN for static assets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check [ENV_SETUP.md](./ENV_SETUP.md) for setup help
2. Review Firebase documentation
3. Check Next.js documentation
4. Open an issue on GitHub

## Changelog

### Version 1.0.0
- Initial release
- Full authentication system
- Report creation and management
- Response system
- Admin analytics
- Mobile responsive design

---

**Lapor Aman** - Making communities safer through transparent reporting and response.
#   L a p o r _ A m a n . p r o  
 