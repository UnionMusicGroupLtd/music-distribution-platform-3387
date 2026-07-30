import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Lock, AlertCircle } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";

export const SetupAdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    user?: any;
  } | null>(null);

  const setupAdminUser = async () => {
    setLoading(true);
    setResult(null);

    try {
      const currentUser = await auth.getUser();
      if (!currentUser) {
        setResult({ success: false, message: 'You must be logged in to run this setup' });
        setLoading(false);
        return;
      }

      const targetEmail = 'info@unionmusicgroup.co.uk';
      
      // List users to find the target user
      const usersList = await auth.listUsers({ 
        search: { email: targetEmail } 
      });

      if (!usersList.data || usersList.data.length === 0) {
        setResult({ success: false, message: `User ${targetEmail} not found` });
        setLoading(false);
        return;
      }

      const targetUser = usersList.data[0];
      
      // Update the user's appMetadata to include admin role
      const existingMetadata = targetUser.userMetadata || {};
      
      await auth.updateUserByUuid(targetUser.userUuid, {
        metadata: {
          ...existingMetadata,
          role: 'admin',
          adminSince: new Date().toISOString(),
          adminSetupBy: currentUser.userUuid
        }
      });

      setResult({ 
        success: true, 
        message: `Successfully set ${targetEmail} as admin!`,
        user: {
          email: targetUser.email,
          uuid: targetUser.userUuid,
          role: 'admin'
        }
      });

    } catch (error) {
      setResult({ 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-900/50 border-purple-500/20 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Setup</h1>
          <p className="text-purple-300 text-sm">
            Configure admin access for info@unionmusicgroup.co.uk
          </p>
        </div>

        {result ? (
          <div className="space-y-4">
            {result.success ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-green-300 font-semibold mb-1">Setup Complete!</h3>
                    <p className="text-green-200/80 text-sm">{result.message}</p>
                    {result.user && (
                      <div className="mt-3 text-xs text-green-200/60">
                        <div>Email: {result.user.email}</div>
                        <div>UUID: {result.user.uuid}</div>
                        <div>Role: {result.user.role}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-red-300 font-semibold mb-1">Setup Failed</h3>
                    <p className="text-red-200/80 text-sm">{result.message}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setResult(null);
              }}
              className="w-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-blue-300 font-semibold mb-1">Admin Setup</h3>
                  <p className="text-blue-200/80 text-sm">
                    This will configure <span className="text-white font-medium">info@unionmusicgroup.co.uk</span> as an admin user with full access to the admin dashboard at <code className="text-white bg-blue-500/20 px-1 rounded">/admin</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-yellow-300 font-semibold mb-1">Requirements</h3>
                  <ul className="text-yellow-200/80 text-sm list-disc list-inside space-y-1">
                    <li>You must be logged in as a user with admin privileges</li>
                    <li>The target email must already be registered</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={setupAdminUser}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? 'Setting up admin...' : 'Setup Admin Access'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SetupAdminPanel;