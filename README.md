# MySkillsOrganizer

🌐 [Русская версия / Russian version](README.ru.md)

> **A visual, interactive tree of your human development — not just tasks, but the person you are becoming.**

MySkillsOrganizer is a web application designed to help you visualize your goals, skills, and the dependencies between them. It is built on the philosophy of **HumanBuilding (HB)**: the idea that the most valuable product of any useful work is not the external thing you produce, but yourself — your knowledge, abilities, and human qualities developed in the process.

🔗 **[Live Demo](https://my-skills-organizer-supabase.vercel.app/)**  
📚 **[HumanBuilding Monograph (PDF)](https://github.com/tyaa10/my-skills-organizer-supabase/releases)**  
💬 **[Community (EN)](https://www.facebook.com/groups/150758748845784)** | **[Community (RU)](https://vk.com/humanbuilders)**

---

## ✨ Features

- **Visual Canvas**: Interactive Fabric.js canvas for organizing skills and goals.
- **Templates**: Create, manage, and share reusable development templates.
- **JSON Import (New!)**: Generate a structured development tree in 30 minutes using any LLM (ChatGPT, Claude, etc.) and import it directly via JSON file.
- **Dependencies**: Define and visualize complex relationships between different skills/goals.
- **Real-time Updates**: Live synchronization across devices via Supabase.
- **Multi-language Support**: Full internationalization (i18n) for EN/RU.

---

## 🛠️ Tech Stack

- **Frontend**: Vue.js 2, Vuex, Vue Router, Vue I18n
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Canvas**: Fabric.js
- **Styling**: Stylus, UIMini CSS Framework
- **Build Tool**: Vite (migrated from Webpack)
- **Validation**: Vuelidate

---

## 🚀 Quick Start

### Prerequisites

- Node.js (>= 16.0.0 recommended)
- npm (>= 8.0.0)
- A free [Supabase](https://supabase.com) account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/tyaa10/my-skills-organizer-supabase.git
   cd my-skills-organizer-supabase
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com).
   - Go to **Settings → API** and copy your `Project URL` and `anon public` key.
   - Create a `.env` file in the root directory and add:

     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your_anon_key_here
     ```

   - Go to the **SQL Editor** in your Supabase dashboard and run the script from `supabase-schema.sql` to create all necessary tables and Row Level Security (RLS) policies.
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000` (or the port shown in your terminal).

---

## 📂 Project Structure

```text
src/
├── components/          # Vue components (Auth, Common, FabricCanvas, etc.)
├── helpers/             # Utility functions (e.g., supabaseConfig.js)
├── lang/                # Internationalization files (en.json, ru.json)
├── plugins/             # Vue plugins (i18n, etc.)
├── router/              # Vue Router configuration
├── store/               # Vuex store modules (user, elems, templates, dependencies)
└── assets/              # Static assets (CSS, Stylus, images)

supabase/
├── functions/           # Edge Functions (e.g., aims API)
└── config.toml          # Supabase local configuration
```

---

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- `users` / `userdata` — User profiles and metadata
- `nodes` — Skills/goals nodes
- `templates` — Reusable templates
- `template_nodes` — Nodes within templates
- `dependencies` — Relationships between nodes
- `template_dependencies` — Dependencies within templates

---

## 📡 API Endpoints

- `GET /functions/v1/aims` — Get public goals from all users.

---

## 🤝 Contributing

This project is open source and available under the [MIT License](LICENSE).

We believe that human development should be a shared, collaborative process. If you are a developer, educator, or philosopher who believes that human growth should be visual, structured, and shared — this is for you.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

**Particularly welcome contributions:**

- Export current template to JSON (for LLM editing and re-import).
- Client-side JSON validation with friendly error messages.
- Direct LLM API integration (one-click template generation).
- Visual schema editor with drag-and-drop.
- Mobile adaptation.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with stubborn hope by Yurii Trofimenko, 2019–2026.*
