# Permchok Frontend

Modern React + TypeScript frontend for Permchok lottery and gaming platform.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: ViteJS
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── api/              # API client and endpoints
├── assets/           # Static assets (images, fonts)
├── components/       # Reusable components
│   ├── common/       # Common UI components
│   └── layouts/      # Layout components
├── features/         # Feature-based modules
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── auth/         # Authentication pages
│   ├── games/        # Game pages
│   ├── lottery/      # Lottery pages
│   ├── profile/      # Profile pages
│   ├── transactions/ # Transaction pages
│   └── promotions/   # Promotion pages
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main app component
├── main.tsx          # App entry point
└── index.css         # Global styles
```

## Key Features

### Authentication
- JWT-based authentication
- Automatic token refresh
- Protected routes
- Login/Register forms with validation

### State Management
- Zustand for global state
- Persistent auth state
- Optimistic updates

### API Integration
- Axios client with interceptors
- Automatic token injection
- Error handling
- Request/response transformation

### Styling
- TailwindCSS utility classes
- Custom design system
- Dark gaming theme
- Responsive design
- Smooth animations

### Form Handling
- React Hook Form for forms
- Zod schema validation
- Custom error messages
- Thai language support

## Environment Variables

See [.env.example](.env.example) for all available environment variables.

Key variables:
- `VITE_API_URL` - Backend API URL
- `VITE_API_BASE_PATH` - API base path (default: /api/v1)
- `VITE_WS_URL` - WebSocket URL

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful component names
- Keep components small and focused

### Component Structure
```tsx
import { useState } from 'react'
import type { ComponentProps } from './types'

const MyComponent = ({ prop1, prop2 }: ComponentProps) => {
  const [state, setState] = useState()

  return (
    <div className="component-wrapper">
      {/* Component content */}
    </div>
  )
}

export default MyComponent
```

### API Calls
```tsx
import { useEffect, useState } from 'react'
import { gameAPI } from '@api/gameAPI'

const MyComponent = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await gameAPI.getGames()
        setData(result)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return <div>{/* Render data */}</div>
}
```

### State Management
```tsx
import { useAuthStore } from '@store/authStore'

const MyComponent = () => {
  const { user, login, logout } = useAuthStore()

  return <div>{user?.username}</div>
}
```

## Troubleshooting

### Port Already in Use
If port 5173 is in use, you can specify a different port:
```bash
npm run dev -- --port 3000
```

### Module Not Found
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
Check TypeScript errors:
```bash
npx tsc --noEmit
```

## License

Proprietary - All rights reserved
