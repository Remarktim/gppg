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

## 7. Pangolins Table (Required for Admin Panel)

The Admin Panel requires a pangolins table to store pangolin data. Create this table in your Supabase SQL editor:

```sql
-- Create pangolins table
create table pangolins (
  id uuid default gen_random_uuid() primary key,
  tag_id text unique not null,
  municipality text not null,
  cluster text not null check (cluster in ('South Palawan', 'Central Palawan', 'North Palawan')),
  sex text check (sex in ('Male', 'Female', 'Unknown')),
  age text,
  weight text,
  length text,
  status text not null default 'alive' check (status in ('alive', 'dead', 'illegal_trade', 'poaching')),
  found_at timestamp with time zone not null default now(),
  reporter_id uuid references auth.users on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table pangolins enable row level security;

-- Allow authenticated users to view all pangolin records
create policy "Authenticated users can view pangolins." on pangolins
  for select using (auth.role() = 'authenticated');

-- Allow authenticated users to insert pangolin records
create policy "Authenticated users can insert pangolins." on pangolins
  for insert with check (auth.role() = 'authenticated');

-- Allow users to update pangolin records (for admin functionality)
create policy "Authenticated users can update pangolins." on pangolins
  for update using (auth.role() = 'authenticated');

-- Allow users to delete pangolin records (for admin functionality)
create policy "Authenticated users can delete pangolins." on pangolins
  for delete using (auth.role() = 'authenticated');

-- Create indexes for better performance
create index idx_pangolins_tag_id on pangolins(tag_id);
create index idx_pangolins_municipality on pangolins(municipality);
create index idx_pangolins_cluster on pangolins(cluster);
create index idx_pangolins_status on pangolins(status);
create index idx_pangolins_found_at on pangolins(found_at);

-- Set up automatic updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_pangolins_updated_at
  before update on pangolins
  for each row execute function update_updated_at_column();
```

### Alternative: Add fields to existing pangolins table

If you already have a pangolins table, you can add the missing fields with these commands:

```sql
-- Add new columns if they don't exist
alter table pangolins
add column if not exists cluster text check (cluster in ('South Palawan', 'Central Palawan', 'North Palawan')),
add column if not exists sex text check (sex in ('Male', 'Female', 'Unknown')),
add column if not exists age text,
add column if not exists weight text,
add column if not exists length text;

-- If you need to make cluster required later (after populating existing records)
-- alter table pangolins alter column cluster set not null;
```

## 8. Testing

1. Start your development server: `npm run dev`
2. Try signing up with an email
3. Check your email for confirmation
4. Try logging in after confirmation
5. Test the admin panel by adding pangolin records

## Features Included

- ✅ Email/Password Authentication
- ✅ Google OAuth Integration
- ✅ Password Reset Functionality
- ✅ Email Verification
- ✅ Form Validation
- ✅ Error Handling
- ✅ Loading States
- ✅ Success Messages
- ✅ Pangolin Management System
- ✅ Admin Dashboard

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
- Row Level Security (RLS) is enabled for both profiles and pangolins tables
- Access to pangolin data is restricted to authenticated users only

## Optional: Cluster Stats View (recommended for MapPage)

Create a lightweight view to serve aggregated stats by cluster for faster reads:

```sql
create or replace view cluster_stats as
select
  cluster,
  count(*) filter (where status = 'alive')         as alive,
  count(*) filter (where status = 'dead')          as dead,
  count(*) filter (where status = 'poaching')      as poaching,
  count(*) filter (where status = 'illegal_trade') as illegal_trades
from pangolins
group by cluster;

-- RLS policies inherit from base table; if you need public read for MapPage, add:
-- create policy "Public can read cluster_stats" on cluster_stats for select using (true);
```

If you expect high write volume and want even faster reads, consider a materialized view with a refresh schedule:

```sql
create materialized view if not exists cluster_stats_mv as
select
  cluster,
  count(*) filter (where status = 'alive')         as alive,
  count(*) filter (where status = 'dead')          as dead,
  count(*) filter (where status = 'poaching')      as poaching,
  count(*) filter (where status = 'illegal_trade') as illegal_trades
from pangolins
group by cluster;

-- To refresh manually:
-- refresh materialized view concurrently cluster_stats_mv;
```

grant usage on schema public to authenticated;
grant select on table public.cluster_stats to authenticated;

-- If you’ll use the materialized view:
grant select on table public.cluster_stats_mv to authenticated;
-- If you don’t already have a select policy for authenticated:

create policy read_pangolins_authenticated
on public.pangolins
for select
using (auth.role() = 'authenticated');
