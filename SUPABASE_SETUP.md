# Supabase Setup Guide

## Quick Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `my-skills-organizer` (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to you
5. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Update Configuration

**Option A: Using Environment Variables (Recommended)**

Create a `.env` file in your project root:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option B: Direct Configuration**

Edit `src/helpers/supabaseConfig.js` and replace the placeholder values:
```javascript
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

### 5. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (if you want email/password auth)
3. Enable **Google** provider (if you want Google auth):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
   - Copy the Client ID and Client Secret to Supabase

### 6. Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Try to sign up for a new account

4. Check the Supabase dashboard to see if the user was created

## Troubleshooting

### Common Issues

1. **"supabaseUrl is required" error**
   - Make sure you've updated the configuration with your actual Supabase credentials
   - Check that the `.env` file is in the project root (not in a subdirectory)

2. **Authentication not working**
   - Verify your Supabase URL and API key are correct
   - Check that the authentication providers are enabled in Supabase dashboard

3. **Database errors**
   - Make sure you've run the SQL schema in Supabase
   - Check the Supabase logs for any errors

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check the browser console for detailed error messages

## Security Notes

- Never commit your `.env` file to version control
- The `anon` key is safe to use in client-side code
- For production, consider using Row Level Security (RLS) policies
