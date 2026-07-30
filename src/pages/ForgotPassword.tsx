import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Request password reset - this returns 200 OK even for invalid emails (prevents enumeration)
      const result = await auth.requestPasswordReset(email);
      
      console.log("Password reset requested:", result);
      setSubmitted(true);
      toast.success("Password reset email sent! Check your inbox.");
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      // Handle specific error cases
      if (error.message.includes('email_template_not_configured')) {
        toast.error("Password reset email is not configured. Please contact support.");
      } else if (error.message.includes('email_rate_limit_exceeded')) {
        toast.error("Too many password reset attempts. Please try again later.");
      } else if (error.message.includes('email_send_failed')) {
        toast.error("Failed to send password reset email. Please try again.");
      } else {
        toast.error(error.message || "Failed to send password reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/50 border-purple-500/20 p-8 text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-purple-300 text-sm">
              We've sent a password reset link to <span className="text-purple-200 font-medium">{email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <p className="text-purple-200 text-sm">
                <span className="font-medium">What happens next?</span>
                <br />
                1. Check your email inbox for the reset link
                <br />
                2. Click the link in the email to reset your password
                <br />
                3. The link expires in 24 hours
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => navigate("/signin")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Back to Sign In
              </Button>
              
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full bg-slate-800/50 border-purple-500/20 hover:bg-slate-700/50 hover:border-purple-500/40 text-white"
              >
                Try Another Email
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-purple-300 text-sm">
              Didn't receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                try again
              </button>
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
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-purple-300 text-sm mt-2">Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-200">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="pl-10 bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-purple-400">
              We'll send you a password reset link if this email is registered
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-purple-400">Or</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <Link 
              to="/signin" 
              className="flex items-center justify-center text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
            
            <p className="text-purple-300 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;