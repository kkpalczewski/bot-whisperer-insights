
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import App from './App.tsx'
import './index.css'

// Initialize Supabase client - these will need to be replaced with actual values when connected
// This is just a placeholder until the user connects with the Supabase integration
const supabaseUrl = 'https://placeholder.supabase.co' // This will be replaced when connecting Supabase
const supabaseKey = 'placeholder-key' // This will be replaced when connecting Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

createRoot(document.getElementById("root")!).render(
  <SessionContextProvider supabaseClient={supabase}>
    <App />
  </SessionContextProvider>
);
