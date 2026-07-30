import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, User, MapPin } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    password: "",
    artistName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting sign up with:", formData.email);
      const user = await auth.signUp(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`.trim(),
        'en',
        {
          country: formData.country,
          signup_country: formData.country,
          artistName: formData.artistName
        }
      );

      console.log("Sign up successful, user data:", user);
      
      // Verify the user was stored in the auth instance
      const currentUser = await auth.getUser();
      console.log("Current user from getUser:", currentUser);
      
      if (user && currentUser) {
        toast.success("Account created successfully! Redirecting to dashboard...");
        
        // Small delay to ensure auth state is properly set
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          window.location.href = "/dashboard"; // Use window.location for hard redirect
        }, 1000);
      } else {
        throw new Error("Account creation succeeded but user data not available");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-purple-500/20 p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-purple-300 text-sm mt-2">Start distributing your music today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-purple-200">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="pl-10 bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-purple-200">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="pl-10 bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

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
            <Label htmlFor="country" className="text-purple-200">Country</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <select
                id="country"
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-purple-500/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              >
                <option value="" className="bg-slate-900 text-purple-400">Select your country</option>
                <option value="United States" className="bg-slate-900">United States</option>
                <option value="United Kingdom" className="bg-slate-900">United Kingdom</option>
                <option value="Canada" className="bg-slate-900">Canada</option>
                <option value="Australia" className="bg-slate-900">Australia</option>
                <option value="Germany" className="bg-slate-900">Germany</option>
                <option value="France" className="bg-slate-900">France</option>
                <option value="Spain" className="bg-slate-900">Spain</option>
                <option value="Italy" className="bg-slate-900">Italy</option>
                <option value="Netherlands" className="bg-slate-900">Netherlands</option>
                <option value="Sweden" className="bg-slate-900">Sweden</option>
                <option value="Norway" className="bg-slate-900">Norway</option>
                <option value="Denmark" className="bg-slate-900">Denmark</option>
                <option value="Finland" className="bg-slate-900">Finland</option>
                <option value="Switzerland" className="bg-slate-900">Switzerland</option>
                <option value="Austria" className="bg-slate-900">Austria</option>
                <option value="Belgium" className="bg-slate-900">Belgium</option>
                <option value="Ireland" className="bg-slate-900">Ireland</option>
                <option value="Portugal" className="bg-slate-900">Portugal</option>
                <option value="Greece" className="bg-slate-900">Greece</option>
                <option value="Poland" className="bg-slate-900">Poland</option>
                <option value="Czech Republic" className="bg-slate-900">Czech Republic</option>
                <option value="Japan" className="bg-slate-900">Japan</option>
                <option value="South Korea" className="bg-slate-900">South Korea</option>
                <option value="China" className="bg-slate-900">China</option>
                <option value="India" className="bg-slate-900">India</option>
                <option value="Singapore" className="bg-slate-900">Singapore</option>
                <option value="Hong Kong" className="bg-slate-900">Hong Kong</option>
                <option value="Taiwan" className="bg-slate-900">Taiwan</option>
                <option value="Malaysia" className="bg-slate-900">Malaysia</option>
                <option value="Thailand" className="bg-slate-900">Thailand</option>
                <option value="Indonesia" className="bg-slate-900">Indonesia</option>
                <option value="Philippines" className="bg-slate-900">Philippines</option>
                <option value="Vietnam" className="bg-slate-900">Vietnam</option>
                <option value="Brazil" className="bg-slate-900">Brazil</option>
                <option value="Argentina" className="bg-slate-900">Argentina</option>
                <option value="Mexico" className="bg-slate-900">Mexico</option>
                <option value="Colombia" className="bg-slate-900">Colombia</option>
                <option value="Chile" className="bg-slate-900">Chile</option>
                <option value="Peru" className="bg-slate-900">Peru</option>
                <option value="South Africa" className="bg-slate-900">South Africa</option>
                <option value="Nigeria" className="bg-slate-900">Nigeria</option>
                <option value="Egypt" className="bg-slate-900">Egypt</option>
                <option value="Morocco" className="bg-slate-900">Morocco</option>
                <option value="Kenya" className="bg-slate-900">Kenya</option>
                <option value="New Zealand" className="bg-slate-900">New Zealand</option>
                <option value="Ireland" className="bg-slate-900">Ireland</option>
                <option value="Other" className="bg-slate-900">Other</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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
                minLength={8}
              />
            </div>
            <p className="text-xs text-purple-400">Minimum 8 characters</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-purple-300 text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
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
      </Card>
    </div>
  );
};

export default SignUp;
