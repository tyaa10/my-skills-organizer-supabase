# Skills Organizer

> Web application: Skills-organizer for everyone

A Vue.js application for organizing and managing skills, goals, and dependencies with a visual canvas interface.

## 🚀 Recent Migrations

This project has been migrated from:
- **Firebase to Supabase** - See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details
- **Webpack to Vite** - See [VITE_MIGRATION_GUIDE.md](./VITE_MIGRATION_GUIDE.md) for details

## Features

- **User Authentication**: Secure user registration and login
- **Visual Canvas**: Interactive canvas for organizing skills and goals
- **Templates**: Create and manage reusable skill templates
- **Dependencies**: Define relationships between different skills/goals
- **Real-time Updates**: Live synchronization across devices
- **Multi-language Support**: Internationalization support

## Tech Stack

- **Frontend**: Vue.js 2, Vuex, Vue Router
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Canvas**: Fabric.js
- **Styling**: Stylus, UIMini CSS Framework
- **Build Tool**: Vite (migrated from Webpack)

## Quick Start

### Prerequisites

- Node.js (>= 6.0.0)
- npm (>= 3.0.0)
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-skills-organizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your Project URL and anon key from Settings → API
   - **Option A**: Create a `.env` file with:
     ```env
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - **Option B**: Update `src/helpers/supabaseConfig.js` directly with your credentials
   - Run the SQL schema from `supabase-schema.sql` in your Supabase dashboard
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## Available Scripts

```bash
# Development
npm run dev          # Start Vite development server
npm run start        # Alias for dev

# Building
npm run build        # Build for production with Vite
npm run preview      # Preview production build

# Testing
npm run unit         # Run unit tests
npm run e2e          # Run e2e tests
npm test             # Run all tests

# Supabase
npm run supabase:start    # Start local Supabase
npm run supabase:stop     # Stop local Supabase
npm run supabase:reset    # Reset local database
npm run supabase:deploy   # Deploy Edge Functions
npm run supabase:logs     # View function logs
```

## Project Structure

```
src/
├── components/          # Vue components
│   ├── Auth/           # Authentication components
│   ├── Common/         # Shared components
│   └── ...
├── helpers/            # Utility functions
│   └── supabaseConfig.js  # Supabase configuration
├── lang/               # Internationalization files
├── plugins/            # Vue plugins
├── router/             # Vue Router configuration
├── store/              # Vuex store modules
│   ├── user.js         # User management
│   ├── elems.js        # Nodes/elements management
│   ├── templates.js    # Templates management
│   └── dependencies.js # Dependencies management
└── assets/             # Static assets

supabase/
├── functions/          # Edge Functions
│   └── aims/          # API endpoint
└── config.toml        # Supabase configuration
```

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User profiles
- `userdata` - User metadata
- `nodes` - Skills/goals nodes
- `templates` - Reusable templates
- `template_nodes` - Nodes within templates
- `dependencies` - Relationships between nodes
- `template_dependencies` - Dependencies within templates

## API Endpoints

- `GET /functions/v1/aims` - Get public goals from all users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues and questions:
- Check the [Migration Guide](./MIGRATION_GUIDE.md)
- Review [Supabase Documentation](https://supabase.com/docs)
- Open an issue in the repository

---

**Note**: This project was migrated from Firebase to Supabase. If you're looking for the original Firebase version, check the git history.
