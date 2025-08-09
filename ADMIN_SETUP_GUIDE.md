# Admin User Setup Guide

## 🚀 Setting Up Admin Authentication with Supabase

Since the hardcoded admin has been removed, you now need to create a real admin user in your Supabase database. Follow these steps:

### Step 1: Create Admin User in Supabase

#### Option A: Using Supabase SQL Editor (Recommended)

1. **Go to your Supabase Dashboard**

   - Navigate to SQL Editor

2. **Run this SQL command** to create an admin user:

   ```sql
   -- Insert admin user directly into auth.users table
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     raw_app_meta_data,
     raw_user_meta_data,
     created_at,
     updated_at,
     confirmation_token,
     email_change,
     email_change_token_new,
     recovery_token
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'admin@gppg.local',
     crypt('your_secure_password_here', gen_salt('bf')),
     NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"role": "admin", "full_name": "System Administrator", "username": "admin"}',
     NOW(),
     NOW(),
     '',
     '',
     '',
     ''
   );
   ```

   **Replace `your_secure_password_here` with your desired admin password!**

#### Option B: Using Supabase Auth API (Alternative)

1. **Create the user first:**
   ```sql
   -- Create admin user via auth.admin_create_user (if available)
   SELECT auth.admin_create_user(
     email => 'admin@gppg.local',
     password => 'your_secure_password_here',
     email_confirm => true,
     user_metadata => '{
       "role": "admin",
       "full_name": "System Administrator",
       "username": "admin"
     }'::jsonb
   );
   ```

### Step 2: Verify Admin User Creation

1. **Check the user was created:**

   ```sql
   SELECT
     id,
     email,
     raw_user_meta_data->>'role' as role,
     raw_user_meta_data->>'full_name' as full_name,
     email_confirmed_at
   FROM auth.users
   WHERE email = 'admin@gppg.local';
   ```

2. **You should see:**
   - Email: `admin@gppg.local`
   - Role: `admin`
   - Full Name: `System Administrator`
   - Email confirmed: Yes

### Step 3: Test Admin Login

1. **Go to your admin login page**
2. **Login with:**
   - Username: `admin`
   - Password: `[your chosen password]`

The system will automatically convert `admin` to `admin@gppg.local` for authentication.

### Step 4: Verify Functionality

After logging in, you should now:

- ✅ Have access to all admin features
- ✅ Be able to add pangolin records with proper reporter_id
- ✅ See your user information in the auth context
- ✅ Have full Supabase integration working

## 🔧 Troubleshooting

### Issue: "Invalid login credentials"

- **Cause:** User not created or wrong password
- **Solution:** Re-run the SQL command with correct details

### Issue: "Access denied. Not authorized for admin access"

- **Cause:** User doesn't have `role: "admin"` in user_metadata
- **Solution:** Update user metadata:
  ```sql
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
  WHERE email = 'admin@gppg.local';
  ```

### Issue: "Email not confirmed"

- **Cause:** Email confirmation required
- **Solution:** Set email as confirmed:
  ```sql
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE email = 'admin@gppg.local';
  ```

## 🎯 Benefits of Real Database Authentication

✅ **Security**: No hardcoded credentials in code
✅ **Scalability**: Can create multiple admin users
✅ **Integration**: Full Supabase features available  
✅ **Audit Trail**: Real user tracking for pangolin records
✅ **Consistency**: Same auth system as public users

## 📝 Notes

- The system now uses **only** Supabase authentication
- Admin users must have `role: "admin"` in their user metadata
- Username format: `admin@gppg.local` (but you can login with just `admin`)
- All pangolin records will now have proper reporter_id tracking
