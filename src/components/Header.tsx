
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSupabaseSession } from '@supabase/auth-helpers-react';
import { FingerprintIcon, LogIn, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export const Header = () => {
  const session = useSupabaseSession();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAuth = () => {
    // This is a placeholder - when Supabase is connected, this will use actual auth
    if (session) {
      // In a real app with Supabase connected, this would be:
      // await supabase.auth.signOut()
      toast.success("Logged out successfully", {
        description: "You have been logged out of your account."
      });
    } else {
      setIsLoggingIn(true);
      // Simulate login UI - in a real app this would open Supabase auth UI
      setTimeout(() => {
        setIsLoggingIn(false);
        toast.success("This is a placeholder login message", {
          description: "Connect Supabase to enable real authentication"
        });
      }, 1500);
    }
  };

  return (
    <header className="py-4 px-6 bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FingerprintIcon size={24} className="text-blue-400" />
          <h1 className="text-xl font-bold text-white">Bot Whisperer Insights</h1>
        </div>
        
        <Button 
          onClick={handleAuth} 
          variant="outline"
          className="flex items-center gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <span>Connecting...</span>
          ) : session ? (
            <>
              <LogOut size={16} />
              <span>Logout</span>
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span>Login</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
