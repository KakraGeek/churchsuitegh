# ChurchSuite Ghana - Comprehensive Documentation

## 📖 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Setup & Installation](#setup--installation)
5. [Configuration](#configuration)
6. [Usage Guide](#usage-guide)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [PWA Features](#pwa-features)
10. [Authentication & Security](#authentication--security)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Contributing](#contributing)

---

## 🌟 Overview

ChurchSuite Ghana is a comprehensive, mobile-first church management system designed specifically for Ghanaian churches. It provides a complete solution for managing church operations, from member management to event planning, attendance tracking, and financial management.

### Key Benefits
- **Mobile-First Design**: Optimized for mobile devices and tablets
- **Progressive Web App (PWA)**: Installable on any device with offline capabilities
- **Real-time Updates**: Live data synchronization across all devices
- **Multi-role Access**: Different permission levels for pastors, leaders, and members
- **Ghana-Specific Features**: Localized for Ghanaian church needs

---

## ✨ Features

### 🏠 Dashboard
- **Overview Statistics**: Member count, attendance trends, giving summaries
- **Quick Actions**: Fast access to common tasks
- **Recent Activity**: Latest updates and notifications
- **Performance Metrics**: Visual charts and analytics

### 👥 Member Management
- **Member Profiles**: Complete member information and history
- **Role Management**: Admin, Pastor, Leader, Member roles
- **Status Tracking**: Active, Inactive, Visitor statuses
- **Contact Information**: Phone, email, address management
- **Family Groups**: Family relationship tracking

### 📅 Events & Services
- **Event Creation**: Sunday services, midweek services, special events
- **Registration System**: Event sign-ups with capacity management
- **QR Code Generation**: Unique QR codes for each event
- **Attendance Tracking**: Real-time check-in/check-out
- **Service Programs**: Detailed service planning and management

### 👶 Children's Ministry
- **Child Registration**: Complete child profiles with parent information
- **Check-in System**: Secure QR code-based check-in/check-out
- **Safety Features**: Audit logs and security tracking
- **Age Groups**: Organized by age categories
- **Parent Notifications**: Automated communication system

### 🎯 Attendance Management
- **QR Code System**: Generate and manage attendance QR codes
- **Real-time Tracking**: Live attendance monitoring
- **Display Screens**: Show attendance on screens during services
- **Reports**: Detailed attendance analytics and reports
- **Export Options**: Excel and PDF export capabilities

### 🧑‍💼 Volunteer Management
- **Team Organization**: Ministry teams and roles
- **Skill Tracking**: Volunteer skills and training records
- **Scheduling**: Service assignment and availability management
- **Performance Metrics**: Volunteer contribution analytics
- **Training Programs**: Skill development tracking

### 📦 Inventory Management
- **Item Tracking**: Complete inventory with categories
- **Borrowing System**: Item checkout and return tracking
- **Maintenance Records**: Equipment maintenance history
- **Audit Trails**: Complete transaction history
- **Low Stock Alerts**: Automatic notifications

### 💰 Giving & Finance
- **Donation Tracking**: Individual and family giving records
- **Payment Methods**: Cash, Mobile Money, Bank transfers
- **Categories**: Tithes, offerings, special projects
- **Reports**: Financial analytics and tax statements
- **Mobile Money Integration**: MoMo payment processing

### 📊 Analytics & Reporting
- **Attendance Analytics**: Service attendance trends
- **Financial Reports**: Giving patterns and projections
- **Member Demographics**: Age, gender, location analysis
- **Volunteer Metrics**: Team performance and engagement
- **Custom Reports**: Flexible reporting options

### 🔔 Communications
- **Notification System**: Automated and manual notifications
- **Templates**: Pre-built message templates
- **Target Groups**: Send to specific member categories
- **Delivery Tracking**: Message delivery status
- **Multi-channel**: SMS, email, in-app notifications

### 📱 PWA Features
- **Installable App**: Add to home screen on any device
- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time updates and alerts
- **App-like Experience**: Native app feel on web
- **Automatic Updates**: Seamless version updates

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite
- **PWA**: Service Worker with Workbox

### Project Structure
```
ChurchSuite/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components
│   │   ├── children/       # Children's ministry components
│   │   ├── events/         # Event management components
│   │   ├── members/        # Member management components
│   │   └── ...
│   ├── pages/              # Page components
│   ├── lib/                # Utility libraries
│   │   ├── api/            # API functions
│   │   ├── db/             # Database schema and connections
│   │   ├── clerk/          # Authentication utilities
│   │   └── icons/          # Icon management system
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── public/                  # Static assets
├── drizzle/                 # Database migrations
└── docs/                    # Documentation
```

### Database Architecture
- **PostgreSQL**: Primary database
- **Drizzle ORM**: Type-safe database operations
- **Migrations**: Version-controlled schema changes
- **Relationships**: Proper foreign key constraints
- **Indexing**: Optimized for performance

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn package manager
- Git

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ChurchSuite
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb churchsuite_ghana
   
   # Run migrations
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/churchsuite_ghana

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# App Configuration
VITE_APP_NAME=ChurchSuite Ghana
VITE_APP_URL=http://localhost:5173

# PWA Configuration
VITE_PWA_ENABLED=true
```

---

## ⚙️ Configuration

### Clerk Authentication Setup
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Configure authentication methods
4. Add domain to allowed origins
5. Copy API keys to environment variables

### Database Configuration
1. **PostgreSQL Setup**
   - Install PostgreSQL
   - Create database user
   - Configure connection settings

2. **Drizzle Configuration**
   - Update `drizzle.config.ts`
   - Configure connection parameters
   - Set migration directory

### PWA Configuration
1. **Icons**: Replace placeholder PWA icons
2. **Manifest**: Update app name and colors
3. **Service Worker**: Configure caching strategies
4. **Offline Support**: Test offline functionality

---

## 📖 Usage Guide

### Getting Started

#### 1. First Login
- Navigate to the application URL
- Sign up with Clerk authentication
- Complete profile setup
- Set user role (Admin, Pastor, Leader, Member)

#### 2. Dashboard Overview
- View key statistics and metrics
- Access quick action buttons
- Monitor recent activity
- Navigate to different modules

#### 3. Member Management
- **Add New Member**
  1. Navigate to Members page
  2. Click "Add Member" button
  3. Fill in member information
  4. Set role and status
  5. Save member profile

- **Edit Member**
  1. Find member in list
  2. Click edit button
  3. Update information
  4. Save changes

- **Member Search**
  - Use search bar for quick finding
  - Filter by role, status, or other criteria
  - Export member lists

#### 4. Event Management
- **Create Event**
  1. Go to Events page
  2. Click "Create Event"
  3. Set event details (name, date, time, location)
  4. Configure registration settings
  5. Generate QR codes

- **Manage Registrations**
  - View registered attendees
  - Track capacity
  - Send notifications
  - Export attendance lists

#### 5. Attendance Tracking
- **Generate QR Codes**
  1. Select event
  2. Choose service type
  3. Generate unique QR codes
  4. Print or display on screens

- **Check-in Process**
  - Scan QR code with mobile device
  - Confirm member identity
  - Record check-in time
  - Update attendance records

#### 6. Children's Ministry
- **Child Registration**
  1. Add child profile
  2. Link to parent/guardian
  3. Set age group
  4. Configure check-in preferences

- **Check-in System**
  - Generate child-specific QR codes
  - Parent/guardian check-in
  - Security audit logging
  - Pickup verification

#### 7. Volunteer Management
- **Team Setup**
  1. Create ministry teams
  2. Define roles and responsibilities
  3. Set skill requirements
  4. Configure schedules

- **Assignment Management**
  - Assign volunteers to services
  - Track availability
  - Monitor performance
  - Generate reports

#### 8. Inventory Management
- **Add Items**
  1. Navigate to Inventory
  2. Click "Add Item"
  3. Set item details and category
  4. Configure borrowing rules

- **Borrowing Process**
  - Member requests item
  - Admin approves request
  - Record checkout
  - Track return dates

#### 9. Financial Management
- **Record Donations**
  1. Go to Giving page
  2. Select member
  3. Choose payment method
  4. Enter amount and category
  5. Process payment

- **Financial Reports**
  - View giving trends
  - Generate tax statements
  - Track project funding
  - Export financial data

---

## 🔌 API Reference

### Authentication Endpoints
```typescript
// Get current user
GET /api/auth/user

// Get user role
GET /api/auth/role

// Update user profile
PUT /api/auth/profile
```

### Member Endpoints
```typescript
// Get all members
GET /api/members

// Get member by ID
GET /api/members/:id

// Create member
POST /api/members

// Update member
PUT /api/members/:id

// Delete member
DELETE /api/members/:id

// Search members
GET /api/members/search?q=query
```

### Event Endpoints
```typescript
// Get all events
GET /api/events

// Get event by ID
GET /api/events/:id

// Create event
POST /api/events

// Update event
PUT /api/events/:id

// Delete event
DELETE /api/events/:id

// Get event registrations
GET /api/events/:id/registrations
```

### Attendance Endpoints
```typescript
// Generate QR code
POST /api/attendance/qr-code

// Check in member
POST /api/attendance/check-in

// Check out member
POST /api/attendance/check-out

// Get attendance report
GET /api/attendance/report
```

### Children Endpoints
```typescript
// Get all children
GET /api/children

// Create child profile
POST /api/children

// Check in child
POST /api/children/:id/check-in

// Check out child
POST /api/children/:id/check-out

// Get security audit log
GET /api/children/:id/audit
```

### Volunteer Endpoints
```typescript
// Get ministry teams
GET /api/volunteers/teams

// Get team members
GET /api/volunteers/teams/:id/members

// Assign volunteer
POST /api/volunteers/assign

// Update assignment
PUT /api/volunteers/assignments/:id
```

### Inventory Endpoints
```typescript
// Get inventory items
GET /api/inventory

// Add item
POST /api/inventory

// Borrow item
POST /api/inventory/:id/borrow

// Return item
POST /api/inventory/:id/return

// Get borrowing history
GET /api/inventory/:id/history
```

### Financial Endpoints
```typescript
// Record donation
POST /api/giving/donations

// Get giving history
GET /api/giving/history

// Get financial reports
GET /api/giving/reports

// Process MoMo payment
POST /api/giving/momo
```

---

## 🗄️ Database Schema

### Core Tables

#### Members
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  date_of_birth DATE,
  gender VARCHAR,
  address TEXT,
  role VARCHAR DEFAULT 'member',
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR,
  max_capacity INTEGER,
  requires_registration BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Attendance
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  event_id UUID REFERENCES events(id),
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  status VARCHAR DEFAULT 'present',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Children
```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  date_of_birth DATE,
  gender VARCHAR,
  parent_id UUID REFERENCES members(id),
  emergency_contact VARCHAR,
  medical_info TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Inventory
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,
  quantity INTEGER DEFAULT 1,
  location VARCHAR,
  status VARCHAR DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Giving
```sql
CREATE TABLE giving (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR NOT NULL,
  payment_method VARCHAR,
  transaction_id VARCHAR,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 PWA Features

### Progressive Web App Capabilities
- **Installable**: Add to home screen on any device
- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time updates and alerts
- **App-like Experience**: Native app feel on web
- **Automatic Updates**: Seamless version updates

### Service Worker
- **Caching Strategy**: Network-first for pages, cache-first for assets
- **Offline Fallback**: Custom offline page with retry functionality
- **Update Management**: Automatic service worker updates
- **Background Sync**: Sync data when connection is restored

### Web App Manifest
```json
{
  "name": "ChurchSuite Ghana",
  "short_name": "ChurchSuite",
  "description": "Mobile-first church management for Ghana",
  "theme_color": "#800020",
  "background_color": "#ffffff",
  "display": "standalone",
  "icons": [
    {
      "src": "pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### PWA Components
- **Install Prompt**: Automatic install suggestion
- **Update Notification**: New version alerts
- **Status Indicator**: Installation status display
- **Offline Page**: Beautiful offline experience

---

## 🔐 Authentication & Security

### Clerk Integration
- **Multi-factor Authentication**: Enhanced security
- **Social Login**: Google, Facebook, Apple
- **Email/Password**: Traditional authentication
- **Session Management**: Secure token handling

### Role-Based Access Control
- **Admin**: Full system access
- **Pastor**: Ministry management access
- **Leader**: Team management access
- **Member**: Limited personal access

### Security Features
- **HTTPS Only**: Secure communication
- **Input Validation**: XSS and injection protection
- **SQL Injection Prevention**: Parameterized queries
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API abuse prevention

---

## 🚀 Deployment

### Production Build
```bash
# Build application
npm run build

# Preview production build
npm run preview

# Start production server
npm start
```

### Environment Setup
1. **Production Database**
   - Use production PostgreSQL instance
   - Configure connection pooling
   - Set up automated backups

2. **Environment Variables**
   - Update all production URLs
   - Set production Clerk keys
   - Configure logging levels

3. **SSL Certificate**
   - Install SSL certificate
   - Configure HTTPS redirects
   - Set security headers

### Deployment Options
- **Vercel**: Easy deployment with automatic builds
- **Netlify**: Static site hosting with form handling
- **AWS**: Scalable cloud infrastructure
- **DigitalOcean**: VPS hosting with full control

### Monitoring & Analytics
- **Error Tracking**: Sentry or similar service
- **Performance Monitoring**: Lighthouse CI
- **User Analytics**: Google Analytics or Plausible
- **Uptime Monitoring**: Pingdom or UptimeRobot

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database status
sudo systemctl status postgresql

# Verify connection
psql -h localhost -U username -d database_name

# Check environment variables
echo $DATABASE_URL
```

#### 2. Authentication Issues
- Verify Clerk API keys
- Check domain configuration
- Clear browser cache and cookies
- Verify user role assignments

#### 3. PWA Installation Problems
- Ensure HTTPS is enabled
- Check service worker registration
- Verify manifest file
- Test on different devices

#### 4. Performance Issues
- Check database query performance
- Monitor API response times
- Optimize image sizes
- Enable compression

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check console for errors
# Use browser DevTools
# Monitor network requests
```

### Log Files
- **Application Logs**: Check console output
- **Database Logs**: PostgreSQL log files
- **Server Logs**: Node.js application logs
- **Browser Logs**: DevTools console

---

## 🤝 Contributing

### Development Setup
1. **Fork Repository**
2. **Create Feature Branch**
3. **Install Dependencies**
4. **Make Changes**
5. **Run Tests**
6. **Submit Pull Request**

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Testing
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Check code coverage
npm run test:coverage
```

### Documentation
- **Code Comments**: Inline documentation
- **API Docs**: OpenAPI/Swagger
- **Component Docs**: Storybook
- **User Guides**: Markdown documentation

---

## 📞 Support

### Getting Help
- **Documentation**: This comprehensive guide
- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions
- **Email**: support@churchsuitegh.com

### Community
- **User Forum**: Community discussions
- **Feature Requests**: Suggest new features
- **Bug Reports**: Report issues
- **Contributions**: Help improve the app

### Training & Onboarding
- **Video Tutorials**: Step-by-step guides
- **Live Training**: Scheduled sessions
- **Documentation**: Comprehensive guides
- **Support Team**: Direct assistance

---

## 📄 License

ChurchSuite Ghana is licensed under the MIT License. See LICENSE file for details.

---

## 🏆 Acknowledgments

- **Clerk**: Authentication and user management
- **Drizzle**: Database ORM and migrations
- **shadcn/ui**: Beautiful UI components
- **Tailwind CSS**: Utility-first CSS framework
- **React**: Frontend framework
- **Vite**: Build tool and development server

---

*This documentation is maintained by the ChurchSuite development team. For the latest updates, please check the repository or contact the support team.*

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: The Geek Toolbox
