# Supabase Authentication Setup

This project uses Supabase for authentication. Follow these steps to set up authentication:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization and fill in project details
5. Wait for the project to be created

## 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your domain (e.g., `http://localhost:5173` for development)
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/dashboard` (for development)
   - Your production URLs when deploying

## 3. Enable Email Authentication

1. In **Authentication** > **Settings** > **Email**
2. Make sure "Enable email confirmations" is checked
3. Configure your email templates if needed

## 4. Enable Google OAuth (Optional)

1. Go to **Authentication** > **Providers**
2. Find **Google** and click to configure
3. Follow the instructions to set up Google OAuth:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs from Supabase
   - Copy Client ID and Client Secret to Supabase

## 5. Environment Variables

1. Copy `env.template` to `.env`
2. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase dashboard under **Settings** > **API**.

## 6. User Profiles Table (Required for Profile Settings)

The ProfileSettingsPage requires a profiles table to store additional user data. Create this table in your Supabase SQL editor:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  phone text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Set up automatic profile creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 7. Testing

1. Start your development server: `npm run dev`
2. Try signing up with an email
3. Check your email for confirmation
4. Try logging in after confirmation

## Features Included

- ✅ Email/Password Authentication
- ✅ Google OAuth Integration
- ✅ Password Reset Functionality
- ✅ Email Verification
- ✅ Form Validation
- ✅ Error Handling
- ✅ Loading States
- ✅ Success Messages

## Authentication Flow

1. **Sign Up**: Users create account with email/password or Google
2. **Email Verification**: Users must verify email before logging in
3. **Login**: Authenticated users are redirected to dashboard
4. **Password Reset**: Users can reset password via email
5. **Auto Logout**: Sessions expire based on Supabase settings

## Security Notes

- All authentication is handled server-side by Supabase
- Passwords are never stored in your application
- JWT tokens are automatically managed
- Row Level Security (RLS) should be enabled for data protection
