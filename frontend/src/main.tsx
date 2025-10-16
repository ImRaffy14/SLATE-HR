import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/authContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
  </QueryClientProvider>
);
