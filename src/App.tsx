import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Tracks from "./pages/Tracks";
import Admin from "./pages/Admin";
import Royalties from "./pages/Royalties";
import SetupAdmin from "./pages/SetupAdmin";
import Plans from "./pages/Plans";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQs from "./pages/FAQs";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthCallback from "./pages/OAuthCallback";
import LinkTree from "./pages/LinkTree";
import NotFound from "./pages/NotFound";
import MediaPartner from "./pages/MediaPartner";
import CoverSongLicensing from "./pages/CoverSongLicensing";
import YouTubePromotion from "./pages/YouTubePromotion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/upload" element={<Layout><Upload /></Layout>} />
          <Route path="/tracks" element={<Layout><Tracks /></Layout>} />
          <Route path="/admin" element={<Layout><Admin /></Layout>} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/setup-admin" element={<Layout><SetupAdmin /></Layout>} />
          <Route path="/royalties" element={<Layout><Royalties /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/faqs" element={<Layout><FAQs /></Layout>} />
          <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
          <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
          <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
          <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
          <Route path="/oauth-callback" element={<Layout><OAuthCallback /></Layout>} />
          <Route path="/link-tree/:id" element={<LinkTree />} />
          <Route path="/media-partner" element={<MediaPartner />} />
          <Route path="/cover-song-licensing" element={<CoverSongLicensing />} />
          <Route path="/youtube-promotion" element={<YouTubePromotion />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
