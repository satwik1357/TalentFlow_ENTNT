<div align="center">
  <h1>🚀 TalentFlow Recruiter Kit</h1>
  <p><em>Modern Recruitment Management Solution for Efficient Hiring Workflows</em></p>

</div>

## 📋 Overview

TalentFlow Recruiter Kit is a cutting-edge recruitment management platform designed to streamline your hiring process. With an intuitive Kanban-style interface, powerful candidate management tools, and real-time collaboration features, it helps recruiters and hiring managers make better hiring decisions faster.

### 🎯 Key Features

#### 📊 Candidate Pipeline Management
- **Interactive Kanban Board** - Visualize and manage candidates across different hiring stages
- **Drag & Drop Interface** - Easily move candidates between recruitment stages

#### 👥 Candidate Management
- **Detailed Profiles** - Comprehensive candidate information at a glance
- **Notes & Comments** - Add and track internal notes for each candidate
- **Advanced Search** - Quickly find candidates using powerful filters and search

#### 🚀 Performance & Experience
- **Blazing Fast** - Built with Vite for exceptional performance
- **Fully Responsive** - Works seamlessly on desktop and mobile devices
- **Intuitive UI** - Clean, modern interface built with shadcn/ui and Tailwind CSS

#### 🔒 Data Security
- **Mock API** - Development-friendly with built-in mock data


## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Access the application**
   Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

### Production Build

To create an optimized production build:

```bash
npm run build
npm run preview
```

## 🖥️ Browser Support

TalentFlow Recruiter Kit supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔧 Configuration

The application can be configured using environment variables. Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=TalentFlow Recruiter Kit
```

## 🛠 Development Guide

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run build:dev` | Create development build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed the database with mock data |
| `npm run msw:init` | Initialize Mock Service Worker |
| `npm run msw:generate` | Generate service worker for mocking API

### Project Structure

```
talentflow-recruiter-kit/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── candidates # Candidate-related components
│   │   └── jobs      # Job-related components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and configurations
│   │   ├── db.js      # Database schema and types
│   │   └── utils.js   # Helper functions
│   ├── mocks/         # Mock data and API handlers
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Main application component
├── .eslintrc.js       # ESLint configuration
├── .prettierrc        # Prettier configuration
├── tsconfig.json      # TypeScript configuration
└── vite.config.js     # Vite configuration
```

### Technology Stack

| Technology | Description |
|------------|-------------|
| React 18 | Frontend library for building user interfaces |
| TypeScript | Typed JavaScript for better development experience |
| Vite | Next-generation frontend tooling |
| Tailwind CSS | Utility-first CSS framework |
| shadcn/ui | Beautifully designed components |
| @dnd-kit | Modern drag and drop toolkit |
| React Router | Client-side routing |
| Lucide Icons | Beautiful & consistent icon toolkit |
| MSW (Mock Service Worker) | API mocking for development and testing |
| Dexie.js | A minimalistic wrapper for IndexedDB |
| React DnD | Drag and drop functionality for the Kanban board |
| clsx | Utility for constructing className strings conditionally |
| date-fns | Modern date utility library |

### Mock Data & Development

The application uses Mock Service Worker (MSW) to mock API requests during development. This allows you to work with realistic data without needing a backend server.

#### Seeding the Database

To populate the application with sample data, run:

```bash
npm run seed
```

This will initialize the database with mock candidates, jobs, and other necessary data.

### API Integration

For development, the application uses a mock API by default. To connect to a real backend, update the API configuration.



