import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initMocks } from './mocks/init';

// Initialize database and start app
async function initializeApp() {
  try {
    // Initialize mocks in development
    if (process.env.NODE_ENV === 'development') {
      await initMocks();
    }
    
    // The database is now seeded by initMocks() in development
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Even if seeding fails, try to render the app
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const root = createRoot(rootElement);
      root.render(
        <div className="p-4 text-red-600">
          <h1 className="text-xl font-bold mb-2">Application Error</h1>
          <p>Failed to initialize the application. Please check the console for details.</p>
          <p className="mt-2 text-sm opacity-75">{error.message}</p>
        </div>
      );
    }
  }
}

initializeApp();