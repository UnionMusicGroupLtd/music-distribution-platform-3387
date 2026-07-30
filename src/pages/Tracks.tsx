import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Music, ArrowLeft, Search, Plus, Edit, RefreshCw, Trash2, Shield } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";
import db from "@/lib/shared/kliv-database.js";
import TrackPlayer from "@/components/TrackPlayer";

const Tracks = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<any[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadTracks();
    loadRecentNotifications();
  }, []);

  const loadRecentNotifications = async () => {
    try {
      const currentUser = await auth.getUser();
      if (!currentUser) return;

      // Load tracks to show recent status changes
      const userTracks = await db.query("tracks", { artist_uuid: `eq.${currentUser.userUuid}` });
      
      // Create notifications from recent track status changes
      const notifications = userTracks
        .filter(track => track.approval_status && track.approval_status !== 'pending')
        .map(track => ({
          trackId: track._row_id,
          trackTitle: track.title,
          status: track.approval_status,
          reason: track.qc_notes,
          timestamp: track.qc_review_date || track._updated_at,
          catalogNumber: track.catalog_number,
          isrc: track.isrc
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5); // Get the 5 most recent
      
      setRecentNotifications(notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  useEffect(() => {
    filterTracks();
  }, [statusFilter, searchQuery, tracks]);

  const loadTracks = async () => {
    try {
      console.log('Tracks: Starting track load...');
      
      // Check for admin impersonation
      const urlParams = new URLSearchParams(window.location.search);
      const impersonateUuid = urlParams.get('impersonate');
      const adminSession = localStorage.getItem('adminSession');
      
      let currentUserData = await auth.getUser();
      let effectiveUserUuid = currentUserData?.userUuid;
      
      // If admin is impersonating a user, get the impersonated user's data
      if (impersonateUuid && adminSession) {
        console.log("Tracks: Admin impersonation detected", impersonateUuid);
        setIsImpersonating(true);
        const adminInfo = JSON.parse(adminSession);
        console.log("Tracks: Admin info", adminInfo);
        
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
          console.log("Tracks: Using impersonated user data:", impersonatedUser);
        }
        
        setCurrentUser(currentUserData);
      }
      
      if (!currentUserData) {
        navigate("/signin");
        return;
      }

      const userTracks = await db.query("tracks", { artist_uuid: `eq.${effectiveUserUuid}` });
      setTracks(userTracks);
      setFilteredTracks(userTracks);
    } catch (error) {
      console.error("Error loading tracks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTracks = () => {
    let filtered = [...tracks];

    // Filter by status (use approval_status instead of status)
    if (statusFilter !== "all") {
      filtered = filtered.filter((track) => track.approval_status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((track) => 
        track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.isrc?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTracks(filtered);
  };

  const handleEditTrack = (track: any) => {
    setEditingTrack(track);
    setEditFormData({
      title: track.title || '',
      isrc: track.isrc || '',
      upc: track.upc || '',
      catalog_number: track.catalog_number || '',
      grid_code: track.grid_code || '',
      genre: track.genre || '',
      language: track.language || '',
      sub_genre: track.sub_genre || '',
      main_artist_name: track.main_artist_name || '',
      featuring_artist_name: track.featuring_artist_name || '',
      songwriter_name: track.songwriter_name || '',
      composer_name: track.composer_name || '',
      producer_name: track.producer_name || '',
      mixing_mastering: track.mixing_mastering || '',
      country_register: track.country_register || ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingTrack) return;

      // Update track data
      await db.update("tracks", { _row_id: `eq.${editingTrack._row_id}` }, {
        ...editFormData,
        approval_status: 'pending', // Reset to pending for re-review
        qc_notes: null, // Clear previous rejection notes
        qc_reviewer_uuid: null, // Clear previous reviewer
        qc_review_date: null // Clear previous review date
      });

      // Reload tracks and close edit form
      await loadTracks();
      setEditingTrack(null);
      setEditFormData({});
      
      // Show success message
      alert('Track updated and resubmitted for review!');
    } catch (error) {
      console.error("Error saving track:", error);
      alert('Failed to update track. Please try again.');
    }
  };

  const handleResubmitTrack = async (trackId: number) => {
    try {
      // Just reset the status to pending without editing
      await db.update("tracks", { _row_id: `eq.${trackId}` }, {
        approval_status: 'pending',
        qc_notes: null,
        qc_reviewer_uuid: null,
        qc_review_date: null
      });

      await loadTracks();
      alert('Track resubmitted for review!');
    } catch (error) {
      console.error("Error resubmitting track:", error);
      alert('Failed to resubmit track. Please try again.');
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

      // Reload tracks
      await loadTracks();
      
      // Show success message
      toast.success(`Track "${trackTitle}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting track:", error);
      toast.error('Failed to delete track. Please try again.');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-purple-400">Loading...</div>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Track Management</h1>
                <p className="text-purple-300">Manage your music uploads and distribution</p>
              </div>
              <Link to="/upload">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Track
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="bg-slate-900/50 border-purple-500/20 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tracks..."
                    className="bg-slate-800/50 border border-purple-500/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-purple-400/50 focus:outline-none focus:border-purple-500/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <select
                  className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/40"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-purple-300 text-sm">Total:</span>
                <Badge className="bg-purple-500/20 text-purple-300">{filteredTracks.length}</Badge>
              </div>
            </div>
          </Card>

          {/* Recent Notifications Section */}
          {recentNotifications.length > 0 && (
            <Card className="bg-slate-900/50 border-purple-500/20 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Status Updates</h3>
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div key={notification.trackId} className="flex items-start justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={
                          notification.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          notification.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }>
                          {notification.status}
                        </Badge>
                        <h4 className="text-white font-medium">{notification.trackTitle}</h4>
                      </div>
                      <div className="text-sm text-purple-300 space-y-1">
                        <p>ISRC: {notification.isrc || 'Not assigned'}</p>
                        <p>Catalog: {notification.catalogNumber || 'Not assigned'}</p>
                        {notification.reason && (
                          <p className="text-yellow-300">Reason: {notification.reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-400">
                        {new Date(notification.timestamp * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-purple-400">
                        {new Date(notification.timestamp * 1000).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {selectedTrack ? (
            /* Single Track View */
            <div className="mb-6">
              <Button
                variant="ghost"
                className="text-purple-300 hover:text-white mb-4"
                onClick={() => setSelectedTrack(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <TrackPlayer 
                track={selectedTrack} 
              />
            </div>
          ) : (
            /* Tracks Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTracks.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Tracks Found</h3>
                  <p className="text-purple-300 mb-4">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your filters or search query" 
                      : "Upload your first track to get started"}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Link to="/upload">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Upload Your First Track
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                filteredTracks.map((track) => (
                  <Card 
                    key={track._row_id} 
                    className="bg-slate-900/50 border-purple-500/20 p-4 hover:border-purple-500/40 transition-all cursor-pointer"
                    onClick={() => setSelectedTrack(track)}
                  >
                    {/* Album Art */}
                    <div className="relative mb-4">
                      {track.cover_art ? (
                        <img 
                          src={track.cover_art} 
                          alt={track.title}
                          className="w-full h-40 object-cover rounded-lg"
                          style={{ width: '100%' }}
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                          <Music className="w-12 h-12 text-purple-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={
                          track.approval_status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          track.approval_status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          track.approval_status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }>
                          {track.approval_status || 'pending'}
                        </Badge>
                      </div>
                    </div>

                    {/* Track Info */}
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">{track.title}</h3>
                    {track.album_name && (
                      <p className="text-purple-300 text-sm mb-2 truncate">{track.album_name}</p>
                    )}

                    {/* Metadata */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400">ISRC:</span>
                        <span className="text-white truncate ml-2">{track.isrc || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400">Genre:</span>
                        <span className="text-white truncate ml-2">{track.genre || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400">Status:</span>
                        <span className="text-white truncate ml-2 capitalize">{track.approval_status || 'pending'}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 text-purple-300 hover:text-white"
                        onClick={() => setSelectedTrack(track)}
                      >
                        View Details
                      </Button>
                      {track.approval_status === 'rejected' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTrack(track);
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 bg-green-500/20 text-green-300 hover:bg-green-500/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Resubmit this track for review without making changes?')) {
                                handleResubmitTrack(track._row_id);
                              }
                            }}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Resubmit
                          </Button>
                        </>
                      )}
                      {(!track.approval_status || track.approval_status === 'draft' || track.approval_status === 'pending') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrack(track._row_id, track.title);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Edit Track Modal */}
          {editingTrack && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="bg-slate-900/95 border-purple-500/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Edit Track</h3>
                    <p className="text-purple-300 text-sm">
                      {editingTrack.approval_status === 'rejected' && (
                        <span className="text-yellow-300">Previous rejection: {editingTrack.qc_notes || 'No reason provided'}</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTrack(null);
                      setEditFormData({});
                    }}
                    className="text-purple-300 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Track Title *</label>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Track Title"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Main Artist Name</label>
                      <input
                        type="text"
                        value={editFormData.main_artist_name}
                        onChange={(e) => setEditFormData({ ...editFormData, main_artist_name: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Main Artist Name"
                      />
                    </div>
                  </div>

                  {/* Identifiers */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">ISRC</label>
                      <input
                        type="text"
                        value={editFormData.isrc}
                        onChange={(e) => setEditFormData({ ...editFormData, isrc: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="ISRC Code"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">UPC</label>
                      <input
                        type="text"
                        value={editFormData.upc}
                        onChange={(e) => setEditFormData({ ...editFormData, upc: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="UPC/EAN Code"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Catalog Number</label>
                      <input
                        type="text"
                        value={editFormData.catalog_number}
                        onChange={(e) => setEditFormData({ ...editFormData, catalog_number: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Catalog Number"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Grid Code</label>
                      <input
                        type="text"
                        value={editFormData.grid_code}
                        onChange={(e) => setEditFormData({ ...editFormData, grid_code: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Grid Code"
                      />
                    </div>
                  </div>

                  {/* Genre & Language */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Genre *</label>
                      <select
                        value={editFormData.genre}
                        onChange={(e) => setEditFormData({ ...editFormData, genre: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="">Select Genre</option>
                        <option>Pop</option>
                        <option>Rock</option>
                        <option>Hip Hop</option>
                        <option>R&B</option>
                        <option>Country</option>
                        <option>Jazz</option>
                        <option>Classical</option>
                        <option>Electronic</option>
                        <option>Reggae</option>
                        <option>Latin</option>
                        <option>World</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Sub-Genre</label>
                      <input
                        type="text"
                        value={editFormData.sub_genre}
                        onChange={(e) => setEditFormData({ ...editFormData, sub_genre: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Sub-Genre"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Language *</label>
                      <select
                        value={editFormData.language}
                        onChange={(e) => setEditFormData({ ...editFormData, language: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="">Select Language</option>
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Italian</option>
                        <option>Portuguese</option>
                        <option>Dutch</option>
                        <option>Swedish</option>
                        <option>Norwegian</option>
                        <option>Danish</option>
                        <option>Finnish</option>
                        <option>Polish</option>
                        <option>Russian</option>
                        <option>Japanese</option>
                        <option>Korean</option>
                        <option>Chinese</option>
                        <option>Arabic</option>
                        <option>Hindi</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Songwriter Name</label>
                      <input
                        type="text"
                        value={editFormData.songwriter_name}
                        onChange={(e) => setEditFormData({ ...editFormData, songwriter_name: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Songwriter Full Name"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Composer Name</label>
                      <input
                        type="text"
                        value={editFormData.composer_name}
                        onChange={(e) => setEditFormData({ ...editFormData, composer_name: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Composer Full Name"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Producer Name</label>
                      <input
                        type="text"
                        value={editFormData.producer_name}
                        onChange={(e) => setEditFormData({ ...editFormData, producer_name: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Producer Name"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm mb-1 block">Mixing/Mastering</label>
                      <input
                        type="text"
                        value={editFormData.mixing_mastering}
                        onChange={(e) => setEditFormData({ ...editFormData, mixing_mastering: e.target.value })}
                        className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Mixing/Mastering Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-purple-300 text-sm mb-1 block">Featuring Artist Name</label>
                    <input
                      type="text"
                      value={editFormData.featuring_artist_name}
                      onChange={(e) => setEditFormData({ ...editFormData, featuring_artist_name: e.target.value })}
                      className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="Featuring Artist Name (if applicable)"
                    />
                  </div>

                  <div>
                    <label className="text-purple-300 text-sm mb-1 block">Country of Registration</label>
                    <input
                      type="text"
                      value={editFormData.country_register}
                      onChange={(e) => setEditFormData({ ...editFormData, country_register: e.target.value })}
                      className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="Country for copyright registration"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={!editFormData.title || !editFormData.genre || !editFormData.language}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update & Resubmit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingTrack(null);
                      setEditFormData({});
                    }}
                    className="text-purple-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tracks;
