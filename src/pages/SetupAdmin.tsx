import { useState, useEffect } from "react";
import { SetupAdminPanel } from "@/components/SetupAdminPanel";
import auth from "@/lib/shared/kliv-auth.js";

const SetupAdmin = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const user = await auth.getUser();
      // Only allow setup if user is already logged in and has appropriate permissions
      if (user) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-purple-400">Checking authorization...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900/50 border-purple-500/20 rounded-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
          <p className="text-purple-300 mb-4">You must be logged in to access the admin setup page.</p>
          <a href="/signin" className="text-purple-400 hover:text-purple-300 underline">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return <SetupAdminPanel />;
};

export default SetupAdmin;