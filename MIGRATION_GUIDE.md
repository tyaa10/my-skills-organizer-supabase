# Firebase to Supabase Migration Guide

This guide explains how to migrate the Skills Organizer project from Firebase to Supabase.

## Overview

The migration involves replacing:
- Firebase Auth → Supabase Auth
- Firebase Realtime Database → Supabase PostgreSQL
- Firebase Functions → Supabase Edge Functions
- Firebase Messaging → (Removed for now, can be added later with Supabase Realtime)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

### 2. Update Configuration

1. Update `src/helpers/supabaseConfig.js` with your Supabase project details:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
   ```

### 3. Set up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Run the SQL script from `supabase-schema.sql` to create all necessary tables and policies

### 4. Deploy Edge Functions

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy the Edge Functions:
   ```bash
   supabase functions deploy aims
   ```

### 5. Install Dependencies

```bash
npm install
```

### 6. Update Environment Variables

If you're using environment variables, update them to use Supabase instead of Firebase.

## Key Changes Made

### Authentication
- Replaced Firebase Auth with Supabase Auth
- Updated authentication state management
- Added automatic user profile creation in Supabase

### Database
- Migrated from Firebase Realtime Database to PostgreSQL
- Created proper relational schema with foreign keys
- Implemented Row Level Security (RLS) policies
- Updated all CRUD operations to use Supabase client

### API Functions
- Replaced Firebase Functions with Supabase Edge Functions
- Updated the `aims` endpoint to work with PostgreSQL
- Added proper CORS handling

### Data Structure Changes
- `left` field renamed to `left_pos` (PostgreSQL reserved keyword)
- Added proper timestamps with `created_at` and `updated_at`
- Implemented proper foreign key relationships

## Features Removed

- Firebase Messaging (push notifications) - can be re-implemented with Supabase Realtime
- Firebase UI - replaced with custom Supabase auth components

## Features Maintained

- User authentication and authorization
- Node management (create, read, update, delete)
- Template management
- Dependency management
- Real-time data synchronization (via Supabase subscriptions)

## Testing the Migration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test user registration and login
3. Test creating, editing, and deleting nodes
4. Test template functionality
5. Test the API endpoint at `/functions/v1/aims`

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure your Supabase project allows your domain
2. **RLS policy errors**: Check that the user is authenticated and policies are correct
3. **Function deployment errors**: Ensure you're logged in and have the correct project linked

### Database Issues

If you encounter issues with the database schema:
1. Check the Supabase logs in the dashboard
2. Verify that RLS policies are correctly set up
3. Ensure foreign key constraints are properly configured

## Next Steps

1. Set up proper error handling and logging
2. Implement push notifications using Supabase Realtime
3. Add data migration scripts if needed
4. Set up monitoring and analytics
5. Configure backup and recovery procedures

## Support

For issues related to this migration, please check:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Project issues on GitHub
