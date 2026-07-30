import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Music, ArrowLeft, Users, Check, Clock, Download, Edit, Upload, DollarSign, Crown, Lock, Mail, UserPlus, Key, Shield, Copy, AlertCircle, X, RefreshCw, Trash2, Info, User, Eye, Building2, Plus, Save, Loader2, Link as LinkIcon, BarChart3, ChevronLeft, ChevronRight, Album } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";
import db from "@/lib/shared/kliv-database.js";
import { content } from "@/lib/shared/kliv-content.js";
import functions from "@/lib/shared/kliv-functions.js";
import AdminTrackPlayer from "@/components/AdminTrackPlayer";

const Admin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<any>('dashboard');
  const [editingUserPackage, setEditingUserPackage] = useState<any>(null);
  const [editingUserManual, setEditingUserManual] = useState<any>(null);
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [manualUserEdit, setManualUserEdit] = useState({
    label_name: '',
    admin_notes: '',
    custom_status: ''
  });
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [pendingTracks, setPendingTracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [royaltyFile, setRoyaltyFile] = useState<File | null>(null);
  const [royaltyUploadStatus, setRoyaltyUploadStatus] = useState<string>('');
  const [editingRoyalty, setEditingRoyalty] = useState<any>(null);
  const [allRoyalties, setAllRoyalties] = useState<any[]>([]);
  
  // Pagination states
  const [usersPagination, setUsersPagination] = useState({ currentPage: 1, itemsPerPage: 10 });
  const [tracksPagination, setTracksPagination] = useState({ currentPage: 1, itemsPerPage: 10 });
  const [payoutsPagination, setPayoutsPagination] = useState({ currentPage: 1, itemsPerPage: 10 });
  const [royaltiesPagination, setRoyaltiesPagination] = useState({ currentPage: 1, itemsPerPage: 10 });
  
  // Payout request states
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  
  // Force re-render state - incremented to trigger UI refresh
  const [dataLoadVersion, setDataLoadVersion] = useState(0);
  
  // Invite user states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePackage, setInvitePackage] = useState<'free' | 'sub'>('free');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  
  // Manual account setup states
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualPackage, setManualPackage] = useState<'free' | 'sub'>('free');
  const [manualLoading, setManualLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  // Storage management states
  const [storageTracks, setStorageTracks] = useState<any[]>([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [deletionProgress, setDeletionProgress] = useState<string>('');
  const [storageStats, setStorageStats] = useState({
    totalTracks: 0,
    approvedTracks: 0,
    tracksWithAudio: 0,
    tracksWithoutAudio: 0,
    estimatedSavings: 0
  });
  
  // Quick royalty entry states
  const [quickRoyalty, setQuickRoyalty] = useState({
    artist_email: '',
    artist_name: '',
    track_title: '',
    platform: '',
    streams: 0,
    revenue: 0,
    currency: 'USD',
    month: new Date().toLocaleString('default', { month: 'long' }).toLowerCase(),
    year: new Date().getFullYear(),
    country: 'US',
    notes: ''
  });
  const [quickRoyaltyLoading, setQuickRoyaltyLoading] = useState(false);
  const [recentQuickEntries, setRecentQuickEntries] = useState<any[]>([]);
  
  // Pay As You Go management states
  const [payAsYouGoForm, setPayAsYouGoForm] = useState({
    userEmail: '',
    paymentType: '',
    paymentId: '',
    amount: 0
  });
  const [allocateCreditsLoading, setAllocateCreditsLoading] = useState(false);
  const [recentCreditAllocations, setRecentCreditAllocations] = useState<any[]>([]);
  
  // White label management states
  const [whiteLabels, setWhiteLabels] = useState<any[]>([]);
  const [selectedWhiteLabel, setSelectedWhiteLabel] = useState<any>(null);
  const [showWhiteLabelForm, setShowWhiteLabelForm] = useState(false);
  const [isEditingWhiteLabel, setIsEditingWhiteLabel] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [whiteLabelForm, setWhiteLabelForm] = useState({
    name: '',
    contact_email: '',
    company_name: '',
    logo_path: '',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    support_email: ''
  });
  
  // User migration states
  const [showMigrationForm, setShowMigrationForm] = useState(false);
  const [migrationMethod, setMigrationMethod] = useState<'manual' | 'csv' | 'api'>('manual');
  const [manualMigration, setManualMigration] = useState({
    email: '',
    firstName: '',
    lastName: '',
    artistName: '',
    packageType: 'free' as 'free' | 'sub',
    sendWelcome: true
  });
  const [csvMigrationFile, setCsvMigrationFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [] as string[]
  });
  
  const [domainSetup, setDomainSetup] = useState({
    custom_domain: '',
    cname_target: 'sites.kliv.dev',
    white_label_id: ''
  });
  const [subAdminForm, setSubAdminForm] = useState({
    user_email: '',
    user_name: '',
    role: 'sub_admin',
    permissions: ''
  });
  
  // Link trees management states
  const [linkTrees, setLinkTrees] = useState<any[]>([]);
  const [selectedLinkTree, setSelectedLinkTree] = useState<any>(null);
  const [showLinkTreeForm, setShowLinkTreeForm] = useState(false);
  const [isEditingLinkTree, setIsEditingLinkTree] = useState(false);
  const [linkTreeForm, setLinkTreeForm] = useState({
    title: '',
    description: '',
    artist_uuid: '',
    artist_name: '',
    type: 'general',
    custom_slug: '',
    theme_color: '#6366f1',
    profile_image: '',
    background_image: '',
    status: 'active'
  });
  const [linkTreeLinks, setLinkTreeLinks] = useState<any[]>([]);
  const [linkTreeLinkForm, setLinkTreeLinkForm] = useState({
    title: '',
    url: '',
    description: '',
    icon: '',
    order_index: 0,
    dsp_type: '',
    _row_id: ''
  });
  const [showAddCustomDSP, setShowAddCustomDSP] = useState(false);
  
  useEffect(() => {
    checkAdminAccess();

    // Set up periodic data refresh to ensure state stays current
    const refreshInterval = setInterval(async () => {
      if (isAdmin && currentUser) {
        console.log('Periodic data refresh triggered');
        try {
          await loadAdminData();
        } catch (error) {
          console.error('Periodic refresh failed:', error);
        }
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [isAdmin, currentUser]);

  // Load link trees when link-trees tab is activated
  useEffect(() => {
    if (activeTab === 'link-trees' && isAdmin) {
      loadLinkTrees();
    }
  }, [activeTab, isAdmin]);
  
  // Debug: Watch state changes
  useEffect(() => {
    console.log('State updated:', {
      usersCount: users.length,
      tracksCount: tracks.length,
      royaltiesCount: allRoyalties.length,
      payoutsCount: payoutRequests.length,
      isAdmin,
      loading,
      dataLoadVersion
    });
  }, [users, tracks, allRoyalties, payoutRequests, isAdmin, loading, dataLoadVersion]);

  // Load storage data when storage tab is activated
  useEffect(() => {
    if (activeTab === 'storage' && isAdmin) {
      loadStorageData();
    }
  }, [activeTab, isAdmin]);

  const checkAdminAccess = async () => {
    try {
      console.log('Checking admin access...');
      const user = await auth.getUser();
      if (!user) {
        console.log('No user found, redirecting to signin');
        toast.error('Please sign in to access the admin panel');
        navigate("/signin");
        return;
      }

      console.log('Current user authenticated:', {
        email: user.email,
        userUuid: user.userUuid,
        groups: user.groups?.length || 0,
        isPrimaryTeam: user.isPrimaryTeam
      });

      // Check if user is admin
      const userMetadata = user.appMetadata || {};
      const isAdmin = userMetadata.role === 'admin' || user.email === 'info@unionmusicgroup.co.uk';
      
      // Check if user has team-administrators group
      const hasTeamAdmin = user.groups?.some((g: any) => g.key === 'team-administrators');
      const hasCrossTeam = user.groups?.some((g: any) => g.key === 'cross-team-administrator');
      
      console.log('Admin access check:', {
        isAdmin,
        hasTeamAdmin,
        hasCrossTeam,
        userMetadata: userMetadata
      });
      
      if (!isAdmin && !hasTeamAdmin && !hasCrossTeam) {
        console.warn('User does not have admin access');
        toast.error('You do not have permission to access this admin panel');
        navigate("/dashboard");
        return;
      }

      console.log('Admin access granted');
      setCurrentUser(user);
      setIsAdmin(true);
      
      // Load admin data - don't revoke admin access on data load failure
      try {
        await loadAdminData();
      } catch (dataError: any) {
        console.error('Error loading admin data:', dataError);
        console.error('Error details:', {
          message: dataError.message,
          stack: dataError.stack,
          name: dataError.name
        });
        // Set loading to false even if data load failed, so panel shows
        setLoading(false);
        // Show a more helpful error message
        toast.error(`Admin data loading incomplete: ${dataError.message || 'Unknown error'}. Some features may not work correctly.`, {
          duration: 8000
        });
        // Don't revoke admin access - keep isAdmin=true so admin panel shows with partial data
      }
    } catch (error: any) {
      console.error("Error checking admin access:", error);
      toast.error('Authentication error. Please sign in again.');
      navigate("/signin");
    }
    // Note: setLoading(false) is now handled at the end of loadAdminData
  };

  // Generate 5-digit numeric user ID
  const generateFiveDigitUserId = () => {
    // Get existing user IDs to avoid collisions
    const existingIds = new Set();
    users.forEach((user: any) => {
      const match = user.userUuid?.match(/^(?:artist_)?(\d{5})$/);
      if (match) {
        existingIds.add(parseInt(match[1]));
      }
    });
    
    // Generate a random 5-digit number (10000-99999)
    let newId;
    do {
      newId = Math.floor(Math.random() * 90000) + 10000;
    } while (existingIds.has(newId));
    
    return newId.toString();
  };

  const loadAdminData = async () => {
    try {
      console.log('Starting admin data load...');
      console.log('Current state before load:', {
        usersCount: users.length,
        tracksCount: tracks.length,
        royaltiesCount: allRoyalties.length,
        payoutsCount: payoutRequests.length
      });
      
      // Test database connection first (non-blocking)
      try {
        console.log('Testing database connection...');
        const tables = await db.listTables();
        console.log('Database connection working! Available tables:', tables);
        
        // Test a simple query to see if we get results
        console.log('Testing simple query on artists table...');
        const testQuery = await db.query("artists", {});
        console.log('Test query results:', {
          resultCount: testQuery.length,
          firstRow: testQuery[0] || 'No results',
          queryType: 'simple_query_all'
        });
        
      } catch (testError: any) {
        console.warn('Database connection test had issues (continuing anyway):', testError.message);
        // Don't throw error - let the actual queries handle connection issues
      }
      
      // Load all artists (existing artist profiles) - this is our primary data source
      let allArtists = [];
      try {
        console.log('Attempting to load artists from database...');
        allArtists = await db.query("artists", {});
        console.log('Artists from database:', allArtists.length);
        console.log('Database artists:', allArtists.map((a: any) => `${a.email} - ${a.artist_name}`));
        
        // Debug: Check if we got data
        if (allArtists.length === 0) {
          console.warn('No artists returned from database query');
          console.log('Checking if database connection is working...');
          
          // Try a simple count query
          try {
            const countResult = await db.query("artists", { select: "count" });
            console.log('Artists count result:', countResult);
          } catch (countError) {
            console.error('Count query failed:', countError);
          }
        }
      } catch (dbError: any) {
        console.error('Error loading artists from database:', dbError);
        console.error('Error details:', {
          message: dbError.message,
          stack: dbError.stack,
          name: dbError.name
        });
        toast.error('Failed to load artists from database');
        throw dbError; // This is critical, so throw the error
      }
      
      // Load all auth users (this includes users who haven't created artist profiles yet)
      let authUsers = [];
      try {
        const authUserList = await auth.listUsers();
        authUsers = authUserList || [];
        console.log('Auth users loaded:', authUsers.length);
      } catch (authError: any) {
        console.warn('Auth users loading failed, using database artists only:', authError);
        console.log('Continuing with database artists as primary data source...');
        // Continue with empty array if auth fails - we'll use database artists as primary
        authUsers = [];
      }
      
      // Create a set of seen emails to avoid duplicates
      const seenEmails = new Set();
      const mergedUsers: any[] = [];
      
      // First, process database artists (primary data source)
      if (Array.isArray(allArtists)) {
        allArtists.forEach((artist: any) => {
          if (!artist.email || seenEmails.has(artist.email)) return;
          
          seenEmails.add(artist.email);
          mergedUsers.push({
            _row_id: artist._row_id,
            email: artist.email,
            artist_name: artist.artist_name || 'Unknown Artist',
            package_type: artist.package_type || 'free',
            label_name: artist.label_name || 'Union Music Group Ltd',
            label_name_locked: artist.label_name_locked || false,
            account_status: artist.account_status || 'active',
            created_at: artist._created_at || new Date().toISOString(),
            profileCompleted: true,
            userUuid: artist.user_uuid || generateFiveDigitUserId(),
            enabled: artist.account_status !== 'blocked',
            isAdmin: artist.email === 'info@unionmusicgroup.co.uk',
            admin_notes: artist.admin_notes || '',
            custom_status: artist.custom_status || ''
          });
        });
      }
      
      // Then, add any auth users that aren't in the database
      if (Array.isArray(authUsers)) {
        authUsers.forEach((authUser: any) => {
          if (!authUser.email || seenEmails.has(authUser.email)) return;
          
          seenEmails.add(authUser.email);
          mergedUsers.push({
            _row_id: authUser.userUuid,
            email: authUser.email,
            artist_name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'User',
            package_type: 'free',
            label_name: 'Union Music Group Ltd',
            label_name_locked: false,
            account_status: authUser.enabled ? 'active' : 'blocked',
            created_at: new Date().toISOString(),
            profileCompleted: false,
            userUuid: authUser.userUuid || generateFiveDigitUserId(),
            enabled: authUser.enabled !== false,
            isAdmin: authUser.email === 'info@unionmusicgroup.co.uk',
            admin_notes: '',
            custom_status: ''
          });
        });
      }
      
      // Sort users: admin first, then by created date
      if (Array.isArray(mergedUsers) && mergedUsers.length > 0) {
        mergedUsers.sort((a: any, b: any) => {
          if (a.isAdmin && !b.isAdmin) return -1;
          if (!a.isAdmin && b.isAdmin) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }
      
      setUsers(mergedUsers);
      
      console.log('Total merged users loaded:', mergedUsers.length);
      console.log('Users by package type:');
      const subCount = Array.isArray(mergedUsers) ? mergedUsers.filter((u: any) => u.package_type === 'sub').length : 0;
      const freeCount = Array.isArray(mergedUsers) ? mergedUsers.filter((u: any) => u.package_type === 'free').length : 0;
      console.log(`   - Subscription: ${subCount}`);
      console.log(`   - Free Plan: ${freeCount}`);
      
      console.log('Final user list:');
      if (Array.isArray(mergedUsers)) {
        mergedUsers.forEach((user: any, index: number) => {
          console.log(`   ${index + 1}. ${user.email} - ${user.artist_name} (${user.package_type}) - ${user.accountStatus} - Admin: ${user.isAdmin} - Profile: ${user.profileCompleted ? 'Yes' : 'No'}`);
        });
      }

      // Load all tracks
      let loadedTracks: any[] = [];
      try {
        const allTracks = await db.query("tracks", {});
        loadedTracks = Array.isArray(allTracks) ? allTracks : [];
        setTracks(loadedTracks);
        console.log('Tracks loaded:', loadedTracks.length);
      } catch (trackError: any) {
        console.error('Error loading tracks:', trackError);
        setTracks([]);
        // Don't show toast for this error - it's not critical
      }
      
      // Load all royalties and enrich with artist names
      try {
        const allRoyalties = await db.query("royalties", {});
        
        // Enrich royalties with artist names
        const enrichedRoyalties = await Promise.all(
          (Array.isArray(allRoyalties) ? allRoyalties : []).map(async (royalty: any) => {
            try {
              // Look up artist name from artists table
              const artists = await db.query("artists", { user_uuid: `eq.${royalty.artist_uuid}` });
              const artistName = artists.length > 0 ? artists[0].artist_name : 'Unknown';
              
              return {
                ...royalty,
                artist_name: artistName
              };
            } catch (error) {
              console.error('Error enriching royalty:', royalty, error);
              return {
                ...royalty,
                artist_name: 'Unknown'
              };
            }
          })
        );
        
        setAllRoyalties(enrichedRoyalties);
        console.log('Royalties loaded and enriched:', enrichedRoyalties.length);
      } catch (royaltyError: any) {
        console.error('Error loading royalties:', royaltyError);
        setAllRoyalties([]);
        // Don't show toast for this error - it's not critical
      }
      
      // Load all payout requests
      try {
        console.log('Attempting to load payout requests from database...');
        const allPayouts = await db.query("payout_requests", {});
        setPayoutRequests(allPayouts);
        console.log('Payout requests loaded:', allPayouts.length);
        
        if (allPayouts.length === 0) {
          console.warn('No payout requests returned from database query');
          console.log('Checking payout requests with debug query...');
          
          // Try a simple count query
          try {
            const countResult = await db.query("payout_requests", { select: "count" });
            console.log('Payout requests count result:', countResult);
          } catch (countError) {
            console.error('Count query failed:', countError);
          }
        }
      } catch (payoutError: any) {
        console.error('Error loading payout requests:', payoutError);
        console.error('Error details:', {
          message: payoutError.message,
          stack: payoutError.stack,
          name: payoutError.name
        });
        setPayoutRequests([]);
        // Don't show toast for this error - it's not critical
      }
      
      // Load pending tracks for QC (use the loaded tracks directly instead of state)
      try {
        if (Array.isArray(loadedTracks) && loadedTracks.length > 0) {
          const pending = loadedTracks.filter((t: any) => t.approval_status === 'pending' || !t.approval_status);
          setPendingTracks(pending);
          console.log('Pending tracks calculated:', pending.length);
        } else {
          console.log('No tracks available for pending filtering');
          setPendingTracks([]);
        }
      } catch (pendingError: any) {
        console.error('Error filtering pending tracks:', pendingError);
        setPendingTracks([]);
      }
      
      console.log('Admin panel loaded successfully!');
      console.log('Summary:');
      console.log(`   Users: ${mergedUsers.length}`);
      console.log(`   Tracks: ${loadedTracks.length}`);
      console.log(`   Royalties: ${Array.isArray(allRoyalties) ? allRoyalties.length : 0}`);
      console.log(`   Pending: ${Array.isArray(pendingTracks) ? pendingTracks.length : 0}`);
      console.log(`   Payouts: ${Array.isArray(payoutRequests) ? payoutRequests.length : 0}`);
      
      // Force re-render to ensure UI updates
      setDataLoadVersion(prev => {
        console.log('Forcing re-render with version:', prev + 1);
        return prev + 1;
      });
      
      // Small delay to ensure all state updates are processed before setting loading to false
      setTimeout(() => {
        setLoading(false);
      }, 100);
      
      // Show success message with current data (no additional queries)
      if (mergedUsers.length === 0) {
        console.warn('No users found - this might indicate a data loading issue');
        toast.warning('Admin panel loaded but no user data found. Please check database connection.');
      }
      // Removed automatic success toast to avoid popup on every admin load
      // Load quick royalty entries
      loadQuickRoyaltyEntries();
      
      // Load white labels
      loadWhiteLabels();
      
      // Load credit allocations
      loadCreditAllocations();
      
      console.log('Admin panel loaded successfully with data');
      
    } catch (error: any) {
      console.error("Fatal error loading admin data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Set loading to false and show panel even if data load failed
      setLoading(false);
      
      // Show a more specific error message
      toast.error(`Admin panel loaded with errors: ${error.message || 'Database connection failed'}. Some data may be missing.`, {
        duration: 10000
      });
      
      // Don't throw error - let the panel show with whatever data we have
    }
  };

  const handleApproveTrack = async (trackId: number) => {
    try {
      // First verify the admin has access to update this track
      const track = tracks.find(t => t._row_id === trackId);
      if (!track) {
        toast.error('Track not found');
        return;
      }

      await db.update("tracks", { _row_id: `eq.${trackId}` }, { 
        approval_status: 'approved',
        qc_reviewer_uuid: currentUser.userUuid,
        qc_review_date: Math.floor(Date.now() / 1000)
      });
      
      setTracks(tracks.map(t => t._row_id === trackId ? { ...t, approval_status: 'approved' } : t));
      setPendingTracks(pendingTracks.filter(t => t._row_id !== trackId));
      
      await sendStatusNotification(track, 'approved');
      toast.success(`Track "${track.title}" approved successfully!`);
    } catch (error) {
      console.error("Error approving track:", error);
      toast.error(`Failed to approve track: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRejectTrack = async (trackId: number, reason: string) => {
    try {
      // Validate reason input
      if (!reason || !reason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }

      // First verify the admin has access to update this track
      const track = tracks.find(t => t._row_id === trackId);
      if (!track) {
        toast.error('Track not found');
        return;
      }

      await db.update("tracks", { _row_id: `eq.${trackId}` }, { 
        approval_status: 'rejected',
        qc_notes: reason.trim(),
        qc_reviewer_uuid: currentUser.userUuid,
        qc_review_date: Math.floor(Date.now() / 1000)
      });
      
      setTracks(tracks.map(t => t._row_id === trackId ? { ...t, approval_status: 'rejected', qc_notes: reason.trim() } : t));
      setPendingTracks(pendingTracks.filter(t => t._row_id !== trackId));
      
      await sendStatusNotification(track, 'rejected', reason.trim());
      toast.success(`Track "${track.title}" rejected. Artist notified via email.`);
    } catch (error) {
      console.error("Error rejecting track:", error);
      toast.error(`Failed to reject track: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSetPendingStatus = async (trackId: number) => {
    try {
      await db.update("tracks", { _row_id: `eq.${trackId}` }, { 
        approval_status: 'pending',
        qc_reviewer_uuid: currentUser.userUuid,
        qc_review_date: Math.floor(Date.now() / 1000)
      });
      
      setTracks(tracks.map(t => t._row_id === trackId ? { ...t, approval_status: 'pending' } : t));
      if (selectedTrack?._row_id === trackId) {
        setSelectedTrack({ ...selectedTrack, approval_status: 'pending' });
      }
      toast.success('Track status set to pending');
    } catch (error) {
      console.error("Error setting pending status:", error);
      toast.error(`Failed to set pending status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteTrack = async (trackId: number, trackTitle: string) => {
    try {
      // Confirm deletion
      if (!confirm(`Are you sure you want to delete "${trackTitle}"? This action cannot be undone.`)) {
        return;
      }

      // Delete the track
      await db.delete("tracks", { _row_id: `eq.${trackId}` });

      // Update state
      setTracks(tracks.filter(t => t._row_id !== trackId));
      setPendingTracks(pendingTracks.filter(t => t._row_id !== trackId));
      
      if (selectedTrack?._row_id === trackId) {
        setSelectedTrack(null);
      }
      
      toast.success(`Track "${trackTitle}" deleted successfully`);
      await loadAdminData();
    } catch (error) {
      console.error("Error deleting track:", error);
      toast.error(`Failed to delete track: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      toast.loading("Downloading file...");
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Downloaded: ${filename}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(`Failed to download ${filename}. Please try again.`);
    }
  };

  const sendStatusNotification = async (track: any, status: string, reason?: string) => {
    try {
      const user = users.find(u => u.userUuid === track.artist_uuid);
      if (!user || !user.email) {
        console.log('No user email found for notification');
        return;
      }

      // Determine notification type
      const notificationType = status === 'approved' ? 'approval' : 'rejection';

      const response = await fetch('/api/v2/functions/send-track-status-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationType: notificationType,
          trackId: track._row_id,
          artistUuid: track.artist_uuid,
          rejectionReason: reason
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notification sent successfully:', result);
        toast.success(`Email notification sent to ${user.artist_name || 'Artist'}`);
      } else {
        console.error('Failed to send notification:', await response.text());
        toast.error('Failed to send email notification');
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error('Error sending email notification');
    }
  };

  const sendMessageNotification = async (track: any, message: string) => {
    try {
      const user = users.find(u => u.userUuid === track.artist_uuid);
      if (!user || !user.email) {
        toast.error('No user email found for notification');
        return;
      }

      const response = await fetch('/api/v2/functions/send-track-status-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationType: 'message',
          trackId: track._row_id,
          artistUuid: track.artist_uuid,
          message: message
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Message notification sent successfully:', result);
        toast.success(`Message sent to ${user.artist_name || 'Artist'}`);
      } else {
        console.error('Failed to send message notification:', await response.text());
        toast.error('Failed to send message notification');
      }
    } catch (error) {
      console.error("Error sending message notification:", error);
      toast.error('Error sending message notification');
    }
  };

  const handleDeleteUser = async (userIdentifier: string) => {
    if (confirm('Are you sure you want to delete this user and all their data? This cannot be undone.')) {
      try {
        // Find the user to determine if we're using _row_id or userUuid
        const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
        if (!targetUser) {
          toast.error('User not found');
          return;
        }
        
        // Use the correct identifier for database queries
        const dbIdentifier = targetUser._row_id ? { artist_uuid: `eq.${targetUser._row_id}` } : { artist_uuid: `eq.${targetUser.userUuid}` };
        
        await db.delete("tracks", dbIdentifier);
        await db.delete("royalties", dbIdentifier);
        
        // For artists table, we need different identifier
        const artistIdentifier = targetUser._row_id ? { _row_id: `eq.${targetUser._row_id}` } : { user_uuid: `eq.${targetUser.userUuid}` };
        await db.delete("artists", artistIdentifier);
        
        setUsers(users.filter(u => (u._row_id !== userIdentifier && u.userUuid !== userIdentifier)));
        if (selectedUser?._row_id === userIdentifier || selectedUser?.userUuid === userIdentifier) {
          setSelectedUser(null);
        }
        
        toast.success("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleUpdateUser = async (userIdentifier: string, updates: any) => {
    try {
      // Find the user to determine if we're using _row_id or userUuid
      const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
      if (!targetUser) {
        toast.error('User not found');
        return;
      }
      
      // Use the correct identifier for database query
      const dbIdentifier = targetUser._row_id ? { _row_id: `eq.${targetUser._row_id}` } : { user_uuid: `eq.${targetUser.userUuid}` };
      
      await db.update("artists", dbIdentifier, updates);
      setUsers(users.map(u => u._row_id === userIdentifier || u.userUuid === userIdentifier ? { ...u, ...updates } : u));
      if (selectedUser?._row_id === userIdentifier || selectedUser?.userUuid === userIdentifier) {
        setSelectedUser({ ...selectedUser, ...updates });
      }
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleChangePackage = async (userIdentifier: string, newPackage: 'free' | 'sub') => {
    try {
      console.log('=== PACKAGE CHANGE START ===');
      console.log('Changing package for user:', userIdentifier, 'to:', newPackage);
      console.log('Current admin user:', currentUser?.email);
      
      // Find the user to determine if we're using _row_id or userUuid
      const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
      if (!targetUser) {
        console.error('User not found in local state');
        toast.error('User not found');
        return;
      }
      
      console.log('Found user in local state:', {
        email: targetUser.email,
        userUuid: targetUser.userUuid,
        _row_id: targetUser._row_id,
        currentPackage: targetUser.package_type
      });
      
      const updates: any = {
        package_type: newPackage,
        label_name_locked: newPackage === 'free'
      };
      
      // Set default label name for free users
      if (newPackage === 'free') {
        updates.label_name = 'Union Music Group Ltd';
      }
      
      // Unlock label name for sub users
      if (newPackage === 'sub') {
        updates.label_name_locked = false;
      }
      
      console.log('Updates to apply:', updates);
      
      // Use the correct identifier for database query
      const dbIdentifier = targetUser._row_id 
        ? { _row_id: `eq.${targetUser._row_id}` } 
        : { user_uuid: `eq.${targetUser.userUuid}` };
      
      console.log('Database identifier:', dbIdentifier);
      
      // Perform the database update
      console.log('Attempting database update...');
      const result = await db.update("artists", dbIdentifier, updates);
      console.log('Database update result:', result);
      
      // Update local state immediately for responsive UI
      setUsers(users.map(u => 
        (u._row_id === userIdentifier || u.userUuid === userIdentifier) 
          ? { ...u, ...updates } 
          : u
      ));
      
      setEditingUserPackage(null);
      
      toast.success(`User package changed to ${newPackage === 'sub' ? 'Subscription' : 'Free'}!`, {
        description: `${targetUser.email} is now on ${newPackage === 'sub' ? 'Subscription' : 'Free'} plan`,
        duration: 4000
      });
      
      // Reload admin data to ensure consistency
      console.log('Reloading admin data to ensure consistency...');
      await loadAdminData();
      
      console.log('=== PACKAGE CHANGE COMPLETE ===');
    } catch (error) {
      console.error("=== PACKAGE CHANGE ERROR ===");
      console.error("Error changing package:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userIdentifier,
        requestedPackage: newPackage
      });
      
      toast.error(`Failed to change package: ${error instanceof Error ? error.message : String(error)}`, {
        duration: 6000
      });
    }
  };

  // Account management functions
  const handleBlockUser = async (userIdentifier: string) => {
    if (confirm('Are you sure you want to block this user? They will not be able to access their account.')) {
      try {
        // Find the user to determine if we're using _row_id or userUuid
        const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
        if (!targetUser) {
          toast.error('User not found');
          return;
        }
        
        console.log('Blocking user:', targetUser.email);
        
        // Use the correct identifier for database query
        const dbIdentifier = targetUser._row_id ? { _row_id: `eq.${targetUser._row_id}` } : { user_uuid: `eq.${targetUser.userUuid}` };
        
        // Update in database
        await db.update("artists", dbIdentifier, { account_status: 'blocked' });
        
        // Update auth user (disable account) - only if we have a real userUuid
        if (targetUser.userUuid && targetUser.userUuid.startsWith('user_') === false) {
          try {
            await auth.updateUserByUuid(targetUser.userUuid, { enabled: false });
          } catch (authError) {
            console.warn('Could not update auth user (may not exist in auth system):', authError);
          }
        }
        
        // Update local state (note: artists table doesn't have 'enabled' column, only account_status)
        setUsers(users.map(u => u._row_id === userIdentifier || u.userUuid === userIdentifier ? { ...u, account_status: 'blocked' } : u));
        
        toast.success('User has been blocked successfully!');
        await loadAdminData();
      } catch (error) {
        console.error("Error blocking user:", error);
        toast.error('Failed to block user');
      }
    }
  };

  const handleUnblockUser = async (userIdentifier: string) => {
    try {
      // Find the user to determine if we're using _row_id or userUuid
      const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
      if (!targetUser) {
        toast.error('User not found');
        return;
      }
      
      console.log('Unblocking user:', targetUser.email);
      
      // Use the correct identifier for database query
      const dbIdentifier = targetUser._row_id ? { _row_id: `eq.${targetUser._row_id}` } : { user_uuid: `eq.${targetUser.userUuid}` };
      
      // Update in database
      await db.update("artists", dbIdentifier, { account_status: 'active' });
      
      // Update auth user (enable account) - only if we have a real userUuid
      if (targetUser.userUuid && targetUser.userUuid.startsWith('user_') === false) {
        try {
          await auth.updateUserByUuid(targetUser.userUuid, { enabled: true });
        } catch (authError) {
          console.warn('Could not update auth user (may not exist in auth system):', authError);
        }
      }
      
      // Update local state (note: artists table doesn't have 'enabled' column, only account_status)
      setUsers(users.map(u => u._row_id === userIdentifier || u.userUuid === userIdentifier ? { ...u, account_status: 'active' } : u));
      
      toast.success('User has been unblocked successfully!');
      await loadAdminData();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error('Failed to unblock user');
    }
  };

  const handleSuspendUser = async (userIdentifier: string) => {
    if (confirm('Are you sure you want to suspend this user? Their account will be temporarily disabled.')) {
      try {
        // Find the user to determine if we're using _row_id or userUuid
        const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
        if (!targetUser) {
          toast.error('User not found');
          return;
        }
        
        console.log('Suspending user:', targetUser.email);
        
        // Use the correct identifier for database query
        const dbIdentifier = targetUser._row_id ? { _row_id: `eq.${targetUser._row_id}` } : { user_uuid: `eq.${targetUser.userUuid}` };
        
        // Update in database
        await db.update("artists", dbIdentifier, { account_status: 'suspended' });
        
        // Update local state (keep enabled but mark as suspended)
        setUsers(users.map(u => u._row_id === userIdentifier || u.userUuid === userIdentifier ? { ...u, account_status: 'suspended' } : u));
        
        toast.success('User has been suspended successfully!');
        await loadAdminData();
      } catch (error) {
        console.error("Error suspending user:", error);
        toast.error('Failed to suspend user');
      }
    }
  };

  const handleReactivateUser = async (userIdentifier: string) => {
    try {
      // Find the user to determine if we're using _row_id or userUuid
      const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
      if (!targetUser) {
        toast.error('User not found');
        return;
      }
      
      console.log('Reactivating user:', targetUser.email);
      
      // Use the correct identifier for database query
      const dbIdentifier = targetUser._row_id ? { _row_id: `eq.${targetUser._row_id}` } : { user_uuid: `eq.${targetUser.userUuid}` };
      
      // Update in database
      await db.update("artists", dbIdentifier, { account_status: 'active' });
      
      // Update local state
      setUsers(users.map(u => u._row_id === userIdentifier || u.userUuid === userIdentifier ? { ...u, account_status: 'active' } : u));
      
      toast.success('User has been reactivated successfully!');
      await loadAdminData();
    } catch (error) {
      console.error("Error reactivating user:", error);
      toast.error('Failed to reactivate user');
    }
  };

  // Manual user editing functions
  const handleStartManualEdit = (user: any) => {
    setEditingUserManual(user._row_id || user.userUuid);
    setManualUserEdit({
      label_name: user.label_name || '',
      admin_notes: user.admin_notes || '',
      custom_status: user.custom_status || ''
    });
  };
  
  // Helper function to get user payout details
  const getUserPayoutDetails = (userUuid: string) => {
    const userPayouts = payoutRequests.filter(p => p.user_uuid === userUuid);
    if (userPayouts.length === 0) return null;
    
    // Get the most recent payout details
    const latestPayout = userPayouts[0];
    return {
      account_number: latestPayout.account_number,
      bank_name: latestPayout.bank_name,
      country: latestPayout.country,
      full_name: latestPayout.full_name,
      routing_number: latestPayout.routing_number,
      swift_code: latestPayout.swift_code,
      iban: latestPayout.iban,
      hasPayoutData: true
    };
  };

  const handleSaveManualEdit = async (userIdentifier: string) => {
    try {
      // Find the user to determine if we're using _row_id or userUuid
      const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
      if (!targetUser) {
        toast.error('User not found');
        return;
      }
      
      const updates: any = {};
      
      if (manualUserEdit.label_name !== (targetUser?.label_name || '')) {
        updates.label_name = manualUserEdit.label_name;
      }
      
      if (manualUserEdit.admin_notes !== (targetUser?.admin_notes || '')) {
        updates.admin_notes = manualUserEdit.admin_notes;
      }
      
      if (manualUserEdit.custom_status !== (targetUser?.custom_status || '')) {
        updates.custom_status = manualUserEdit.custom_status;
      }
      
      if (Object.keys(updates).length > 0) {
        // Use the correct identifier for database query
        const dbIdentifier = targetUser._row_id ? { _row_id: `eq.${targetUser._row_id}` } : { user_uuid: `eq.${targetUser.userUuid}` };
        
        await db.update("artists", dbIdentifier, updates);
        
        setUsers(users.map(u => u._row_id === userIdentifier || u.userUuid === userIdentifier ? { ...u, ...updates } : u));
        setEditingUserManual(null);
        toast.success('User information updated successfully!');
        await loadAdminData();
      } else {
        toast.info('No changes to save');
        setEditingUserManual(null);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error('Failed to update user information');
    }
  };

  const handleCancelManualEdit = () => {
    setEditingUserManual(null);
    setManualUserEdit({
      label_name: '',
      admin_notes: '',
      custom_status: ''
    });
  };

  const handleQuickStatusChange = async (userIdentifier: string, newStatus: string) => {
    try {
      // Find the user to determine if we're using _row_id or userUuid
      const targetUser = users.find(u => (u._row_id === userIdentifier || u.userUuid === userIdentifier));
      if (!targetUser) {
        toast.error('User not found');
        return;
      }
      
      console.log('Quick status change for:', targetUser.email, 'to:', newStatus);
      
      const updates: any = { account_status: newStatus };
      
      // Only update auth user for real userUuids (not generated ones)
      if (targetUser.userUuid && targetUser.userUuid.startsWith('user_') === false) {
        if (newStatus === 'blocked') {
          try {
            await auth.updateUserByUuid(targetUser.userUuid, { enabled: false });
          } catch (authError) {
            console.warn('Could not update auth user (may not exist in auth system):', authError);
          }
        } else if (newStatus === 'active') {
          try {
            await auth.updateUserByUuid(targetUser.userUuid, { enabled: true });
          } catch (authError) {
            console.warn('Could not update auth user (may not exist in auth system):', authError);
          }
        }
      }
      
      // Use the correct identifier for database query
      const dbIdentifier = targetUser._row_id ? { _row_id: `eq.${targetUser._row_id}` } : { user_uuid: `eq.${targetUser.userUuid}` };
      
      await db.update("artists", dbIdentifier, updates);
      setUsers(users.map(u => u._row_id === userIdentifier || u.userUuid === userIdentifier ? { ...u, ...updates } : u));
      
      const statusMessages = {
        'active': 'User activated successfully!',
        'suspended': 'User suspended successfully!',
        'blocked': 'User blocked successfully!'
      };
      
      toast.success(statusMessages[newStatus] || 'User status updated!');
      await loadAdminData();
    } catch (error) {
      console.error("Error changing user status:", error);
      toast.error('Failed to change user status');
    }
  };
  
  // Payout request handlers
  const handleApprovePayout = async (payoutId: number) => {
    try {
      // Get the payout request details
      const payout = payoutRequests.find(p => p._row_id === payoutId);
      if (!payout) {
        toast.error('Payout request not found');
        return;
      }

      // Update payout request status
      await db.update("payout_requests", { _row_id: `eq.${payoutId}` }, { 
        status: 'approved',
        processed_at: Math.floor(Date.now() / 1000)
      });
      
      // Update user's payout_settings (create if not exists, update balance)
      const existingSettings = await db.query("payout_settings", { user_uuid: `eq.${payout.user_uuid}` });
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings (for future balance tracking)
        await db.update("payout_settings", { _row_id: `eq.${existingSettings[0]._row_id}` }, {
          default_bank_name: payout.bank_name,
          default_account_number: payout.account_number,
          default_routing_number: payout.routing_number,
          default_swift_code: payout.swift_code,
          default_iban: payout.iban,
          default_full_name: payout.full_name,
          default_country: payout.country,
          payout_email: payout.email
        });
      } else {
        // Create new payout_settings for user
        await db.insert("payout_settings", {
          user_uuid: payout.user_uuid,
          artist_uuid: payout.artist_uuid,
          default_bank_name: payout.bank_name,
          default_account_number: payout.account_number,
          default_routing_number: payout.routing_number,
          default_swift_code: payout.swift_code,
          default_iban: payout.iban,
          default_full_name: payout.full_name,
          default_country: payout.country,
          payout_email: payout.email
        });
      }
      
      setPayoutRequests(payoutRequests.map(p => p._row_id === payoutId ? { ...p, status: 'approved' } : p));
      
      toast.success(`Payout request approved successfully!`);
      await loadAdminData();
    } catch (error) {
      console.error("Error approving payout:", error);
      toast.error('Failed to approve payout');
    }
  };
  
  const handleRejectPayout = async (payoutId: number) => {
    try {
      // Get the payout request details
      const payout = payoutRequests.find(p => p._row_id === payoutId);
      if (!payout) {
        toast.error('Payout request not found');
        return;
      }

      // Update payout request status with rejection timestamp
      await db.update("payout_requests", { _row_id: `eq.${payoutId}` }, { 
        status: 'rejected',
        processed_at: Math.floor(Date.now() / 1000)
      });
      
      // Note: We could optionally add rejection_reason tracking here in future
      // For now, just update the status
      
      setPayoutRequests(payoutRequests.map(p => p._row_id === payoutId ? { ...p, status: 'rejected' } : p));
      
      toast.success(`Payout request rejected successfully!`);
      await loadAdminData();
    } catch (error) {
      console.error("Error rejecting payout:", error);
      toast.error('Failed to reject payout');
    }
  };
  
  const handleProcessPayout = async (payoutId: number) => {
    try {
      await db.update("payout_requests", { _row_id: `eq.${payoutId}` }, { 
        status: 'processing',
        processed_at: Math.floor(Date.now() / 1000)
      });
      
      setPayoutRequests(payoutRequests.map(p => p._row_id === payoutId ? { ...p, status: 'processing' } : p));
      
      toast.success(`Payout marked as processing!`);
      await loadAdminData();
    } catch (error) {
      console.error("Error processing payout:", error);
      toast.error('Failed to update payout status');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if user already exists
    try {
      const existingUsers = await auth.listUsers({ search: { email: inviteEmail.trim() } });
      if (existingUsers.data && existingUsers.data.length > 0) {
        toast.error('A user with this email already exists');
        return;
      }
    } catch (error) {
      console.log('Could not check existing users, continuing...');
    }

    setInviteLoading(true);
    try {
      console.log('Creating user via auth.createUser...');
      console.log('Invite details:', {
        email: inviteEmail.trim(),
        name: inviteName.trim(),
        packageType: invitePackage,
        invitedBy: currentUser?.email
      });
      
      const nameParts = inviteName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      
      console.log('Name parts:', { firstName, lastName });
      
      // Create user without password - will send activation email
      const newUser = await auth.createUser({
        email: inviteEmail.trim(),
        password: null, // No password - will send activation email
        firstName: firstName,
        lastName: lastName,
        locale: 'en',
        metadata: {
          invitedBy: currentUser?.email,
          invitedAt: Math.floor(Date.now() / 1000).toString(),
          packageType: invitePackage,
          adminInvited: 'true'
        }
      });
      
      console.log('User created successfully:', newUser);
      
      // Send welcome email via edge function for better reliability
      try {
        console.log('Sending welcome email via edge function...');
        const emailResult = await functions.post('send-migration-welcome', {
          email: inviteEmail.trim(),
          firstName: firstName,
          lastName: lastName,
          password: null, // No password - they'll set it
          artistName: inviteName.trim(),
          templateType: 'user_welcome' // Regular user invite, not migration
        });
        
        console.log('Email function result:', emailResult);
        
        if (emailResult.emailSent) {
          console.log('✅ Welcome email sent successfully to:', inviteEmail);
        } else {
          console.warn('⚠️ Email function returned emailSent=false:', emailResult);
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the invitation if email fails - user was created successfully
      }
      
      // Create artist profile
      try {
        await db.insert('artists', {
          user_uuid: newUser.userUuid,
          email: inviteEmail.trim(),
          artist_name: inviteName.trim(),
          package_type: invitePackage,
          label_name: invitePackage === 'free' ? 'Union Music Group Ltd' : '',
          label_name_locked: invitePackage === 'free',
          created_at: Math.floor(Date.now() / 1000)
        });
        console.log('Artist profile created successfully');
      } catch (dbError) {
        console.error('Error creating artist profile:', dbError);
        toast.warning('User created but profile creation had issues');
      }
      
      // Add to pending invitations
      const newInvitation = {
        email: inviteEmail.trim(),
        name: inviteName.trim(),
        packageType: invitePackage,
        status: 'sent',
        invitedBy: currentUser?.email,
        invitedAt: Math.floor(Date.now() / 1000),
        uuid: newUser.userUuid
      };
      
      setPendingInvitations([...pendingInvitations, newInvitation]);
      
      // Reset form
      setInviteEmail('');
      setInviteName('');
      setInvitePackage('free');
      setShowInviteForm(false);
      
      toast.success(`✅ User ${inviteName} (${inviteEmail}) invited successfully!`, {
        duration: 5000,
        description: "User account created. Check email delivery status below."
      });
      
      // Add detailed info about email delivery
      setTimeout(() => {
        toast.info(`📧 Email delivery info:`, {
          description: `Activation email sent to ${inviteEmail}. If not received within 5 minutes, check spam folder or contact support.`,
          duration: 8000
        });
      }, 1000);
      
      // Reload admin data to get updated users list
      await loadAdminData();
      
    } catch (authError: any) {
      console.error('Failed to invite user:', authError);
      console.error('Error details:', {
        message: authError.message,
        stack: authError.stack,
        name: authError.name
      });
      
      // Better error messages based on error type
      let errorMessage = 'Failed to invite user';
      let errorDescription = '';
      
      if (authError.message && authError.message.includes('No such API endpoint')) {
        errorMessage = 'Auth SDK configuration error';
        errorDescription = 'The authentication system is not properly configured. Please contact technical support.';
      } else if (authError.message && authError.message.includes('email_exists')) {
        errorMessage = 'User already exists';
        errorDescription = 'A user with this email address is already registered in the system.';
      } else if (authError.message && authError.message.includes('insufficient_permissions')) {
        errorMessage = 'Permission denied';
        errorDescription = 'You do not have the required permissions to invite users. Contact your administrator.';
      } else if (authError.message && authError.message.includes('rate_limit') || authError.message && authError.message.includes('429')) {
        errorMessage = 'Rate limit exceeded';
        errorDescription = 'Too many invitation emails sent recently. Please wait a few hours before trying again, or configure custom SMTP for higher limits.';
      } else if (authError.message && authError.message.includes('email_template') || authError.message && authError.message.includes('template_not_configured')) {
        errorMessage = 'Email template error';
        errorDescription = 'The welcome email template is not properly configured. Please contact support.';
      } else if (authError.message && authError.message.includes('email') && (authError.message.includes('failed') || authError.message.includes('send'))) {
        errorMessage = 'Email delivery failed';
        errorDescription = 'User account was created but the activation email could not be sent. The user may need to request password reset.';
      } else if (authError.message) {
        errorMessage = 'Invitation failed';
        errorDescription = authError.message;
      }
      
      toast.error(errorMessage, { 
        duration: 6000,
        description: errorDescription
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteInvitation = (index: number) => {
    setPendingInvitations(pendingInvitations.filter((_, i) => i !== index));
    toast.success('Invitation deleted');
  };

  const handleResendInvitation = async (invitation: any) => {
    setInviteLoading(true);
    try {
      console.log('Resending invitation to:', invitation.email);
      
      // Use auth.resendActivation if available
      try {
        await auth.resendActivation(invitation.email);
        toast.success(`📧 Invitation resent to ${invitation.email}`, {
          description: "New activation email sent. Please wait 5-15 minutes for delivery."
        });
      } catch (resendError: any) {
        console.log('Resend activation failed, trying alternative approach:', resendError);
        
        // Alternative: Show the activation code directly
        toast.info(`Invitation info for ${invitation.email}`, {
          description: `Name: ${invitation.name}, Package: ${invitation.packageType === 'sub' ? 'Subscription' : 'Free'}. User should check their email or contact support.`,
          duration: 8000
        });
      }
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast.error(`Failed to resend invitation: ${error.message || 'Unknown error'}`);
    } finally {
      setInviteLoading(false);
    }
  };

  // Generate secure password
  const generateSecurePassword = () => {
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    return password;
  };

  // Manual account setup handler
  const handleManualAccountSetup = async () => {
    if (!manualEmail.trim() || !manualName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if user already exists
    try {
      const existingUsers = await auth.listUsers({ search: { email: manualEmail.trim() } });
      if (existingUsers.data && existingUsers.data.length > 0) {
        toast.error('A user with this email already exists');
        return;
      }
    } catch (error) {
      console.log('Could not check existing users, continuing...');
    }

    setManualLoading(true);
    try {
      console.log('Creating user account manually...');
      
      const nameParts = manualName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Generate secure password
      const generatedPassword = generateSecurePassword();
      
      // Create user with password (no email sent)
      const newUser = await auth.createUser({
        email: manualEmail.trim(),
        password: generatedPassword,
        firstName: firstName,
        lastName: lastName,
        locale: 'en',
        metadata: {
          createdBy: currentUser?.email,
          createdAt: Math.floor(Date.now() / 1000).toString(),
          packageType: manualPackage,
          manualSetup: 'true',
          emailVerified: true // Skip email verification
        }
      });
      
      console.log('User created successfully:', newUser);
      
      // Create artist profile
      try {
        await db.insert('artists', {
          user_uuid: newUser.userUuid,
          email: manualEmail.trim(),
          artist_name: manualName.trim(),
          package_type: manualPackage,
          label_name: manualPackage === 'free' ? 'Union Music Group Ltd' : '',
          label_name_locked: manualPackage === 'free',
          created_at: Math.floor(Date.now() / 1000)
        });
        console.log('Artist profile created successfully');
      } catch (dbError) {
        console.error('Error creating artist profile:', dbError);
        toast.warning('User created but profile creation had issues');
      }
      
      // Store generated credentials for display
      setGeneratedCredentials({
        email: manualEmail.trim(),
        password: generatedPassword,
        name: manualName.trim(),
        package: manualPackage,
        userUuid: newUser.userUuid,
        loginUrl: window.location.origin + '/signin'
      });
      
      // Reset form
      setManualEmail('');
      setManualName('');
      setManualPackage('free');
      
      toast.success(`✅ User account created successfully!`, {
        description: "Credentials generated. Share them securely with the user.",
        duration: 5000
      });
      
      // Reload admin data
      await loadAdminData();
      
    } catch (authError: any) {
      console.error('Failed to create manual account:', authError);
      console.error('Error details:', {
        message: authError.message,
        stack: authError.stack,
        name: authError.name
      });
      
      // Better error messages
      let errorMessage = 'Failed to create account';
      let errorDescription = '';
      
      if (authError.message && authError.message.includes('email_exists')) {
        errorMessage = 'User already exists';
        errorDescription = 'A user with this email address is already registered.';
      } else if (authError.message && authError.message.includes('insufficient_permissions')) {
        errorMessage = 'Permission denied';
        errorDescription = 'You do not have permission to create user accounts.';
      } else if (authError.message && authError.message.includes('password')) {
        errorMessage = 'Password requirements';
        errorDescription = 'The generated password does not meet security requirements.';
      } else if (authError.message) {
        errorMessage = 'Account creation failed';
        errorDescription = authError.message;
      }
      
      toast.error(errorMessage, { 
        duration: 6000,
        description: errorDescription
      });
    } finally {
      setManualLoading(false);
    }
  };

  // Copy credentials to clipboard
  const copyCredentialsToClipboard = async () => {
    if (!generatedCredentials) return;
    
    const credentialsText = `
Union Music Group - Account Credentials
========================================

Name: ${generatedCredentials.name}
Email: ${generatedCredentials.email}
Password: ${generatedCredentials.password}
Package: ${generatedCredentials.package === 'sub' ? 'Subscription' : 'Free Plan'}

Login URL: ${generatedCredentials.loginUrl}

Please change your password after first login.

Created by: ${currentUser?.email}
Created at: ${new Date().toLocaleString()}
    `.trim();
    
    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopiedToClipboard(true);
      toast.success('Credentials copied to clipboard!', {
        description: 'Paste and share securely with the user via encrypted channel.',
        duration: 4000
      });
      
      setTimeout(() => setCopiedToClipboard(false), 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy credentials to clipboard');
    }
  };

  // Close credentials display
  const closeCredentialsDisplay = () => {
    setGeneratedCredentials(null);
    setCopiedToClipboard(false);
  };

  const handleUpdateTrack = async (trackId: number, updates: any) => {
    try {
      await db.update("tracks", { _row_id: `eq.${trackId}` }, updates);
      setTracks(tracks.map(t => t._row_id === trackId ? { ...t, ...updates } : t));
      if (selectedTrack?._row_id === trackId) {
        setSelectedTrack({ ...selectedTrack, ...updates });
      }
    } catch (error) {
      console.error("Error updating track:", error);
    }
  };

  const exportData = async (dataType: 'users' | 'tracks' | 'royalties') => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (dataType) {
        case 'users':
          data = await db.query("artists", {});
          filename = 'users_export.json';
          break;
        case 'tracks':
          data = await db.query("tracks", {});
          filename = 'tracks_export.json';
          break;
        case 'royalties':
          data = await db.query("royalties", {});
          filename = 'royalties_export.json';
          break;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  // Storage Management Functions
  const loadStorageData = async () => {
    setStorageLoading(true);
    try {
      const allTracks = await db.query("tracks", {});
      
      // Filter for approved tracks that have audio files
      const approvedTracksWithAudio = allTracks.filter((track: any) => 
        track.approval_status === 'approved' && track.file_path && track.file_path.trim() !== ''
      );
      
      setStorageTracks(approvedTracksWithAudio);
      
      // Calculate storage statistics
      const totalTracks = allTracks.length;
      const approvedTracks = allTracks.filter((t: any) => t.approval_status === 'approved').length;
      const tracksWithAudio = allTracks.filter((t: any) => t.file_path && t.file_path.trim() !== '').length;
      const tracksWithoutAudio = totalTracks - tracksWithAudio;
      
      // Estimate file size (average 5MB per audio file)
      const estimatedSavings = approvedTracksWithAudio.length * 5;
      
      setStorageStats({
        totalTracks,
        approvedTracks,
        tracksWithAudio,
        tracksWithoutAudio,
        estimatedSavings
      });
      
      console.log('Storage data loaded:', {
        approvedTracksWithAudio: approvedTracksWithAudio.length,
        stats: { totalTracks, approvedTracks, tracksWithAudio, tracksWithoutAudio, estimatedSavings }
      });
    } catch (error) {
      console.error('Error loading storage data:', error);
      toast.error('Failed to load storage data');
    } finally {
      setStorageLoading(false);
    }
  };

  const deleteAudioFile = async (track: any) => {
    if (!track.file_path || track.file_path.trim() === '') {
      toast.warning('This track has no audio file to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the audio file for "${track.title}"?\n\n` +
      `This action will:\n` +
      `• Remove the audio file from storage\n` +
      `• Keep all track metadata (ISRC, UPC, etc.)\n` +
      `• User will no longer see audio player\n\n` +
      `Track: ${track.title}\n` +
      `File: ${track.file_path}\n` +
      `ISRC: ${track.isrc || 'N/A'}\n` +
      `Status: ${track.approval_status}`
    );

    if (!confirmed) return;

    try {
      console.log('Deleting audio file for track:', track._row_id, track.file_path);
      
      // Delete the file from content storage
      const content = await import('@/lib/shared/kliv-content.js');
      const { content: contentModule } = content;
      await contentModule.deleteFile(track.file_path);
      
      // Update track record to remove file_path
      await db.update("tracks", { _row_id: `eq.${track._row_id}` }, { 
        file_path: '',
        audio_removed_at: Math.floor(Date.now() / 1000)
      });
      
      // Update local state
      setStorageTracks(storageTracks.filter(t => t._row_id !== track._row_id));
      
      toast.success(`✅ Audio file deleted successfully!`, {
        description: `"${track.title}" audio removed. Metadata preserved.`,
        duration: 4000
      });
      
      // Reload data
      await loadStorageData();
      await loadAdminData();
      
    } catch (error) {
      console.error('Error deleting audio file:', error);
      toast.error('Failed to delete audio file', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const deleteMultipleAudioFiles = async (trackIds: number[]) => {
    if (trackIds.length === 0) {
      toast.warning('No tracks selected for deletion');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${trackIds.length} audio file(s)?\n\n` +
      `This action will:\n` +
      `• Remove all selected audio files from storage\n` +
      `• Keep all track metadata (ISRC, UPC, etc.)\n` +
      `• Users will no longer see audio players for these tracks\n\n` +
      `Total files to delete: ${trackIds.length}`
    );

    if (!confirmed) return;

    setDeletionProgress(`Deleting ${trackIds.length} audio files...`);
    let successCount = 0;
    let errorCount = 0;

    try {
      const content = await import('@/lib/shared/kliv-content.js');
      const { content: contentModule } = content;
      
      for (const trackId of trackIds) {
        try {
          const track = storageTracks.find(t => t._row_id === trackId);
          if (!track || !track.file_path) continue;
          
          // Delete from content storage
          await contentModule.deleteFile(track.file_path);
          
          // Update database
          await db.update("tracks", { _row_id: `eq.${trackId}` }, { 
            file_path: '',
            audio_removed_at: Math.floor(Date.now() / 1000)
          });
          
          successCount++;
          setDeletionProgress(`Deleted ${successCount}/${trackIds.length} files...`);
        } catch (error) {
          console.error(`Error deleting file for track ${trackId}:`, error);
          errorCount++;
        }
      }
      
      // Update local state
      setStorageTracks(storageTracks.filter(t => !trackIds.includes(t._row_id)));
      
      if (successCount > 0) {
        toast.success(`✅ Successfully deleted ${successCount} audio file(s)!`, {
          description: errorCount > 0 ? `${errorCount} file(s) failed to delete.` : 'All selected files removed successfully.',
          duration: 5000
        });
      }
      
      if (errorCount > 0) {
        toast.error(`⚠️ ${errorCount} file(s) failed to delete`);
      }
      
      // Reload data
      await loadStorageData();
      await loadAdminData();
      
    } catch (error) {
      console.error('Error in bulk deletion:', error);
      toast.error('Failed to complete bulk deletion');
    } finally {
      setDeletionProgress('');
    }
  };

  const deleteAllApprovedAudio = async () => {
    const totalFiles = storageTracks.length;
    if (totalFiles === 0) {
      toast.info('No approved audio files to delete');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ CRITICAL STORAGE ACTION ⚠️\n\n` +
      `You are about to delete ALL ${totalFiles} audio files from approved tracks.\n\n` +
      `This will:\n` +
      `• Remove ${totalFiles} audio files from permanent storage\n` +
      `• Save approximately ${storageStats.estimatedSavings}MB of storage space\n` +
      `• Keep ALL metadata for users (ISRC, UPC, catalog numbers, etc.)\n` +
      `• Users will no longer see audio players on their dashboards\n\n` +
      `❗ This action CANNOT be undone ❗\n\n` +
      `Do you want to proceed?`
    );

    if (!confirmed) return;

    setDeletionProgress(`Deleting all ${totalFiles} approved audio files...`);
    
    await deleteMultipleAudioFiles(storageTracks.map(t => t._row_id));
    
    toast.success('🎉 Bulk deletion completed!', {
      description: `${totalFiles} audio files removed from storage.`,
      duration: 5000
    });
  };
  const handleRoyaltyFileUpload = async (file: File) => {
    setRoyaltyFile(file);
    setRoyaltyUploadStatus('Processing...');
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setRoyaltyUploadStatus('Invalid CSV format');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const processedData = [];
      const skippedRows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const royaltyEntry: any = {};
        
        headers.forEach((header, index) => {
          royaltyEntry[header] = values[index] || '';
        });
        
        // Try to get artist_uuid - either from CSV or by looking up artist name
        let artistUuid = royaltyEntry.artist_uuid || '';
        if (!artistUuid && royaltyEntry.artist_name) {
          // Look up artist_uuid by artist_name
          const artists = await db.query('artists', { artist_name: `eq.${royaltyEntry.artist_name}` });
          if (artists.length > 0) {
            artistUuid = artists[0].user_uuid;
            console.log(`Found artist_uuid for ${royaltyEntry.artist_name}: ${artistUuid}`);
          } else {
            console.warn(`No artist found with name: ${royaltyEntry.artist_name}`);
            skippedRows.push({ row: i, reason: `Artist not found: ${royaltyEntry.artist_name}` });
            continue;
          }
        } else if (!artistUuid && royaltyEntry.performer) {
          // Alternative field name for artist
          const artists = await db.query('artists', { artist_name: `eq.${royaltyEntry.performer}` });
          if (artists.length > 0) {
            artistUuid = artists[0].user_uuid;
            console.log(`Found artist_uuid for performer ${royaltyEntry.performer}: ${artistUuid}`);
          } else {
            console.warn(`No artist found with performer name: ${royaltyEntry.performer}`);
            skippedRows.push({ row: i, reason: `Artist not found: ${royaltyEntry.performer}` });
            continue;
          }
        }
        
        const dbRoyalty = {
          artist_uuid: artistUuid,
          track_id: royaltyEntry.track_id || null,
          track_title: royaltyEntry.track_title || royaltyEntry.title || '',
          platform: royaltyEntry.platform || royaltyEntry['digital service provider'] || '',
          streams: parseFloat(royaltyEntry.streams || royaltyEntry.count || 0),
          revenue: parseFloat(royaltyEntry.revenue || royaltyEntry['royalty ($us)'] || 0),
          currency: royaltyEntry.currency || 'USD',
          period: royaltyEntry.period || new Date().toISOString().slice(0, 7),
          split_percentage: parseFloat(royaltyEntry.split_percentage) || 100,
          label_share: parseFloat(royaltyEntry.label_share) || 0,
          upc: royaltyEntry.upc || royaltyEntry['upc code'] || '',
          isrc: royaltyEntry.isrc || royaltyEntry['isrc code'] || '',
          admin_notes: royaltyEntry.admin_notes || '',
          is_adjustment: royaltyEntry.is_adjustment === 'true' || royaltyEntry.is_adjustment === '1',
          country: royaltyEntry.territory || '',
          uploaded_by: currentUser.userUuid,
          upload_date: Math.floor(Date.now() / 1000)
        };
        
        // Validate required fields and data
        if (!dbRoyalty.artist_uuid) {
          console.warn(`Skipping row ${i}: Missing artist_uuid (no artist_name or performer found)`);
          skippedRows.push({ row: i, reason: 'Missing artist identifier' });
          continue;
        }
        if (!dbRoyalty.track_title) {
          console.warn(`Skipping row ${i}: Missing track_title`);
          skippedRows.push({ row: i, reason: 'Missing track title' });
          continue;
        }
        if (!dbRoyalty.platform) {
          console.warn(`Skipping row ${i}: Missing platform`);
          skippedRows.push({ row: i, reason: 'Missing platform' });
          continue;
        }
        if (dbRoyalty.streams < 0 || dbRoyalty.revenue < 0) {
          console.warn(`Skipping row ${i}: Invalid streams or revenue values`);
          skippedRows.push({ row: i, reason: 'Negative values' });
          continue;
        }
        if (dbRoyalty.revenue === 8 || String(dbRoyalty.revenue) === '8') {
          console.warn(`Skipping row ${i}: $8 revenue not allowed (likely placeholder data)`);
          skippedRows.push({ row: i, reason: 'Blocked $8 revenue' });
          continue;
        }
        
        await db.insert('royalties', dbRoyalty);
        processedData.push(dbRoyalty);
      }
      
      await loadAdminData();
      
      if (skippedRows.length > 0) {
        console.log(`Skipped ${skippedRows.length} rows:`, skippedRows);
      }
      
      const statusMessage = `Successfully imported ${processedData.length} royalty records${skippedRows.length > 0 ? ` (${skippedRows.length} skipped)` : ''}`;
      setRoyaltyUploadStatus(statusMessage);
      setTimeout(() => setRoyaltyUploadStatus(''), 8000);
      
      if (processedData.length > 0) {
        toast.success('Royalty import completed!', {
          description: statusMessage,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error processing royalty file:', error);
      setRoyaltyUploadStatus('Error processing file. Check CSV format.');
      toast.error('Failed to import royalty data', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    }
  };
  // Quick Royalty Entry Handler
  const handleQuickRoyaltyEntry = async () => {
    try {
      setQuickRoyaltyLoading(true);
      
      // Validation
      if (!quickRoyalty.artist_email || !quickRoyalty.track_title || !quickRoyalty.platform) {
        toast.error('Artist Email, Track Title, and Platform are required');
        return;
      }
      if (quickRoyalty.streams < 0 || quickRoyalty.revenue < 0) {
        toast.error('Streams and Revenue must be positive numbers');
        return;
      }
      if (quickRoyalty.revenue === 8 || String(quickRoyalty.revenue) === '8') {
        toast.error('$8 revenue is not allowed (placeholder data)');
        return;
      }
      
      // Get current user for entered_by field
      const currentUser = await auth.getUser();
      const enteredBy = currentUser?.email || 'admin';
      
      // Look up the artist's UUID from their email
      const artists = await db.query('artists', { email: `eq.${quickRoyalty.artist_email}` });
      if (!artists || artists.length === 0) {
        toast.error('Artist not found', {
          description: `No artist found with email ${quickRoyalty.artist_email}`,
          duration: 4000
        });
        return;
      }
      
      const artistUuid = artists[0].user_uuid;
      console.log(`Found artist UUID: ${artistUuid} for ${quickRoyalty.artist_email}`);
      
      // Create period string (YYYY-MM format)
      const period = `${quickRoyalty.year}-${quickRoyalty.month}`;
      
      // Insert into main royalties table (system adds _created_by, _created_at automatically)
      await db.insert('royalties', {
        artist_uuid: artistUuid,
        track_title: quickRoyalty.track_title,
        platform: quickRoyalty.platform,
        streams: quickRoyalty.streams,
        revenue: quickRoyalty.revenue,
        currency: quickRoyalty.currency,
        period: period,
        country: quickRoyalty.country,
        split_percentage: 100,
        label_share: 0,
        upc: '',
        isrc: '',
        admin_notes: quickRoyalty.notes || `Quick entry by ${enteredBy}`,
        is_adjustment: false
      });
      
      toast.success('Quick royalty entry added successfully!', {
        description: `Added ${quickRoyalty.platform} royalty for ${quickRoyalty.track_title} - User will see this in their dashboard`,
        duration: 4000
      });
      
      // Reset form
      setQuickRoyalty({
        artist_email: '',
        artist_name: '',
        track_title: '',
        platform: '',
        streams: 0,
        revenue: 0,
        currency: 'USD',
        month: new Date().toLocaleString('default', { month: 'long' }).toLowerCase(),
        year: new Date().getFullYear(),
        country: 'US',
        notes: ''
      });
      
      // Reload recent entries
      loadQuickRoyaltyEntries();
    } catch (error) {
      console.error('Error adding quick royalty entry:', error);
      toast.error('Failed to add royalty entry', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    } finally {
      setQuickRoyaltyLoading(false);
    }
  };

  // Load recent quick royalty entries (from main royalties table)
  const loadQuickRoyaltyEntries = async () => {
    try {
      const entries = await db.query('royalties', {
        order: '_created_at.desc',
        limit: 10
      });
      setRecentQuickEntries(entries || []);
      console.log('Loaded recent royalty entries:', entries?.length || 0);
    } catch (error) {
      console.error('Error loading quick royalty entries:', error);
    }
  };

  // Pay As You Go Handlers
  const handleAllocateCredits = async () => {
    try {
      setAllocateCreditsLoading(true);
      
      // Validation
      if (!payAsYouGoForm.userEmail || !payAsYouGoForm.paymentType || !payAsYouGoForm.paymentId) {
        toast.error('User Email, Payment Type, and Payment ID are required');
        return;
      }
      
      // Get current admin user
      const currentUser = await auth.getUser();
      if (currentUser?.email !== 'info@unionmusicgroup.co.uk') {
        toast.error('Admin access only');
        return;
      }
      
      // Call the allocate credits function - include admin email for verification
      const result = await functions.post('allocate-upload-credits', {
        userEmail: payAsYouGoForm.userEmail,
        paymentType: payAsYouGoForm.paymentType,
        paymentId: payAsYouGoForm.paymentId,
        amount: payAsYouGoForm.amount,
        adminEmail: currentUser?.email || 'info@unionmusicgroup.co.uk'
      });
      
      if (result.success) {
        toast.success('Upload credits allocated successfully!', {
          description: `${payAsYouGoForm.userEmail} can now upload ${result.tracksAllowed} tracks`,
          duration: 4000
        });
        
        // Reset form
        setPayAsYouGoForm({
          userEmail: '',
          paymentType: '',
          paymentId: '',
          amount: 0
        });
        
        // Reload recent allocations
        loadCreditAllocations();
      } else {
        toast.error('Failed to allocate credits', {
          description: result.error || 'Unknown error occurred',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error allocating credits:', error);
      toast.error('Failed to allocate credits', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    } finally {
      setAllocateCreditsLoading(false);
    }
  };

  const loadCreditAllocations = async () => {
    try {
      const allocations = await db.query('pay_as_you_go_payments', {
        order: '_created_at.desc',
        limit: 20
      });
      
      // Enrich with user emails - FIXED: use artists table instead of users
      const enrichedAllocations = await Promise.all(
        (allocations || []).map(async (allocation: any) => {
          try {
            const artists = await db.query('artists', { user_uuid: `eq.${allocation.user_uuid}` });
            return {
              ...allocation,
              user_email: artists[0]?.email || allocation.user_uuid
            };
          } catch {
            return {
              ...allocation,
              user_email: allocation.user_uuid
            };
          }
        })
      );
      
      setRecentCreditAllocations(enrichedAllocations);
      console.log('Loaded recent credit allocations:', enrichedAllocations.length);
    } catch (error) {
      console.error('Error loading credit allocations:', error);
    }
  };

  // White Label Handlers
  const handleLogoUpload = async (file: File) => {
    try {
      setLogoUploading(true);
      
      // Upload file to content filesystem
      const result = await content.uploadFile(file, '/content/logos/');
      
      setWhiteLabelForm({
        ...whiteLabelForm,
        logo_path: result.path
      });
      
      toast.success('Logo uploaded successfully!', {
        description: 'Logo saved and ready to use',
        duration: 3000
      });
      
      return result.path;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
      return null;
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCreateWhiteLabel = async () => {
    try {
      // Validation
      if (!whiteLabelForm.name || !whiteLabelForm.contact_email) {
        toast.error('Name and Contact Email are required');
        return;
      }
      
      // Upload logo if file is selected
      let logoPath = whiteLabelForm.logo_path;
      if (logoFile && !logoPath) {
        logoPath = await handleLogoUpload(logoFile);
        if (!logoPath) return; // Upload failed
      }
      
      // Create white label
      await db.insert('white_labels', {
        name: whiteLabelForm.name,
        contact_email: whiteLabelForm.contact_email,
        company_name: whiteLabelForm.company_name,
        logo_path: logoPath,
        primary_color: whiteLabelForm.primary_color,
        secondary_color: whiteLabelForm.secondary_color,
        support_email: whiteLabelForm.support_email
      });
      
      toast.success('Brand created successfully!', {
        description: `${whiteLabelForm.name} is ready for sub-admin assignment`,
        duration: 3000
      });
      
      // Reset form
      setWhiteLabelForm({
        name: '',
        contact_email: '',
        company_name: '',
        logo_path: '',
        primary_color: '#6366f1',
        secondary_color: '#8b5cf6',
        support_email: ''
      });
      setLogoFile(null);
      setShowWhiteLabelForm(false);
      setIsEditingWhiteLabel(false);
      
      // Reload white labels
      loadWhiteLabels();
    } catch (error) {
      console.error('Error creating white label:', error);
      toast.error('Failed to create brand', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    }
  };

  const handleEditWhiteLabel = (label: any) => {
    setIsEditingWhiteLabel(true);
    setWhiteLabelForm({
      name: label.name,
      contact_email: label.contact_email,
      company_name: label.company_name || '',
      logo_path: label.logo_path || '',
      primary_color: label.primary_color || '#6366f1',
      secondary_color: label.secondary_color || '#8b5cf6',
      support_email: label.support_email || ''
    });
    setSelectedWhiteLabel(label);
    setShowWhiteLabelForm(true);
  };

  const handleUpdateWhiteLabel = async () => {
    try {
      if (!selectedWhiteLabel || !whiteLabelForm.name) {
        toast.error('Brand name is required');
        return;
      }
      
      // Upload new logo if file is selected
      let logoPath = whiteLabelForm.logo_path;
      if (logoFile) {
        logoPath = await handleLogoUpload(logoFile);
        if (!logoPath) return; // Upload failed
      }
      
      // Update white label
      await db.update('white_labels', {
        _row_id: `eq.${selectedWhiteLabel._row_id}`
      }, {
        name: whiteLabelForm.name,
        contact_email: whiteLabelForm.contact_email,
        company_name: whiteLabelForm.company_name,
        logo_path: logoPath,
        primary_color: whiteLabelForm.primary_color,
        secondary_color: whiteLabelForm.secondary_color,
        support_email: whiteLabelForm.support_email
      });
      
      toast.success('Brand updated successfully!', {
        description: `${whiteLabelForm.name} details have been saved`,
        duration: 3000
      });
      
      // Reset form
      setWhiteLabelForm({
        name: '',
        contact_email: '',
        company_name: '',
        logo_path: '',
        primary_color: '#6366f1',
        secondary_color: '#8b5cf6',
        support_email: ''
      });
      setLogoFile(null);
      setSelectedWhiteLabel(null);
      setShowWhiteLabelForm(false);
      setIsEditingWhiteLabel(false);
      
      // Reload white labels
      loadWhiteLabels();
    } catch (error) {
      console.error('Error updating white label:', error);
      toast.error('Failed to update brand', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    }
  };

  const handleDeleteWhiteLabel = async (label: any) => {
    try {
      if (!confirm(`Are you sure you want to delete "${label.name}"? This will remove all sub-admin assignments, domains, and cannot be undone.`)) {
        return;
      }
      
      console.log('Starting deletion of white label:', label.name, 'ID:', label._row_id);
      
      // Delete all domains for this white label first
      try {
        await db.delete('white_label_domains', {
          white_label_id: `eq.${label._row_id}`
        });
        console.log('✅ Deleted white label domains');
      } catch (error) {
        console.warn('⚠️ Failed to delete domains:', error);
        // Continue anyway - might not have domains
      }
      
      // Delete all sub-admin assignments for this white label
      try {
        await db.delete('white_label_users', {
          white_label_id: `eq.${label._row_id}`
        });
        console.log('✅ Deleted white label users');
      } catch (error) {
        console.warn('⚠️ Failed to delete users:', error);
        // Continue anyway - might not have users
      }
      
      // Delete the white label
      await db.delete('white_labels', {
        _row_id: `eq.${label._row_id}`
      });
      console.log('✅ Deleted white label successfully');
      
      toast.success('Brand deleted successfully!', {
        description: `${label.name} and all assignments have been removed`,
        duration: 3000
      });
      
      // Reload white labels
      loadWhiteLabels();
    } catch (error) {
      console.error('Error deleting white label:', error);
      toast.error('Failed to delete brand', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    }
  };

  const handleSetupDomain = async () => {
    try {
      if (!selectedWhiteLabel || !domainSetup.custom_domain) {
        toast.error('Please select a white label and enter a custom domain');
        return;
      }
      
      // Check if domain already exists
      const existingDomains = await db.query('white_label_domains', {
        custom_domain: `eq.${domainSetup.custom_domain}`
      });
      
      if (existingDomains && existingDomains.length > 0) {
        toast.error('Domain already configured', {
          description: `This domain is already set up for another white label`,
          duration: 5000
        });
        return;
      }
      
      // Create domain entry
      await db.insert('white_label_domains', {
        white_label_id: selectedWhiteLabel._row_id,
        custom_domain: domainSetup.custom_domain,
        cname_target: domainSetup.cname_target,
        dns_status: 'pending',
        ssl_status: 'pending'
      });
      
      toast.success('Domain setup initiated!', {
        description: `DNS configuration required for ${domainSetup.custom_domain}`,
        duration: 5000
      });
      
      // Reset domain form
      setDomainSetup({
        custom_domain: '',
        cname_target: 'sites.kliv.dev',
        white_label_id: ''
      });
      
      // Reload white labels
      loadWhiteLabels();
    } catch (error) {
      console.error('Error setting up domain:', error);
      toast.error('Failed to setup domain', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    }
  };

  const handleAddSubAdmin = async () => {
    try {
      if (!selectedWhiteLabel || !subAdminForm.user_email) {
        toast.error('Please select a white label and enter user email');
        return;
      }
      
      // Check if user exists
      const artists = await db.query('artists', { email: `eq.${subAdminForm.user_email}` });
      if (artists.length === 0) {
        toast.error('User not found', {
          description: `No user found with email ${subAdminForm.user_email}. The user must exist first.`,
          duration: 5000
        });
        return;
      }
      
      // Check if user is already assigned to this white label
      const existingAssignments = await db.query('white_label_users', {
        user_email: `eq.${subAdminForm.user_email}`,
        white_label_id: `eq.${selectedWhiteLabel._row_id}`
      });
      
      if (existingAssignments.length > 0) {
        toast.error('User already assigned', {
          description: `${subAdminForm.user_email} is already assigned to this brand`,
          duration: 5000
        });
        return;
      }
      
      // Create sub-admin assignment
      await db.insert('white_label_users', {
        white_label_id: selectedWhiteLabel._row_id,
        user_email: subAdminForm.user_email,
        user_name: artists[0].artist_name || subAdminForm.user_name,
        role: subAdminForm.role,
        permissions: subAdminForm.permissions
      });
      
      toast.success('Sub-admin assigned successfully!', {
        description: `${subAdminForm.user_email} will see "${selectedWhiteLabel.name}" branding when they login`,
        duration: 5000
      });
      
      // Reset form
      setSubAdminForm({
        user_email: '',
        user_name: '',
        role: 'sub_admin',
        permissions: ''
      });
      
      // Reload white labels
      loadWhiteLabels();
    } catch (error) {
      console.error('Error adding sub-admin:', error);
      toast.error('Failed to assign sub-admin', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    }
  };

  const loadWhiteLabels = async () => {
    try {
      const labels = await db.query('white_labels', { order: '_created_at.desc' });
      setWhiteLabels(labels || []);
    } catch (error) {
      console.error('Error loading white labels:', error);
    }
  };

  // User Migration Handlers
  const handleManualMigration = async () => {
    try {
      if (!manualMigration.email || !manualMigration.firstName) {
        toast.error('Email and First Name are required');
        return;
      }

      setMigrationLoading(true);
      setMigrationProgress({
        total: 1,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: []
      });

      // Generate secure password
      const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let password = '';
        const array = new Uint32Array(16);
        crypto.getRandomValues(array);
        for (let i = 0; i < 16; i++) {
          password += chars[array[i] % chars.length];
        }
        return password;
      };

      const generatedPassword = generatePassword();

      // Create user account
      const userResult = await auth.createUser({
        email: manualMigration.email,
        password: generatedPassword,
        firstName: manualMigration.firstName,
        lastName: manualMigration.lastName || '',
        locale: 'en',
        metadata: {
          migratedFrom: 'distributionunion.com',
          migratedAt: new Date().toISOString()
        }
      });

      if (!userResult?.userUuid) {
        throw new Error('Failed to create user account');
      }

      // Create artist profile with 5-digit numeric user ID
      const userId = generateFiveDigitUserId();
      
      await db.insert('artists', {
        user_uuid: userId,
        artist_name: manualMigration.artistName || manualMigration.firstName,
        package_type: manualMigration.packageType,
        label_name: 'Union Music Group Ltd',
        label_name_locked: manualMigration.packageType === 'free' ? 1 : 0
      });

      // Send welcome email if requested
      if (manualMigration.sendWelcome) {
        try {
          console.log('Sending welcome email to:', manualMigration.email);
          const emailResult = await functions.post('send-migration-welcome', {
            email: manualMigration.email,
            firstName: manualMigration.firstName,
            password: generatedPassword,
            artistName: manualMigration.artistName || manualMigration.firstName
          });
          
          console.log('Email result:', emailResult);
          
          if (emailResult.emailSent) {
            toast.success('Welcome email sent!', {
              description: `Login credentials sent to ${manualMigration.email}`,
              duration: 3000
            });
          } else {
            toast.error('Email delivery failed', {
              description: 'User created but email could not be sent',
              duration: 5000
            });
          }
        } catch (emailError) {
          console.error('Welcome email failed:', emailError);
          toast.error('Email service unavailable', {
            description: 'User created but welcome email failed',
            duration: 5000
          });
        }
      }

      setMigrationProgress({
        total: 1,
        processed: 1,
        successful: 1,
        failed: 0,
        errors: []
      });

      toast.success('User migrated successfully!', {
        description: `Account created for ${manualMigration.email}`,
        duration: 5000
      });

      // Reset form
      setManualMigration({
        email: '',
        firstName: '',
        lastName: '',
        artistName: '',
        packageType: 'free',
        sendWelcome: true
      });

      // Reload admin data
      await loadAdminData();

    } catch (error) {
      console.error('Error in manual migration:', error);
      setMigrationProgress(prev => ({
        ...prev,
        failed: prev.failed + 1,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error']
      }));

      toast.error('Migration failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    } finally {
      setMigrationLoading(false);
    }
  };

  const handleCsvMigration = async () => {
    try {
      if (!csvMigrationFile) {
        toast.error('Please select a CSV file');
        return;
      }

      setMigrationLoading(true);
      
      // Parse CSV
      const text = await csvMigrationFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        return row;
      });

      setCsvPreview(data.slice(0, 5)); // Show first 5 rows

      setMigrationProgress({
        total: data.length,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: []
      });

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        setMigrationProgress(prev => ({ ...prev, processed: i + 1 }));

        try {
          const email = row.email || row['email address'];
          const firstName = row.firstname || row['first name'] || row.name || '';
          const lastName = row.lastname || row['last name'] || '';
          const artistName = row.artistname || row['artist name'] || firstName;
          const packageType = row.package || row.subscription || 'free';

          if (!email) {
            throw new Error('Missing email address');
          }

          // Generate password
          const generatePassword = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
            let password = '';
            const array = new Uint32Array(16);
            crypto.getRandomValues(array);
            for (let j = 0; j < 16; j++) {
              password += chars[array[j] % chars.length];
            }
            return password;
          };

          const generatedPassword = generatePassword();

          // Create user
          const userResult = await auth.createUser({
            email,
            password: generatedPassword,
            firstName,
            lastName,
            locale: 'en',
            metadata: {
              migratedFrom: 'distributionunion.com',
              migratedAt: new Date().toISOString()
            }
          });

          if (userResult?.userUuid) {
            // Create artist profile with 5-digit numeric user ID
            const userId = generateFiveDigitUserId();
            
            await db.insert('artists', {
              user_uuid: userId,
              artist_name: artistName,
              package_type: packageType === 'sub' ? 'sub' : 'free',
              label_name: 'Union Music Group Ltd',
              label_name_locked: packageType !== 'sub' ? 1 : 0
            });

            setMigrationProgress(prev => ({
              ...prev,
              successful: prev.successful + 1
            }));
          }

        } catch (rowError) {
          console.error(`Error processing row ${i + 1}:`, rowError);
          setMigrationProgress(prev => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [...prev.errors, `Row ${i + 1}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`]
          }));
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Migration completed!`, {
        description: `${migrationProgress.successful} users migrated successfully`,
        duration: 5000
      });

      // Reload admin data
      await loadAdminData();

    } catch (error) {
      console.error('Error in CSV migration:', error);
      toast.error('CSV Migration failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    } finally {
      setMigrationLoading(false);
    }
  };

  // Pagination Helper Functions
  const paginateArray = <T,>(array: T[], pagination: { currentPage: number; itemsPerPage: number }) => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return array.slice(startIndex, endIndex);
  };

  const getTotalPages = (array: any[], itemsPerPage: number) => {
    return Math.ceil(array.length / itemsPerPage);
  };

  // Link Trees Functions
  const loadLinkTrees = async () => {
    try {
      const trees = await db.query('link_trees', {});
      setLinkTrees(Array.isArray(trees) ? trees : []);
    } catch (error) {
      console.error('Error loading link trees:', error);
      setLinkTrees([]);
    }
  };

  const generateUniqueSlug = async (title: string): Promise<string> => {
    // Create a base slug from the title
    let baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9-]/g, '')  // Remove non-URL characters
      .replace(/-+/g, '-')          // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
    
    if (!baseSlug) {
      baseSlug = 'link-tree';
    }

    // Check if this slug already exists
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingSlug = await db.query('link_trees', { 
        custom_slug: `eq.${finalSlug}` 
      });
      
      if (!Array.isArray(existingSlug) || existingSlug.length === 0) {
        return finalSlug; // Found a unique slug
      }
      
      // Try with a counter
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
      
      // Safety limit to prevent infinite loop
      if (counter > 1000) {
        return `link-tree-${Date.now()}`;
      }
    }
  };

  const loadLinkTreeLinks = async (treeId: number) => {
    try {
      const links = await db.query('link_tree_links', { link_tree_id: `eq.${treeId}` });
      setLinkTreeLinks(Array.isArray(links) ? links : []);
    } catch (error) {
      console.error('Error loading link tree links:', error);
      setLinkTreeLinks([]);
    }
  };

  const PaginationControls = ({ 
    pagination, 
    setPagination, 
    totalItems 
  }: { 
    pagination: { currentPage: number; itemsPerPage: number }; 
    setPagination: React.Dispatch<React.SetStateAction<any>>;
    totalItems: number;
  }) => {
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-500/20">
        <div className="text-sm text-purple-300">
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, totalItems)} of {totalItems} items
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
            disabled={pagination.currentPage === 1}
            className="text-purple-300 border-purple-500/30"
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.currentPage <= 3) {
              pageNum = i + 1;
            } else if (pagination.currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = pagination.currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                size="sm"
                variant={pagination.currentPage === pageNum ? "default" : "outline"}
                onClick={() => setPagination({ ...pagination, currentPage: pageNum })}
                className={pagination.currentPage === pageNum ? "bg-purple-500" : "text-purple-300 border-purple-500/30"}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
            disabled={pagination.currentPage === totalPages}
            className="text-purple-300 border-purple-500/30"
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const handleUpdateRoyalty = async (royaltyId: number, updates: any) => {
    try {
      console.log('=== ROYALTY UPDATE START ===');
      console.log('handleUpdateRoyalty called:', royaltyId, updates);
      
      // First validate required fields
      if (!updates.artist_uuid || !updates.track_title || !updates.platform) {
        console.error('Missing required fields');
        toast.error('Artist UUID, Track Title, and Platform are required');
        return;
      }
      if (updates.streams < 0 || updates.revenue < 0) {
        console.error('Invalid values:', { streams: updates.streams, revenue: updates.revenue });
        toast.error('Streams and Revenue must be positive numbers');
        return;
      }
      if (updates.revenue === 8 || String(updates.revenue) === '8') {
        console.error('Blocked placeholder data');
        toast.error('$8 revenue is not allowed (placeholder data)');
        return;
      }
      
      // Create a clean updates object by ONLY including database fields
      const cleanUpdates: any = {};
      
      // WHITELIST: Only these fields exist in the royalties table
      const allowedFields = [
        'artist_uuid',
        'track_title', 
        'platform',
        'streams',
        'revenue',
        'currency',
        'period',
        'country',
        'split_percentage',
        'label_share',
        'upc',
        'isrc',
        'admin_notes',
        'is_adjustment'
      ];
      
      // Copy ONLY allowed fields - exclude EVERYTHING else
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          cleanUpdates[field] = updates[field];
        }
      }
      
      console.log('Clean updates for database:', cleanUpdates);
      console.log('Filtered out fields:', Object.keys(updates).filter(key => !allowedFields.includes(key)));
      
      // Verify cleanUpdates has no forbidden fields
      const forbiddenFields = Object.keys(cleanUpdates).filter(key => !allowedFields.includes(key));
      if (forbiddenFields.length > 0) {
        console.error('ERROR: Forbidden fields still in cleanUpdates:', forbiddenFields);
        toast.error('Internal error: Forbidden fields detected');
        return;
      }
      
      console.log('Executing database update...');
      await db.update('royalties', { _row_id: `eq.${royaltyId}` }, cleanUpdates);
      
      console.log('Update successful, clearing editing mode');
      setEditingRoyalty(null);
      
      console.log('Reloading admin data');
      await loadAdminData();
      
      console.log('=== ROYALTY UPDATE COMPLETE ===');
      toast.success('Royalty entry updated successfully!', {
        description: 'Changes have been saved to the database.',
        duration: 3000
      });
    } catch (error) {
      console.error('=== ROYALTY UPDATE ERROR ===');
      console.error('Error updating royalty:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        royaltyId,
        updatesKeys: Object.keys(updates)
      });
      toast.error('Failed to update royalty entry', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    }
  };

  const filteredData = () => {
    let filtered = activeTab === 'tracks' || activeTab === 'qc' ? tracks : users;

    if (searchQuery) {
      if (activeTab === 'tracks' || activeTab === 'qc') {
        filtered = filtered.filter((item: any) => 
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        filtered = filtered.filter((item: any) => 
          item.artist_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    if (statusFilter !== 'all' && activeTab === 'tracks') {
      filtered = filtered.filter((item: any) => item.approval_status === statusFilter);
    }

    return filtered;
  };

  const filteredRoyalties = () => {
    return allRoyalties;
  };

  const getDetailedStats = () => {
    const totalStreams = allRoyalties.reduce((sum: number, r: any) => sum + (r.streams || 0), 0);
    const totalRevenue = allRoyalties.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0);
    const genreBreakdown = tracks.reduce((acc: any, t: any) => {
      const genre = t.genre || 'Unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    const languageBreakdown = tracks.reduce((acc: any, t: any) => {
      const lang = t.language || 'Unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    return {
      totalStreams,
      totalRevenue,
      genreBreakdown,
      languageBreakdown,
      avgTracksPerUser: users.length > 0 ? (tracks.length / users.length).toFixed(2) : 0,
      recentUploads: tracks.filter((t: any) => {
        const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
        return t._created_at && t._created_at > thirtyDaysAgo;
      }).length
    };
  };

  const detailedStats = getDetailedStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-purple-400 mb-4">Loading Admin Panel...</div>
          <div className="text-sm text-purple-500">Please wait while we load your data</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Access Denied</div>
          <div className="text-purple-300 mb-4">You don't have permission to access this admin panel</div>
          <RouterLink to="/dashboard">
            <Button className="bg-purple-500 hover:bg-purple-600">Return to Dashboard</Button>
          </RouterLink>
        </div>
      </div>
    );
  }

  return (
    <div key={dataLoadVersion} className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <RouterLink to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Union Music Group - Admin</span>
            </RouterLink>
            <div className="flex items-center gap-4">
              <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">ADMIN ACCESS</Badge>
              <RouterLink to="/dashboard">
                <Button variant="ghost" className="text-purple-300 hover:text-white">
                  Exit Admin
                </Button>
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-purple-300">Manage users, tracks, royalties, and quality control</p>
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-300">
                    <strong>Admin User Access:</strong> To access Upload, Manage Tracks, and Royalty Check features as a user, use the "Login as User" button in the Users tab. This allows you to experience the platform from the artist's perspective while maintaining admin privileges.
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={async () => {
                console.log('🔄 Manual refresh triggered by user');
                toast.loading('Refreshing admin data...');
                try {
                  await loadAdminData();
                  toast.dismiss();
                  toast.success('Admin data refreshed successfully!');
                } catch (error) {
                  toast.dismiss();
                  toast.error('Failed to refresh admin data. Please try again.');
                }
              }}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-300">Total</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{users.length}</div>
              <div className="text-sm text-purple-300">Registered Users</div>
              <div className="text-xs text-purple-400 mt-2">
                {users.filter(u => u.profileCompleted).length} with profiles • {users.filter(u => !u.profileCompleted).length} incomplete
              </div>
            </Card>

            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Music className="w-6 h-6 text-purple-400" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-300">Total</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{tracks.length}</div>
              <div className="text-sm text-purple-300">Total Tracks</div>
            </Card>

            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300">Pending</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{pendingTracks.length}</div>
              <div className="text-sm text-purple-300">Awaiting Review</div>
            </Card>

            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <Badge className="bg-green-500/20 text-green-300">Records</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{allRoyalties.length}</div>
              <div className="text-sm text-purple-300">Royalty Entries</div>
            </Card>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className={activeTab === 'dashboard' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'qc' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('qc')}
              className={activeTab === 'qc' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              QC Queue ({pendingTracks.length})
            </Button>
            <Button
              variant={activeTab === 'tracks' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('tracks')}
              className={activeTab === 'tracks' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              All Tracks
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className={activeTab === 'users' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              Users
            </Button>
            <Button
              variant={activeTab === 'royalties' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('royalties')}
              className={activeTab === 'royalties' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              Royalties
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analytics')}
              className={activeTab === 'analytics' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              Analytics
            </Button>
            <Button
              variant={activeTab === 'packages' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('packages')}
              className={activeTab === 'packages' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <Crown className="w-3 h-3 mr-1" />
              Packages
            </Button>
            <Button
              variant={activeTab === 'payouts' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('payouts')}
              className={activeTab === 'payouts' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Payouts ({payoutRequests.length})
            </Button>
            <Button
              variant={activeTab === 'storage' ? 'default' : 'ghost'}
              onClick={() => {
                setActiveTab('storage');
                loadStorageData();
              }}
              className={activeTab === 'storage' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Storage
            </Button>
            <Button
              variant={activeTab === 'artist-profiles' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('artist-profiles')}
              className={activeTab === 'artist-profiles' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <User className="w-3 h-3 mr-1" />
              Artist Profiles
            </Button>
            <Button
              variant={activeTab === 'quick-royalty' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('quick-royalty')}
              className={activeTab === 'quick-royalty' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Quick Royalty
            </Button>
            <Button
              variant={activeTab === 'pay-as-you-go' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('pay-as-you-go')}
              className={activeTab === 'pay-as-you-go' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <Album className="w-3 h-3 mr-1" />
              Pay As You Go
            </Button>
            <Button
              variant={activeTab === 'white-labels' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('white-labels')}
              className={activeTab === 'white-labels' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <Building2 className="w-3 h-3 mr-1" />
              White Labels
            </Button>
            <Button
              variant={activeTab === 'link-trees' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('link-trees')}
              className={activeTab === 'link-trees' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              Link Trees
            </Button>
            <Button
              variant={activeTab === 'migration' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('migration')}
              className={activeTab === 'migration' ? 'bg-purple-500 text-white' : 'text-purple-300 hover:text-white text-xs px-3 py-2'}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              User Migration
            </Button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => exportData('users')}
                      className="w-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Users
                    </Button>
                    <Button
                      onClick={() => exportData('tracks')}
                      className="w-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Tracks
                    </Button>
                    <Button
                      onClick={() => exportData('royalties')}
                      className="w-full bg-green-500/20 text-green-300 hover:bg-green-500/30 justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Royalties
                    </Button>
                  </div>
                </Card>

                <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Pending Review</h3>
                  {pendingTracks.length === 0 ? (
                    <p className="text-purple-300">No tracks awaiting review</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingTracks.slice(0, 5).map((track) => (
                        <div key={track._row_id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                          <div>
                            <div className="text-white font-medium">{track.title}</div>
                            <div className="text-purple-300 text-sm">{track.genre || 'No genre'}</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveTab('qc');
                              setSelectedTrack(track);
                            }}
                            className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          >
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Users & Artists Management - Always Visible */}
              <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-400" />
                      </div>
                      Users & Artists Management
                    </h3>
                    <p className="text-purple-300 text-sm mt-1">Complete manual control over all accounts</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      <span className="text-purple-300">Total: {users.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-purple-300">{users.filter(u => u.enabled !== false && u.account_status !== 'blocked' && u.account_status !== 'suspended').length} Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-purple-300">{users.filter(u => u.account_status === 'blocked' || u.enabled === false).length} Blocked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-purple-300">{users.filter(u => u.account_status === 'suspended').length} Suspended</span>
                    </div>
                  </div>
                </div>

                {/* User Filter Controls */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-purple-300 text-sm">Filter:</label>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                      <option value="all">All Users ({users.length})</option>
                      <option value="active">Active Only ({users.filter(u => u.enabled !== false && u.account_status !== 'blocked' && u.account_status !== 'suspended').length})</option>
                      <option value="blocked">Blocked Only ({users.filter(u => u.account_status === 'blocked' || u.enabled === false).length})</option>
                      <option value="suspended">Suspended Only ({users.filter(u => u.account_status === 'suspended').length})</option>
                      <option value="sub">Subscription ({users.filter(u => u.package_type === 'sub').length})</option>
                      <option value="free">Free Plan ({users.filter(u => u.package_type === 'free').length})</option>
                    </select>
                  </div>
                  <div className="ml-auto text-purple-400 text-sm">
                    Showing {userStatusFilter === 'all' ? users.length : 
                      userStatusFilter === 'active' ? users.filter(u => u.enabled !== false && u.account_status !== 'blocked' && u.account_status !== 'suspended').length :
                      userStatusFilter === 'blocked' ? users.filter(u => u.account_status === 'blocked' || u.enabled === false).length :
                      userStatusFilter === 'suspended' ? users.filter(u => u.account_status === 'suspended').length :
                      userStatusFilter === 'sub' ? users.filter(u => u.package_type === 'sub').length :
                      users.filter(u => u.package_type === 'free').length} users
                  </div>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const filteredUsers = users.filter(user => {
                      if (userStatusFilter === 'all') return true;
                      if (userStatusFilter === 'active') return user.enabled !== false && user.account_status !== 'blocked' && user.account_status !== 'suspended';
                      if (userStatusFilter === 'blocked') return user.account_status === 'blocked' || user.enabled === false;
                      if (userStatusFilter === 'suspended') return user.account_status === 'suspended';
                      if (userStatusFilter === 'sub') return user.package_type === 'sub';
                      if (userStatusFilter === 'free') return user.package_type === 'free';
                      return true;
                    });
                    
                    // Apply pagination
                    const paginatedUsers = paginateArray(filteredUsers, usersPagination);
                    const totalPages = Math.ceil(filteredUsers.length / usersPagination.itemsPerPage);
                    
                    return (
                      <>
                        {paginatedUsers.map((user) => (
                    <div key={user._row_id || user.userUuid || user.email} className="border border-purple-500/20 rounded-lg overflow-hidden hover:border-purple-500/40 transition-colors">
                      <div className="p-4 bg-slate-800/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-white font-semibold">{user.artist_name || 'Unknown Artist'}</h4>
                              {user.package_type === 'sub' && (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Subscription
                                </Badge>
                              )}
                              {user.package_type === 'free' && (
                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Free Plan
                                </Badge>
                              )}
                              {(user.account_status === 'blocked' || user.enabled === false) && (
                                <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">
                                  <X className="w-3 h-3 mr-1" />
                                  Blocked
                                </Badge>
                              )}
                              {user.account_status === 'suspended' && (
                                <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Suspended
                                </Badge>
                              )}
                              {user.custom_status && (
                                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  <Edit className="w-3 h-3 mr-1" />
                                  {user.custom_status}
                                </Badge>
                              )}
                              {!user.profileCompleted && (
                                <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Profile Incomplete
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-purple-300 mb-2">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-purple-400">Label:</span>
                                <span>{user.label_name || 'Union Music Group Ltd'}</span>
                                {user.label_name_locked && user.package_type === 'free' && (
                                  <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Locked
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Account Number and Payout Details */}
                              {(() => {
                                const payoutDetails = getUserPayoutDetails(user.userUuid);
                                if (payoutDetails && payoutDetails.hasPayoutData) {
                                  return (
                                    <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                      <div className="text-xs text-blue-300 mb-1 font-semibold">Account Information:</div>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <div className="text-purple-400">Account: {payoutDetails.account_number || 'N/A'}</div>
                                        <div className="text-purple-400">Bank: {payoutDetails.bank_name || 'N/A'}</div>
                                        <div className="text-purple-400">Country: {payoutDetails.country || 'N/A'}</div>
                                        <div className="text-purple-400">SWIFT: {payoutDetails.swift_code || 'N/A'}</div>
                                        {payoutDetails.iban && (
                                          <div className="text-purple-400 col-span-2">IBAN: {payoutDetails.iban}</div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <div className="mt-2 text-xs text-purple-400 italic">
                                    No payout information available
                                  </div>
                                );
                              })()}
                              
                              {user.admin_notes && (
                                <div className="mt-1 text-xs text-orange-300 bg-orange-500/10 p-1.5 rounded">
                                  <span className="font-semibold">Admin Notes:</span> {user.admin_notes}
                                </div>
                              )}
                              {user.firstName && user.lastName && (
                                <div className="text-xs text-purple-400 mt-1">
                                  Name: {user.firstName} {user.lastName} • Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                                </div>
                              )}
                              <div className="text-xs text-purple-400 mt-1">
                                User ID: {user.userUuid || 'N/A'} • Account Status: <span className={user.account_status === 'active' ? 'text-green-400' : user.account_status === 'blocked' ? 'text-red-400' : 'text-yellow-400'}>{user.account_status || 'active'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="bg-slate-900/50 border-t border-purple-500/20 p-3">
                        {editingUserManual === (user._row_id || user.userUuid) ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="text-purple-300 text-xs mb-1 block">Label Name</label>
                                <input
                                  type="text"
                                  value={manualUserEdit.label_name}
                                  onChange={(e) => setManualUserEdit({...manualUserEdit, label_name: e.target.value})}
                                  className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-1.5 text-white text-sm"
                                  placeholder="Custom label name"
                                />
                              </div>
                              <div>
                                <label className="text-purple-300 text-xs mb-1 block">Admin Notes</label>
                                <input
                                  type="text"
                                  value={manualUserEdit.admin_notes}
                                  onChange={(e) => setManualUserEdit({...manualUserEdit, admin_notes: e.target.value})}
                                  className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-1.5 text-white text-sm"
                                  placeholder="Internal notes"
                                />
                              </div>
                              <div>
                                <label className="text-purple-300 text-xs mb-1 block">Custom Status</label>
                                <input
                                  type="text"
                                  value={manualUserEdit.custom_status}
                                  onChange={(e) => setManualUserEdit({...manualUserEdit, custom_status: e.target.value})}
                                  className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-1.5 text-white text-sm"
                                  placeholder="E.g., VIP, Pending Review"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveManualEdit(user._row_id || user.userUuid)}
                                className="bg-green-500/20 text-green-300 hover:bg-green-500/30"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Save Changes
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelManualEdit}
                                className="text-purple-300 hover:text-white"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Plan Management */}
                              {editingUserPackage === (user._row_id || user.userUuid) ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleChangePackage(user._row_id || user.userUuid, 'free')}
                                    className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                                  >
                                    Set Free
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleChangePackage(user._row_id || user.userUuid, 'sub')}
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                                  >
                                    <Crown className="w-3 h-3 mr-1" />
                                    Set Sub
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingUserPackage(null)}
                                    className="text-purple-300 hover:text-white"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => setEditingUserPackage(user._row_id || user.userUuid)}
                                  className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                                >
                                  <Crown className="w-3 h-3 mr-1" />
                                  Change Plan
                                </Button>
                              )}

                              {/* Quick Status Change */}
                              <select
                                value={user.account_status || 'active'}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (confirm(`Change user status to ${newStatus}?`)) {
                                    handleQuickStatusChange(user._row_id || user.userUuid, newStatus);
                                  }
                                }}
                                className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-2 py-1 text-white text-xs"
                              >
                                <option value="active">🟢 Active</option>
                                <option value="suspended">🟡 Suspended</option>
                                <option value="blocked">🔴 Blocked</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Manual Edit Button */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartManualEdit(user)}
                                className="text-purple-300 hover:text-white hover:bg-purple-500/10"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Manual Edit
                              </Button>
                              
                              {/* Account Action Buttons */}
                              {user.account_status !== 'blocked' && user.enabled !== false && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleBlockUser(user._row_id || user.userUuid)}
                                  className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  Block
                                </Button>
                              )}
                              {user.account_status === 'blocked' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleUnblockUser(user._row_id || user.userUuid)}
                                  className="text-green-300 hover:text-green-200 hover:bg-green-500/10"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Unblock
                                </Button>
                              )}
                            </div>
                        </div>
                        )}
                      </div>
                    </div>
                    ))}
                    {/* Pagination Controls */}
                    {(() => {
                      const filteredUsers = users.filter(user => {
                        if (userStatusFilter === 'all') return true;
                        if (userStatusFilter === 'active') return user.enabled !== false && user.account_status !== 'blocked' && user.account_status !== 'suspended';
                        if (userStatusFilter === 'blocked') return user.account_status === 'blocked' || user.enabled === false;
                        if (userStatusFilter === 'suspended') return user.account_status === 'suspended';
                        if (userStatusFilter === 'sub') return user.package_type === 'sub';
                        if (userStatusFilter === 'free') return user.package_type === 'free';
                        return true;
                      });
                      
                      const totalPages = Math.ceil(filteredUsers.length / usersPagination.itemsPerPage);
                      
                      if (totalPages <= 1) return null;
                      
                      return (
                        <PaginationControls 
                          pagination={usersPagination}
                          setPagination={setUsersPagination}
                          totalItems={filteredUsers.length}
                        />
                      );
                    })()}
                  </>
                  );
                })()}
                </div>
              </Card>
            </div>
          )}

          {/* QC Queue Tab */}
          {activeTab === 'qc' && (
            <div>
              {selectedTrack ? (
                <div className="mb-6">
                  <Button
                    variant="ghost"
                    className="text-purple-300 hover:text-white mb-4"
                    onClick={() => setSelectedTrack(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Queue
                  </Button>
                  <AdminTrackPlayer 
                    track={selectedTrack} 
                    onUpdateTrack={handleUpdateTrack}
                    onDownloadFile={downloadFile}
                    onApprove={() => {
                      handleApproveTrack(selectedTrack._row_id);
                      setSelectedTrack(null);
                    }}
                    onReject={(reason) => {
                      if (reason) {
                        handleRejectTrack(selectedTrack._row_id, reason);
                        setSelectedTrack(null);
                      }
                    }}
                    onSetPending={() => {
                      handleSetPendingStatus(selectedTrack._row_id);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTracks.length === 0 ? (
                    <Card className="bg-slate-900/50 border-purple-500/20 p-12 text-center">
                      <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
                      <p className="text-purple-300">No tracks currently awaiting review</p>
                    </Card>
                      ) : (
                    <>
                        {paginateArray(pendingTracks, tracksPagination).map((track) => (
                      <Card key={track._row_id} className="bg-slate-900/50 border-purple-500/20 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">{track.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-purple-500/20 text-purple-300">{track.genre || 'No genre'}</Badge>
                              <Badge className="bg-blue-500/20 text-blue-300">{track.language || 'No language'}</Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => setSelectedTrack(track)}
                            className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                              </Button>
                            </div>
                          </Card>
                        ))}
                        <PaginationControls 
                          pagination={tracksPagination}
                          setPagination={setTracksPagination}
                          totalItems={pendingTracks.length}
                        />
                      </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Royalties Management Tab */}
          {activeTab === 'royalties' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Import Royalty Data (CSV)</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-300 font-semibold mb-2">CSV Format Requirements:</h4>
                      <code className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded block mb-3">
                        artist_uuid OR artist_name, track_title OR title, platform OR "digital service provider", streams OR count, revenue OR "royalty ($us)", currency, period, split_percentage, label_share, upc OR "upc code", isrc OR "isrc code", territory OR country
                      </code>
                      <div className="text-xs text-blue-200 space-y-1">
                        <p>• <strong>Artist identification:</strong> artist_uuid (preferred) OR artist_name/performer (auto-lookup)</p>
                        <p>• <strong>Required fields:</strong> artist identification, track_title, platform</p>
                        <p>• <strong>Validation:</strong> streams ≥ 0, revenue ≥ 0</p>
                        <p>• <strong>⚠️ Blocked:</strong> $8 revenue (placeholder data)</p>
                        <p>• <strong>Defaults:</strong> currency=USD, period=current month</p>
                        <p>• <strong>Alternative column names:</strong> Supports multiple variations (e.g., "Digital Service Provider", "Count", "Royalty ($US)")</p>
                      </div>
                    </div>
                  
                  <label className="block">
                    <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors">
                      <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-purple-300 text-sm">Click to upload CSV file</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleRoyaltyFileUpload(file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </label>
                  
                  {royaltyUploadStatus && (
                    <div className={`text-center py-2 px-4 rounded-lg ${
                      royaltyUploadStatus.includes('Success') || royaltyUploadStatus.includes('imported') 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {royaltyUploadStatus}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">Royalty Entries Management</h3>
                    {editingRoyalty && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse">
                        <Edit className="w-3 h-3 mr-1" />
                        Editing Mode
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setEditingRoyalty({
                        artist_uuid: '',
                        track_title: '',
                        platform: 'Spotify',
                        streams: 0,
                        revenue: 0,
                        currency: 'USD',
                        period: new Date().toISOString().slice(0, 7),
                        split_percentage: 100,
                        label_share: 0,
                        upc: '',
                        isrc: '',
                        admin_notes: '',
                        is_adjustment: true
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                    disabled={editingRoyalty !== null}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {editingRoyalty ? 'Finish Editing First' : '+ Add Manual Entry'}
                  </Button>
                </div>

                {editingRoyalty && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Edit className="w-4 h-4 text-purple-400" />
                        {editingRoyalty._row_id ? 'Edit Royalty Entry' : 'Add New Royalty Entry'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRoyalty(null)}
                        className="text-purple-300 hover:text-white"
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Artist UUID *</label>
                      <input
                        type="text"
                        value={editingRoyalty.artist_uuid}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, artist_uuid: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Required: Enter artist UUID"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Track Title *</label>
                      <input
                        type="text"
                        value={editingRoyalty.track_title}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, track_title: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Required: Track name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">UPC</label>
                      <input
                        type="text"
                        value={editingRoyalty.upc || ''}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, upc: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Universal Product Code"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">ISRC</label>
                      <input
                        type="text"
                        value={editingRoyalty.isrc || ''}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, isrc: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="International Standard Recording Code"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Platform *</label>
                      <select
                        value={editingRoyalty.platform}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, platform: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        required
                      >
                        <option value="">Select Platform</option>
                        <optgroup label="Major Streaming Services">
                          <option>Spotify</option>
                          <option>Apple Music</option>
                          <option>YouTube Music</option>
                          <option>Amazon Music</option>
                          <option>Tidal</option>
                          <option>Deezer</option>
                          <option>Pandora</option>
                          <option>Napster</option>
                        </optgroup>
                        <optgroup label="Social & Video Platforms">
                          <option>TikTok</option>
                          <option>Instagram Music</option>
                          <option>Facebook Music</option>
                          <option>YouTube (Audio)</option>
                          <option>YouTube Shorts</option>
                          <option>Twitch</option>
                          <option>Snapchat Music</option>
                        </optgroup>
                        <optgroup label="Asian Markets">
                          <option>Line Music</option>
                          <option>KuGou</option>
                          <option>Kuwo</option>
                          <option>QQ Music</option>
                          <option>Migu</option>
                          <option>Y.qq (QQ Music)</option>
                          <option>NetEase Cloud Music</option>
                          <option>Yandex Music</option>
                          <option>Anghami</option>
                          <option>GG</option>
                          <option>Joox</option>
                          <option>JioSaavn</option>
                          <option>Resso</option>
                          <option>Smule</option>
                          <option>Wynk Music</option>
                          <option>Hungama</option>
                        </optgroup>
                        <optgroup label="Download Stores">
                          <option>iTunes</option>
                          <option>Google Play</option>
                          <option>Amazon MP3</option>
                          <option>Bandcamp</option>
                          <option>Beatport</option>
                          <option>Traxsource</option>
                          <option>Junodownload</option>
                          <option>7digital</option>
                        </optgroup>
                        <optgroup label="Emerging & Regional">
                          <option>SoundCloud</option>
                          <option>Mixcloud</option>
                          <option>Audiomack</option>
                          <option>Boomplay</option>
                          <option>Mdundo</option>
                          <option>Mzansi</option>
                          <option>Songa</option>
                          <option>Kkbox</option>
                          <option>MyMusic</option>
                          <option>Music Choice</option>
                          <option>iHeartRadio</option>
                          <option>SiriusXM</option>
                          <option>Radio.com</option>
                          <option>Audius</option>
                          <option>Resonate</option>
                          <option>Idagio</option>
                          <option>Presto</option>
                          <option>Primephonic</option>
                        </optgroup>
                        <optgroup label="Mobile Carriers">
                          <option>Verizon</option>
                          <option>AT&T</option>
                          <option>T-Mobile</option>
                          <option>Sprint</option>
                          <option>Vodafone</option>
                          <option>Telefonica</option>
                          <option>Orange</option>
                          <option>China Mobile</option>
                        </optgroup>
                        <optgroup label="Other Services">
                          <option>Shazam</option>
                          <option>Genius</option>
                          <option>Musixmatch</option>
                          <option>LyricFind</option>
                          <option>Other</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Streams</label>
                      <input
                        type="number"
                        value={editingRoyalty.streams}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, streams: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Revenue</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRoyalty.revenue}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, revenue: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Artist Share %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={editingRoyalty.split_percentage}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, split_percentage: parseFloat(e.target.value) || 100 })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Label Share %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={editingRoyalty.label_share}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, label_share: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-purple-300 text-sm mb-1 block">Admin Notes (Hidden from users)</label>
                      <textarea
                        value={editingRoyalty.admin_notes}
                        onChange={(e) => setEditingRoyalty({ ...editingRoyalty, admin_notes: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        rows={3}
                        placeholder="Internal notes about this royalty entry..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={async () => {
                        // Validate required fields
                        if (!editingRoyalty.artist_uuid || !editingRoyalty.track_title || !editingRoyalty.platform) {
                          toast.error('Artist UUID, Track Title, and Platform are required');
                          return;
                        }
                        if (editingRoyalty.streams < 0 || editingRoyalty.revenue < 0) {
                          toast.error('Streams and Revenue must be positive numbers');
                          return;
                        }
                        if (editingRoyalty.revenue === 8 || String(editingRoyalty.revenue) === '8') {
                          toast.error('$8 revenue is not allowed (placeholder data)');
                          return;
                        }
                        
                        try {
                          if (editingRoyalty._row_id) {
                            console.log('Updating royalty entry:', editingRoyalty._row_id, editingRoyalty);
                            await handleUpdateRoyalty(editingRoyalty._row_id, editingRoyalty);
                            toast.success('Royalty entry updated successfully!');
                          } else {
                            console.log('Creating new royalty entry:', editingRoyalty);
                            await db.insert('royalties', {
                              ...editingRoyalty,
                              uploaded_by: currentUser.userUuid,
                              upload_date: Math.floor(Date.now() / 1000)
                            });
                            setEditingRoyalty(null);
                            setRoyaltyUploadStatus('Royalty entry created successfully');
                            setTimeout(() => setRoyaltyUploadStatus(''), 3000);
                            await loadAdminData();
                            toast.success('Royalty entry created successfully!');
                          }
                        } catch (error) {
                          console.error('Error saving royalty entry:', error);
                          toast.error(`Failed to save royalty entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium"
                    >
                      {editingRoyalty._row_id ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Royalty Entry
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Create Royalty Entry
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingRoyalty(null)}
                      className="text-purple-300 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                )}

                <h3 className="text-lg font-semibold text-white mb-4">Recent Royalty Entries</h3>
                <div className="space-y-3">
                  {paginateArray(filteredRoyalties(), royaltiesPagination).map((royalty: any) => (
                    <div key={royalty._row_id} className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-semibold">{royalty.track_title}</h4>
                            <Badge className="bg-blue-500/20 text-blue-300">{royalty.platform}</Badge>
                            {royalty.is_adjustment && (
                              <Badge className="bg-orange-500/20 text-orange-300">Adjustment</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-purple-400">Streams:</div>
                              <div className="text-white">{royalty.streams?.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-purple-400">Gross:</div>
                              <div className="text-green-300">${royalty.revenue?.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-purple-400">Artist Share:</div>
                              <div className="text-white">{royalty.split_percentage}%</div>
                            </div>
                            <div>
                              <div className="text-purple-400">Label Share:</div>
                              <div className="text-white">{royalty.label_share}%</div>
                            </div>
                            {royalty.upc && (
                              <div>
                                <div className="text-purple-400">UPC:</div>
                                <div className="text-white text-xs">{royalty.upc}</div>
                              </div>
                            )}
                            {royalty.isrc && (
                              <div>
                                <div className="text-purple-400">ISRC:</div>
                                <div className="text-white text-xs">{royalty.isrc}</div>
                              </div>
                            )}
                          </div>
                          {royalty.admin_notes && (
                            <div className="mt-2 text-xs text-orange-300 bg-orange-500/10 p-2 rounded">
                              <span className="font-semibold">Admin Notes:</span> {royalty.admin_notes}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            console.log('🔝 Edit button clicked for royalty:', royalty);
                            console.log('Setting editingRoyalty state with:', royalty);
                            setEditingRoyalty(royalty);
                            
                            // Scroll to top of form
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                            
                            toast.info('Editing royalty entry - make your changes below', {
                              duration: 2000
                            });
                          }}
                          className="text-purple-300 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  <PaginationControls 
                    pagination={royaltiesPagination}
                    setPagination={setRoyaltiesPagination}
                    totalItems={filteredRoyalties().length}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Payout Management Tab */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      Payout Requests Management
                    </h3>
                    <p className="text-purple-300 text-sm mt-1">
                      Review and process user withdrawal requests
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{payoutRequests.length}</div>
                      <div className="text-xs text-purple-400">Total Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{payoutRequests.filter(p => p.status === 'pending').length}</div>
                      <div className="text-xs text-purple-400">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{payoutRequests.filter(p => p.status === 'approved').length}</div>
                      <div className="text-xs text-purple-400">Approved</div>
                    </div>
                  </div>
                </div>

                {payoutRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-purple-400" />
                    </div>
                    <h4 className="text-white text-lg font-medium mb-2">No Payout Requests</h4>
                    <p className="text-purple-300 text-sm">No payout requests have been submitted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginateArray(payoutRequests, payoutsPagination).map((payout: any) => (
                      <Card key={payout._row_id} className="bg-slate-800/50 border border-purple-500/20 p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                payout.status === 'approved' ? 'bg-green-500/20' :
                                payout.status === 'rejected' ? 'bg-red-500/20' :
                                payout.status === 'processing' ? 'bg-blue-500/20' :
                                'bg-yellow-500/20'
                              }`}>
                                {payout.status === 'approved' ? <Check className="w-5 h-5 text-green-400" /> :
                                 payout.status === 'rejected' ? <X className="w-5 h-5 text-red-400" /> :
                                 payout.status === 'processing' ? <Clock className="w-5 h-5 text-blue-400" /> :
                                 <Clock className="w-5 h-5 text-yellow-400" />}
                              </div>
                              <div>
                                <h4 className="text-white font-semibold text-lg">
                                  ${payout.amount?.toFixed(2)} - {payout.full_name}
                                </h4>
                                <div className="text-purple-300 text-sm">
                                  {payout.email} • Request ID: #{payout._row_id}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-purple-400">Amount:</div>
                                <div className="text-white font-semibold">${payout.amount?.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-purple-400">Status:</div>
                                <div>
                                  <Badge className={
                                    payout.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                                    payout.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                    payout.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-yellow-500/20 text-yellow-300'
                                  }>
                                    {payout.status || 'pending'}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <div className="text-purple-400">Country:</div>
                                <div className="text-white">{payout.country?.toUpperCase() || 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-purple-400">Submitted:</div>
                                <div className="text-white">
                                  {payout.requested_at ? new Date(payout.requested_at * 1000).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <div className="text-purple-400">Bank Name:</div>
                                <div className="text-white">{payout.bank_name || 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-purple-400">Account:</div>
                                <div className="text-white">{payout.account_number || 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-purple-400">Routing/SWIFT:</div>
                                <div className="text-white">
                                  {payout.routing_number ? payout.routing_number : payout.swift_code || 'N/A'}
                                </div>
                              </div>
                              <div>
                                <div className="text-purple-400">IBAN:</div>
                                <div className="text-white">{payout.iban || 'Not provided'}</div>
                              </div>
                            </div>

                            {payout.notes && (
                              <div className="mt-3 text-sm">
                                <div className="text-purple-400">Notes:</div>
                                <div className="text-white bg-slate-900/50 p-2 rounded mt-1">{payout.notes}</div>
                              </div>
                            )}

                            {payout.processed_at && (
                              <div className="mt-3 text-sm text-blue-300">
                                Processed: {new Date(payout.processed_at * 1000).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {payout.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleProcessPayout(payout._row_id)}
                                  className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  Mark Processing
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovePayout(payout._row_id)}
                                  className="bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRejectPayout(payout._row_id)}
                                  className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {payout.status === 'processing' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovePayout(payout._row_id)}
                                  className="bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRejectPayout(payout._row_id)}
                                  className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {payout.status === 'approved' && (
                              <div className="text-green-400 text-sm font-medium">
                                ✓ Completed
                              </div>
                            )}
                            {payout.status === 'rejected' && (
                              <div className="text-red-400 text-sm font-medium">
                                ✗ Rejected
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    <PaginationControls 
                      pagination={payoutsPagination}
                      setPagination={setPayoutsPagination}
                      totalItems={payoutRequests.length}
                    />
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Storage Management Tab */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Audio File Storage Management</h3>
                    <p className="text-purple-300 text-sm">Remove audio files from approved tracks to save storage space while preserving all metadata</p>
                  </div>
                  <Button
                    onClick={loadStorageData}
                    disabled={storageLoading}
                    className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {/* Storage Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">Total Tracks</div>
                    <div className="text-2xl font-bold text-white">{storageStats.totalTracks}</div>
                  </Card>
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">Approved Tracks</div>
                    <div className="text-2xl font-bold text-green-400">{storageStats.approvedTracks}</div>
                  </Card>
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">With Audio Files</div>
                    <div className="text-2xl font-bold text-yellow-400">{storageStats.tracksWithAudio}</div>
                  </Card>
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">Audio Removed</div>
                    <div className="text-2xl font-bold text-blue-400">{storageStats.tracksWithoutAudio}</div>
                  </Card>
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">Est. Storage Saved</div>
                    <div className="text-2xl font-bold text-green-400">{storageStats.estimatedSavings}MB</div>
                  </Card>
                </div>

                {/* Information Section */}
                <Card className="bg-blue-950/30 border-blue-500/20 p-4 mb-6">
                  <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Storage Optimization Information
                  </h4>
                  <div className="space-y-2 text-sm text-blue-200">
                    <div>• <strong>Audio files can be safely removed</strong> after tracks are approved and distributed to platforms</div>
                    <div>• <strong>All metadata is preserved</strong>: ISRC, UPC, catalog numbers, credits, and track information remain visible to users</div>
                    <div>• <strong>User experience remains intact</strong>: Users see all track details, but audio playback is disabled for approved tracks</div>
                    <div>• <strong>Significant storage savings</strong>: Audio files average ~5MB each, removing them frees substantial storage space</div>
                    <div>• <strong>Reversible action</strong>: If needed, audio files can be re-uploaded in the future (requires original files)</div>
                  </div>
                </Card>

                {/* Progress Indicator */}
                {deletionProgress && (
                  <Card className="bg-yellow-950/30 border-yellow-500/20 p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-yellow-300 font-medium">{deletionProgress}</span>
                    </div>
                  </Card>
                )}

                {/* Bulk Actions */}
                {storageTracks.length > 0 && (
                  <Card className="bg-orange-950/30 border-orange-500/20 p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-orange-300 font-semibold mb-1">⚠️ Bulk Actions Available</h4>
                        <p className="text-orange-200 text-sm">You have {storageTracks.length} approved tracks with audio files that can be removed</p>
                      </div>
                      <Button
                        onClick={deleteAllApprovedAudio}
                        className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All Audio Files
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Tracks with Audio Files */}
                {storageLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h4 className="text-white text-lg font-medium mb-2">Loading Storage Data...</h4>
                    <p className="text-purple-300 text-sm">Please wait while we analyze your storage usage</p>
                  </div>
                ) : storageTracks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="text-white text-lg font-medium mb-2">Storage Optimized!</h4>
                    <p className="text-purple-300 text-sm">No approved tracks have audio files stored. Your storage is optimized.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold mb-3">
                      Approved Tracks with Audio Files ({storageTracks.length})
                    </h4>
                    {storageTracks.map((track: any) => (
                      <Card key={track._row_id} className="bg-slate-800/50 border border-purple-500/20 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center">
                                {track.cover_art ? (
                                  <img 
                                    src={track.cover_art + '?w=100'} 
                                    alt={track.title} 
                                    className="w-12 h-12 rounded object-cover"
                                    style={{width: '48px', height: '48px'}}
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiIC8+PC9zdmc+';
                                    }}
                                  />
                                ) : (
                                  <Music className="w-6 h-6 text-purple-400" />
                                )}
                              </div>
                              <div>
                                <h5 className="text-white font-semibold">{track.title}</h5>
                                <div className="text-purple-300 text-sm">
                                  {track.isrc && `ISRC: ${track.isrc} • `}
                                  {track.upc && `UPC: ${track.upc}`}
                                </div>
                                <div className="text-purple-400 text-xs mt-1">
                                  {track.genre && `${track.genre} • `}
                                  Uploaded: {track._created_at ? new Date(track._created_at * 1000).toLocaleDateString() : 'Recently'}
                                </div>
                              </div>
                            </div>
                            
                            {track.file_path && (
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 mt-2">
                                <div className="text-blue-300 text-xs mb-1">📁 Audio File Location:</div>
                                <div className="text-blue-400 text-xs font-mono">{track.file_path}</div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-2">
                              ✓ Approved
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => deleteAudioFile(track)}
                              className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete Audio
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <Button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite New User
                  </Button>
                </div>

                {/* Invite User Form */}
                {showInviteForm && (
                  <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/30 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4 text-purple-400" />
                        Send User Invitation
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInviteForm(false)}
                        className="text-purple-300 hover:text-white"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-purple-300 text-sm mb-1 block">Email Address *</label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="user@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 text-sm mb-1 block">Full Name *</label>
                        <input
                          type="text"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 text-sm mb-1 block">Package Type</label>
                        <select
                          value={invitePackage}
                          onChange={(e) => setInvitePackage(e.target.value as 'free' | 'sub')}
                          className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          <option value="free">Free Plan</option>
                          <option value="sub">Subscription Plan</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleInviteUser}
                        disabled={inviteLoading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        {inviteLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowInviteForm(false);
                          setInviteEmail('');
                          setInviteName('');
                          setInvitePackage('free');
                        }}
                        className="text-purple-300 hover:text-white"
                        disabled={inviteLoading}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-200 text-sm">
                          <Mail className="w-3 h-3 inline mr-1" />
                          <strong>Note:</strong> The invited user will receive an activation email to set up their account and password.
                        </p>
                      </div>
                      
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <p className="text-yellow-200 text-xs">
                          <strong>⚠️ Email Delivery Info:</strong>
                        </p>
                        <ul className="text-yellow-200 text-xs mt-2 space-y-1">
                          <li>• Default email limit: ~2 emails/day without custom SMTP</li>
                          <li>• Activation emails may take 5-10 minutes to arrive</li>
                          <li>• Check spam/junk folders if email not received</li>
                          <li>• For higher limits, configure custom SMTP in settings</li>
                        </ul>
                      </div>
                      
                      {/* Debug info for admin */}
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                        <p className="text-orange-200 text-xs">
                          <strong>Debug Info:</strong> Your current user groups: {currentUser?.groups?.map((g: any) => g.key).join(', ') || 'none'}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <Card className="bg-orange-950/30 border-orange-500/20 p-4 mb-6">
                    <h4 className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Pending Invitations ({pendingInvitations.length})
                    </h4>
                    <div className="space-y-2">
                      {pendingInvitations.map((invitation, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-orange-500/20">
                          <div className="flex-1">
                            <div className="text-white font-medium">{invitation.name}</div>
                            <div className="text-purple-300 text-sm">{invitation.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={
                                invitation.packageType === 'sub' 
                                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30' 
                                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              }>
                                {invitation.packageType === 'sub' ? 'Subscription' : 'Free Plan'}
                              </Badge>
                              <span className="text-xs text-purple-400">
                                Invited {invitation.invitedAt ? new Date(invitation.invitedAt * 1000).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResendInvitation(invitation)}
                              className="text-purple-300 hover:text-white"
                              disabled={inviteLoading}
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Resend
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteInvitation(index)}
                              className="text-red-300 hover:text-red-200"
                              disabled={inviteLoading}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Manual Account Setup Section */}
                <Card className="bg-green-950/30 border-green-500/20 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-green-300 font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Manual Account Setup
                    </h4>
                    <Button
                      onClick={() => setShowManualForm(!showManualForm)}
                      size="sm"
                      className="bg-green-500/20 text-green-300 hover:bg-green-500/30"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      {showManualForm ? 'Hide Form' : 'Create Account'}
                    </Button>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                    <p className="text-green-200 text-sm">
                      <strong>✅ Alternative to Email Invitations:</strong> Create user accounts manually and share credentials directly. Bypasses email delivery issues.
                    </p>
                  </div>

                  {showManualForm && (
                    <Card className="bg-gradient-to-br from-green-950/50 to-slate-950/50 border-green-500/30 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-white font-semibold flex items-center gap-2">
                          <Key className="w-4 h-4 text-green-400" />
                          Create User Account with Password
                        </h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowManualForm(false);
                            setManualEmail('');
                            setManualName('');
                            setManualPackage('free');
                            setGeneratedCredentials(null);
                          }}
                          className="text-purple-300 hover:text-white"
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-green-300 text-sm mb-1 block">Email Address *</label>
                          <input
                            type="email"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                            className="w-full bg-slate-800/50 border border-green-500/20 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="user@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-green-300 text-sm mb-1 block">Full Name *</label>
                          <input
                            type="text"
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                            className="w-full bg-slate-800/50 border border-green-500/20 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-green-300 text-sm mb-1 block">Package Type</label>
                          <select
                            value={manualPackage}
                            onChange={(e) => setManualPackage(e.target.value as 'free' | 'sub')}
                            className="w-full bg-slate-800/50 border border-green-500/20 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            <option value="free">Free Plan</option>
                            <option value="sub">Subscription Plan</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleManualAccountSetup}
                          disabled={manualLoading}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          {manualLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Create Account & Generate Password
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowManualForm(false);
                            setManualEmail('');
                            setManualName('');
                            setManualPackage('free');
                          }}
                          className="text-purple-300 hover:text-white"
                          disabled={manualLoading}
                        >
                          Cancel
                        </Button>
                      </div>

                      <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-200 text-xs">
                          <strong>📋 Information:</strong> A secure password will be automatically generated and displayed for you to share with the user. The account will be ready for immediate login.
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Generated Credentials Display */}
                  {generatedCredentials && (
                    <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 p-6 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-yellow-300 font-semibold flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Account Credentials Generated
                        </h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={closeCredentialsDisplay}
                          className="text-yellow-300 hover:text-white"
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-yellow-500/20">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300 text-sm">Name:</span>
                            <span className="text-white font-medium">{generatedCredentials.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300 text-sm">Email:</span>
                            <span className="text-white font-medium">{generatedCredentials.email}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300 text-sm">Password:</span>
                            <span className="text-green-300 font-mono font-bold">{generatedCredentials.password}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300 text-sm">Package:</span>
                            <Badge className={
                              generatedCredentials.package === 'sub' 
                                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30' 
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            }>
                              {generatedCredentials.package === 'sub' ? 'Subscription' : 'Free Plan'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300 text-sm">Login URL:</span>
                            <span className="text-blue-300 text-xs">{generatedCredentials.loginUrl}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={copyCredentialsToClipboard}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                        >
                          {copiedToClipboard ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy All Credentials
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={closeCredentialsDisplay}
                          className="text-purple-300 hover:text-white"
                        >
                          Close
                        </Button>
                      </div>

                      <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-red-200 text-xs">
                          <strong>⚠️ Security Warning:</strong> Share these credentials with the user through a secure channel (encrypted email, secure messaging, phone call, etc.). Do not send via plain email if possible.
                        </p>
                      </div>
                    </Card>
                  )}
                </Card>

                {/* Email Troubleshooting Section */}
                <Card className="bg-red-950/30 border-red-500/20 p-6 mb-6">
                  <h4 className="text-red-300 font-semibold mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Delivery Troubleshooting
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-200 font-medium mb-2">⚠️ If users are not receiving invitation emails:</p>
                      <ul className="text-red-200 space-y-2 text-xs">
                        <li>• <strong>Check Rate Limits:</strong> Default limit is ~2 emails/day. Configure custom SMTP for higher limits.</li>
                        <li>• <strong>Spam Folders:</strong> Ask users to check junk/spam folders.</li>
                        <li>• <strong>Email Delay:</strong> Activation emails may take 5-15 minutes to arrive.</li>
                        <li>• <strong>Email Provider:</strong> Some providers (Gmail, Outlook) may delay authentication emails.</li>
                        <li>• <strong>Template Status:</strong> Verify user_welcome template is enabled in email settings.</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-blue-200 font-medium mb-2">🔧 Solutions to try:</p>
                      <ol className="text-blue-200 space-y-1 text-xs">
                        <li>1. Wait 15-30 minutes for email delivery</li>
                        <li>2. Ask user to check spam/junk folders</li>
                        <li>3. Use "Resend" button for pending invitations</li>
                        <li>4. Configure custom SMTP in platform settings for better delivery</li>
                        <li>5. Manually create password reset link if activation fails</li>
                      </ol>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-200 font-medium mb-2">✅ Alternative: Manual Account Setup</p>
                      <p className="text-green-200 text-xs">
                        If email activation fails, you can manually set user passwords using the "Request Password Reset" option in the platform admin panel, or contact technical support for assistance.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Existing Users */}
                <div className="space-y-3">
                  {paginateArray(users, usersPagination).map((user) => (
                    <div key={user._row_id || user.userUuid || user.email} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold">{user.artist_name || 'Unknown Artist'}</h4>
                          {user.package_type === 'sub' && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                              <Crown className="w-3 h-3 mr-1" />
                              Subscription
                            </Badge>
                          )}
                          {user.package_type === 'free' && (
                            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Free Plan
                            </Badge>
                          )}
                          {!user.profileCompleted && (
                            <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Profile Incomplete
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-purple-300">
                          <div>{user.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span>{user.label_name || 'Union Music Group Ltd'}</span>
                            {user.label_name_locked && user.package_type === 'free' && (
                              <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                <Lock className="w-3 h-3 mr-1" />
                                Label Locked
                              </Badge>
                            )}
                          </div>
                          {user.firstName && user.lastName && !user.profileCompleted && (
                            <div className="text-xs text-purple-400 mt-1">
                              Name: {user.firstName} {user.lastName} • Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingUserPackage === (user._row_id || user.userUuid) ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleChangePackage(user._row_id || user.userUuid, 'free')}
                              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                            >
                              Free
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleChangePackage(user._row_id || user.userUuid, 'sub')}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                            >
                              <Crown className="w-3 h-3 mr-1" />
                              Sub
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingUserPackage(null)}
                              className="text-purple-300 hover:text-white"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setEditingUserPackage(user._row_id || user.userUuid)}
                            className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                          >
                            Change Package
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <PaginationControls 
                    pagination={usersPagination}
                    setPagination={setUsersPagination}
                    totalItems={users.length}
                  />
                </div>
              </Card>
              
              <Card className="bg-blue-950/30 border-blue-500/20 p-6">
                <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Package Features
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2">Free Plan</h5>
                    <ul className="text-sm text-purple-300 space-y-1">
                      <li>✓ Basic music distribution</li>
                      <li>✓ Standard royalty reporting</li>
                      <li>✓ Fixed label: Union Music Group Ltd</li>
                      <li className="text-red-300">✗ Custom label name</li>
                      <li className="text-red-300">✗ Priority support</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      Subscription Plan
                    </h5>
                    <ul className="text-sm text-purple-300 space-y-1">
                      <li>✓ Advanced distribution features</li>
                      <li>✓ Priority royalty processing</li>
                      <li>✓ <span className="text-green-300 font-semibold">Custom label name</span></li>
                      <li>✓ Priority support</li>
                      <li>✓ Advanced analytics</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}
          {/* Packages Management Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Package Management</h3>
                    <p className="text-purple-300 text-sm">Manage subscription packages, pricing, and PayPal links</p>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    onClick={() => window.open('/plans', '_blank')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    View Plans Page
                  </Button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-blue-200 text-sm">
                    <strong>ℹ️ Package Management:</strong> All pricing and PayPal links are managed here. Changes will be reflected across the site including the Plans page, dashboard, and user upgrade options.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Basic Plan */}
                  <Card className="bg-gradient-to-br from-slate-900/50 to-slate-950/50 border-purple-500/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">Basic Plan</h4>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Monthly</Badge>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-white">$4.99</div>
                      <div className="text-purple-300 text-sm">per month</div>
                    </div>
                    <div className="space-y-2 text-sm text-purple-200 mb-4">
                      <div>• 1 Artist</div>
                      <div>• Unlimited releases</div>
                      <div>• 48-72h delivery</div>
                      <div>• All digital stores</div>
                      <div>• 100% royalties</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                      <div className="text-purple-300 text-xs mb-2">PayPal Subscription Link:</div>
                      <div className="text-purple-400 text-xs break-all">
                        https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-4XD88406N03958449NC2NMOA
                      </div>
                    </div>
                    <Button
                      className="w-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                      onClick={() => window.open('https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-4XD88406N03958449NC2NMOA', '_blank')}
                    >
                      Test PayPal Link
                    </Button>
                  </Card>

                  {/* Silver Pack */}
                  <Card className="bg-gradient-to-br from-yellow-950/50 to-orange-950/50 border-yellow-500/30 p-6 relative">
                    <div className="absolute -top-2 right-4">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                        MOST POPULAR
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">Silver Pack</h4>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Yearly</Badge>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-white">$40.00</div>
                      <div className="text-purple-300 text-sm">per year</div>
                    </div>
                    <div className="space-y-2 text-sm text-purple-200 mb-4">
                      <div>• <span className="text-yellow-300 font-semibold">Unlimited artists</span></div>
                      <div>• Unlimited releases</div>
                      <div>• 24-48h delivery</div>
                      <div>• Sync licensing (TV/Radio/Games)</div>
                      <div>• Label creation</div>
                      <div>• Facebook & Instagram monetization</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                      <div className="text-yellow-300 text-xs mb-2">PayPal Subscription Link:</div>
                      <div className="text-yellow-400 text-xs break-all">
                        https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-28J32398VJ727723WNC43SVI
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      onClick={() => window.open('https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-28J32398VJ727723WNC43SVI', '_blank')}
                    >
                      Test PayPal Link
                    </Button>
                  </Card>

                  {/* White Label */}
                  <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 border-purple-500/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">White Label</h4>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Custom</Badge>
                    </div>
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-white">$399</div>
                      <div className="text-purple-300 text-sm mb-1">setup fee + $40/month</div>
                      <div className="text-xs text-purple-400">maintenance & backend</div>
                    </div>
                    <div className="space-y-2 text-sm text-purple-200 mb-4">
                      <div>• <span className="text-purple-300 font-semibold">Own brand distribution</span></div>
                      <div>• Custom logo & branding</div>
                      <div>• Own website</div>
                      <div>• Full backend access</div>
                      <div>• Custom domain</div>
                      <div>• Advanced analytics</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                      <div className="text-purple-300 text-xs mb-2">PayPal Subscription Link:</div>
                      <div className="text-purple-400 text-xs break-all">
                        https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-5M576636AK744634MNATTUFY
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      onClick={() => window.open('https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-5M576636AK744634MNATTUFY', '_blank')}
                    >
                      Test PayPal Link
                    </Button>
                  </Card>
                </div>
              </Card>

              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Package Features Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left text-purple-300 pb-3">Feature</th>
                        <th className="text-center text-purple-300 pb-3">Basic $4.99/mo</th>
                        <th className="text-center text-yellow-300 pb-3">Silver $40/yr</th>
                        <th className="text-center text-purple-300 pb-3">White Label $399+$40/mo</th>
                      </tr>
                    </thead>
                    <tbody className="text-purple-200">
                      <tr className="border-b border-purple-500/10">
                        <td className="py-3">Artists</td>
                        <td className="text-center">1</td>
                        <td className="text-center text-yellow-300 font-semibold">Unlimited</td>
                        <td className="text-center">Unlimited</td>
                      </tr>
                      <tr className="border-b border-purple-500/10">
                        <td className="py-3">Releases</td>
                        <td className="text-center">Unlimited</td>
                        <td className="text-center text-yellow-300 font-semibold">Unlimited</td>
                        <td className="text-center">Unlimited</td>
                      </tr>
                      <tr className="border-b border-purple-500/10">
                        <td className="py-3">Delivery Time</td>
                        <td className="text-center">48-72h</td>
                        <td className="text-center text-yellow-300 font-semibold">24-48h</td>
                        <td className="text-center">24-48h</td>
                      </tr>
                      <tr className="border-b border-purple-500/10">
                        <td className="py-3">Sync Licensing</td>
                        <td className="text-center text-red-300">❌</td>
                        <td className="text-center text-green-300">✅</td>
                        <td className="text-center text-green-300">✅</td>
                      </tr>
                      <tr className="border-b border-purple-500/10">
                        <td className="py-3">Label Creation</td>
                        <td className="text-center text-red-300">❌</td>
                        <td className="text-center text-green-300">✅</td>
                        <td className="text-center text-green-300">✅</td>
                      </tr>
                      <tr className="border-b border-purple-500/10">
                        <td className="py-3">Social Media Monetization</td>
                        <td className="text-center text-red-300">❌</td>
                        <td className="text-center text-green-300">✅</td>
                        <td className="text-center text-green-300">✅</td>
                      </tr>
                      <tr className="border-b border-purple-500/10">
                        <td className="py-3">Custom Branding</td>
                        <td className="text-center text-red-300">❌</td>
                        <td className="text-center text-red-300">❌</td>
                        <td className="text-center text-green-300 font-semibold">✅ Full</td>
                      </tr>
                      <tr>
                        <td className="py-3">Support Level</td>
                        <td className="text-center">24/7 Email</td>
                        <td className="text-center text-yellow-300 font-semibold">24/7 Live Chat</td>
                        <td className="text-center">Priority</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}


          {activeTab === 'tracks' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">All Uploaded Tracks</h3>
                <p className="text-purple-300 text-sm mb-4">Showing {tracks.length} tracks from all users</p>
                
                {tracks.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-dashed border-purple-500/30">
                    <Music className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-purple-300">No tracks uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tracks.map((track) => {
                      const artist = users.find(u => u.userUuid === track.artist_uuid);
                      return (
                        <div 
                          key={track._row_id}
                          className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all"
                          onClick={() => setSelectedTrack(track)}
                        >
                          {track.cover_art ? (
                            <img 
                              src={track.cover_art} 
                              alt={track.title}
                              className="w-16 h-16 rounded object-cover"
                              style={{ width: '64px', height: '64px' }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Music className="w-6 h-6 text-purple-400" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold truncate">{track.title}</h4>
                            <p className="text-purple-300 text-sm">
                              {track.main_artist_name || artist?.artist_name || 'Unknown Artist'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-purple-400">
                                {new Date(track._created_at * 1000).toLocaleDateString()}
                              </span>
                              <span className="text-purple-500">•</span>
                              <Badge className={
                                track.approval_status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                track.approval_status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              }>
                                {track.approval_status || 'pending'}
                              </Badge>
                              <span className="text-purple-500">•</span>
                              <Badge className={
                                track.status === 'published' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                track.status === 'archived' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                                'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              }>
                                {track.status || 'draft'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs text-purple-400 mb-1">ISRC: {track.isrc || 'N/A'}</div>
                            <div className="text-xs text-purple-400 mb-2">Catalog: {track.catalog_number || 'N/A'}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTrack(track._row_id, track.title);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
              
              {selectedTrack && (
                <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Track Details</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTrack(null)}
                      className="text-purple-300 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <AdminTrackPlayer 
                    track={selectedTrack}
                    onApprove={() => handleApproveTrack(selectedTrack._row_id)}
                    onReject={(reason) => handleRejectTrack(selectedTrack._row_id, reason)}
                    onSetPending={() => handleSetPendingStatus(selectedTrack._row_id)}
                    onUpdateTrack={async (trackId, updates) => {
                      try {
                        await db.update("tracks", { _row_id: `eq.${trackId}` }, updates);
                        setTracks(tracks.map(t => t._row_id === trackId ? { ...t, ...updates } : t));
                        setSelectedTrack({ ...selectedTrack, ...updates });
                        toast.success("Track updated successfully");
                      } catch (error) {
                        console.error("Error updating track:", error);
                        toast.error("Failed to update track");
                      }
                    }}
                    onDownloadFile={downloadFile}
                    onSendMessage={(message) => sendMessageNotification(selectedTrack, message)}
                  />
                </Card>
              )}
            </div>
          )}

          {activeTab === 'analytics' && isAdmin && (
            <div className="space-y-6">
              {/* Analytics Management */}
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Royalty Analytics Management</h3>
                    <p className="text-purple-300 text-sm">Manually create, edit, and manage royalty analytics data for artists</p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingRoyalty({
                        artist_email: '',
                        artist_name: '',
                        track_title: '',
                        platform: 'Spotify',
                        streams: 0,
                        revenue: 0,
                        currency: 'USD',
                        period: new Date().toISOString().slice(0, 7),
                        country: 'US',
                        notes: ''
                      });
                      setShowAddCustomDSP(true);
                    }}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Analytics Entry
                  </Button>
                </div>

                {/* Analytics Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">Total Entries</div>
                    <div className="text-2xl font-bold text-white">{allRoyalties.length}</div>
                  </Card>
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">Total Streams</div>
                    <div className="text-2xl font-bold text-green-400">
                      {allRoyalties.reduce((sum, r) => sum + (r.streams || 0), 0).toLocaleString()}
                    </div>
                  </Card>
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      ${allRoyalties.reduce((sum, r) => sum + (r.revenue || 0), 0).toFixed(2)}
                    </div>
                  </Card>
                  <Card className="bg-slate-800/50 border border-purple-500/20 p-4">
                    <div className="text-purple-400 text-sm mb-1">Artists with Data</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {new Set(allRoyalties.map(r => r.artist_uuid)).size}
                    </div>
                  </Card>
                </div>

                {/* Analytics Table */}
                <div className="space-y-4">
                  {allRoyalties.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-dashed border-purple-500/30">
                      <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-purple-300">No analytics data found</p>
                      <p className="text-purple-400 text-sm mt-2">Click "Add Analytics Entry" to create manual analytics data</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {allRoyalties
                          .slice(
                            (royaltiesPagination.currentPage - 1) * royaltiesPagination.itemsPerPage,
                            royaltiesPagination.currentPage * royaltiesPagination.itemsPerPage
                          )
                          .map((royalty) => (
                            <Card key={royalty._row_id} className="bg-slate-800/50 border border-purple-500/20 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-white font-semibold">{royalty.track_title || 'Unknown Track'}</h4>
                                    <Badge className="bg-purple-500/20 text-purple-300">
                                      {royalty.platform || 'Unknown'}
                                    </Badge>
                                    <Badge className="bg-blue-500/20 text-blue-300">
                                      {royalty.period || 'N/A'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <div className="text-purple-400">Artist</div>
                                      <div className="text-white">{royalty.artist_name || 'Unknown'}</div>
                                    </div>
                                    <div>
                                      <div className="text-purple-400">Streams</div>
                                      <div className="text-white font-semibold">{(royalty.streams || 0).toLocaleString()}</div>
                                    </div>
                                    <div>
                                      <div className="text-purple-400">Revenue</div>
                                      <div className="text-white font-semibold">${(royalty.revenue || 0).toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <div className="text-purple-400">Country</div>
                                      <div className="text-white">{royalty.country || 'N/A'}</div>
                                    </div>
                                  </div>
                                  {royalty.admin_notes && (
                                    <div className="mt-2 text-sm">
                                      <div className="text-purple-400">Notes:</div>
                                      <div className="text-white">{royalty.admin_notes}</div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingRoyalty(royalty);
                                      setShowAddCustomDSP(true);
                                    }}
                                    className="text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      if (window.confirm(`Delete analytics entry for "${royalty.track_title}"?`)) {
                                        try {
                                          await db.delete('royalties', { _row_id: `eq.${royalty._row_id}` });
                                          setAllRoyalties(allRoyalties.filter(r => r._row_id !== royalty._row_id));
                                          toast.success('Analytics entry deleted');
                                        } catch (error) {
                                          toast.error('Failed to delete entry');
                                        }
                                      }
                                    }}
                                    className="text-red-300 border-red-500/30 hover:bg-red-500/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>

                      {/* Pagination Controls */}
                      {allRoyalties.length > royaltiesPagination.itemsPerPage && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-500/20">
                          <div className="text-purple-300 text-sm">
                            Showing {(royaltiesPagination.currentPage - 1) * royaltiesPagination.itemsPerPage + 1} to {Math.min(royaltiesPagination.currentPage * royaltiesPagination.itemsPerPage, allRoyalties.length)} of {allRoyalties.length} entries
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRoyaltiesPagination({ ...royaltiesPagination, currentPage: royaltiesPagination.currentPage - 1 })}
                              disabled={royaltiesPagination.currentPage === 1}
                              className="text-purple-300 border-purple-500/30 hover:bg-purple-500/20 disabled:opacity-50"
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Previous
                            </Button>
                            
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.ceil(allRoyalties.length / royaltiesPagination.itemsPerPage) }, (_, i) => i + 1)
                                .filter(page => {
                                  const totalPages = Math.ceil(allRoyalties.length / royaltiesPagination.itemsPerPage);
                                  return page === 1 || page === totalPages || (page >= royaltiesPagination.currentPage - 1 && page <= royaltiesPagination.currentPage + 1);
                                })
                                .map((page, index, arr) => (
                                  <>
                                    {index > 0 && arr[index - 1] !== page - 1 && (
                                      <span className="text-purple-400 px-2">...</span>
                                    )}
                                    <Button
                                      key={page}
                                      size="sm"
                                      variant={royaltiesPagination.currentPage === page ? "default" : "outline"}
                                      onClick={() => setRoyaltiesPagination({ ...royaltiesPagination, currentPage: page })}
                                      className={royaltiesPagination.currentPage === page 
                                        ? "bg-purple-500 text-white" 
                                        : "text-purple-300 border-purple-500/30 hover:bg-purple-500/20"}
                                    >
                                      {page}
                                    </Button>
                                  </>
                                ))}
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRoyaltiesPagination({ ...royaltiesPagination, currentPage: royaltiesPagination.currentPage + 1 })}
                              disabled={royaltiesPagination.currentPage === Math.ceil(allRoyalties.length / royaltiesPagination.itemsPerPage)}
                              className="text-purple-300 border-purple-500/30 hover:bg-purple-500/20 disabled:opacity-50"
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {/* Analytics Edit Form Modal */}
              {showAddCustomDSP && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <Card className="bg-slate-800 border border-purple-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h4 className="text-white font-semibold mb-4">
                      {editingRoyalty?._row_id ? 'Edit Analytics Entry' : 'Add Analytics Entry'}
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-purple-300 mb-1 block">Artist Email *</label>
                          <input
                            type="email"
                            value={editingRoyalty?.artist_email || ''}
                            onChange={(e) => setEditingRoyalty({...editingRoyalty, artist_email: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                            placeholder="artist@example.com"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-purple-300 mb-1 block">Artist Name</label>
                          <input
                            type="text"
                            value={editingRoyalty?.artist_name || ''}
                            onChange={(e) => setEditingRoyalty({...editingRoyalty, artist_name: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                            placeholder="Artist Name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-purple-300 mb-1 block">Track Title *</label>
                        <input
                          type="text"
                          value={editingRoyalty?.track_title || ''}
                          onChange={(e) => setEditingRoyalty({...editingRoyalty, track_title: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                          placeholder="Track Title"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-purple-300 mb-1 block">Platform *</label>
                          <select
                            value={editingRoyalty?.platform || 'Spotify'}
                            onChange={(e) => setEditingRoyalty({...editingRoyalty, platform: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                          >
                            <optgroup label="Streaming Services">
                              <option value="Spotify">Spotify</option>
                              <option value="Apple Music">Apple Music</option>
                              <option value="YouTube Music">YouTube Music</option>
                              <option value="Amazon Music">Amazon Music</option>
                              <option value="Tidal">Tidal</option>
                              <option value="Deezer">Deezer</option>
                              <option value="Pandora">Pandora</option>
                              <option value="SoundCloud">SoundCloud</option>
                              <option value="Napster">Napster</option>
                              <option value="iHeartRadio">iHeartRadio</option>
                              <option value="Anghami">Anghami</option>
                              <option value="Boomplay">Boomplay</option>
                              <option value="JioSaavn">JioSaavn</option>
                              <option value="KKBOX">KKBOX</option>
                              <option value="NetEase Cloud Music">NetEase Cloud Music</option>
                              <option value="Resso">Resso</option>
                              <option value="Gaana">Gaana</option>
                              <option value="Yandex Music">Yandex Music</option>
                              <option value="Hungama">Hungama</option>
                            </optgroup>
                            <optgroup label="Video Platforms">
                              <option value="YouTube">YouTube</option>
                              <option value="YouTube Content ID">YouTube Content ID</option>
                              <option value="YouTube Shorts">YouTube Shorts</option>
                              <option value="TikTok">TikTok</option>
                              <option value="Facebook">Facebook</option>
                              <option value="Instagram">Instagram</option>
                              <option value="Twitch">Twitch</option>
                              <option value="Vimeo">Vimeo</option>
                            </optgroup>
                            <optgroup label="Download Stores">
                              <option value="iTunes">iTunes</option>
                              <option value="Amazon Music Store">Amazon Music Store</option>
                              <option value="Google Play">Google Play</option>
                              <option value="Beatport">Beatport</option>
                              <option value="Junodownload">Junodownload</option>
                              <option value="Traxsource">Traxsource</option>
                              <option value="Bandcamp">Bandcamp</option>
                            </optgroup>
                            <optgroup label="Asian Platforms">
                              <option value="Spotify Japan">Spotify Japan</option>
                              <option value="Line Music">Line Music</option>
                              <option value="VK Music">VK Music</option>
                              <option value="Tencent Music">Tencent Music (QQ)</option>
                              <option value="KuGou">KuGou</option>
                              <option value="Kuwo">Kuwo</option>
                              <option value="Migu">Migu</option>
                              <option value="Bilibili">Bilibili</option>
                              <option value="Melon">Melon</option>
                              <option value="Genie">Genie</option>
                              <option value="FLO">FLO</option>
                              <option value="Bugs">Bugs</option>
                            </optgroup>
                            <optgroup label="Radio & Other">
                              <option value="SiriusXM">SiriusXM</option>
                              <option value="Pandora Radio">Pandora Radio</option>
                              <option value="Last.fm">Last.fm</option>
                              <option value="Shazam">Shazam</option>
                              <option value="Mixcloud">Mixcloud</option>
                              <option value="Audius">Audius</option>
                              <option value="Apple Music Classical">Apple Music Classical</option>
                              <option value="Idagio">Idagio</option>
                              <option value="Primephonic">Primephonic</option>
                              <option value="Resonate">Resonate</option>
                              <option value="Other">Other</option>
                            </optgroup>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-purple-300 mb-1 block">Period (YYYY-MM) *</label>
                          <input
                            type="month"
                            value={editingRoyalty?.period?.toLowerCase()?.replace('june', '06')?.replace('july', '07')?.replace('august', '08')?.replace('september', '09')?.replace('october', '10')?.replace('november', '11')?.replace('december', '12')?.replace('january', '01')?.replace('february', '02')?.replace('march', '03')?.replace('april', '04')?.replace('may', '05') || new Date().toISOString().slice(0, 7)}
                            onChange={(e) => setEditingRoyalty({...editingRoyalty, period: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-purple-300 mb-1 block">Streams *</label>
                          <input
                            type="number"
                            value={editingRoyalty?.streams || 0}
                            onChange={(e) => setEditingRoyalty({...editingRoyalty, streams: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-purple-300 mb-1 block"> Revenue (USD) *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingRoyalty?.revenue || 0}
                            onChange={(e) => setEditingRoyalty({...editingRoyalty, revenue: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-purple-300 mb-1 block">Country</label>
                          <select
                            value={editingRoyalty?.country || 'US'}
                            onChange={(e) => setEditingRoyalty({...editingRoyalty, country: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                          >
                            <optgroup label="North America">
                              <option value="US">United States (US)</option>
                              <option value="CA">Canada (CA)</option>
                              <option value="MX">Mexico (MX)</option>
                              <option value="GT">Guatemala (GT)</option>
                              <option value="CR">Costa Rica (CR)</option>
                              <option value="PA">Panama (PA)</option>
                              <option value="CU">Cuba (CU)</option>
                              <option value="DO">Dominican Republic (DO)</option>
                              <option value="JM">Jamaica (JM)</option>
                              <option value="TT">Trinidad and Tobago (TT)</option>
                            </optgroup>
                            <optgroup label="Central America & Caribbean">
                              <option value="HN">Honduras (HN)</option>
                              <option value="SV">El Salvador (SV)</option>
                              <option value="NI">Nicaragua (NI)</option>
                              <option value="BZ">Belize (BZ)</option>
                              <option value="HT">Haiti (HT)</option>
                              <option value="PR">Puerto Rico (PR)</option>
                              <option value="BS">Bahamas (BS)</option>
                              <option value="BB">Barbados (BB)</option>
                            </optgroup>
                            <optgroup label="South America">
                              <option value="BR">Brazil (BR)</option>
                              <option value="AR">Argentina (AR)</option>
                              <option value="CO">Colombia (CO)</option>
                              <option value="CL">Chile (CL)</option>
                              <option value="PE">Peru (PE)</option>
                              <option value="VE">Venezuela (VE)</option>
                              <option value="EC">Ecuador (EC)</option>
                              <option value="BO">Bolivia (BO)</option>
                              <option value="PY">Paraguay (PY)</option>
                              <option value="UY">Uruguay (UY)</option>
                              <option value="GY">Guyana (GY)</option>
                              <option value="SR">Suriname (SR)</option>
                            </optgroup>
                            <optgroup label="Europe">
                              <option value="GB">United Kingdom (GB)</option>
                              <option value="DE">Germany (DE)</option>
                              <option value="FR">France (FR)</option>
                              <option value="IT">Italy (IT)</option>
                              <option value="ES">Spain (ES)</option>
                              <option value="NL">Netherlands (NL)</option>
                              <option value="CH">Switzerland (CH)</option>
                              <option value="SE">Sweden (SE)</option>
                              <option value="NO">Norway (NO)</option>
                              <option value="DK">Denmark (DK)</option>
                              <option value="FI">Finland (FI)</option>
                              <option value="PL">Poland (PL)</option>
                              <option value="CZ">Czech Republic (CZ)</option>
                              <option value="AT">Austria (AT)</option>
                              <option value="BE">Belgium (BE)</option>
                              <option value="IE">Ireland (IE)</option>
                              <option value="PT">Portugal (PT)</option>
                              <option value="GR">Greece (GR)</option>
                              <option value="HU">Hungary (HU)</option>
                              <option value="RO">Romania (RO)</option>
                              <option value="BG">Bulgaria (BG)</option>
                              <option value="HR">Croatia (HR)</option>
                              <option value="SI">Slovenia (SI)</option>
                              <option value="SK">Slovakia (SK)</option>
                              <option value="LT">Lithuania (LT)</option>
                              <option value="LV">Latvia (LV)</option>
                              <option value="EE">Estonia (EE)</option>
                              <option value="IS">Iceland (IS)</option>
                              <option value="LU">Luxembourg (LU)</option>
                              <option value="MT">Malta (MT)</option>
                              <option value="CY">Cyprus (CY)</option>
                              <option value="UA">Ukraine (UA)</option>
                              <option value="RU">Russia (RU)</option>
                            </optgroup>
                            <optgroup label="Asia">
                              <option value="JP">Japan (JP)</option>
                              <option value="CN">China (CN)</option>
                              <option value="HK">Hong Kong (HK)</option>
                              <option value="TW">Taiwan (TW)</option>
                              <option value="KR">South Korea (KR)</option>
                              <option value="IN">India (IN)</option>
                              <option value="SG">Singapore (SG)</option>
                              <option value="MY">Malaysia (MY)</option>
                              <option value="TH">Thailand (TH)</option>
                              <option value="ID">Indonesia (ID)</option>
                              <option value="PH">Philippines (PH)</option>
                              <option value="VN">Vietnam (VN)</option>
                              <option value="BD">Bangladesh (BD)</option>
                              <option value="PK">Pakistan (PK)</option>
                              <option value="LK">Sri Lanka (LK)</option>
                              <option value="NP">Nepal (NP)</option>
                              <option value="MM">Myanmar (MM)</option>
                              <option value="KH">Cambodia (KH)</option>
                              <option value="LA">Laos (LA)</option>
                              <option value="BT">Bhutan (BT)</option>
                              <option value="MV">Maldives (MV)</option>
                              <option value="BN">Brunei (BN)</option>
                              <option value="MN">Mongolia (MN)</option>
                              <option value="KZ">Kazakhstan (KZ)</option>
                              <option value="UZ">Uzbekistan (UZ)</option>
                              <option value="AF">Afghanistan (AF)</option>
                              <option value="NP">Nepal (NP)</option>
                            </optgroup>
                            <optgroup label="Middle East">
                              <option value="IL">Israel (IL)</option>
                              <option value="AE">United Arab Emirates (AE)</option>
                              <option value="SA">Saudi Arabia (SA)</option>
                              <option value="QA">Qatar (QA)</option>
                              <option value="KW">Kuwait (KW)</option>
                              <option value="BH">Bahrain (BH)</option>
                              <option value="OM">Oman (OM)</option>
                              <option value="JO">Jordan (JO)</option>
                              <option value="LB">Lebanon (LB)</option>
                              <option value="SY">Syria (SY)</option>
                              <option value="IQ">Iraq (IQ)</option>
                              <option value="YE">Yemen (YE)</option>
                              <option value="TR">Turkey (TR)</option>
                              <option value="IR">Iran (IR)</option>
                              <option value="CY">Cyprus (CY)</option>
                            </optgroup>
                            <optgroup label="Africa">
                              <option value="ZA">South Africa (ZA)</option>
                              <option value="EG">Egypt (EG)</option>
                              <option value="NG">Nigeria (NG)</option>
                              <option value="KE">Kenya (KE)</option>
                              <option value="GH">Ghana (GH)</option>
                              <option value="MA">Morocco (MA)</option>
                              <option value="ET">Ethiopia (ET)</option>
                              <option value="TZ">Tanzania (TZ)</option>
                              <option value="UG">Uganda (UG)</option>
                              <option value="ZW">Zimbabwe (ZW)</option>
                              <option value="ZM">Zambia (ZM)</option>
                              <option value="AO">Angola (AO)</option>
                              <option value="CI">Côte d'Ivoire (CI)</option>
                              <option value="SN">Senegal (SN)</option>
                              <option value="ML">Mali (ML)</option>
                              <option value="CD">Democratic Republic of Congo (CD)</option>
                              <option value="CM">Cameroon (CM)</option>
                              <option value="MU">Mauritius (MU)</option>
                              <option value="TN">Tunisia (TN)</option>
                              <option value="DZ">Algeria (DZ)</option>
                              <option value="LY">Libya (LY)</option>
                              <option value="NA">Namibia (NA)</option>
                              <option value="BW">Botswana (BW)</option>
                              <option value="MG">Madagascar (MG)</option>
                            </optgroup>
                            <optgroup label="Oceania">
                              <option value="AU">Australia (AU)</option>
                              <option value="NZ">New Zealand (NZ)</option>
                              <option value="PG">Papua New Guinea (PG)</option>
                              <option value="FJ">Fiji (FJ)</option>
                              <option value="SB">Solomon Islands (SB)</option>
                              <option value="VU">Vanuatu (VU)</option>
                              <option value="WS">Samoa (WS)</option>
                              <option value="TO">Tonga (TO)</option>
                              <option value="PF">French Polynesia (PF)</option>
                              <option value="NC">New Caledonia (NC)</option>
                            </optgroup>
                            <optgroup label="Other Territories">
                              <option value="PR">Puerto Rico (PR)</option>
                              <option value="GU">Guam (GU)</option>
                              <option value="VI">US Virgin Islands (VI)</option>
                              <option value="AS">American Samoa (AS)</option>
                              <option value="MH">Marshall Islands (MH)</option>
                              <option value="FM">Micronesia (FM)</option>
                              <option value="PW">Palau (PW)</option>
                              <option value="GI">Gibraltar (GI)</option>
                              <option value="JE">Jersey (JE)</option>
                              <option value="IM">Isle of Man (IM)</option>
                              <option value="FO">Faroe Islands (FO)</option>
                              <option value="GL">Greenland (GL)</option>
                              <option value="GF">French Guiana (GF)</option>
                              <option value="RE">Réunion (RE)</option>
                              <option value="YT">Mayotte (YT)</option>
                              <option value="MS">Montserrat (MS)</option>
                              <option value="BM">Bermuda (BM)</option>
                              <option value="KY">Cayman Islands (KY)</option>
                              <option value="GG">Guernsey (GG)</option>
                              <option value="AX">Åland Islands (AX)</option>
                              <option value="SJ">Svalbard and Jan Mayen (SJ)</option>
                            </optgroup>
                            <optgroup label="Global/International">
                              <option value="WW">Worldwide (WW)</option>
                              <option value="INT">International (INT)</option>
                              <option value="EU">European Union (EU)</option>
                              <option value="GLOBAL">Global (GLOBAL)</option>
                              <option value="OTHER">Other (OTHER)</option>
                            </optgroup>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-purple-300 mb-1 block">Currency</label>
                          <select
                            value={editingRoyalty?.currency || 'USD'}
                            onChange={(e) => setEditingRoyalty({...editingRoyalty, currency: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                          >
                            <optgroup label="Americas">
                              <option value="USD">USD - US Dollar</option>
                              <option value="CAD">CAD - Canadian Dollar</option>
                              <option value="MXN">MXN - Mexican Peso</option>
                              <option value="BRL">BRL - Brazilian Real</option>
                              <option value="ARS">ARS - Argentine Peso</option>
                              <option value="CLP">CLP - Chilean Peso</option>
                              <option value="COP">COP - Colombian Peso</option>
                            </optgroup>
                            <optgroup label="Europe">
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                              <option value="CHF">CHF - Swiss Franc</option>
                              <option value="SEK">SEK - Swedish Krona</option>
                              <option value="NOK">NOK - Norwegian Krone</option>
                              <option value="DKK">DKK - Danish Krone</option>
                              <option value="PLN">PLN - Polish Zloty</option>
                              <option value="CZK">CZK - Czech Koruna</option>
                              <option value="HUF">HUF - Hungarian Forint</option>
                              <option value="RON">RON - Romanian Leu</option>
                            </optgroup>
                            <optgroup label="Asia Pacific">
                              <option value="JPY">JPY - Japanese Yen</option>
                              <option value="CNY">CNY - Chinese Yuan</option>
                              <option value="HKD">HKD - Hong Kong Dollar</option>
                              <option value="SGD">SGD - Singapore Dollar</option>
                              <option value="AUD">AUD - Australian Dollar</option>
                              <option value="NZD">NZD - New Zealand Dollar</option>
                              <option value="KRW">KRW - South Korean Won</option>
                              <option value="INR">INR - Indian Rupee</option>
                              <option value="THB">THB - Thai Baht</option>
                              <option value="IDR">IDR - Indonesian Rupiah</option>
                              <option value="MYR">MYR - Malaysian Ringgit</option>
                              <option value="PHP">PHP - Philippine Peso</option>
                              <option value="VND">VND - Vietnamese Dong</option>
                            </optgroup>
                            <optgroup label="Middle East & Africa">
                              <option value="ILS">ILS - Israeli Shekel</option>
                              <option value="AED">AED - UAE Dirham</option>
                              <option value="SAR">SAR - Saudi Riyal</option>
                              <option value="EGP">EGP - Egyptian Pound</option>
                              <option value="ZAR">ZAR - South African Rand</option>
                              <option value="NGN">NGN - Nigerian Naira</option>
                              <option value="KES">KES - Kenyan Shilling</option>
                            </optgroup>
                            <optgroup label="Other">
                              <option value="RUB">RUB - Russian Ruble</option>
                              <option value="TRY">TRY - Turkish Lira</option>
                              <option value="UAH">UAH - Ukrainian Hryvnia</option>
                              <option value="OTHER">OTHER - Other Currency</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-purple-300 mb-1 block">Admin Notes</label>
                        <textarea
                          value={editingRoyalty?.admin_notes || editingRoyalty?.notes || ''}
                          onChange={(e) => setEditingRoyalty({...editingRoyalty, admin_notes: e.target.value, notes: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                          placeholder="Additional notes about this entry..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddCustomDSP(false);
                          setEditingRoyalty(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            if (!editingRoyalty.artist_email || !editingRoyalty.track_title || !editingRoyalty.platform) {
                              toast.error('Artist Email, Track Title, and Platform are required');
                              return;
                            }

                            // Look up the artist's UUID from their email
                            const artists = await db.query('artists', { email: `eq.${editingRoyalty.artist_email}` });
                            if (!artists || artists.length === 0) {
                              toast.error('Artist not found', {
                                description: `No artist found with email ${editingRoyalty.artist_email}`,
                                duration: 4000
                              });
                              return;
                            }

                            const artistUuid = artists[0].user_uuid;

                            // Ensure period is in YYYY-MM format
                            let formattedPeriod = editingRoyalty.period || new Date().toISOString().slice(0, 7);
                            // Convert month names to numbers if needed
                            const monthMap: {[key: string]: string} = {
                              'january': '01', 'february': '02', 'march': '03', 'april': '04',
                              'may': '05', 'june': '06', 'july': '07', 'august': '08',
                              'september': '09', 'october': '10', 'november': '11', 'december': '12'
                            };
                            Object.entries(monthMap).forEach(([month, num]) => {
                              formattedPeriod = formattedPeriod.toLowerCase().replace(month, num);
                            });

                            const royaltyData = {
                              artist_uuid: artistUuid,
                              track_title: editingRoyalty.track_title,
                              platform: editingRoyalty.platform,
                              streams: editingRoyalty.streams || 0,
                              revenue: editingRoyalty.revenue || 0,
                              currency: editingRoyalty.currency || 'USD',
                              period: formattedPeriod,
                              country: editingRoyalty.country || 'US',
                              split_percentage: 100,
                              label_share: 0,
                              upc: '',
                              isrc: '',
                              admin_notes: editingRoyalty.admin_notes || editingRoyalty.notes || '',
                              is_adjustment: false
                            };

                            if (editingRoyalty._row_id) {
                              await db.update('royalties', { _row_id: `eq.${editingRoyalty._row_id}` }, royaltyData);
                              toast.success('Analytics entry updated successfully', {
                                description: `Artist will see updated data after refreshing their dashboard`
                              });
                            } else {
                              await db.insert('royalties', royaltyData);
                              toast.success('Analytics entry added successfully', {
                                description: `$${royaltyData.revenue.toFixed(2)} from ${royaltyData.streams.toLocaleString()} ${royaltyData.platform} streams. Artist: ${editingRoyalty.artist_name}`,
                                duration: 5000
                              });
                              toast('Info:', {
                                description: `Artist needs to refresh their dashboard to see new analytics data`,
                                duration: 6000
                              });
                            }

                            setShowAddCustomDSP(false);
                            setEditingRoyalty(null);

                            // Reload analytics data with artist names
                            const rawRoyalties = await db.query('royalties', { order: '_created_at.desc', limit: 100 });
                            
                            // Enrich with artist names
                            const enrichedRoyalties = await Promise.all(
                              (Array.isArray(rawRoyalties) ? rawRoyalties : []).map(async (royalty: any) => {
                                try {
                                  const artists = await db.query("artists", { user_uuid: `eq.${royalty.artist_uuid}` });
                                  const artistName = artists.length > 0 ? artists[0].artist_name : 'Unknown';
                                  return { ...royalty, artist_name: artistName };
                                } catch (error) {
                                  return { ...royalty, artist_name: 'Unknown' };
                                }
                              })
                            );
                            
                            setAllRoyalties(enrichedRoyalties || []);
                          } catch (error) {
                            console.error('Error saving analytics entry:', error);
                            toast.error('Failed to save analytics entry');
                          }
                        }}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        {editingRoyalty?._row_id ? 'Update Entry' : 'Add Entry'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'artist-profiles' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Artist Profile Details for DSP Setup</h3>
                <p className="text-purple-300 text-sm mb-4">Comprehensive artist information for creating accurate DSP profiles</p>
                
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-dashed border-purple-500/30">
                      <User className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-purple-300">No artists found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => {
                        const userTracks = tracks.filter(t => t.artist_uuid === user.userUuid);
                        return (
                          <div 
                            key={user.userUuid}
                            className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-white font-semibold text-lg">{user.artist_name || 'Not set'}</h4>
                                  <Badge className={
                                    user.package_type === 'sub' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                    'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                  }>
                                    {user.package_type === 'sub' ? 'Subscription' : 'Free'}
                                  </Badge>
                                  <Badge className={
                                    user.account_status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                    user.account_status === 'blocked' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                    user.account_status === 'suspended' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                    'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                  }>
                                    {user.account_status || 'active'}
                                  </Badge>
                                </div>
                                <p className="text-purple-300 text-sm">{user.email || 'No email'}</p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Login as User clicked for:', user.email, user.userUuid);
                                    // Store admin session and redirect to user dashboard
                                    const adminInfo = {
                                      email: currentUser?.email,
                                      isAdmin: true,
                                      originalUser: currentUser
                                    };
                                    localStorage.setItem('adminSession', JSON.stringify(adminInfo));
                                    
                                    toast.success(`Logging in as ${user.email}`, {
                                      description: "Opening user dashboard...",
                                      duration: 2000
                                    });
                                    
                                    // Navigate to user dashboard with impersonation
                                    setTimeout(() => {
                                      window.location.href = `/dashboard?impersonate=${user.userUuid}`;
                                    }, 500);
                                  }}
                                  className="text-green-300 border-green-500/30 hover:bg-green-500/20"
                                  type="button"
                                >
                                  <Key className="w-4 h-4 mr-1" />
                                  Login as User
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-purple-400 block mb-1">Artist Name</span>
                                <span className="text-white">{user.artist_name || 'Not provided'}</span>
                              </div>
                              <div>
                                <span className="text-purple-400 block mb-1">Label Name</span>
                                <span className="text-white">{user.label_name || 'Union Music Group Ltd'}</span>
                              </div>
                              <div>
                                <span className="text-purple-400 block mb-1">Email</span>
                                <span className="text-white">{user.email || 'Not provided'}</span>
                              </div>
                              <div>
                                <span className="text-purple-400 block mb-1">Phone</span>
                                <span className="text-white">{user.phone || 'Not provided'}</span>
                              </div>
                              <div>
                                <span className="text-purple-400 block mb-1">Country</span>
                                <span className="text-white">{user.country || 'Not provided'}</span>
                              </div>
                              <div>
                                <span className="text-purple-400 block mb-1">Account Status</span>
                                <span className="text-white capitalize">{user.account_status || 'active'}</span>
                              </div>
                              <div>
                                <span className="text-purple-400 block mb-1">Profile Completed</span>
                                <span className="text-white">{user.profile_completed ? '✅ Yes' : '❌ No'}</span>
                              </div>
                              <div>
                                <span className="text-purple-400 block mb-1">Total Tracks</span>
                                <span className="text-white">{userTracks.length}</span>
                              </div>
                            </div>
                            
                            {user.admin_notes && (
                              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div className="text-yellow-300 text-xs mb-1">Admin Notes</div>
                                <div className="text-yellow-200 text-sm">{user.admin_notes}</div>
                              </div>
                            )}
                            
                            {user.custom_status && (
                              <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div className="text-blue-300 text-xs mb-1">Custom Status</div>
                                <div className="text-blue-200 text-sm">{user.custom_status}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Quick Royalty Entry Tab */}
          {activeTab === 'quick-royalty' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Quick Royalty Entry - No CSV Required
                </h3>
                <p className="text-purple-300 text-sm mb-6">
                  Enter royalty data manually for any artist without uploading CSV files. This data will be added to the artist's dashboard immediately.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Artist Email *</label>
                    <Input
                      type="email"
                      value={quickRoyalty.artist_email}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, artist_email: e.target.value})}
                      placeholder="artist@email.com"
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Artist Name</label>
                    <Input
                      value={quickRoyalty.artist_name}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, artist_name: e.target.value})}
                      placeholder="Artist Display Name"
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Track Title *</label>
                    <Input
                      value={quickRoyalty.track_title}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, track_title: e.target.value})}
                      placeholder="Song Name"
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Platform *</label>
                    <select
                      value={quickRoyalty.platform}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, platform: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white"
                    >
                      <option value="">Select Platform</option>
                      <option value="Spotify">Spotify</option>
                      <option value="Apple Music">Apple Music</option>
                      <option value="YouTube Music">YouTube Music</option>
                      <option value="Amazon Music">Amazon Music</option>
                      <option value="Pandora">Pandora</option>
                      <option value="Deezer">Deezer</option>
                      <option value="Tidal">Tidal</option>
                      <option value="SoundCloud">SoundCloud</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="JioSaavn">JioSaavn</option>
                      <option value="Joox">Joox</option>
                      <option value="Qobuz">Qobuz</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Streams *</label>
                    <Input
                      type="number"
                      value={quickRoyalty.streams}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, streams: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Revenue ($) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quickRoyalty.revenue}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, revenue: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Currency</label>
                    <select
                      value={quickRoyalty.currency}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, currency: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Month</label>
                    <select
                      value={quickRoyalty.month}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, month: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white"
                    >
                      <option value="january">January</option>
                      <option value="february">February</option>
                      <option value="march">March</option>
                      <option value="april">April</option>
                      <option value="may">May</option>
                      <option value="june">June</option>
                      <option value="july">July</option>
                      <option value="august">August</option>
                      <option value="september">September</option>
                      <option value="october">October</option>
                      <option value="november">November</option>
                      <option value="december">December</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Year</label>
                    <Input
                      type="number"
                      value={quickRoyalty.year}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, year: parseInt(e.target.value) || new Date().getFullYear()})}
                      placeholder="2026"
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-300">Country</label>
                    <select
                      value={quickRoyalty.country}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, country: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white"
                    >
                      <optgroup label="North America">
                        <option value="US">United States (US)</option>
                        <option value="CA">Canada (CA)</option>
                        <option value="MX">Mexico (MX)</option>
                        <option value="GT">Guatemala (GT)</option>
                        <option value="CR">Costa Rica (CR)</option>
                        <option value="PA">Panama (PA)</option>
                        <option value="CU">Cuba (CU)</option>
                        <option value="DO">Dominican Republic (DO)</option>
                        <option value="JM">Jamaica (JM)</option>
                        <option value="TT">Trinidad and Tobago (TT)</option>
                      </optgroup>
                      <optgroup label="Central America & Caribbean">
                        <option value="HN">Honduras (HN)</option>
                        <option value="SV">El Salvador (SV)</option>
                        <option value="NI">Nicaragua (NI)</option>
                        <option value="BZ">Belize (BZ)</option>
                        <option value="HT">Haiti (HT)</option>
                        <option value="PR">Puerto Rico (PR)</option>
                        <option value="BS">Bahamas (BS)</option>
                        <option value="BB">Barbados (BB)</option>
                      </optgroup>
                      <optgroup label="South America">
                        <option value="BR">Brazil (BR)</option>
                        <option value="AR">Argentina (AR)</option>
                        <option value="CO">Colombia (CO)</option>
                        <option value="CL">Chile (CL)</option>
                        <option value="PE">Peru (PE)</option>
                        <option value="VE">Venezuela (VE)</option>
                        <option value="EC">Ecuador (EC)</option>
                        <option value="BO">Bolivia (BO)</option>
                        <option value="PY">Paraguay (PY)</option>
                        <option value="UY">Uruguay (UY)</option>
                        <option value="GY">Guyana (GY)</option>
                        <option value="SR">Suriname (SR)</option>
                      </optgroup>
                      <optgroup label="Europe">
                        <option value="GB">United Kingdom (GB)</option>
                        <option value="DE">Germany (DE)</option>
                        <option value="FR">France (FR)</option>
                        <option value="IT">Italy (IT)</option>
                        <option value="ES">Spain (ES)</option>
                        <option value="NL">Netherlands (NL)</option>
                        <option value="CH">Switzerland (CH)</option>
                        <option value="SE">Sweden (SE)</option>
                        <option value="NO">Norway (NO)</option>
                        <option value="DK">Denmark (DK)</option>
                        <option value="FI">Finland (FI)</option>
                        <option value="PL">Poland (PL)</option>
                        <option value="CZ">Czech Republic (CZ)</option>
                        <option value="AT">Austria (AT)</option>
                        <option value="BE">Belgium (BE)</option>
                        <option value="IE">Ireland (IE)</option>
                        <option value="PT">Portugal (PT)</option>
                        <option value="GR">Greece (GR)</option>
                        <option value="HU">Hungary (HU)</option>
                        <option value="RO">Romania (RO)</option>
                        <option value="BG">Bulgaria (BG)</option>
                        <option value="HR">Croatia (HR)</option>
                        <option value="SI">Slovenia (SI)</option>
                        <option value="SK">Slovakia (SK)</option>
                        <option value="LT">Lithuania (LT)</option>
                        <option value="LV">Latvia (LV)</option>
                        <option value="EE">Estonia (EE)</option>
                        <option value="IS">Iceland (IS)</option>
                        <option value="LU">Luxembourg (LU)</option>
                        <option value="MT">Malta (MT)</option>
                        <option value="CY">Cyprus (CY)</option>
                        <option value="UA">Ukraine (UA)</option>
                        <option value="RU">Russia (RU)</option>
                      </optgroup>
                      <optgroup label="Asia">
                        <option value="JP">Japan (JP)</option>
                        <option value="CN">China (CN)</option>
                        <option value="HK">Hong Kong (HK)</option>
                        <option value="TW">Taiwan (TW)</option>
                        <option value="KR">South Korea (KR)</option>
                        <option value="IN">India (IN)</option>
                        <option value="SG">Singapore (SG)</option>
                        <option value="MY">Malaysia (MY)</option>
                        <option value="TH">Thailand (TH)</option>
                        <option value="ID">Indonesia (ID)</option>
                        <option value="PH">Philippines (PH)</option>
                        <option value="VN">Vietnam (VN)</option>
                        <option value="BD">Bangladesh (BD)</option>
                        <option value="PK">Pakistan (PK)</option>
                        <option value="LK">Sri Lanka (LK)</option>
                        <option value="NP">Nepal (NP)</option>
                        <option value="MM">Myanmar (MM)</option>
                        <option value="KH">Cambodia (KH)</option>
                        <option value="LA">Laos (LA)</option>
                        <option value="BT">Bhutan (BT)</option>
                        <option value="MV">Maldives (MV)</option>
                        <option value="BN">Brunei (BN)</option>
                        <option value="MN">Mongolia (MN)</option>
                        <option value="KZ">Kazakhstan (KZ)</option>
                        <option value="UZ">Uzbekistan (UZ)</option>
                        <option value="AF">Afghanistan (AF)</option>
                      </optgroup>
                      <optgroup label="Middle East">
                        <option value="IL">Israel (IL)</option>
                        <option value="AE">United Arab Emirates (AE)</option>
                        <option value="SA">Saudi Arabia (SA)</option>
                        <option value="QA">Qatar (QA)</option>
                        <option value="KW">Kuwait (KW)</option>
                        <option value="BH">Bahrain (BH)</option>
                        <option value="OM">Oman (OM)</option>
                        <option value="JO">Jordan (JO)</option>
                        <option value="LB">Lebanon (LB)</option>
                        <option value="SY">Syria (SY)</option>
                        <option value="IQ">Iraq (IQ)</option>
                        <option value="YE">Yemen (YE)</option>
                        <option value="TR">Turkey (TR)</option>
                        <option value="IR">Iran (IR)</option>
                      </optgroup>
                      <optgroup label="Africa">
                        <option value="ZA">South Africa (ZA)</option>
                        <option value="EG">Egypt (EG)</option>
                        <option value="NG">Nigeria (NG)</option>
                        <option value="KE">Kenya (KE)</option>
                        <option value="GH">Ghana (GH)</option>
                        <option value="MA">Morocco (MA)</option>
                        <option value="ET">Ethiopia (ET)</option>
                        <option value="TZ">Tanzania (TZ)</option>
                        <option value="UG">Uganda (UG)</option>
                        <option value="ZW">Zimbabwe (ZW)</option>
                        <option value="ZM">Zambia (ZM)</option>
                        <option value="AO">Angola (AO)</option>
                        <option value="CI">Côte d'Ivoire (CI)</option>
                        <option value="SN">Senegal (SN)</option>
                        <option value="ML">Mali (ML)</option>
                        <option value="CD">Democratic Republic of Congo (CD)</option>
                        <option value="CM">Cameroon (CM)</option>
                        <option value="MU">Mauritius (MU)</option>
                        <option value="TN">Tunisia (TN)</option>
                        <option value="DZ">Algeria (DZ)</option>
                        <option value="LY">Libya (LY)</option>
                        <option value="NA">Namibia (NA)</option>
                        <option value="BW">Botswana (BW)</option>
                        <option value="MG">Madagascar (MG)</option>
                      </optgroup>
                      <optgroup label="Oceania">
                        <option value="AU">Australia (AU)</option>
                        <option value="NZ">New Zealand (NZ)</option>
                        <option value="PG">Papua New Guinea (PG)</option>
                        <option value="FJ">Fiji (FJ)</option>
                        <option value="SB">Solomon Islands (SB)</option>
                        <option value="VU">Vanuatu (VU)</option>
                        <option value="WS">Samoa (WS)</option>
                        <option value="TO">Tonga (TO)</option>
                        <option value="PF">French Polynesia (PF)</option>
                        <option value="NC">New Caledonia (NC)</option>
                      </optgroup>
                      <optgroup label="Global/International">
                        <option value="WW">Worldwide (WW)</option>
                        <option value="INT">International (INT)</option>
                        <option value="EU">European Union (EU)</option>
                        <option value="GLOBAL">Global (GLOBAL)</option>
                        <option value="OTHER">Other (OTHER)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-purple-300">Notes</label>
                    <Input
                      value={quickRoyalty.notes}
                      onChange={(e) => setQuickRoyalty({...quickRoyalty, notes: e.target.value})}
                      placeholder="Optional notes about this entry"
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleQuickRoyaltyEntry}
                    disabled={quickRoyaltyLoading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {quickRoyaltyLoading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Add Royalty Entry
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Pay As You Go Management Tab */}
          {activeTab === 'pay-as-you-go' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Album className="w-5 h-5 text-pink-400" />
                  Pay As You Go - Upload Credits Management
                </h3>
                <p className="text-purple-300 text-sm mb-6">
                  Allocate upload credits to users who have purchased Single ($2.99), EP ($4.99), or Album ($8.99) releases. Users can then upload without subscription.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Allocate Credits to User</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-purple-300">User Email *</label>
                        <Input
                          type="email"
                          value={payAsYouGoForm.userEmail}
                          onChange={(e) => setPayAsYouGoForm({...payAsYouGoForm, userEmail: e.target.value})}
                          placeholder="artist@email.com"
                          className="bg-slate-800 border-purple-500/30 text-white mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-purple-300">Payment Type *</label>
                        <select
                          value={payAsYouGoForm.paymentType}
                          onChange={(e) => setPayAsYouGoForm({...payAsYouGoForm, paymentType: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white mt-1"
                        >
                          <option value="">Select Payment Type</option>
                          <option value="single">Single Release ($2.99) - 1 Track</option>
                          <option value="ep">EP Release ($4.99) - 6 Tracks</option>
                          <option value="album">Album Release ($8.99) - 15 Tracks</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-purple-300">Payment ID *</label>
                        <Input
                          value={payAsYouGoForm.paymentId}
                          onChange={(e) => setPayAsYouGoForm({...payAsYouGoForm, paymentId: e.target.value})}
                          placeholder="Transaction ID from PayPal"
                          className="bg-slate-800 border-purple-500/30 text-white mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-purple-300">Amount ($)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={payAsYouGoForm.amount}
                          onChange={(e) => setPayAsYouGoForm({...payAsYouGoForm, amount: parseFloat(e.target.value) || 0})}
                          placeholder="Auto-filled based on payment type"
                          className="bg-slate-800 border-purple-500/30 text-white mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleAllocateCredits}
                        disabled={allocateCreditsLoading}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        {allocateCreditsLoading ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Album className="w-4 h-4 mr-2" />
                            Allocate Credits
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPayAsYouGoForm({
                          userEmail: '',
                          paymentType: '',
                          paymentId: '',
                          amount: 0
                        })}
                        className="text-purple-300 border-purple-500/30"
                      >
                        Clear Form
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Payment Type Reference</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-blue-300 font-semibold">Single Release</div>
                          <div className="text-blue-200 font-bold">$2.99</div>
                        </div>
                        <div className="text-blue-400 text-sm">1 Track Upload</div>
                      </div>

                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-purple-300 font-semibold">EP Release</div>
                          <div className="text-purple-200 font-bold">$4.99</div>
                        </div>
                        <div className="text-purple-400 text-sm">6 Track Uploads</div>
                      </div>

                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-green-300 font-semibold">Album Release</div>
                          <div className="text-green-200 font-bold">$8.99</div>
                        </div>
                        <div className="text-green-400 text-sm">15 Track Uploads</div>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                      <h5 className="text-yellow-300 font-semibold mb-2">💡 Process</h5>
                      <ol className="text-yellow-200 text-sm space-y-1">
                        <li>1. User pays via PayPal button on Plans page</li>
                        <li>2. Copy PayPal Transaction ID</li>
                        <li>3. Enter user email + payment details here</li>
                        <li>4. Click "Allocate Credits" to activate uploads</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Credits Allocations */}
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Credit Allocations</h3>
                <div className="space-y-3">
                  {recentCreditAllocations.length > 0 ? (
                    recentCreditAllocations.map((allocation) => (
                      <div key={allocation._row_id} className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-white font-medium">{allocation.user_email}</div>
                            <div className="text-purple-300 text-sm">
                              {allocation.payment_type} - {allocation.tracks_allowed} tracks allocated
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-300 font-semibold">${allocation.amount.toFixed(2)}</div>
                            <div className="text-purple-400 text-xs">
                              {new Date(allocation.payment_date * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-purple-400 py-8">
                      No credit allocations yet. Use the form above to allocate credits to users.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* White Label Management Tab */}
          {activeTab === 'white-labels' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  White Label & Branding Management
                </h3>
                <p className="text-purple-300 text-sm mb-6">
                  Create white label brands with custom names and logos. Sub-admin users will see their brand when they login. Main admin retains full access to all data.
                </p>

                <div className="flex justify-end mb-6">
                  <Button
                    onClick={() => setShowWhiteLabelForm(!showWhiteLabelForm)}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Brand
                  </Button>
                </div>

                {showWhiteLabelForm && (
                  <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-6">
                    <h4 className="text-white font-semibold mb-4">{isEditingWhiteLabel ? 'Edit Brand' : 'New White Label Brand'}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Brand Name *</label>
                        <Input
                          value={whiteLabelForm.name}
                          onChange={(e) => setWhiteLabelForm({...whiteLabelForm, name: e.target.value})}
                          placeholder="My Music Distribution"
                          className="bg-slate-700 border-purple-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Contact Email *</label>
                        <Input
                          type="email"
                          value={whiteLabelForm.contact_email}
                          onChange={(e) => setWhiteLabelForm({...whiteLabelForm, contact_email: e.target.value})}
                          placeholder="contact@brand.com"
                          className="bg-slate-700 border-purple-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Logo (JPG/PNG) *</label>
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setLogoFile(file);
                                // Show preview
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  console.log('Logo selected for upload');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="bg-slate-700 border-purple-500/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                          />
                          {logoUploading && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading logo...
                            </div>
                          )}
                          {(logoFile || whiteLabelForm.logo_path) && (
                            <div className="flex items-center gap-2 mt-2">
                              {logoFile ? (
                                <img 
                                  src={URL.createObjectURL(logoFile)} 
                                  alt="Logo preview" 
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-purple-500/30"
                                />
                              ) : whiteLabelForm.logo_path && (
                                <img 
                                  src={whiteLabelForm.logo_path} 
                                  alt="Current logo" 
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-purple-500/30"
                                />
                              )}
                              <span className="text-sm text-purple-300">Logo ready</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Support Email</label>
                        <Input
                          type="email"
                          value={whiteLabelForm.support_email}
                          onChange={(e) => setWhiteLabelForm({...whiteLabelForm, support_email: e.target.value})}
                          placeholder="support@brand.com"
                          className="bg-slate-700 border-purple-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Primary Color</label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={whiteLabelForm.primary_color}
                            onChange={(e) => setWhiteLabelForm({...whiteLabelForm, primary_color: e.target.value})}
                            className="w-20 h-10 bg-slate-700 border-purple-500/30"
                          />
                          <Input
                            value={whiteLabelForm.primary_color}
                            onChange={(e) => setWhiteLabelForm({...whiteLabelForm, primary_color: e.target.value})}
                            placeholder="#6366f1"
                            className="flex-1 bg-slate-700 border-purple-500/30 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Secondary Color</label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={whiteLabelForm.secondary_color}
                            onChange={(e) => setWhiteLabelForm({...whiteLabelForm, secondary_color: e.target.value})}
                            className="w-20 h-10 bg-slate-700 border-purple-500/30"
                          />
                          <Input
                            value={whiteLabelForm.secondary_color}
                            onChange={(e) => setWhiteLabelForm({...whiteLabelForm, secondary_color: e.target.value})}
                            placeholder="#8b5cf6"
                            className="flex-1 bg-slate-700 border-purple-500/30 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        onClick={() => {
                          setShowWhiteLabelForm(false);
                          setIsEditingWhiteLabel(false);
                          setLogoFile(null);
                          setWhiteLabelForm({
                            name: '',
                            contact_email: '',
                            company_name: '',
                            logo_path: '',
                            primary_color: '#6366f1',
                            secondary_color: '#8b5cf6',
                            support_email: ''
                          });
                        }}
                        variant="outline"
                        className="text-purple-300 border-purple-500/30"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={isEditingWhiteLabel ? handleUpdateWhiteLabel : handleCreateWhiteLabel}
                        disabled={logoUploading}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isEditingWhiteLabel ? 'Update Brand' : 'Create Brand'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* White Label List */}
                <div className="space-y-4">
                  {whiteLabels.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-dashed border-purple-500/30">
                      <Building2 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-purple-300">No white label clients yet</p>
                      <p className="text-purple-400 text-sm mt-1">Create your first white label client above</p>
                    </div>
                  ) : (
                    whiteLabels.map((label) => (
                      <Card key={label._row_id} className="bg-slate-800/50 border-purple-500/20 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            {label.logo_path && (
                              <img src={label.logo_path} alt={label.name} className="w-16 h-16 rounded-lg object-cover border-2 border-purple-500/30" />
                            )}
                            <div>
                              <h4 className="text-white font-semibold text-lg">{label.name}</h4>
                              <p className="text-purple-300 text-sm">{label.contact_email}</p>
                              <p className="text-purple-400 text-xs">Brand colors: {label.primary_color} / {label.secondary_color}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Active
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-purple-400 block mb-1">Support Email</span>
                            <span className="text-white">{label.support_email || 'Not set'}</span>
                          </div>
                          <div>
                            <span className="text-purple-400 block mb-1">Logo</span>
                            <span className="text-white">{label.logo_path ? 'Uploaded' : 'Not set'}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleEditWhiteLabel(label)}
                            className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Brand
                          </Button>
                          <Button
                            onClick={() => setSelectedWhiteLabel(label)}
                            className="bg-green-500/20 text-green-300 hover:bg-green-500/30"
                            size="sm"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Manage Sub-Admin
                          </Button>
                          <Button
                            onClick={() => handleDeleteWhiteLabel(label)}
                            className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>

              {/* Sub-Admin Management Section */}
              {selectedWhiteLabel && (
                <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-400" />
                    Sub-Admin Access for {selectedWhiteLabel.name}
                  </h3>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="text-green-300 font-medium">Easy Sub-Admin Access</div>
                        <div className="text-green-200 text-sm mt-1">
                          Sub-admins login to the same dashboard and see their brand name and logo. Main admin retains full access.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm text-purple-300">Assign Existing User Email *</label>
                      <Input
                        type="email"
                        value={subAdminForm.user_email}
                        onChange={(e) => setSubAdminForm({...subAdminForm, user_email: e.target.value})}
                        placeholder="user@example.com"
                        className="bg-slate-800 border-purple-500/30 text-white"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={handleAddSubAdmin}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign Sub-Admin
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-purple-300 font-medium mb-2">How It Works</div>
                    <div className="text-purple-200 text-sm space-y-1">
                      <p>• Sub-admins login with their existing credentials to the same dashboard</p>
                      <p>• They see their brand name and logo instead of Union Music Group</p>
                      <p>• Main admin (you) has full access to all data and can manage any brand</p>
                      <p>• Sub-admins see only their assigned brand's data</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* User Migration Tab */}
          {activeTab === 'migration' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  User Migration from Old Platform
                </h3>
                <p className="text-purple-300 text-sm mb-6">
                  Transfer user accounts from https://dash.distributionunion.com/ to this platform. Choose your migration method below.
                </p>

                {/* Migration Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card 
                    className={`p-4 cursor-pointer transition-all ${migrationMethod === 'manual' ? 'bg-purple-500/20 border-purple-500' : 'bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40'}`}
                    onClick={() => setMigrationMethod('manual')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-medium">Manual Entry</h4>
                    </div>
                    <p className="text-purple-300 text-sm">
                      Add users one by one with full control over each migration
                    </p>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer transition-all ${migrationMethod === 'csv' ? 'bg-purple-500/20 border-purple-500' : 'bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40'}`}
                    onClick={() => setMigrationMethod('csv')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Upload className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-medium">CSV Upload</h4>
                    </div>
                    <p className="text-purple-300 text-sm">
                      Bulk import users from a CSV file if you can export data
                    </p>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer transition-all ${migrationMethod === 'api' ? 'bg-purple-500/20 border-purple-500' : 'bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40'}`}
                    onClick={() => setMigrationMethod('api')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-medium">Copy & Paste</h4>
                    </div>
                    <p className="text-purple-300 text-sm">
                      Paste user data directly if you have access to view it
                    </p>
                  </Card>
                </div>

                {/* Manual Migration Form */}
                {migrationMethod === 'manual' && (
                  <Card className="bg-slate-800/50 border-purple-500/20 p-6">
                    <h4 className="text-white font-semibold mb-4">Add User Manually</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Email Address *</label>
                        <Input
                          type="email"
                          value={manualMigration.email}
                          onChange={(e) => setManualMigration({...manualMigration, email: e.target.value})}
                          placeholder="user@oldplatform.com"
                          className="bg-slate-700 border-purple-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">First Name *</label>
                        <Input
                          value={manualMigration.firstName}
                          onChange={(e) => setManualMigration({...manualMigration, firstName: e.target.value})}
                          placeholder="John"
                          className="bg-slate-700 border-purple-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Last Name</label>
                        <Input
                          value={manualMigration.lastName}
                          onChange={(e) => setManualMigration({...manualMigration, lastName: e.target.value})}
                          placeholder="Doe"
                          className="bg-slate-700 border-purple-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Artist Name</label>
                        <Input
                          value={manualMigration.artistName}
                          onChange={(e) => setManualMigration({...manualMigration, artistName: e.target.value})}
                          placeholder="Artist Display Name"
                          className="bg-slate-700 border-purple-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Package Type</label>
                        <select
                          value={manualMigration.packageType}
                          onChange={(e) => setManualMigration({...manualMigration, packageType: e.target.value as 'free' | 'sub'})}
                          className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                        >
                          <option value="free">Free Plan</option>
                          <option value="sub">Subscription Plan</option>
                        </select>
                      </div>

                      <div className="space-y-2 flex items-center">
                        <input
                          type="checkbox"
                          id="sendWelcome"
                          checked={manualMigration.sendWelcome}
                          onChange={(e) => setManualMigration({...manualMigration, sendWelcome: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="sendWelcome" className="text-sm text-purple-300">
                          Send welcome email with login credentials
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleManualMigration}
                        disabled={migrationLoading}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {migrationLoading ? 'Migrating...' : 'Migrate User'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* CSV Migration Form */}
                {migrationMethod === 'csv' && (
                  <Card className="bg-slate-800/50 border-purple-500/20 p-6">
                    <h4 className="text-white font-semibold mb-4">Bulk Import from CSV</h4>
                    
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                      <div className="text-blue-300 font-medium mb-2">CSV Format Requirements</div>
                      <div className="text-blue-200 text-sm space-y-1">
                        <p>• First row should contain headers: email, firstname, lastname, artistname, package</p>
                        <p>• Required fields: email, firstname</p>
                        <p>• Optional fields: lastname, artistname, package (defaults to 'free')</p>
                        <p>• Package values: 'free' or 'sub'</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-purple-300">Select CSV File</label>
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCsvMigrationFile(file);
                          }}
                          className="bg-slate-700 border-purple-500/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                        />
                      </div>

                      {csvPreview.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm text-purple-300">Data Preview (First 5 rows)</label>
                          <div className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-purple-300 border-b border-purple-500/20">
                                  {Object.keys(csvPreview[0] || {}).map(key => (
                                    <th key={key} className="text-left p-2">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="text-white">
                                {csvPreview.map((row, i) => (
                                  <tr key={i} className="border-b border-purple-500/10">
                                    {Object.values(row).map((value, j) => (
                                      <td key={j} className="p-2">{value as string}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          onClick={handleCsvMigration}
                          disabled={migrationLoading || !csvMigrationFile}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {migrationLoading ? 'Importing...' : 'Import Users'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Copy & Paste Method */}
                {migrationMethod === 'api' && (
                  <Card className="bg-slate-800/50 border-purple-500/20 p-6">
                    <h4 className="text-white font-semibold mb-4">Copy & Paste User Data</h4>
                    
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-4">
                      <div className="text-orange-300 font-medium mb-2">How to Use This Method</div>
                      <div className="text-orange-200 text-sm space-y-2">
                        <p>1. Go to your old platform admin panel</p>
                        <p>2. View the user list and copy the data</p>
                        <p>3. Paste user data below (one user per line, format: email,firstname,lastname,artistname)</p>
                        <p>4. Click import to process all users</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-purple-300">Paste User Data (one per line)</label>
                      <textarea
                        className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white min-h-[200px] font-mono text-sm"
                        placeholder="user1@example.com,John,Doe,John Doe Music&#10;user2@example.com,Jane,Smith,Jane Smith"
                      />
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Import Pasted Data
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Migration Progress */}
                {migrationLoading && (
                  <Card className="bg-slate-800/50 border-purple-500/20 p-6">
                    <h4 className="text-white font-semibold mb-4">Migration Progress</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300">Processed: {migrationProgress.processed} / {migrationProgress.total}</span>
                        <span className="text-green-300">Successful: {migrationProgress.successful}</span>
                        <span className="text-red-300">Failed: {migrationProgress.failed}</span>
                      </div>

                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(migrationProgress.processed / migrationProgress.total) * 100}%` }}
                        />
                      </div>

                      {migrationProgress.errors.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm text-red-300">Errors:</label>
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                            {migrationProgress.errors.map((error, i) => (
                              <div key={i} className="text-red-200 text-sm">{error}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </Card>

              {/* Migration Tips */}
              <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Migration Tips & Best Practices
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-green-300 font-medium mb-2">✓ What Works Well</div>
                    <div className="text-green-200 text-sm space-y-1">
                      <p>• Manual entry for small numbers (1-10 users)</p>
                      <p>• CSV import for medium numbers (10-100 users)</p>
                      <p>• Users will receive automatic welcome emails</p>
                      <p>• Passwords are generated securely</p>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="text-orange-300 font-medium mb-2">⚠️ Important Notes</div>
                    <div className="text-orange-200 text-sm space-y-1">
                      <p>• Old platform passwords cannot be transferred</p>
                      <p>• Users will need to set new passwords on first login</p>
                      <p>• Track uploads and royalties stay on old platform</p>
                      <p>• User accounts transfer but not historical data</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
              )}

              {activeTab === 'link-trees' && (
                <div className="space-y-6">
                  {/* Link Trees Management */}
                  <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Artist Link Trees</h3>
                      <Button 
                        onClick={() => {
                          setShowLinkTreeForm(true);
                          setIsEditingLinkTree(false);
                          setLinkTreeForm({
                            title: '',
                            description: '',
                            artist_uuid: '',
                            artist_name: '',
                            type: 'general',
                            custom_slug: '',
                            theme_color: '#6366f1',
                            profile_image: '',
                            background_image: '',
                            status: 'active'
                          });
                        }}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Link Tree
                      </Button>
                    </div>

                    {showLinkTreeForm && (
                      <Card className="bg-slate-800/50 border border-purple-500/30 p-6 mb-6">
                        <h4 className="text-white font-semibold mb-4">
                          {isEditingLinkTree ? 'Edit Link Tree' : 'Create New Link Tree'}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-purple-300 mb-1 block">Title *</label>
                            <input
                              type="text"
                              value={linkTreeForm.title}
                              onChange={(e) => setLinkTreeForm({...linkTreeForm, title: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                              placeholder="My Music Links"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm text-purple-300 mb-1 block">Custom Slug (optional)</label>
                            <input
                              type="text"
                              value={linkTreeForm.custom_slug}
                              onChange={(e) => {
                                // Allow only URL-friendly characters
                                const slug = e.target.value.toLowerCase()
                                  .replace(/[^a-z0-9-]/g, '')  // Remove non-URL characters
                                  .replace(/-+/g, '-')          // Replace multiple hyphens with single
                                  .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
                                setLinkTreeForm({...linkTreeForm, custom_slug: slug});
                              }}
                              className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                              placeholder="my-music-links"
                            />
                            <p className="text-xs text-purple-400 mt-1">
                              Optional custom URL. Leave empty for auto-generated. Use lowercase letters, numbers, and hyphens only.
                            </p>
                          </div>

                          <div>
                            <label className="text-sm text-purple-300 mb-1 block">Artist UUID</label>
                            <input
                              type="text"
                              value={linkTreeForm.artist_uuid}
                              onChange={(e) => setLinkTreeForm({...linkTreeForm, artist_uuid: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                              placeholder="Artist UUID (optional)"
                            />
                          </div>

                          <div>
                            <label className="text-sm text-purple-300 mb-1 block">Artist Name</label>
                            <input
                              type="text"
                              value={linkTreeForm.artist_name}
                              onChange={(e) => setLinkTreeForm({...linkTreeForm, artist_name: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                              placeholder="Artist Name"
                            />
                          </div>

                          <div>
                            <label className="text-sm text-purple-300 mb-1 block">Type</label>
                            <select
                              value={linkTreeForm.type}
                              onChange={(e) => setLinkTreeForm({...linkTreeForm, type: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                            >
                              <option value="general">General</option>
                              <option value="album">Album</option>
                              <option value="single">Single</option>
                              <option value="ep">EP</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm text-purple-300 mb-1 block">Theme Color</label>
                            <input
                              type="color"
                              value={linkTreeForm.theme_color}
                              onChange={(e) => setLinkTreeForm({...linkTreeForm, theme_color: e.target.value})}
                              className="w-full h-10 bg-slate-700 border border-purple-500/30 rounded-md"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-sm text-purple-300 mb-1 block">Description</label>
                            <textarea
                              value={linkTreeForm.description}
                              onChange={(e) => setLinkTreeForm({...linkTreeForm, description: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white min-h-[80px]"
                              placeholder="Description of this link tree..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => setShowLinkTreeForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              try {
                                // Validate required fields
                                if (!linkTreeForm.title) {
                                  toast.error('Title is required');
                                  return;
                                }

                                if (isEditingLinkTree && selectedLinkTree) {
                                  // For editing, check if custom_slug is being changed and if it conflicts
                                  if (linkTreeForm.custom_slug && linkTreeForm.custom_slug !== selectedLinkTree.custom_slug) {
                                    const existingSlug = await db.query('link_trees', { 
                                      custom_slug: `eq.${linkTreeForm.custom_slug}` 
                                    });
                                    
                                    if (Array.isArray(existingSlug) && existingSlug.length > 0) {
                                      toast.error('This custom slug is already taken. Please choose another.');
                                      return;
                                    }
                                  }

                                  await db.update('link_trees', { _row_id: `eq.${selectedLinkTree._row_id}` }, {
                                    title: linkTreeForm.title,
                                    description: linkTreeForm.description,
                                    artist_uuid: linkTreeForm.artist_uuid,
                                    artist_name: linkTreeForm.artist_name,
                                    type: linkTreeForm.type,
                                    custom_slug: linkTreeForm.custom_slug || null,
                                    theme_color: linkTreeForm.theme_color,
                                    status: linkTreeForm.status
                                  });
                                  toast.success('Link tree updated successfully');
                                } else {
                                  // For creating, handle custom_slug validation and generation
                                  let finalSlug = linkTreeForm.custom_slug;
                                  
                                  // If custom_slug is provided, check if it already exists
                                  if (finalSlug) {
                                    const existingSlug = await db.query('link_trees', { 
                                      custom_slug: `eq.${finalSlug}` 
                                    });
                                    
                                    if (Array.isArray(existingSlug) && existingSlug.length > 0) {
                                      toast.error('This custom slug is already taken. Please choose another.');
                                      return;
                                    }
                                  } else {
                                    // Generate a unique slug automatically
                                    finalSlug = await generateUniqueSlug(linkTreeForm.title);
                                    console.log('Generated unique slug:', finalSlug);
                                  }
                                  
                                  const newTree = await db.insert('link_trees', {
                                    title: linkTreeForm.title,
                                    description: linkTreeForm.description,
                                    artist_uuid: linkTreeForm.artist_uuid,
                                    artist_name: linkTreeForm.artist_name,
                                    type: linkTreeForm.type,
                                    custom_slug: finalSlug || null,
                                    theme_color: linkTreeForm.theme_color,
                                    status: linkTreeForm.status
                                  });
                                  toast.success('Link tree created successfully');
                                }
                                setShowLinkTreeForm(false);
                                loadLinkTrees();
                              } catch (error) {
                                // Handle database errors more specifically
                                const errorMsg = error?.message || String(error);
                                
                                if (errorMsg.includes('UNIQUE constraint failed: link_trees.custom_slug')) {
                                  toast.error('This custom slug is already taken. Please choose another.');
                                } else if (errorMsg.includes('NOT NULL constraint failed: link_trees.title')) {
                                  toast.error('Title is required');
                                } else {
                                  toast.error('Failed to save link tree. Please try again.');
                                  console.error('Error saving link tree:', error);
                                }
                              }
                            }}
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isEditingLinkTree ? 'Update' : 'Create'} Link Tree
                          </Button>
                        </div>
                      </Card>
                    )}

                    {/* Link Trees List */}
                    <div className="space-y-3">
                      {linkTrees.length === 0 ? (
                        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-dashed border-purple-500/30">
                          <LinkIcon className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                          <p className="text-purple-300">No link trees created yet</p>
                        </div>
                      ) : (
                        linkTrees.map((tree) => (
                          <Card key={tree._row_id} className="bg-slate-800/50 border border-purple-500/20 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-white font-semibold">{tree.title}</h4>
                                  <Badge className={
                                    tree.status === 'active' 
                                      ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                                  }>
                                    {tree.status}
                                  </Badge>
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    {tree.type}
                                  </Badge>
                                </div>
                                {tree.description && (
                                  <p className="text-purple-300 text-sm mb-2">{tree.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-purple-400">
                                  {tree.artist_name && <span>Artist: {tree.artist_name}</span>}
                                  {tree.custom_slug && (
                                    <span className="flex items-center gap-1">
                                      <LinkIcon className="w-3 h-3" />
                                      /{tree.custom_slug}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLinkTree(tree);
                                    setIsEditingLinkTree(true);
                                    setShowLinkTreeForm(true);
                                    setLinkTreeForm({
                                      title: tree.title,
                                      description: tree.description,
                                      artist_uuid: tree.artist_uuid,
                                      artist_name: tree.artist_name,
                                      type: tree.type,
                                      custom_slug: tree.custom_slug,
                                      theme_color: tree.theme_color,
                                      profile_image: tree.profile_image,
                                      background_image: tree.background_image,
                                      status: tree.status
                                    });
                                    loadLinkTreeLinks(tree._row_id);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/link-tree/${tree.custom_slug || tree._row_id}`, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-400 hover:text-red-300"
                                  onClick={async () => {
                                    if (confirm('Delete this link tree and all its links?')) {
                                      await db.delete('link_tree_links', { link_tree_id: `eq.${tree._row_id}` });
                                      await db.delete('link_trees', { _row_id: `eq.${tree._row_id}` });
                                      toast.success('Link tree deleted');
                                      loadLinkTrees();
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                      </div>

                    </Card>

                    {/* Link Tree Links Management */}
                      {/* Link Tree Links Management */}
                      {selectedLinkTree && (
                        <Card className="bg-slate-900/50 border-purple-500/20 p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">
                              DSP Links for: {selectedLinkTree.title}
                            </h3>
                            <Button 
                              onClick={() => {
                                setLinkTreeLinkForm({
                                  title: '',
                                  url: '',
                                  description: '',
                                  icon: '',
                                  order_index: linkTreeLinks.length,
                                  dsp_type: '',
                                  _row_id: ''
                                });
                                setShowAddCustomDSP(true);
                              }}
                              className="bg-purple-500 hover:bg-purple-600"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Custom DSP
                            </Button>
                          </div>

                          {/* Predefined DSP Links */}
                          <div className="space-y-3 mb-6">
                            <h4 className="text-purple-300 text-sm font-semibold mb-3">
                              Main DSP Links (Editable)
                            </h4>
                            
                            {['spotify', 'youtube_music', 'soundcloud', 'apple_music'].map((dspType) => {
                              const dspInfo = {
                                spotify: { name: 'Spotify', icon: 'spotify', color: '#1DB954' },
                                youtube_music: { name: 'YouTube Music', icon: 'youtube', color: '#FF0000' },
                                soundcloud: { name: 'SoundCloud', icon: 'soundcloud', color: '#FF5500' },
                                apple_music: { name: 'Apple Music/iTunes', icon: 'apple', color: '#FA243C' }
                              }[dspType];
                              
                              const existingLink = linkTreeLinks.find(link => link.dsp_type === dspType);
                              
                              return (
                                <Card key={dspType} className="bg-slate-800/50 border border-purple-500/20 p-4">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                      style={{ backgroundColor: dspInfo.color }}
                                    >
                                      <Music className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="text-white font-semibold">{dspInfo.name}</h5>
                                      {existingLink ? (
                                        <p className="text-green-400 text-sm flex items-center">
                                          ✓ Link configured
                                          <Button
                                            size="sm"
                                            variant="link"
                                            className="ml-2 text-purple-400 hover:text-purple-300"
                                            onClick={() => {
                                              setLinkTreeLinkForm({
                                                title: existingLink.title,
                                                url: existingLink.url,
                                                description: existingLink.description,
                                                icon: existingLink.icon,
                                                order_index: existingLink.order_index,
                                                dsp_type: existingLink.dsp_type,
                                                _row_id: existingLink._row_id
                                              });
                                              setShowAddCustomDSP(true);
                                            }}
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                        </p>
                                      ) : (
                                        <p className="text-purple-400 text-sm">Not set up</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {existingLink ? (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(existingLink.url, '_blank')}
                                          >
                                            <Eye className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-400 hover:text-red-300"
                                            onClick={async () => {
                                              if (confirm(`Remove ${dspInfo.name} link?`)) {
                                                await db.delete('link_tree_links', { _row_id: `eq.${existingLink._row_id}` });
                                                toast.success(`${dspInfo.name} link removed`);
                                                loadLinkTreeLinks(selectedLinkTree._row_id);
                                              }
                                            }}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setLinkTreeLinkForm({
                                              title: dspInfo.name,
                                              url: '',
                                              description: '',
                                              icon: dspInfo.icon,
                                              order_index: linkTreeLinks.length,
                                              dsp_type: dspType
                                            });
                                            setShowAddCustomDSP(true);
                                          }}
                                          className="text-green-400 hover:text-green-300"
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          Add
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>

                          {/* Additional DSP Links */}
                          <div className="space-y-3">
                            <h4 className="text-purple-300 text-sm font-semibold mb-3">
                              Additional DSP Links
                            </h4>
                            
                            {linkTreeLinks.filter(link => !link.dsp_type).map((link) => (
                              <Card key={link._row_id} className="bg-slate-800/50 border border-purple-500/20 p-4">
                                <div className="flex items-center gap-3">
                                  {link.icon && (
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-purple-400">
                                      <Music className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <h5 className="text-white font-semibold">{link.title}</h5>
                                    <p className="text-green-400 text-sm">✓ Link configured</p>
                                    {link.description && (
                                      <p className="text-purple-400 text-xs">{link.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(link.url, '_blank')}
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setLinkTreeLinkForm({
                                          title: link.title,
                                          url: link.url,
                                          description: link.description,
                                          icon: link.icon,
                                          order_index: link.order_index,
                                          _row_id: link._row_id
                                        });
                                        setShowAddCustomDSP(true);
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-400 hover:text-red-300"
                                      onClick={async () => {
                                        if (confirm(`Remove ${link.title}?`)) {
                                          await db.delete('link_tree_links', { _row_id: `eq.${link._row_id}` });
                                          toast.success('Link removed');
                                          loadLinkTreeLinks(selectedLinkTree._row_id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}

                            {linkTreeLinks.filter(link => !link.dsp_type).length === 0 && (
                              <div className="text-center py-6 bg-slate-800/30 rounded-lg border border-dashed border-purple-500/30">
                                <p className="text-purple-400 text-sm">No additional DSP links added</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}

                        {/* Custom DSP Form Modal - OUTSIDE selectedLinkTree conditional */}
                        {showAddCustomDSP && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <Card className="bg-slate-800 border border-purple-500/30 p-6 max-w-md w-full">
                            <h4 className="text-white font-semibold mb-4">
                              {linkTreeLinkForm._row_id ? 'Edit DSP Link' : 'Add DSP Link'}
                            </h4>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm text-purple-300 mb-1 block">DSP Name *</label>
                                <input
                                  type="text"
                                  value={linkTreeLinkForm.title}
                                  onChange={(e) => setLinkTreeLinkForm({...linkTreeLinkForm, title: e.target.value})}
                                  className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                                  placeholder="Spotify"
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm text-purple-300 mb-1 block">URL *</label>
                                <input
                                  type="text"
                                  value={linkTreeLinkForm.url}
                                  onChange={(e) => setLinkTreeLinkForm({...linkTreeLinkForm, url: e.target.value})}
                                  className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                                  placeholder="https://open.spotify.com/..."
                                />
                              </div>

                              <div>
                                <label className="text-sm text-purple-300 mb-1 block">Icon Type</label>
                                <select
                                  value={linkTreeLinkForm.icon}
                                  onChange={(e) => setLinkTreeLinkForm({...linkTreeLinkForm, icon: e.target.value})}
                                  className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                                >
                                  <option value="">No Icon</option>
                                  <option value="spotify">Spotify</option>
                                  <option value="apple">Apple Music</option>
                                  <option value="youtube">YouTube Music</option>
                                  <option value="amazon">Amazon Music</option>
                                  <option value="tiktok">TikTok</option>
                                  <option value="instagram">Instagram</option>
                                  <option value="facebook">Facebook</option>
                                  <option value="soundcloud">SoundCloud</option>
                                  <option value="bandcamp">Bandcamp</option>
                                  <option value="deezer">Deezer</option>
                                  <option value="tidal">Tidal</option>
                                  <option value="pandora">Pandora</option>
                                  <option value="iheartradio">iHeartRadio</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-sm text-purple-300 mb-1 block">Description (optional)</label>
                                <input
                                  type="text"
                                  value={linkTreeLinkForm.description}
                                  onChange={(e) => setLinkTreeLinkForm({...linkTreeLinkForm, description: e.target.value})}
                                  className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md text-white"
                                  placeholder="Main streaming platform"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowAddCustomDSP(false);
                                  setLinkTreeLinkForm({
                                    title: '',
                                    url: '',
                                    description: '',
                                    icon: '',
                                    order_index: linkTreeLinks.length,
                                    dsp_type: '',
                                    _row_id: ''
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={async () => {
                                  try {
                                    if (linkTreeLinkForm.title && linkTreeLinkForm.url) {
                                      if (linkTreeLinkForm._row_id) {
                                        await db.update('link_tree_links', { _row_id: `eq.${linkTreeLinkForm._row_id}` }, {
                                          title: linkTreeLinkForm.title,
                                          url: linkTreeLinkForm.url,
                                          description: linkTreeLinkForm.description,
                                          icon: linkTreeLinkForm.icon,
                                          order_index: linkTreeLinkForm.order_index,
                                          dsp_type: linkTreeLinkForm.dsp_type
                                        });
                                        toast.success('DSP link updated successfully');
                                      } else {
                                        await db.insert('link_tree_links', {
                                          link_tree_id: selectedLinkTree._row_id,
                                          title: linkTreeLinkForm.title,
                                          url: linkTreeLinkForm.url,
                                          description: linkTreeLinkForm.description,
                                          icon: linkTreeLinkForm.icon,
                                          order_index: linkTreeLinkForm.order_index,
                                          dsp_type: linkTreeLinkForm.dsp_type
                                        });
                                        toast.success('DSP link added successfully');
                                      }
                                      setShowAddCustomDSP(false);
                                      setLinkTreeLinkForm({
                                        title: '',
                                        url: '',
                                        description: '',
                                        icon: '',
                                        order_index: linkTreeLinks.length,
                                        dsp_type: '',
                                        _row_id: ''
                                      });
                                      loadLinkTreeLinks(selectedLinkTree._row_id);
                                    } else {
                                      toast.error('DSP name and URL are required');
                                    }
                                  } catch (error) {
                                    toast.error('Failed to save DSP link');
                                    console.error('DSP link error:', error);
                                  }
                                }}
                                className="bg-purple-500 hover:bg-purple-600"
                              >
                                {linkTreeLinkForm._row_id ? 'Update' : 'Add'} DSP Link
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}

                    </div>
                  )}
                </div>  {/* Close max-w-7xl container */}
              </main>
              </div>
            );
}

export default Admin;