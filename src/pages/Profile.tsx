import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Music, ArrowLeft, Save, User, Crown, Lock, Shield, LogOut } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";
import db from "@/lib/shared/kliv-database.js";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [packageType, setPackageType] = useState<'free' | 'sub'>('free');
  const [labelNameLocked, setLabelNameLocked] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [formData, setFormData] = useState({
    artist_name: "",
    genre: "",
    bio: "",
    spotify_link: "",
    apple_music_link: "",
    soundcloud_link: "",
    youtube_link: "",
    social_media: "",
    label_name: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Profile: Loading profile data...');
      
      // Check for admin impersonation
      const urlParams = new URLSearchParams(window.location.search);
      const impersonateUuid = urlParams.get('impersonate');
      const adminSession = localStorage.getItem('adminSession');
      
      let currentUser = await auth.getUser();
      let effectiveUserUuid = currentUser?.userUuid;
      
      // If admin is impersonating a user, get the impersonated user's data
      if (impersonateUuid && adminSession) {
        console.log("Profile: Admin impersonation detected", impersonateUuid);
        setIsImpersonating(true);
        
        // Get the impersonated user's artist data
        const impersonatedArtists = await db.query("artists", { user_uuid: `eq.${impersonateUuid}` });
        if (impersonatedArtists.length > 0) {
          currentUser = {
            ...currentUser,
            userUuid: impersonateUuid,
            email: impersonatedArtists[0].email || currentUser.email,
            artist_name: impersonatedArtists[0].artist_name
          };
          effectiveUserUuid = impersonateUuid;
          console.log("Profile: Using impersonated user data:", currentUser);
        }
        
        // Show impersonation banner
        toast.success(`Admin logged in as user`, {
          description: `Viewing profile as ${currentUser?.email || 'user'}`,
          duration: 3000
        });
      }
      
      if (!currentUser) {
        navigate("/signin");
        return;
      }
      setUser(currentUser);

      console.log('Profile: Querying artists for user:', effectiveUserUuid);
      const artists = await db.query("artists", { user_uuid: `eq.${effectiveUserUuid}` });
      console.log('Profile: Artist data received:', artists);
      
      if (artists.length > 0) {
        const artistData = artists[0];
        const packageType = artistData.package_type || 'free';
        const labelLocked = artistData.label_name_locked !== undefined ? artistData.label_name_locked : true;
        
        console.log('Profile: Artist data breakdown:', {
          email: artistData.email,
          package_type: packageType,
          label_name_locked: labelLocked,
          label_name: artistData.label_name
        });
        
        setPackageType(packageType);
        setLabelNameLocked(labelLocked);
        
        // For sub users with unlocked labels, use their custom label name
        // For free users, always use default label name
        let defaultLabelName = 'Union Music Group Ltd';
        if (packageType === 'sub' && !labelLocked) {
          defaultLabelName = artistData.label_name || 'Union Music Group Ltd';
        }
        
        console.log('Profile: Setting default label name:', defaultLabelName);
        
        setFormData({
          artist_name: artistData.artist_name || "",
          genre: artistData.genre || "",
          bio: artistData.bio || "",
          spotify_link: artistData.spotify_link || "",
          apple_music_link: artistData.apple_music_link || "",
          soundcloud_link: artistData.soundcloud_link || "",
          youtube_link: artistData.youtube_link || "",
          social_media: artistData.social_media || "",
          label_name: defaultLabelName
        });
        
        // Log final state for debugging
        console.log('Profile: Final form state:', {
          packageType,
          labelLocked,
          canEditLabel: !labelLocked || packageType === 'sub',
          defaultLabelName
        });
      } else {
        console.warn('Profile: No artist data found for user:', effectiveUserUuid);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const currentUser = await auth.getUser();
      if (!currentUser) {
        toast.error("User not authenticated");
        navigate("/signin");
        return;
      }

      // Ensure we have a proper UUID
      const userUuid = currentUser.userUuid || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const existing = await db.query("artists", { user_uuid: `eq.${userUuid}` });

      if (existing.length > 0) {
        // Only update label_name if not locked or user is subscription
        const updateData: any = {
          artist_name: formData.artist_name,
          genre: formData.genre,
          bio: formData.bio,
          spotify_link: formData.spotify_link,
          apple_music_link: formData.apple_music_link,
          soundcloud_link: formData.soundcloud_link,
          youtube_link: formData.youtube_link,
          social_media: formData.social_media
        };
        
        // Only include label_name in update if user has permission
        if (!labelNameLocked || packageType === 'sub') {
          updateData.label_name = formData.label_name;
        }
        
        await db.update(
          "artists",
          { _row_id: `eq.${existing[0]._row_id}` },
          updateData
        );
        
        console.log('✅ Artist profile updated:', userUuid);
      } else {
        const insertData: any = {
          user_uuid: userUuid, // Use the guaranteed UUID
          email: currentUser.email, // Add email for better tracking
          artist_name: formData.artist_name,
          genre: formData.genre,
          bio: formData.bio,
          spotify_link: formData.spotify_link,
          apple_music_link: formData.apple_music_link,
          soundcloud_link: formData.soundcloud_link,
          youtube_link: formData.youtube_link,
          social_media: formData.social_media,
          package_type: packageType,
          label_name_locked: labelNameLocked,
          account_status: 'active' // Ensure active status
        };
        
        // Set default label name for free users
        if (packageType === 'free') {
          insertData.label_name = 'Union Music Group Ltd';
        } else {
          insertData.label_name = formData.label_name || 'Union Music Group Ltd';
        }
        
        await db.insert("artists", insertData);
        console.log('✅ New artist profile created with UUID:', userUuid);
      }

      toast.success("Profile updated successfully!");
      console.log('✅ Profile saved successfully');
    } catch (error: any) {
      console.error("❌ Error saving profile:", error);
      
      // Better error messages
      let errorMessage = "Failed to update profile";
      if (error?.message) {
        errorMessage = error.message;
      }
      
      // Check for specific permission errors
      if (errorMessage.includes('permission') || errorMessage.includes('not allowed') || errorMessage.includes('unauthorized')) {
        errorMessage = "You don't have permission to save this profile. Please make sure you're logged in.";
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
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
                    <Link to={isImpersonating ? `/dashboard?impersonate=${user?.userUuid}` : "/dashboard"} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xl font-bold text-white">Union Music Group</span>
                    </Link>
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
                          Admin Impersonation Mode: Viewing as {user?.email}
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

      {/* Main Content */}
      <main className={isImpersonating ? "pt-36 pb-12 px-4 sm:px-6 lg:px-8" : "pt-24 pb-12 px-4 sm:px-6 lg:px-8"}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link to={isImpersonating ? `/dashboard?impersonate=${user?.userUuid}` : "/dashboard"}>
              <Button variant="ghost" className="text-purple-300 hover:text-white mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Artist Profile</h1>
            <p className="text-purple-300">Manage your public artist information</p>
                {packageType === 'sub' && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                          <Crown className="w-3 h-3 mr-1" />
                          Subscription
                        </Badge>
                      )}
                      {packageType === 'free' && (
                        <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Free Plan
                        </Badge>
                      )}
          </div>

          <Card className="bg-slate-900/50 border-purple-500/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-purple-300">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artist_name" className="text-purple-200">Artist Name *</Label>
                  <Input
                    id="artist_name"
                    placeholder="Your artist or band name"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-purple-200">Genre</Label>
                  <Input
                    id="genre"
                    placeholder="e.g., Hip-Hop, Electronic, Rock"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-purple-200">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell fans about your music and journey..."
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50 min-h-32"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="label_name" className="text-purple-200">Label Name</Label>
                    {labelNameLocked && packageType === 'free' && (
                      <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3 mr-1" />
                        Free Plan - Fixed
                      </Badge>
                    )}
                    {!labelNameLocked && packageType === 'sub' && (
                      <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                        <Crown className="w-3 h-3 mr-1" />
                        Subscription - Customizable
                      </Badge>
                    )}
                    {labelNameLocked && packageType === 'sub' && (
                      <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3 mr-1" />
                        Admin Locked
                      </Badge>
                    )}
                  </div>
                  
                  {labelNameLocked && packageType === 'free' ? (
                    <div className="relative">
                      <Input
                        id="label_name"
                        value="Union Music Group Ltd"
                        disabled
                        className="bg-slate-800/50 border-purple-500/20 text-purple-300 cursor-not-allowed opacity-70"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-md">
                        <Lock className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-xs text-purple-400 mt-1">
                        💡 Upgrade to Subscription to customize your label name
                      </p>
                    </div>
                  ) : labelNameLocked && packageType === 'sub' ? (
                    <div className="relative">
                      <Input
                        id="label_name"
                        value={formData.label_name}
                        disabled
                        className="bg-slate-800/50 border-purple-500/20 text-purple-300 cursor-not-allowed opacity-70"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-md">
                        <Lock className="w-4 h-4 text-red-400" />
                      </div>
                      <p className="text-xs text-red-400 mt-1">
                        🔒 Label name is locked by admin. Contact support for changes.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Input
                        id="label_name"
                        placeholder="Enter your custom label name"
                        className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                        value={formData.label_name}
                        onChange={(e) => setFormData({ ...formData, label_name: e.target.value })}
                      />
                      <p className="text-xs text-green-400 mt-1">
                        ✅ Custom label name enabled for subscription users
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Social Links</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="spotify_link" className="text-purple-200">Spotify</Label>
                    <Input
                      id="spotify_link"
                      placeholder="https://open.spotify.com/artist/..."
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.spotify_link}
                      onChange={(e) => setFormData({ ...formData, spotify_link: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apple_music_link" className="text-purple-200">Apple Music</Label>
                    <Input
                      id="apple_music_link"
                      placeholder="https://music.apple.com/..."
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.apple_music_link}
                      onChange={(e) => setFormData({ ...formData, apple_music_link: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soundcloud_link" className="text-purple-200">SoundCloud</Label>
                    <Input
                      id="soundcloud_link"
                      placeholder="https://soundcloud.com/..."
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.soundcloud_link}
                      onChange={(e) => setFormData({ ...formData, soundcloud_link: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube_link" className="text-purple-200">YouTube</Label>
                    <Input
                      id="youtube_link"
                      placeholder="https://youtube.com/..."
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.youtube_link}
                      onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social_media" className="text-purple-200">Other Social Media</Label>
                    <Input
                      id="social_media"
                      placeholder="Instagram, TikTok URLs..."
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.social_media}
                      onChange={(e) => setFormData({ ...formData, social_media: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
                <Link to={isImpersonating ? `/dashboard?impersonate=${user?.userUuid}` : "/dashboard"}>
                  <Button variant="ghost" className="text-purple-300 hover:text-white">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
