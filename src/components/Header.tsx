import { Button } from "@/components/ui/button";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { FingerprintIcon, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Header = () => {
  const supabaseClient = useSupabaseClient();
  const session = useSession();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAuth = async () => {
    if (session) {
      try {
        await supabaseClient.auth.signOut();
        toast.success("Logged out successfully");
      } catch (error) {
        toast.error("Error logging out");
      }
    } else {
      setIsLoggingIn(true);
      try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } catch (error) {
        toast.error("Error logging in");
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <header className="py-4 px-6 bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FingerprintIcon size={24} className="text-blue-400" />
          <h1 className="text-xl font-bold text-white">
            B2BD - Bot-to-Bot Detector
          </h1>
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
