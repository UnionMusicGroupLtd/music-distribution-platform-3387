import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, ArrowLeft, TrendingUp, DollarSign, Play, Globe2, BarChart3, Check, Shield } from "lucide-react";
import { toast } from "sonner";
import auth from "@/lib/shared/kliv-auth.js";
import db from "@/lib/shared/kliv-database.js";
import RoyaltyAnalytics from "@/components/RoyaltyAnalytics";

const Royalties = () => {
  const navigate = useNavigate();
  const [royalties, setRoyalties] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod] = useState("all");
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('Royalties: Starting data load...');
      
      // Check for admin impersonation
      const urlParams = new URLSearchParams(window.location.search);
      const impersonateUuid = urlParams.get('impersonate');
      const adminSession = localStorage.getItem('adminSession');
      
      let currentUserData = await auth.getUser();
      let effectiveUserUuid = currentUserData?.userUuid;
      
      // Add null check early to prevent crashes
      if (!currentUserData) {
        console.log('Royalties: No user data from auth.getUser(), redirecting to signin');
        navigate("/signin");
        return;
      }
      
      // If admin is impersonating a user, get the impersonated user's data
      if (impersonateUuid && adminSession) {
        console.log("Royalties: Admin impersonation detected", impersonateUuid);
        setIsImpersonating(true);
        const adminInfo = JSON.parse(adminSession);
        console.log("Royalties: Admin info", adminInfo);
        
        // Get the impersonated user's artist data
        const impersonatedArtists = await db.query("artists", { user_uuid: `eq.${impersonateUuid}` });
        if (impersonatedArtists.length > 0) {
          const impersonatedUser = {
            ...currentUserData,
            userUuid: impersonateUuid,
            email: impersonatedArtists[0].email || currentUserData?.email || 'user@example.com',
            artist_name: impersonatedArtists[0].artist_name
          };
          currentUserData = impersonatedUser;
          effectiveUserUuid = impersonateUuid;
          console.log("Royalties: Using impersonated user data:", impersonatedUser);
        }
        
        setCurrentUser(currentUserData);
        
        // Show impersonation banner
        toast.success(`Admin logged in as user`, {
          description: `Logged in as ${currentUserData?.email || 'user'}. Click 'Return to Admin' to go back.`,
          duration: 5000
        });
      }
      
      // Set current user for non-impersonation as well
      if (!isImpersonating) {
        setCurrentUser(currentUserData);
      }
      
      console.log('Royalties: User authenticated:', currentUserData?.email || 'unknown');
      console.log('Royalties: Effective user UUID:', effectiveUserUuid);

      if (!currentUserData) {
        console.log('Royalties: No user found, redirecting to signin');
        navigate("/signin");
        return;
      }

      // First, get the artist record for this user to get the correct UUID
      const artists = await db.query("artists", { user_uuid: `eq.${effectiveUserUuid}` });
      const finalUserUuid = artists.length > 0 ? artists[0].user_uuid : effectiveUserUuid;
      
      console.log('Royalties: Final user UUID:', finalUserUuid);
      
      // If no artist record found, handle gracefully
      if (artists.length === 0) {
        console.log('Royalties: No artist record found for user, showing empty state');
        setRoyalties([]);
        setTracks([]);
        setLoading(false);
        return;
      }

      // Load tracks using the correct UUID
      console.log('Royalties: Loading tracks...');
      const userTracks = await db.query("tracks", { artist_uuid: `eq.${finalUserUuid}` });
      console.log('Royalties: Tracks loaded:', userTracks.length);
      setTracks(Array.isArray(userTracks) ? userTracks : []);

      // Load royalties using the correct UUID
      console.log('Royalties: Loading royalties...');
      const userRoyalties = await db.query("royalties", { artist_uuid: `eq.${finalUserUuid}` });
      console.log('Royalties: Royalties loaded:', userRoyalties.length);
      
      // Calculate actual user earnings after split and label share
      const calculatedRoyalties = (Array.isArray(userRoyalties) ? userRoyalties : []).map((royalty: any) => {
        try {
          const userSplit = typeof royalty.split_percentage === 'number' ? royalty.split_percentage : 100;
          const labelDeduction = typeof royalty.label_share === 'number' ? royalty.label_share : 0;
          const effectiveSplit = userSplit - labelDeduction;
          const revenue = typeof royalty.revenue === 'number' ? royalty.revenue : 0;
          const userRevenue = (revenue * effectiveSplit) / 100;
          
          return {
            ...royalty,
            userEarnings: userRevenue,
            effectiveSplit: effectiveSplit,
            // Hide admin-only fields
            admin_notes: undefined,
            is_adjustment: undefined
          };
        } catch (error) {
          console.error('Error calculating royalty:', royalty, error);
          return {
            ...royalty,
            userEarnings: 0,
            effectiveSplit: 100,
            admin_notes: undefined,
            is_adjustment: undefined
          };
        }
      });
      
      console.log('Royalties: Calculated royalties:', calculatedRoyalties.length);
      setRoyalties(calculatedRoyalties);
    } catch (error) {
      console.error("Error loading royalty data:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // Set empty arrays to prevent crashes
      setRoyalties([]);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const getTrackById = (trackId: number) => {
    try {
      if (!Array.isArray(tracks)) {
        console.warn('Royalties: tracks is not an array');
        return { title: 'Unknown Track', album_name: '' };
      }
      const track = tracks.find((t: any) => t._row_id === trackId);
      if (!track) {
        console.warn('Royalties: Track not found for track_id:', trackId);
        return { title: 'Unknown Track', album_name: '' };
      }
      return track;
    } catch (error) {
      console.error('Royalties: Error getting track:', error);
      return { title: 'Unknown Track', album_name: '' };
    }
  };

  const calculateStats = () => {
    try {
      console.log('Royalties: Calculating stats from', royalties.length, 'royalties');
      
      if (!Array.isArray(royalties) || royalties.length === 0) {
        console.log('Royalties: No royalties to calculate stats from');
        return { totalRevenue: 0, totalStreams: 0, avgPerStream: 0 };
      }
      
      const totalRevenue = royalties.reduce((sum, r) => {
        const earnings = typeof r.userEarnings === 'number' ? r.userEarnings : 0;
        return sum + earnings;
      }, 0);
      
      const totalStreams = royalties.reduce((sum, r) => {
        const streams = typeof r.streams === 'number' ? r.streams : 0;
        return sum + streams;
      }, 0);
      
      const avgPerStream = totalStreams > 0 ? totalRevenue / totalStreams : 0;

      console.log('Royalties: Stats calculated:', { totalRevenue, totalStreams, avgPerStream });
      return { totalRevenue, totalStreams, avgPerStream };
    } catch (error) {
      console.error('Royalties: Error calculating stats:', error);
      return { totalRevenue: 0, totalStreams: 0, avgPerStream: 0 };
    }
  };

  // Calculate stats safely
  const stats = calculateStats();

  // Add additional safety check
  if (!Array.isArray(royalties)) {
    console.error('Royalties: royalties is not an array', royalties);
    setRoyalties([]);
  }

  const filteredRoyalties = (Array.isArray(royalties) ? royalties : []).filter(() => {
    if (selectedPeriod === "all") return true;
    // Add period filtering logic here
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-purple-400">Loading...</div>
      </div>
    );
  }

  try {
    // Final safety check before rendering
    if (!Array.isArray(royalties)) {
      console.error('Royalties: Invalid royalties state, resetting to empty array');
      setRoyalties([]);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
          <div className="text-purple-400">Loading royalty data...</div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Union Music Group</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Admin Impersonation Banner */}
            {isImpersonating && (
              <Card className="bg-gradient-to-r from-green-950/30 to-slate-950/50 border-green-500/20 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-green-300 font-semibold">Admin Impersonation Mode</h4>
                      <p className="text-purple-300 text-sm">
                        Viewing as: <span className="text-white font-medium">{currentUser?.email}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      localStorage.removeItem('adminSession');
                      window.location.href = '/admin';
                    }}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Return to Admin
                  </Button>
                </div>
              </Card>
            )}
            
            <div className="mb-8">
              <Link to="/dashboard">
                <Button variant="ghost" className="text-purple-300 hover:text-white mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white mb-2">Royalty Tracking</h1>
              <p className="text-purple-300">Monitor your earnings and streaming performance</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-purple-950/30 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-300">Total</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">${stats.totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-purple-300">Your Earnings</div>
              </Card>

              <Card className="bg-purple-950/30 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Play className="w-6 h-6 text-pink-400" />
                  </div>
                  <Badge className="bg-pink-500/20 text-pink-300">Lifetime</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalStreams.toLocaleString()}</div>
                <div className="text-sm text-purple-300">Total Streams</div>
              </Card>

              <Card className="bg-purple-950/30 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300">Average</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">${stats.avgPerStream.toFixed(4)}</div>
                <div className="text-sm text-purple-300">Per Stream Rate</div>
              </Card>
            </div>

            {/* Success message when analytics exist */}
            {royalties.length > 0 && (
              <Card className="bg-gradient-to-r from-green-950/30 to-slate-950/50 border-green-500/20 p-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-green-300 font-semibold">Analytics Data Available</h4>
                    <p className="text-purple-300 text-sm">Your streaming performance is being tracked across {royalties.length} data point(s)</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Advanced Analytics Section */}
            <Card className="bg-slate-900/50 border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Advanced Analytics
                  </h2>
                  <p className="text-purple-300 text-sm">Detailed breakdown by DSP, country, and performance</p>
                </div>
                <Badge className="bg-purple-500/20 text-purple-300">
                  {royalties.length} Data Points
                </Badge>
              </div>
              
              {royalties.length > 0 ? (
                <RoyaltyAnalytics royalties={royalties} tracks={tracks} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-purple-300">No analytics data available yet</p>
                </div>
              )}
            </Card>

            {/* Royalty Breakdown */}
            <Card className="bg-slate-900/50 border-purple-500/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Revenue by Platform</h2>
              
              {filteredRoyalties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{royalties.length === 0 ? 'No Royalty Data Yet' : 'No Data Found'}</h3>
                  <p className="text-purple-300 mb-4">
                    {royalties.length === 0 
                      ? 'Once your music starts streaming, you\'ll see earnings here.' 
                      : 'No analytics match your current filters.'}
                  </p>
                  {royalties.length === 0 && (
                    <Link to="/upload">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Upload Music
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRoyalties.map((royalty: any, index: number) => {
                    const track = royalty.track_id ? getTrackById(royalty.track_id) : null;
                    const displayTitle = royalty.track_title || track?.title || "Unknown Track";
                    const displayAlbum = track?.album_name || '';
                    
                    return (
                      <div
                        key={index}
                        className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {displayTitle}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                                {royalty.platform}
                              </Badge>
                              {royalty.country && (
                                <Badge className="bg-blue-500/20 text-blue-300 text-xs flex items-center gap-1">
                                  <Globe2 className="w-3 h-3" />
                                  {royalty.country}
                                </Badge>
                              )}
                              {royalty.period && (
                                <span className="text-sm text-purple-300">{royalty.period}</span>
                              )}
                              {displayAlbum && (
                                <span className="text-sm text-purple-300">{displayAlbum}</span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-purple-400">Your Earnings</div>
                                <div className="text-white font-semibold">${royalty.userEarnings?.toFixed(2) || "0.00"}</div>
                              </div>
                              <div>
                                <div className="text-purple-400">Streams</div>
                                <div className="text-white font-semibold">{(royalty.streams || 0).toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-purple-400">Your Share</div>
                                <div className="text-white font-semibold">{royalty.effectiveSplit || 100}%</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-300">${royalty.userEarnings?.toFixed(2) || "0.00"}</div>
                            <div className="text-xs text-purple-400">Your Earnings</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Payout Information */}
            <Card className="bg-gradient-to-br from-green-950/30 to-slate-950/50 border-green-500/20 p-6 mt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Payout Information</h3>
                  <p className="text-purple-300 text-sm mb-4">
                    Royalties are calculated monthly and paid out when you reach the minimum threshold of $50. 
                    Payments are processed within 45 days after the end of each month.
                  </p>
                  <div className="flex gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
                      <div className="text-xs text-green-400">Minimum Payout</div>
                      <div className="text-lg font-semibold text-white">$50.00</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
                      <div className="text-xs text-green-400">Payment Schedule</div>
                      <div className="text-lg font-semibold text-white">Monthly</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
                      <div className="text-xs text-green-400">Processing Time</div>
                      <div className="text-lg font-semibold text-white">45 Days</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Royalties: Rendering error:', error);
    console.error('Royalties: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      royaltiesCount: Array.isArray(royalties) ? royalties.length : 'not array',
      tracksCount: Array.isArray(tracks) ? tracks.length : 'not array'
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Royalties Page Error</h1>
          <p className="text-purple-300 mb-4">There was an error loading the royalties page.</p>
          <div className="bg-purple-950/50 border border-purple-500/20 rounded-lg p-4 mb-4 max-w-md">
            <p className="text-xs text-purple-400">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
          <Link to="/dashboard">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
};

export default Royalties;
