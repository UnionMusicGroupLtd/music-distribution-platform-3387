import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Music, Upload, DollarSign, Settings, LogOut, Shield, Crown, Clock, Check, X, Wallet, Banknote, AlertCircle, Bell } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";
import { toast } from "sonner";
import auth from "@/lib/shared/kliv-auth.js";
import db from "@/lib/shared/kliv-database.js";
import functions from "@/lib/shared/kliv-functions.js";
import { useWhiteLabelBranding } from "@/hooks/useWhiteLabelBranding";

const Dashboard = () => {
  const navigate = useNavigate();
  const { branding: whiteLabelBranding } = useWhiteLabelBranding();
  const [artist, setArtist] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalStreams: 0,
    totalRevenue: 0,
    activeReleases: 0,
    pendingTracks: 0,
    approvedTracks: 0,
    rejectedTracks: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<any>(null);
  const [adminNotices, setAdminNotices] = useState<any[]>([]);
  
  // Payout form state
  const [payoutForm, setPayoutForm] = useState({
    full_name: '',
    email: '',
    country: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    swift_code: '',
    iban: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    console.log("Dashboard: Starting user data load...");
    try {
      // Check for admin impersonation
      const urlParams = new URLSearchParams(window.location.search);
      const impersonateUuid = urlParams.get('impersonate');
      const adminSession = localStorage.getItem('adminSession');
      
      let currentUserData = await auth.getUser();
      let effectiveUserUuid = currentUserData?.userUuid;
      
      // Retry logic for auth.getUser() - it might take a moment to persist
      let retries = 0;
      while ((!currentUserData || !currentUserData.userUuid) && retries < 3) {
        console.log(`Dashboard: Retry ${retries + 1} - auth.getUser() returned no data, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        currentUserData = await auth.getUser();
        effectiveUserUuid = currentUserData?.userUuid;
        retries++;
      }
      
      console.log("Dashboard: Current user data after retries:", currentUserData);
      console.log("Dashboard: Effective user UUID:", effectiveUserUuid);
      
      // If admin is impersonating a user, get the impersonated user's data
      if (impersonateUuid && adminSession) {
        console.log("Dashboard: Admin impersonation detected", impersonateUuid);
        setIsImpersonating(true);
        const adminInfo = JSON.parse(adminSession);
        console.log("Dashboard: Admin info", adminInfo);
        
        // Get the impersonated user's artist data
        const impersonatedArtists = await db.query("artists", { user_uuid: `eq.${impersonateUuid}` });
        if (impersonatedArtists.length > 0) {
          const impersonatedUser = {
            ...currentUserData,
            userUuid: impersonateUuid,
            email: impersonatedArtists[0].email || currentUserData.email,
            artist_name: impersonatedArtists[0].artist_name
          };
          currentUserData = impersonatedUser;
          effectiveUserUuid = impersonateUuid;
          console.log("Dashboard: Using impersonated user data:", impersonatedUser);
        }
        
        // Show impersonation banner
        toast.success(`Admin logged in as user`, {
          description: `Logged in as ${currentUserData?.email || 'user'}. Click 'Return to Admin' to go back.`,
          duration: 5000
        });
      }
      
      if (!currentUserData || !currentUserData.userUuid) {
        console.log("Dashboard: No user found after retries, redirecting to signin");
        toast.error("Please sign in to access your dashboard");
        // Use window.location for hard redirect
        window.location.href = "/signin";
        return;
      }
      
      console.log("Dashboard: User authenticated, loading data for:", currentUserData.email);
      setCurrentUser(currentUserData);

      // Check if user is admin (but don't show admin functions when impersonating)
      // This check needs to happen BEFORE artist data loading, since admin users might not have artist records
      const userMetadata = currentUserData.appMetadata || {};
      const userEmail = currentUserData.email || '';
      
      // Use the local isImpersonatingCheck variable instead of relying on potentially stale state
      const isImpersonatingCheck = !!(impersonateUuid && adminSession);
      
      // Multiple admin detection methods for robustness
      const isAdminCheck = !isImpersonatingCheck && (
        // Method 1: Check user metadata role
        userMetadata.role === 'admin' ||
        // Method 2: Check specific admin email
        userEmail === 'info@unionmusicgroup.co.uk' ||
        // Method 3: Check if user has admin groups
        (currentUserData.groups && currentUserData.groups.some((g: any) => 
          g.key === 'tenant_admin' || g.key === 'admins' || g.key === 'admin'
        ))
      );
      
      setIsAdmin(isAdminCheck);
      
      console.log("Dashboard: Admin status:", isAdminCheck);
      console.log("Dashboard: User metadata:", userMetadata);
      console.log("Dashboard: User email:", userEmail);
      console.log("Dashboard: User groups:", currentUserData.groups);
      console.log("Dashboard: Admin check details:", {
        isImpersonatingCheck,
        userRole: userMetadata.role,
        email: userEmail,
        hasGroups: !!currentUserData.groups,
        groupKeys: currentUserData.groups?.map((g: any) => g.key),
        isAdminCheck,
        allChecks: {
          metadataRole: userMetadata.role === 'admin',
          emailMatch: userEmail === 'info@unionmusicgroup.co.uk',
          hasAdminGroups: currentUserData.groups?.some((g: any) => 
            g.key === 'tenant_admin' || g.key === 'admins' || g.key === 'admin'
          )
        }
      });
      
      // DEBUG: Log when we're in impersonation mode but admin check might be wrong
      if (isImpersonatingCheck && isAdminCheck) {
        console.error("⚠️ WARNING: isImpersonatingCheck=true but isAdminCheck=true - Admin Panel will show incorrectly!");
        console.error("This is the bug causing the admin panel to appear during impersonation");
      }
      
      // Force admin access for debugging if all checks fail but email matches
      // IMPORTANT: Skip this during impersonation to prevent admin panel from showing
      if (!isAdminCheck && userEmail === 'info@unionmusicgroup.co.uk' && !isImpersonatingCheck) {
        console.warn("Forcing admin access due to email match");
        setIsAdmin(true);
      }

      const artists = await db.query("artists", { user_uuid: `eq.${effectiveUserUuid}` });
      console.log("Dashboard: Found artists:", artists.length);
      
      if (artists.length > 0) {
        setArtist(artists[0]);
        
        // Load payout settings and history
        const [payoutSettingsData, payoutHistoryData] = await Promise.all([
          db.query("payout_settings", { user_uuid: `eq.${effectiveUserUuid}` }),
          db.query("payout_requests", { user_uuid: `eq.${effectiveUserUuid}` })
        ]);
        
        if (payoutSettingsData.length > 0) {
          setPayoutSettings(payoutSettingsData[0]);
          // Pre-fill form with saved settings
          setPayoutForm({
            full_name: payoutSettingsData[0].default_full_name || '',
            email: payoutSettingsData[0].payout_email || currentUserData.email,
            country: payoutSettingsData[0].default_country || '',
            bank_name: payoutSettingsData[0].default_bank_name || '',
            account_number: payoutSettingsData[0].default_account_number || '',
            routing_number: payoutSettingsData[0].default_routing_number || '',
            swift_code: payoutSettingsData[0].default_swift_code || '',
            iban: payoutSettingsData[0].default_iban || '',
            amount: '',
            notes: ''
          });
        }
          setPayoutHistory(payoutHistoryData);
          
          // Load admin notices for the current user
          try {
            const notices = await db.query("admin_notices", { 
              user_uuid: `eq.${effectiveUserUuid}`,
              is_read: `eq.0` 
            });
            // Filter out expired notices and global notices (user_uuid is null)
            const validNotices = notices.filter((notice: any) => {
              // Include if user_uuid matches or if it's a global notice (user_uuid is null)
              const isForThisUser = notice.user_uuid === effectiveUserUuid || !notice.user_uuid;
              // Check expiration
              const notExpired = !notice.expires_at || new Date(notice.expires_at) > new Date();
              return isForThisUser && notExpired;
            });
            setAdminNotices(Array.isArray(validNotices) ? validNotices : []);
          } catch (error) {
            console.error("Error loading admin notices:", error);
            setAdminNotices([]);
          }
        }

        const tracks = await db.query("tracks", { artist_uuid: `eq.${effectiveUserUuid}` });
        const royalties = await db.query("royalties", { artist_uuid: `eq.${effectiveUserUuid}` });
        
        // Load pay-as-you-go payment information
        const payments = await db.query("pay_as_you_go_payments", { 
          user_uuid: `eq.${effectiveUserUuid}`,
          payment_status: `eq.completed`
        });
        
        // Calculate available credits
        let availableCredits = 0;
        let totalCredits = 0;
        let usedCredits = 0;
        
        payments.forEach((payment: any) => {
          // Check if payment hasn't expired
          const now = Math.floor(Date.now() / 1000);
          if (!payment.expires_at || payment.expires_at > now) {
            const paymentCredits = payment.tracks_allowed - payment.tracks_used;
            availableCredits += paymentCredits;
            totalCredits += payment.tracks_allowed;
            usedCredits += payment.tracks_used;
          }
        });
        
        const hasSubscription = artist.package_type === 'sub';
        const hasCredits = availableCredits > 0;

      // Calculate user's actual earnings after splits
      const totalStreams = royalties.reduce((sum: number, r: any) => sum + (r.streams || 0), 0);
      const totalRevenue = royalties.reduce((sum: number, r: any) => {
        const userSplit = r.split_percentage || 100;
        const labelDeduction = r.label_share || 0;
        const effectiveSplit = userSplit - labelDeduction;
        const userRevenue = (r.revenue * effectiveSplit) / 100;
        return sum + userRevenue;
      }, 0);
      const activeReleases = tracks.filter((t: any) => t.status === "published").length;
      const pendingTracks = tracks.filter((t: any) => t.approval_status === "pending" || !t.approval_status).length;
      const approvedTracks = tracks.filter((t: any) => t.approval_status === "approved").length;
      const rejectedTracks = tracks.filter((t: any) => t.approval_status === "rejected").length;

      setStats({
        totalTracks: tracks.length,
        totalStreams,
        totalRevenue,
        activeReleases,
        pendingTracks,
        approvedTracks,
        rejectedTracks
      });
      
      // Update current user with credit information
      setCurrentUser({
        ...currentUserData,
        availableCredits,
        totalCredits,
        usedCredits,
        hasSubscription,
        hasCredits
      });
    } catch (error: any) {
      console.error("Dashboard: Error loading user data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
      
      // Check if this is an authentication error
      if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
        toast.error("Authentication failed. Please sign in again.");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 1000);
      } else {
        // For admin users, provide a better error message and suggest direct admin access
        const userEmail = currentUserData?.email || '';
        const isAdminUser = userEmail === 'info@unionmusicgroup.co.uk' || 
                           (currentUserData?.groups && currentUserData.groups.some((g: any) => 
                             g.key === 'tenant_admin' || g.key === 'admins' || g.key === 'admin'
                           ));
        
        if (isAdminUser) {
          toast.error("Dashboard data failed to load, but admin access is available. Go to /admin", {
            duration: 6000,
            description: "Admin panel access is still available via direct URL"
          });
        } else {
          toast.error("Failed to load dashboard data. Please refresh the page.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/");
  };

  const handlePayoutSubmit = async () => {
    if (!currentUser || !artist) return;

    // Validation
    const amount = parseFloat(payoutForm.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      toast.error('Minimum payout amount is $50.00');
      return;
    }

    if (amount > stats.totalRevenue) {
      toast.error('Requested amount exceeds your available balance');
      return;
    }

    if (!payoutForm.full_name || !payoutForm.email || !payoutForm.country || !payoutForm.bank_name || !payoutForm.account_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Country-specific validation
    if (payoutForm.country === 'us' && !payoutForm.routing_number) {
      toast.error('Routing number is required for US bank accounts');
      return;
    }

    // IBAN is recommended but not strictly required for international accounts
    // Allow submission without IBAN but show a warning toast
    if (payoutForm.country !== 'us' && !payoutForm.iban) {
      console.warn('International account submitted without IBAN');
      toast('IBAN is recommended for faster international payments, but not required', {
        description: 'Your payout will be processed using the provided bank details',
        duration: 4000
      });
    }

    setPayoutLoading(true);

    try {
      // Create payout request
      await db.insert('payout_requests', {
        user_uuid: currentUser.userUuid,
        artist_uuid: artist.user_uuid,
        full_name: payoutForm.full_name,
        email: payoutForm.email,
        country: payoutForm.country,
        bank_name: payoutForm.bank_name,
        account_number: payoutForm.account_number,
        routing_number: payoutForm.routing_number,
        swift_code: payoutForm.swift_code,
        iban: payoutForm.iban,
        amount: amount,
        status: 'pending',
        requested_at: Math.floor(Date.now() / 1000),
        notes: payoutForm.notes
      });

      // Save/update payout settings for future use
      const settingsData = {
        user_uuid: currentUser.userUuid,
        artist_uuid: artist.user_uuid,
        default_full_name: payoutForm.full_name,
        payout_email: payoutForm.email,
        default_country: payoutForm.country,
        default_bank_name: payoutForm.bank_name,
        default_account_number: payoutForm.account_number,
        default_routing_number: payoutForm.routing_number,
        default_swift_code: payoutForm.swift_code,
        default_iban: payoutForm.iban
      };

      if (payoutSettings) {
        await db.update('payout_settings', { user_uuid: `eq.${currentUser.userUuid}` }, settingsData);
      } else {
        await db.insert('payout_settings', settingsData);
      }

      // Send confirmation email to both user and admin
      try {
        await functions.post('send-payout-confirmation', {
          payoutData: {
            amount: amount,
            full_name: payoutForm.full_name,
            email: payoutForm.email,
            status: 'pending'
          },
          requestData: {
            full_name: payoutForm.full_name,
            email: payoutForm.email,
            country: payoutForm.country,
            bank_name: payoutForm.bank_name,
            account_number: payoutForm.account_number,
            routing_number: payoutForm.routing_number,
            swift_code: payoutForm.swift_code,
            iban: payoutForm.iban,
            amount: amount,
            notes: payoutForm.notes,
            user_uuid: currentUser.userUuid,
            artist_uuid: artist.user_uuid
          }
        });
        console.log('Payout notifications sent successfully');
      } catch (emailError) {
        console.error('Failed to send payout emails:', emailError);
      }

      toast.success(`Payout request of $${amount.toFixed(2)} submitted successfully!`, {
        description: 'Your request has been submitted and will be processed within 3-5 business days.',
        duration: 5000
      });

      // Reset form
      setPayoutForm({
        ...payoutForm,
        amount: '',
        notes: ''
      });
      setShowPayoutForm(false);

      // Reload data to update payout history
      await loadUserData();
    } catch (error: any) {
      console.error('Error submitting payout request:', error);
      toast.error(error.message || 'Failed to submit payout request');
    } finally {
      setPayoutLoading(false);
    }
  };

  const getCountryBankFields = () => {
    switch (payoutForm.country) {
      case 'us':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="routing_number" className="text-purple-200">Routing Number *</Label>
              <Input
                id="routing_number"
                placeholder="9-digit routing number"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.routing_number}
                onChange={(e) => setPayoutForm({ ...payoutForm, routing_number: e.target.value })}
                maxLength={9}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number" className="text-purple-200">Account Number *</Label>
              <Input
                id="account_number"
                placeholder="Bank account number"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.account_number}
                onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })}
              />
            </div>
          </>
        );
      case 'uk':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="swift_code" className="text-purple-200">SWIFT/BIC Code *</Label>
              <Input
                id="swift_code"
                placeholder="8 or 11 character SWIFT code"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.swift_code}
                onChange={(e) => setPayoutForm({ ...payoutForm, swift_code: e.target.value.toUpperCase() })}
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number" className="text-purple-200">Account Number *</Label>
              <Input
                id="account_number"
                placeholder="8-digit account number"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.account_number}
                onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })}
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_code" className="text-purple-200">Sort Code</Label>
              <Input
                id="sort_code"
                placeholder="6-digit sort code"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.routing_number}
                onChange={(e) => setPayoutForm({ ...payoutForm, routing_number: e.target.value })}
                maxLength={6}
              />
            </div>
          </>
        );
      case 'eu':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="iban" className="text-purple-200">IBAN (Recommended)</Label>
              <Input
                id="iban"
                placeholder="International Bank Account Number"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.iban}
                onChange={(e) => setPayoutForm({ ...payoutForm, iban: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swift_code" className="text-purple-200">SWIFT/BIC Code *</Label>
              <Input
                id="swift_code"
                placeholder="8 or 11 character SWIFT code"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.swift_code}
                onChange={(e) => setPayoutForm({ ...payoutForm, swift_code: e.target.value.toUpperCase() })}
                maxLength={11}
              />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="iban" className="text-purple-200">IBAN (Recommended)</Label>
              <Input
                id="iban"
                placeholder="International Bank Account Number"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.iban}
                onChange={(e) => setPayoutForm({ ...payoutForm, iban: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swift_code" className="text-purple-200">SWIFT/BIC Code (Recommended)</Label>
              <Input
                id="swift_code"
                placeholder="8 or 11 character SWIFT code"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={payoutForm.swift_code}
                onChange={(e) => setPayoutForm({ ...payoutForm, swift_code: e.target.value.toUpperCase() })}
                maxLength={11}
              />
            </div>
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Your Dashboard</h2>
          <p className="text-purple-300">Please wait while we load your music distribution data...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {whiteLabelBranding?.logo_path ? (
                  <img src={whiteLabelBranding.logo_path} alt="Logo" className="w-5 h-5 rounded" />
                ) : (
                  <Music className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-xl font-bold text-white">
                {whiteLabelBranding?.name || 'Union Music Group'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/profile">
                <Button variant="ghost" className="text-purple-300 hover:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-red-300 hover:text-red-200">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className="text-purple-300 hover:text-white"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Impersonation Banner */}
      {isImpersonating && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-red-600 to-orange-600 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-white font-medium">
                  Admin Impersonation Mode: Viewing as {currentUser?.email}
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  localStorage.removeItem('adminSession');
                  window.location.href = '/admin';
                }}
                className="bg-white text-red-600 hover:bg-white/90"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Return to Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className={isImpersonating ? "pt-36 pb-12 px-4 sm:px-6 lg:px-8" : "pt-24 pb-12 px-4 sm:px-6 lg:px-8"}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">
                Dashboard
              </h1>
              {artist?.package_type === 'sub' && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Subscription
                </Badge>
              )}
              {artist?.package_type === 'free' && (
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Free Plan
                </Badge>
              )}
            </div>
          </div>

          {/* Admin Notices Section - Clean notice cards only */}
          {adminNotices.length > 0 && (
            <div className="mb-6">
              {/* Hide any legacy notice headers via inline style for cache busting */}
              <style>{`h2:has(+ .space-y-3) { display: none !important; }`}</style>
              <div className="space-y-3" key="notices-container-v2">
                {adminNotices.map((notice) => (
                  <Card key={notice._row_id} className={`p-4 border-l-4 ${
                    notice.notice_type === 'urgent' ? 'bg-red-950/30 border-red-500' :
                    notice.notice_type === 'warning' ? 'bg-yellow-950/30 border-yellow-500' :
                    notice.notice_type === 'success' ? 'bg-green-950/30 border-green-500' :
                    'bg-blue-950/30 border-blue-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            notice.notice_type === 'urgent' ? 'bg-red-500/20 text-red-300' :
                            notice.notice_type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                            notice.notice_type === 'success' ? 'bg-green-500/20 text-green-300' :
                            'bg-blue-500/20 text-blue-300'
                          }>
                            {notice.notice_type?.toUpperCase()}
                          </Badge>
                          {notice.expires_at && (
                            <span className="text-xs text-slate-400">
                              Expires: {new Date(notice.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-white">{notice.notice}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await db.update('admin_notices', { _row_id: `eq.${notice._row_id}` }, { is_read: 1 });
                            setAdminNotices(adminNotices.filter(n => n._row_id !== notice._row_id));
                          } catch (error) {
                            console.error('Error marking notice as read:', error);
                          }
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!artist && (
            <Card className="bg-purple-950/30 border-purple-500/20 p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-2">Complete Your Profile</h3>
              <p className="text-purple-300 mb-4">Set up your artist profile to start distributing your music.</p>
              <Link to={isImpersonating ? `/profile?impersonate=${currentUser?.userUuid}` : "/profile"}>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Complete Profile
                </Button>
              </Link>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Music className="w-6 h-6 text-purple-400" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-300">Total</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalTracks}</div>
              <div className="text-sm text-purple-300">Tracks Uploaded</div>
            </Card>

            <Card className="bg-yellow-950/30 border-yellow-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300">Pending</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.pendingTracks}</div>
              <div className="text-sm text-purple-300">Awaiting Review</div>
            </Card>

            <Card className="bg-green-950/30 border-green-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <Badge className="bg-green-500/20 text-green-300">Approved</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.approvedTracks}</div>
              <div className="text-sm text-purple-300">Ready for Distribution</div>
            </Card>

            <Card className="bg-red-950/30 border-red-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <Badge className="bg-red-500/20 text-red-300">Needs Work</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.rejectedTracks}</div>
              <div className="text-sm text-purple-300">Require Updates</div>
            </Card>
          </div>

          {/* Status Overview Section */}
          {(stats.pendingTracks > 0 || stats.approvedTracks > 0 || stats.rejectedTracks > 0) && (
            <Card className="bg-slate-900/50 border-purple-500/20 p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Track Status Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.pendingTracks > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-yellow-300 font-medium">Pending Review</h4>
                    </div>
                    <p className="text-white text-2xl font-bold">{stats.pendingTracks}</p>
                    <p className="text-purple-300 text-sm">tracks awaiting admin review</p>
                  </div>
                )}
                {stats.approvedTracks > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-400" />
                      <h4 className="text-green-300 font-medium">Approved</h4>
                    </div>
                    <p className="text-white text-2xl font-bold">{stats.approvedTracks}</p>
                    <p className="text-purple-300 text-sm">ready for distribution</p>
                  </div>
                )}
                {stats.rejectedTracks > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <X className="w-5 h-5 text-red-400" />
                      <h4 className="text-red-300 font-medium">Needs Updates</h4>
                    </div>
                    <p className="text-white text-2xl font-bold">{stats.rejectedTracks}</p>
                    <p className="text-purple-300 text-sm">require corrections</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Pay-As-You-Go Credit Status for non-subscription users */}
          {artist && artist.package_type !== 'sub' && (
            <Card className="bg-gradient-to-br from-blue-950/50 to-slate-950/50 border-blue-500/20 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Upload Credits</h3>
                    <p className="text-purple-300 text-sm">Pay-as-you-go upload status</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-300">
                    {(() => {
                      // Calculate available credits (this will be updated by useEffect)
                      const availableCredits = currentUser?.availableCredits || 0;
                      const totalCredits = currentUser?.totalCredits || 0;
                      return `${availableCredits}/${totalCredits}`;
                    })()}
                  </div>
                  <div className="text-sm text-purple-300">credits available</div>
                </div>
              </div>
              
              {/* Credit usage warning */}
              {currentUser?.availableCredits === 0 && currentUser?.totalCredits > 0 && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-red-300 text-sm">
                      <span className="font-medium">All credits used!</span> Purchase additional releases or subscribe to continue uploading.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Low credit warning */}
              {currentUser?.availableCredits > 0 && currentUser?.availableCredits <= 2 && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <p className="text-yellow-300 text-sm">
                      <span className="font-medium">Low credits!</span> You have {currentUser?.availableCredits} upload credit(s) remaining.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Link 
              to={isImpersonating ? `/upload?impersonate=${currentUser?.userUuid}` : "/upload"} 
              className="block"
              onClick={(e) => {
                // Block navigation if user has no credits and no subscription
                if (!currentUser?.hasSubscription && currentUser?.availableCredits === 0) {
                  e.preventDefault();
                  toast.error("No upload credits available. Please purchase additional releases or subscribe to continue.", {
                    duration: 5000
                  });
                  // Navigate to plans page
                  window.location.href = "/plans";
                }
              }}
            >
              <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-6 hover:border-purple-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Music</h3>
                <p className="text-purple-300">Upload new tracks and distribute to streaming platforms</p>
              </Card>
            </Link>

            <Link to={isImpersonating ? `/tracks?impersonate=${currentUser?.userUuid}` : "/tracks"} className="block">
              <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-6 hover:border-purple-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Music className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Manage Tracks</h3>
                <p className="text-purple-300">View your tracks and check approval status</p>
              </Card>
            </Link>

            {/* Admin Panel Card - Only visible to admin users */}
            {isAdmin && (
              <Link to="/admin" className="block">
                <Card className="bg-gradient-to-br from-red-950/50 to-slate-950/50 border-red-500/20 p-6 hover:border-red-500/40 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Admin Panel</h3>
                  <p className="text-purple-300">Manage users, analytics, and platform settings</p>
                  <div className="mt-2 text-xs text-red-400">
                    ✓ Admin Access Verified
                  </div>
                </Card>
              </Link>
            )}
            
            {/* Debug info for admin status */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-xs font-mono">
                  DEBUG: isAdmin={isAdmin ? 'true' : 'false'}, email={currentUser?.email}
                </p>
              </div>
            )}

            {/* Upgrade Plan Card */}
            <div className="md:col-span-2">
              <Card 
                className="bg-gradient-to-br from-yellow-950/50 to-slate-950/50 border-yellow-500/20 p-6 hover:border-yellow-500/40 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => setShowUpgradeModal(true)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Upgrade Your Plan</h3>
                        <p className="text-purple-300 text-sm">Pay As You Go ($2.99) or Subscription plans available</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-purple-300">Pay As You Go $2.99</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-purple-300">3 Subscription Plans</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span className="text-purple-300">PayPal Payment</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-purple-300 text-sm">From $2.99</span>
                    <Crown className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
              </Card>

              <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onSubscribe={(planType) => {
                  console.log('User subscribed to:', planType);
                  // The modal already handles the PayPal redirect
                }}
              />
            </div>


            <Link to={isImpersonating ? `/profile?impersonate=${currentUser?.userUuid}` : "/profile"} className="block">
              <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-6 hover:border-purple-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Profile Settings</h3>
                <p className="text-purple-300">Update your artist profile and preferences</p>
              </Card>
            </Link>

            <Link to={isImpersonating ? `/royalties?impersonate=${currentUser?.userUuid}` : "/royalties"} className="block">
              <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-6 hover:border-purple-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">View Royalties</h3>
                <p className="text-purple-300">Track your earnings and royalty reports</p>
              </Card>
            </Link>

          {/* Payout Section */}
          <Card className="bg-gradient-to-br from-green-950/50 to-slate-950/50 border-green-500/20 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Payout & Earnings</h3>
                  <p className="text-purple-300 text-sm">Withdraw your royalties when you reach $50</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-300">${stats.totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-purple-300">Available Balance</div>
              </div>
            </div>

            {stats.totalRevenue >= 50 ? (
              <div className="space-y-4">
                {!showPayoutForm ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">You're eligible for payout!</p>
                        <p className="text-purple-300 text-sm">Minimum threshold of $50.00 reached</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowPayoutForm(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Banknote className="w-4 h-4 mr-2" />
                      Request Payout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Payout Form */}
                    <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-green-400" />
                          Payout Request Form
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPayoutForm(false)}
                          className="text-purple-300 hover:text-white"
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-purple-200">Full Legal Name *</Label>
                          <Input
                            id="full_name"
                            placeholder="John Doe"
                            className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                            value={payoutForm.full_name}
                            onChange={(e) => setPayoutForm({ ...payoutForm, full_name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-purple-200">Email for Payout Confirmation *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="payout@example.com"
                            className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                            value={payoutForm.email}
                            onChange={(e) => setPayoutForm({ ...payoutForm, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-purple-200">Bank Country *</Label>
                          <select
                            id="country"
                            className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/40"
                            value={payoutForm.country}
                            onChange={(e) => setPayoutForm({ ...payoutForm, country: e.target.value })}
                          >
                            <option value="">Select your country</option>
                            <option value="us">United States (USD)</option>
                            <option value="uk">United Kingdom (GBP)</option>
                            <option value="eu">European Union (EUR)</option>
                            <option value="ca">Canada (CAD)</option>
                            <option value="au">Australia (AUD)</option>
                            <option value="other">Other Countries</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-purple-200">Withdrawal Amount *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">$</span>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              min="50"
                              max={stats.totalRevenue}
                              placeholder="50.00"
                              className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50 pl-7"
                              value={payoutForm.amount}
                              onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                            />
                          </div>
                          <p className="text-xs text-purple-400">Available: ${stats.totalRevenue.toFixed(2)} | Minimum: $50.00</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bank_name" className="text-purple-200">Bank Name *</Label>
                          <Input
                            id="bank_name"
                            placeholder="Your bank name"
                            className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                            value={payoutForm.bank_name}
                            onChange={(e) => setPayoutForm({ ...payoutForm, bank_name: e.target.value })}
                          />
                        </div>

                        {/* Country-specific fields */}
                        {payoutForm.country && getCountryBankFields()}

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                            <div className="text-sm text-blue-200">
                              <p className="font-semibold mb-1">Bank Requirements:</p>
                              <ul className="space-y-1 text-xs">
                                <li>• <strong>US:</strong> Routing number required</li>
                                <li>• <strong>International:</strong> IBAN recommended (not required)</li>
                                <li>• <strong>SWIFT/BIC:</strong> Required for international transfers</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="notes" className="text-purple-200">Additional Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any additional information for your payout..."
                            className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50 min-h-20"
                            value={payoutForm.notes}
                            onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                          <div className="text-sm text-blue-200">
                            <p className="font-semibold mb-1">Payout Information:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• Processing time: 3-5 business days</li>
                              <li>• Minimum withdrawal: $50.00</li>
                              <li>• Confirmation email will be sent to: {payoutForm.email}</li>
                              <li>• Bank details are securely stored for future payouts</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={handlePayoutSubmit}
                          disabled={payoutLoading}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          {payoutLoading ? 'Processing...' : `Withdraw $${payoutForm.amount || '0.00'}`}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowPayoutForm(false)}
                          className="text-purple-300 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Minimum threshold not reached</p>
                    <p className="text-purple-300 text-sm">You need $50.00 to request a payout. Current balance: ${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payout History */}
            {payoutHistory.length > 0 && (
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Recent Payout Requests</h4>
                <div className="space-y-2">
                  {payoutHistory.slice(0, 3).map((payout: any) => (
                    <div key={payout._row_id} className="bg-slate-800/30 border border-purple-500/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            payout.status === 'approved' ? 'bg-green-500/20' :
                            payout.status === 'pending' ? 'bg-yellow-500/20' :
                            'bg-red-500/20'
                          }`}>
                            {payout.status === 'approved' ? <Check className="w-4 h-4 text-green-400" /> :
                             payout.status === 'pending' ? <Clock className="w-4 h-4 text-yellow-400" /> :
                             <X className="w-4 h-4 text-red-400" />}
                          </div>
                          <div>
                            <p className="text-white font-medium">${payout.amount.toFixed(2)}</p>
                            <p className="text-purple-300 text-xs">{new Date(payout.requested_at * 1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={
                          payout.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                          payout.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }>
                          {payout.status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;