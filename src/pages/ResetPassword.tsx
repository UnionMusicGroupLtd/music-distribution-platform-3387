import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, CheckCircle, XCircle } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [requirements, setRequirements] = useState({
    minLength: false,
    notEmail: false
  });
  const [success, setSuccess] = useState(false);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  // Check password requirements in real-time
  useEffect(() => {
    if (formData.password) {
      setRequirements({
        minLength: formData.password.length >= 8,
        notEmail: !formData.password.includes('@') // Simple check, not perfect
      });
    }
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      // Complete password reset
      const result = await auth.completePasswordReset(token, formData.password);
      
      console.log("Password reset completed:", result);
      setSuccess(true);
      toast.success("Password reset successful!");
      
      // Auto-redirect to sign-in after success
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      // Handle specific error cases
      if (error.message.includes('invalid_token')) {
        toast.error("Invalid or expired reset token. Please request a new password reset.");
        setTimeout(() => navigate("/forgot-password"), 3000);
      } else if (error.message.includes('password_too_short')) {
        toast.error("Password is too short. Must be at least 8 characters.");
      } else if (error.message.includes('insufficient_password_complexity')) {
        toast.error("Password is not complex enough. Please use a stronger password.");
      } else {
        toast.error(error.message || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/50 border-purple-500/20 p-8 text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h1>
            <p className="text-purple-300 text-sm">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/signin")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Go to Sign In
            </Button>
            
            <p className="text-purple-300 text-sm">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-purple-500/20 p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-purple-300 text-sm mt-2">Create a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-200">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                className="pl-10 bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-purple-200">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="pl-10 bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Password Requirements */}
          {formData.password && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 space-y-1">
              <p className="text-purple-200 text-xs font-medium">Password Requirements:</p>
              <div className="flex items-center text-xs">
                {requirements.minLength ? (
                  <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400 mr-2" />
                )}
                <span className={requirements.minLength ? "text-green-400" : "text-red-400"}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center text-xs">
                {requirements.notEmail ? (
                  <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400 mr-2" />
                )}
                <span className={requirements.notEmail ? "text-green-400" : "text-red-400"}>
                  Not your email address
                </span>
              </div>
            </div>
          )}

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <p className="text-purple-300 text-xs">
              <span className="font-medium text-purple-200">Security Note:</span> Your password should be unique and not used on other websites.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={loading || !requirements.minLength || !requirements.notEmail || formData.password !== formData.confirmPassword}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/signin" 
            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;