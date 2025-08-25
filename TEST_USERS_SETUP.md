# 🧪 Test Users Setup Guide

This guide explains how to set up test users for development and testing of ChurchSuiteGH.

## 🎯 Test Users Overview

We've created two test users with different permission levels:

### 👑 **Admin User (mockadmin)**
- **Username:** `mockadmin`
- **Password:** `Mock987123!`
- **Email:** `mockadmin@churchsuite.com`
- **Role:** `admin`
- **Permissions:** Full access to all features, can manage members, services, events, etc.

### 👤 **Regular Member User (mockuser)**
- **Username:** `mockuser`
- **Password:** `Mock987123!`
- **Email:** `mockuser@churchsuite.com`
- **Role:** `member`
- **Permissions:** Limited access, can view own information and participate in events

## 🚀 Setup Instructions

### Step 1: Seed the Database

Run the test user seeding script to create the user records in your database:

```bash
npm run db:seed-test-users
```

This will:
- Create member records in your database
- Display the credentials you need to create in Clerk
- Show a summary of what was created

### Step 2: Create Users in Clerk Dashboard

Since ChurchSuiteGH uses Clerk for authentication, you need to manually create these users in your Clerk dashboard:

1. **Go to Clerk Dashboard:** https://dashboard.clerk.com/
2. **Navigate to:** Users → Add User
3. **Create the first user:**
   - Email: `mockadmin@churchsuite.com`
   - Username: `mockadmin`
   - Password: `Mock987123!`
4. **Create the second user:**
   - Email: `mockuser@churchsuite.com`
   - Username: `mockuser`
   - Password: `Mock987123!`

### Step 3: Verify Setup

After creating the users in both Clerk and the database:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test Admin Login:**
   - Go to http://localhost:5173
   - Click "Sign In"
   - Use `mockadmin` / `Mock987123!`
   - Verify you have admin access (can see all features)

3. **Test Member Login:**
   - Sign out
   - Sign in with `mockuser` / `Mock987123!`
   - Verify limited access (member view only)

## 🔍 Testing Different Views

### Admin View (mockadmin)
- ✅ Full access to all pages
- ✅ Can manage members, events, services
- ✅ Can view analytics and reports
- ✅ Can create and edit Sunday service programs
- ✅ Can manage inventory and volunteers

### Member View (mockuser)
- ✅ Limited access to member features
- ✅ Can view own profile and attendance
- ✅ Can register for events
- ✅ Cannot access admin features
- ✅ Cannot manage other members

## 🛠️ Troubleshooting

### Common Issues

1. **"User not found" error:**
   - Ensure you've created the user in Clerk Dashboard
   - Check that the email matches exactly

2. **"Invalid credentials" error:**
   - Verify username/password in Clerk Dashboard
   - Check for typos in credentials

3. **Database connection errors:**
   - Ensure your `.env.local` file has the correct `DATABASE_URL`
   - Check that your database is running and accessible

4. **Role-based access issues:**
   - Verify the user was created with the correct role in the database
   - Check that the `clerkUserId` matches between Clerk and database

### Reset Test Users

If you need to reset the test users:

1. **Clear database records:**
   ```bash
   # You may need to manually delete from your database
   # or run a cleanup script
   ```

2. **Re-run seeding:**
   ```bash
   npm run db:seed-test-users
   ```

3. **Recreate in Clerk Dashboard**

## 📱 Testing Features

### Sunday Service Management
- **Admin:** Create, edit, and manage service programs
- **Member:** View upcoming services and programs

### Member Management
- **Admin:** Add, edit, and manage all members
- **Member:** View own profile only

### Event Management
- **Admin:** Create and manage events
- **Member:** Register for events and view details

### Analytics & Reports
- **Admin:** Full access to all analytics
- **Member:** Limited or no access

## 🔐 Security Notes

- These are **test users only** - never use in production
- Passwords are intentionally simple for testing
- Users are marked as test users in the database
- Consider deleting test users before deploying to production

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify database connectivity
3. Confirm Clerk configuration
4. Check that all environment variables are set correctly

---

**Happy Testing! 🎉**

These test users will help you verify that your role-based access control is working correctly and that both admin and member experiences are properly implemented.

📋 Next Steps:
1. Create users in Clerk Dashboard with the credentials above
2. Test login with mockadmin/Mock987123! (Admin view)
3. Test login with mockuser/Mock987123! (Member view)
4. Verify different permissions and access levels
