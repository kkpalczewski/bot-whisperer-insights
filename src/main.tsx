
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from 'next-themes'
import { supabase } from '@/integrations/supabase/client'
import { SessionContextProvider } from '@supabase/auth-helpers-react'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </ThemeProvider>
);
