
import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

export const Header: React.FC = () => {
  const user = useUser();
  const supabase = useSupabaseClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleEmailLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Eye className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Bot Whisperer Insights</h1>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.email || user.user_metadata?.full_name || 'Logged in user'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEmailLogin}>
              Github
            </Button>
            <Button variant="default" size="sm" onClick={handleLogin}>
              Google
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
