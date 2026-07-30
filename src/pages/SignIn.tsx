import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("=== Starting Sign In Process ===");
      console.log("Email:", formData.email);
      console.log("Password provided:", formData.password ? "Yes" : "No");
      
      // Validate input
      if (!formData.email || !formData.password) {
        throw new Error("Email and password are required");
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }
      
      console.log("Attempting auth.signIn...");
      const user = await auth.signIn(formData.email, formData.password);
      console.log("Sign in successful, user data:", user);
      
      // Verify the user was stored in the auth instance
      console.log("Verifying stored user...");
      const currentUser = await auth.getUser();
      console.log("Current user from getUser:", currentUser);
      
      if (user && currentUser) {
        toast.success("Welcome back! Redirecting to dashboard...");
        
        // Small delay to ensure auth state is properly set
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          window.location.href = "/dashboard"; // Use window.location for hard redirect
        }, 500);
      } else {
        throw new Error("Authentication succeeded but user data not available");
      }
    } catch (error: any) {
      console.error("=== Sign In Error Details ===");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error cause:", error.cause);
      console.error("Full error:", error);
      
      // Better error messages based on common issues
      let errorMessage = "Failed to sign in. Please check your credentials.";
      
      if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
        errorMessage = "Access denied. Please contact support if this problem persists.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        description: "Please check your email and password and try again.",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-purple-500/20 p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Union Music Group Ltd</h1>
          <p className="text-purple-300 text-sm mt-2">Sign in to your artist dashboard</p>
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-200">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 text-sm">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-purple-300 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="https://www.distributionunion.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              Visit Distribution Union
            </Button>
          </a>
        </div>

        {/* Debug info - remove in production */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
            <p className="text-red-300 text-xs font-mono">
              DEBUG: If login fails, check browser console for detailed error information
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SignIn;
