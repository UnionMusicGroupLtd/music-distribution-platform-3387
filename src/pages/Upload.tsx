import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Music, ArrowLeft, Upload as UploadIcon, Disc3, Shield } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";
import db from "@/lib/shared/kliv-database.js";
import { content } from "@/lib/shared/kliv-content.js";
import functions from "@/lib/shared/kliv-functions.js";

const Upload = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [formData, setFormData] = useState({
    release_type: "single",
    title: "",
    album_name: "",
    genre: "",
    release_date: "",
    lyrics: "",
    isrc: "",
    upc: "",
    label_name: "",
    grid_code: "",
    catalog_number: "",
    p_line: "",
    c_line: "",
    copyright_year: "",
    language: "",
    main_artist_name: "",
    featuring_artist_name: "",
    songwriter_name: "",
    composer_name: "",
    producer_name: "",
    mixing_mastering: "",
    country_register: "",
    sub_genre: "",
    explicit_content: "no",
    uses_ai: "no",
    track_type: "original",
    selected_stores: [] as string[]
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [additionalTracks, setAdditionalTracks] = useState<Array<{
    title: string;
    audioFile: File | null;
    isrc: string;
    lyrics: string;
  }>>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('Upload: Starting user data load...');
      
      // Check for admin impersonation
      const urlParams = new URLSearchParams(window.location.search);
      const impersonateUuid = urlParams.get('impersonate');
      const adminSession = localStorage.getItem('adminSession');
      
      let currentUserData = await auth.getUser();
      let effectiveUserUuid = currentUserData?.userUuid;
      
      // If admin is impersonating a user, get the impersonated user's data
      if (impersonateUuid && adminSession) {
        console.log("Upload: Admin impersonation detected", impersonateUuid);
        setIsImpersonating(true);
        const adminInfo = JSON.parse(adminSession);
        console.log("Upload: Admin info", adminInfo);
        
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
          console.log("Upload: Using impersonated user data:", impersonatedUser);
        }
      }
      
      if (!currentUserData) {
        navigate("/signin");
        return;
      }
      setCurrentUser(currentUserData);

      const artists = await db.query("artists", { user_uuid: `eq.${effectiveUserUuid}` });
      if (artists.length === 0) {
        toast.error("Please complete your profile first");
        navigate("/profile");
        return;
      }
      
      const artistData = artists[0];
      
      // Check if user has subscription OR available pay-as-you-go credits
      const hasSubscription = artistData.package_type === 'sub';
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
      
      const hasCredits = availableCredits > 0;
      const canUpload = hasSubscription || hasCredits;
      
      // STRICT ENFORCEMENT: Immediately block if no credits available
      if (!canUpload) {
        if (hasSubscription) {
          toast.error("Music upload requires a subscription plan. Please choose a plan below.");
        } else {
          toast.error("No upload credits available. You must purchase a Single, EP, or Album release, or subscribe to continue uploading.", {
            duration: 6000
          });
        }
        navigate("/plans");
        return;
      }
      
      // Additional check: If pay-as-you-go user has zero credits after uploads, redirect immediately
      if (!hasSubscription && availableCredits === 0) {
        toast.error("You've used all your upload credits. To upload more music, please purchase additional releases or subscribe.", {
          duration: 6000
        });
        navigate("/plans");
        return;
      }
      
      // Set label name based on user's package type
      const labelName = artistData.package_type === 'sub' 
        ? (artistData.label_name || 'Union Music Group Ltd')
        : 'Union Music Group Ltd';
      
      // Determine available release types based on user's payments
      const availableReleaseTypes = new Set<string>();
      
      if (hasSubscription) {
        // Subscription users can access all release types
        availableReleaseTypes.add('single');
        availableReleaseTypes.add('ep');
        availableReleaseTypes.add('album');
      } else if (hasCredits) {
        // Pay-as-you-go users: check payment types
        payments.forEach((payment: any) => {
          // Check if payment hasn't expired
          const now = Math.floor(Date.now() / 1000);
          if (!payment.expires_at || payment.expires_at > now) {
            // Map payment type to allowed release types
            if (payment.payment_type === 'single') {
              availableReleaseTypes.add('single');
            } else if (payment.payment_type === 'ep') {
              availableReleaseTypes.add('single');
              availableReleaseTypes.add('ep');
            } else if (payment.payment_type === 'album') {
              availableReleaseTypes.add('single');
              availableReleaseTypes.add('ep');
              availableReleaseTypes.add('album');
            }
          }
        });
      }
      
      // Set default release type to first available type if current selection is not available
      if (!availableReleaseTypes.has(formData.release_type)) {
        const newFormData = {
          ...formData,
          release_type: Array.from(availableReleaseTypes)[0] || 'single'
        };
        
        // Update other fields too
        newFormData.label_name = labelName;
        newFormData.catalog_number = catalogNumber;
        
        setFormData(newFormData);
      } else {
        const newFormData = {
          ...formData,
          label_name: labelName,
          catalog_number: catalogNumber
        };
        setFormData(newFormData);
      }
      
      setCurrentUser({ 
        ...currentUserData, 
        artistData: artistData,
        availableCredits,
        totalCredits,
        usedCredits,
        hasSubscription,
        hasCredits,
        availableReleaseTypes: Array.from(availableReleaseTypes)
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverArt(e.target.files[0]);
    }
  };

  const addTrack = () => {
    setAdditionalTracks([
      ...additionalTracks,
      { title: "", audioFile: null, isrc: "", lyrics: "" }
    ]);
  };

  const removeTrack = (index: number) => {
    setAdditionalTracks(additionalTracks.filter((_, i) => i !== index));
  };

  const generateCatalogNumber = async (dateStr?: string): Promise<string> => {
    try {
      const today = dateStr || new Date().toISOString().slice(2,10).replace(/-/g, '');
      const prefix = `UMG${today}`;
      
      const existingTracks = await db.query("tracks", {});
      const todayCatalogs = existingTracks
        .filter((t: any) => t.catalog_number && t.catalog_number.startsWith(prefix))
        .map((t: any) => parseInt(t.catalog_number.replace(prefix, '')) || 0)
        .sort((a: number, b: number) => b - a);
      
      const nextNum = todayCatalogs.length > 0 ? todayCatalogs[0] + 1 : 1;
      const catalogNumber = `${prefix}${String(nextNum).padStart(3, '0')}`;
      
      return catalogNumber;
    } catch (error) {
      console.error('Error generating catalog number:', error);
      const today = dateStr || new Date().toISOString().slice(2,10).replace(/-/g, '');
      return `UMG${today}001`;
    }
  };
  
  const updateTrack = (index: number, field: string, value: any) => {
    const updated = [...additionalTracks];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalTracks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    // Check if user has enough credits for selected release type
    if (!currentUser?.hasSubscription && currentUser?.hasCredits) {
      const tracksToUpload = 1 + additionalTracks.length;
      
      // Validate release type matches purchase
      const releaseTypeValid = currentUser?.availableReleaseTypes?.includes(formData.release_type);
      if (!releaseTypeValid) {
        toast.error(`You don't have access to ${formData.release_type.toUpperCase()} release type. Please upgrade your plan.`, {
          duration: 4000
        });
        return;
      }
      
      // Check if user has enough credits for the tracks
      if (tracksToUpload > currentUser.availableCredits) {
        toast.error(`Not enough credits. You have ${currentUser.availableCredits} credit(s) available, but this upload requires ${tracksToUpload} credit(s).`, {
          duration: 5000
        });
        return;
      }
      
      // Additional validation for EP/Album releases
      if (formData.release_type === 'ep' && tracksToUpload < 2) {
        toast.error('EP releases must have at least 2 tracks', {
          duration: 4000
        });
        return;
      }
      
      if (formData.release_type === 'ep' && tracksToUpload > 6) {
        toast.error('EP releases cannot have more than 6 tracks', {
          duration: 4000
        });
        return;
      }
      
      if (formData.release_type === 'album' && tracksToUpload < 7) {
        toast.error('Album releases must have at least 7 tracks', {
          duration: 4000
        });
        return;
      }
    }

    setUploading(true);
    setProgress(0);

    try {
      // IMPORTANT: Deduct credits FIRST before upload for pay-as-you-go users
      if (!currentUser.hasSubscription && currentUser.hasCredits) {
        try {
          const tracksToUpload = 1 + additionalTracks.length;
          const payments = await db.query("pay_as_you_go_payments", { 
            user_uuid: `eq.${currentUser.userUuid}`,
            payment_status: `eq.completed`
          });
          
          // Sort by expiration (soonest expiring first)
          const sortedPayments = payments
            .filter((payment: any) => !payment.expires_at || payment.expires_at > Math.floor(Date.now() / 1000))
            .sort((a: any, b:any) => (a.expires_at || Infinity) - (b.expires_at || Infinity));
          
          let creditsToDeduct = tracksToUpload;
          let creditsAvailable = 0;
          
          // Calculate total available credits first
          for (const payment of sortedPayments) {
            creditsAvailable += payment.tracks_allowed - payment.tracks_used;
          }
          
          // Validate enough credits available
          if (creditsAvailable < tracksToUpload) {
            toast.error(`Not enough credits. You have ${creditsAvailable} credit(s) available, but this upload requires ${tracksToUpload} credit(s).`, {
              duration: 5000
            });
            setUploading(false);
            return;
          }
          
          // Deduct credits BEFORE uploading
          for (const payment of sortedPayments) {
            if (creditsToDeduct <= 0) break;
            
            const availableInPayment = payment.tracks_allowed - payment.tracks_used;
            const toDeduct = Math.min(availableInPayment, creditsToDeduct);
            
            if (toDeduct > 0) {
              console.log(`Deducting ${toDeduct} credits from payment ${payment._row_id} (allowed: ${payment.tracks_allowed}, used: ${payment.tracks_used})`);
              
              await db.update("pay_as_you_go_payments", { _row_id: `eq.${payment._row_id}` }, {
                tracks_used: payment.tracks_used + toDeduct
              });
              
              creditsToDeduct -= toDeduct;
              console.log(`Credits remaining to deduct: ${creditsToDeduct}`);
            }
          }
          
          console.log(`✅ Successfully deducted ${tracksToUpload} credits from pay-as-you-go payments`);
        } catch (creditError) {
          console.error('❌ CRITICAL: Failed to deduct credits:', creditError);
          toast.error("Failed to process credits. Your upload has been cancelled to prevent unauthorized usage.", {
            duration: 5000
          });
          setUploading(false);
          return; // STOP the upload process
        }
      }

      // Now proceed with upload after credits are deducted
      let coverArtPath = "";
      if (coverArt) {
        const coverResult = await content.uploadFile(coverArt, "/content/uploads/covers/");
        coverArtPath = coverResult.path;
      }

      let mainAudioPath = "";
      if (audioFile) {
        const audioResult = await content.uploadFile(audioFile, "/content/uploads/music/", {
          onProgress: ({ percentage }: any) => {
            setProgress(percentage);
          }
        });
        mainAudioPath = audioResult.path;
      }

      await db.insert("tracks", {
        artist_uuid: currentUser.userUuid,
        title: formData.title,
        album_name: formData.album_name || formData.title,
        genre: formData.genre,
        release_date: formData.release_date,
        file_path: mainAudioPath,
        cover_art: coverArtPath,
        lyrics: formData.lyrics,
        isrc: formData.isrc,
        upc: formData.upc,
        label_name: formData.label_name,
        grid_code: formData.grid_code,
        catalog_number: formData.catalog_number,
        p_line: formData.p_line,
        c_line: formData.c_line,
        copyright_year: formData.copyright_year,
        language: formData.language,
        main_artist_name: formData.main_artist_name,
        featuring_artist_name: formData.featuring_artist_name,
        songwriter_name: formData.songwriter_name,
        composer_name: formData.composer_name,
        producer_name: formData.producer_name,
        mixing_mastering: formData.mixing_mastering,
        country_register: formData.country_register,
        sub_genre: formData.sub_genre,
        explicit_content: formData.explicit_content,
        uses_ai: formData.uses_ai,
        track_type: formData.track_type,
        selected_stores: formData.selected_stores.join(","),
        status: "draft",
        distribution_status: "pending",
        approval_status: "pending"
      });

      if (formData.release_type !== "single" && additionalTracks.length > 0) {
        for (let i = 0; i < additionalTracks.length; i++) {
          const track = additionalTracks[i];
          if (track.audioFile) {
            const trackAudioPath = await content.uploadFile(track.audioFile, "/content/uploads/music/");
            
            // Generate new catalog number for each additional track
            const today = new Date();
            const dateStr = today.toISOString().slice(2,10).replace(/-/g, '');
            const existingTracks = await db.query("tracks", {});
            const prefix = `UMG${dateStr}`;
            const todayCatalogs = existingTracks
              .filter((t: any) => t.catalog_number && t.catalog_number.startsWith(prefix))
              .map((t: any) => parseInt(t.catalog_number.replace(prefix, '')) || 0)
              .sort((a: number, b: number) => b - a);
            const nextNum = todayCatalogs.length > 0 ? todayCatalogs[0] + 1 : 1;
            const trackCatalogNumber = `${prefix}${String(nextNum).padStart(3, '0')}`;
            
            await db.insert("tracks", {
              artist_uuid: currentUser.userUuid,
              title: track.title,
              album_name: formData.album_name || formData.title,
              genre: formData.genre,
              release_date: formData.release_date,
              file_path: trackAudioPath.path,
              cover_art: coverArtPath,
              lyrics: track.lyrics,
              isrc: track.isrc,
              upc: "",
              label_name: formData.label_name,
              grid_code: formData.grid_code,
              catalog_number: trackCatalogNumber,
              p_line: formData.p_line,
              c_line: formData.c_line,
              copyright_year: formData.copyright_year,
              language: formData.language,
              main_artist_name: formData.main_artist_name,
              featuring_artist_name: formData.featuring_artist_name,
              songwriter_name: formData.songwriter_name,
              composer_name: formData.composer_name,
              producer_name: formData.producer_name,
              mixing_mastering: formData.mixing_mastering,
              country_register: formData.country_register,
              sub_genre: formData.sub_genre,
              explicit_content: formData.explicit_content,
              uses_ai: formData.uses_ai,
              track_type: formData.track_type,
              selected_stores: formData.selected_stores.join(","),
              status: "draft",
              distribution_status: "pending",
              approval_status: "pending"
            });
          }
        }
      }

      // Send notification email to admin
      try {
        await functions.post('send-upload-notification', {
          trackData: {
            ...formData,
            selected_stores: formData.selected_stores.join(',')
          },
          artistData: {
            artist_name: currentUser.artistData?.artist_name || currentUser.email
          }
        });
        console.log('Upload notification sent successfully');
      } catch (emailError: any) {
        console.error('Failed to send upload notification:', emailError);
        // Don't fail the upload if email fails
      }

      toast.success("Track uploaded successfully!");
      
      // STRICT ENFORCEMENT: Check if user has used up all credits after upload
      if (!currentUser.hasSubscription && currentUser.hasCredits) {
        const remainingCredits = currentUser.availableCredits - (1 + additionalTracks.length);
        
        if (remainingCredits <= 0) {
          toast.success("Upload complete! You've used all your upload credits. To upload more music, please purchase additional releases or subscribe.", {
            duration: 6000
          });
          
          // Reset form and redirect to plans page
          setFormData({
            release_type: "single",
            title: "",
            album_name: "",
            genre: "",
            release_date: "",
            lyrics: "",
            isrc: "",
            upc: "",
            label_name: "",
            grid_code: "",
            catalog_number: "",
            p_line: "",
            c_line: "",
            copyright_year: "",
            language: "",
            main_artist_name: "",
            featuring_artist_name: "",
            songwriter_name: "",
            composer_name: "",
            producer_name: "",
            mixing_mastering: "",
            country_register: "",
            sub_genre: "",
            explicit_content: "no",
            uses_ai: "no",
            track_type: "original",
            selected_stores: []
          });
          setAdditionalTracks([]);
          setAudioFile(null);
          setCoverArt(null);
          setProgress(0);

          setTimeout(() => {
            navigate("/plans");
          }, 2000);
          return;
        }
      }
      
      // Normal redirect if user still has credits or has subscription
      setFormData({
        release_type: "single",
        title: "",
        album_name: "",
        genre: "",
        release_date: "",
        lyrics: "",
        isrc: "",
        upc: "",
        label_name: "",
        grid_code: "",
        catalog_number: "",
        p_line: "",
        c_line: "",
        copyright_year: "",
        language: "",
        main_artist_name: "",
        featuring_artist_name: "",
        songwriter_name: "",
        composer_name: "",
        producer_name: "",
        mixing_mastering: "",
        country_register: "",
        sub_genre: "",
        explicit_content: "no",
        uses_ai: "no",
        track_type: "original",
        selected_stores: []
      });
      setAdditionalTracks([]);
      setAudioFile(null);
      setCoverArt(null);
      setProgress(0);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error uploading track:", error);
      
      // Better error messages
      let errorMessage = "Failed to upload track";
      if (error?.message) {
        errorMessage = error.message;
      }
      
      // Check for specific permission errors
      if (errorMessage.includes('permission') || errorMessage.includes('not allowed') || errorMessage.includes('unauthorized')) {
        errorMessage = "You don't have permission to upload tracks. Please make sure you're logged in and have a subscription plan.";
      }
      
      // Check for file size or format errors
      if (errorMessage.includes('file') || errorMessage.includes('size') || errorMessage.includes('format')) {
        errorMessage = `File issue: ${errorMessage}. Please check your file format and size.`;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
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

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
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
            <h1 className="text-3xl font-bold text-white mb-2">Upload Music</h1>
            <p className="text-purple-300">Distribute your music to major streaming platforms</p>
          </div>

          <Card className="bg-slate-900/50 border-purple-500/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-purple-200 text-lg">
                  Release Type 
                  {!currentUser?.hasSubscription && currentUser?.hasCredits && (
                    <span className="text-purple-400 text-sm ml-2">
                      (Based on your purchase)
                    </span>
                  )}
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'single', name: 'Single', description: 'One track' },
                    { id: 'ep', name: 'EP', description: '2-6 tracks' },
                    { id: 'album', name: 'Album', description: '7+ tracks' }
                  ].map((type) => {
                    const isAvailable = currentUser?.hasSubscription || 
                      (currentUser?.availableReleaseTypes && currentUser.availableReleaseTypes.includes(type.id));
                    
                    return (
                      <label
                        key={type.id}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                          !isAvailable
                            ? 'bg-slate-900/30 border-slate-700/30 opacity-50 cursor-not-allowed'
                            : formData.release_type === type.id
                              ? 'bg-purple-500/20 border-purple-500'
                              : 'bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="release_type"
                          className="sr-only"
                          checked={formData.release_type === type.id}
                          disabled={!isAvailable}
                          onChange={() => setFormData({ ...formData, release_type: type.id })}
                        />
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isAvailable ? 'text-white' : 'text-slate-500'}`}>
                            {type.name}
                          </span>
                          {!isAvailable && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                              Locked
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${isAvailable ? 'text-purple-300' : 'text-slate-500'}`}>
                          {type.description}
                        </span>
                        {!isAvailable && (
                          <span className="text-xs text-slate-500 text-center">
                            Upgrade to unlock
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                {!currentUser?.hasSubscription && currentUser?.hasCredits && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mt-2">
                    <p className="text-purple-300 text-sm">
                      <span className="font-medium text-purple-200">Release Types Available:</span> 
                      {currentUser?.availableReleaseTypes?.map((type: string) => {
                        const typeNames = { single: 'Single', ep: 'EP', album: 'Album' };
                        return typeNames[type as keyof typeof typeNames];
                      }).join(', ')}
                    </p>
                    <p className="text-purple-400 text-xs mt-1">
                      Your purchase of {currentUser?.availableReleaseTypes?.includes('album') ? 'Album' : currentUser?.availableReleaseTypes?.includes('ep') ? 'EP' : 'Single'} release includes these options.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-purple-200">
                    {formData.release_type === "single" ? "Track Title *" : "Release Title *"}
                  </Label>
                  <Input
                    id="title"
                    placeholder={formData.release_type === "single" ? "Your song title" : "Album/EP title"}
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {formData.release_type !== "single" && (
                  <div className="space-y-2">
                    <Label htmlFor="album_name" className="text-purple-200">Album/EP Name</Label>
                    <Input
                      id="album_name"
                      placeholder="Same as release title or different"
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.album_name}
                      onChange={(e) => setFormData({ ...formData, album_name: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="main_artist_name" className="text-purple-200">Main Artist Name</Label>
                  <Input
                    id="main_artist_name"
                    placeholder="Primary artist name"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.main_artist_name}
                    onChange={(e) => setFormData({ ...formData, main_artist_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuring_artist_name" className="text-purple-200">Featuring Artist Name (Optional)</Label>
                  <Input
                    id="featuring_artist_name"
                    placeholder="Featured artist name"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.featuring_artist_name}
                    onChange={(e) => setFormData({ ...formData, featuring_artist_name: e.target.value })}
                  />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-purple-200">Genre</Label>
                  <Input
                    id="genre"
                    placeholder="e.g., Hip-Hop, Electronic"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub_genre" className="text-purple-200">Sub-Genre</Label>
                  <Input
                    id="sub_genre"
                    placeholder="e.g., Trap, DnB, House, Tech House"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.sub_genre}
                    onChange={(e) => setFormData({ ...formData, sub_genre: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="release_date" className="text-purple-200">Release Date</Label>
                  <Input
                    id="release_date"
                    type="date"
                    className="bg-slate-800/50 border-purple-500/20 text-white"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isrc" className="text-purple-200">ISRC (Optional)</Label>
                  <Input
                    id="isrc"
                    placeholder="International Standard Recording Code"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.isrc}
                    onChange={(e) => setFormData({ ...formData, isrc: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upc" className="text-purple-200">UPC (Optional)</Label>
                  <Input
                    id="upc"
                    placeholder="Universal Product Code"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.upc}
                    onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label_name" className="text-purple-200">Label Name</Label>
                  <Input
                    id="label_name"
                    placeholder="Your label name"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.label_name}
                    disabled
                    title="Label name is automatically set based on your subscription package"
                  />
                  <p className="text-xs text-purple-400">Label name is automatically set based on your subscription package</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="songwriter_name" className="text-purple-200">Songwriter Full Name</Label>
                  <Input
                    id="songwriter_name"
                    placeholder="John Doe"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.songwriter_name}
                    onChange={(e) => setFormData({ ...formData, songwriter_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="composer_name" className="text-purple-200">Composer Full Name</Label>
                  <Input
                    id="composer_name"
                    placeholder="Jane Smith"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.composer_name}
                    onChange={(e) => setFormData({ ...formData, composer_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="producer_name" className="text-purple-200">Producer Name</Label>
                  <Input
                    id="producer_name"
                    placeholder="Producer name"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.producer_name}
                    onChange={(e) => setFormData({ ...formData, producer_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mixing_mastering" className="text-purple-200">Mixing & Mastering</Label>
                  <Input
                    id="mixing_mastering"
                    placeholder="Mixing & Mastering engineer"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.mixing_mastering}
                    onChange={(e) => setFormData({ ...formData, mixing_mastering: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country_register" className="text-purple-200">Country Register</Label>
                  <select
                    id="country_register"
                    className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/40"
                    value={formData.country_register}
                    onChange={(e) => setFormData({ ...formData, country_register: e.target.value })}
                  >
                    <option value="">Select country</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
                    <option value="de">Germany</option>
                    <option value="fr">France</option>
                    <option value="es">Spain</option>
                    <option value="it">Italy</option>
                    <option value="jp">Japan</option>
                    <option value="kr">South Korea</option>
                    <option value="cn">China</option>
                    <option value="in">India</option>
                    <option value="br">Brazil</option>
                    <option value="mx">Mexico</option>
                    <option value="nl">Netherlands</option>
                    <option value="se">Sweden</option>
                    <option value="no">Norway</option>
                    <option value="dk">Denmark</option>
                    <option value="fi">Finland</option>
                    <option value="ch">Switzerland</option>
                    <option value="at">Austria</option>
                    <option value="be">Belgium</option>
                    <option value="ie">Ireland</option>
                    <option value="pt">Portugal</option>
                    <option value="gr">Greece</option>
                    <option value="pl">Poland</option>
                    <option value="cz">Czech Republic</option>
                    <option value="hu">Hungary</option>
                    <option value="ro">Romania</option>
                    <option value="bg">Bulgaria</option>
                    <option value="hr">Croatia</option>
                    <option value="si">Slovenia</option>
                    <option value="sk">Slovakia</option>
                    <option value="lt">Lithuania</option>
                    <option value="lv">Latvia</option>
                    <option value="ee">Estonia</option>
                    <option value="is">Iceland</option>
                    <option value="cy">Cyprus</option>
                    <option value="mt">Malta</option>
                    <option value="lu">Luxembourg</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-purple-200 text-lg">Select Stores & Platforms</Label>
                <p className="text-sm text-purple-400">Choose which platforms to distribute your music to</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: 'spotify', name: 'Spotify' },
                    { id: 'apple_music', name: 'Apple Music' },
                    { id: 'youtube_music', name: 'YouTube Music' },
                    { id: 'amazon_music', name: 'Amazon Music' },
                    { id: 'tiktok', name: 'TikTok' },
                    { id: 'instagram', name: 'Instagram' },
                    { id: 'soundcloud', name: 'SoundCloud' },
                    { id: 'deezer', name: 'Deezer' },
                    { id: 'tidal', name: 'Tidal' },
                    { id: 'facebook', name: 'Facebook' },
                    { id: 'jiosaavn', name: 'JioSaavn' },
                    { id: 'joox', name: 'Joox' },
                    { id: 'qobuz', name: 'Qobuz' },
                    { id: 'all_stores', name: 'All Digital Stores' }
                  ].map((store) => (
                    <label
                      key={store.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.selected_stores.includes(store.id)
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-purple-500 text-purple-500 focus:ring-purple-500 bg-slate-700"
                        checked={formData.selected_stores.includes(store.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selected_stores: [...formData.selected_stores, store.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selected_stores: formData.selected_stores.filter(s => s !== store.id)
                            });
                          }
                        }}
                      />
                      <span className="text-white text-sm">{store.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Advanced Metadata Section */}
              <div className="space-y-4">
                <Label className="text-purple-200 text-lg">Advanced Metadata</Label>
                <p className="text-sm text-purple-400">Optional identifiers and copyright information</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grid_code" className="text-purple-200">Grid Code</Label>
                    <Input
                      id="grid_code"
                      placeholder="Grid identifier code"
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.grid_code}
                      onChange={(e) => setFormData({ ...formData, grid_code: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catalog_number" className="text-purple-200">Catalog Number</Label>
                    <Input
                      id="catalog_number"
                      placeholder="Catalog reference number"
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.catalog_number}
                      onChange={(e) => setFormData({ ...formData, catalog_number: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="copyright_year" className="text-purple-200">Copyright Year</Label>
                    <Input
                      id="copyright_year"
                      placeholder="e.g., 2024"
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.copyright_year}
                      onChange={(e) => setFormData({ ...formData, copyright_year: e.target.value })}
                      type="number"
                      min="1900"
                      max="2100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="p_line" className="text-purple-200">P-Line (Phonogram Copyright)</Label>
                    <Input
                      id="p_line"
                      placeholder="e.g., 2024 Union Music Group"
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.p_line}
                      onChange={(e) => setFormData({ ...formData, p_line: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="c_line" className="text-purple-200">C-Line (Copyright)</Label>
                    <Input
                      id="c_line"
                      placeholder="e.g., 2024 Union Music Group"
                      className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                      value={formData.c_line}
                      onChange={(e) => setFormData({ ...formData, c_line: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Language Section */}
              <div className="space-y-4">
                <Label className="text-purple-200 text-lg">Language</Label>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-purple-200">Primary Language</Label>
                    <select
                      id="language"
                      className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/40"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option value="">Select language</option>
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="italian">Italian</option>
                      <option value="portuguese">Portuguese</option>
                      <option value="dutch">Dutch</option>
                      <option value="russian">Russian</option>
                      <option value="japanese">Japanese</option>
                      <option value="korean">Korean</option>
                      <option value="chinese">Chinese</option>
                      <option value="arabic">Arabic</option>
                      <option value="hindi">Hindi</option>
                      <option value="punjabi">Punjabi</option>
                      <option value="instrumental">Instrumental</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Explicit Content Section */}
              <div className="space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <Label className="text-orange-200 text-lg flex items-center gap-2">
                    ⚠️ Explicit Content
                  </Label>
                  <p className="text-sm text-orange-300 mt-2">
                    Does this track contain explicit content (profanity, mature themes, or adult language)?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.explicit_content === "yes"
                          ? 'bg-orange-500/20 border-orange-500'
                          : 'bg-slate-800/50 border-orange-500/20 hover:border-orange-500/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="explicit_content"
                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 bg-slate-700"
                        checked={formData.explicit_content === "yes"}
                        onChange={() => setFormData({ ...formData, explicit_content: "yes" })}
                      />
                      <div>
                        <span className="text-white font-semibold">Yes - Explicit</span>
                        <p className="text-xs text-orange-300 mt-1">Contains explicit content</p>
                      </div>
                    </label>
                    
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.explicit_content === "no"
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-slate-800/50 border-green-500/20 hover:border-green-500/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="explicit_content"
                        className="w-4 h-4 text-green-500 focus:ring-green-500 bg-slate-700"
                        checked={formData.explicit_content === "no"}
                        onChange={() => setFormData({ ...formData, explicit_content: "no" })}
                      />
                      <div>
                        <span className="text-white font-semibold">No - Clean</span>
                        <p className="text-xs text-green-300 mt-1">No explicit content</p>
                      </div>
                    </label>
                  </div>
                  
                  <p className="text-xs text-orange-200 mt-3">
                    <strong>Important:</strong> Correctly marking explicit content helps streaming platforms apply appropriate content ratings and age restrictions.
                  </p>
                </div>
              </div>

              {/* AI Usage Section */}
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <Label className="text-blue-200 text-lg flex items-center gap-2">
                    🤖 AI Usage
                  </Label>
                  <p className="text-sm text-blue-300 mt-2">
                    Does this track use AI tools in its creation?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.uses_ai === "yes"
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-slate-800/50 border-blue-500/20 hover:border-blue-500/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="uses_ai"
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500 bg-slate-700"
                        checked={formData.uses_ai === "yes"}
                        onChange={() => setFormData({ ...formData, uses_ai: "yes" })}
                      />
                      <div>
                        <span className="text-white font-semibold">Yes - Uses AI</span>
                        <p className="text-xs text-blue-300 mt-1">Track uses AI tools</p>
                      </div>
                    </label>
                    
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.uses_ai === "no"
                          ? 'bg-slate-500/20 border-slate-500'
                          : 'bg-slate-800/50 border-slate-500/20 hover:border-slate-500/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="uses_ai"
                        className="w-4 h-4 text-slate-500 focus:ring-slate-500 bg-slate-700"
                        checked={formData.uses_ai === "no"}
                        onChange={() => setFormData({ ...formData, uses_ai: "no" })}
                      />
                      <div>
                        <span className="text-white font-semibold">No - No AI</span>
                        <p className="text-xs text-slate-300 mt-1">No AI tools used</p>
                      </div>
                    </label>
                  </div>
                  
                  <p className="text-xs text-blue-200 mt-3">
                    <strong>Note:</strong> This includes AI-generated vocals, AI mixing/mastering, or AI composition assistance.
                  </p>
                </div>
              </div>

              {/* Track Type Section */}
              <div className="space-y-4">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <Label className="text-purple-200 text-lg flex items-center gap-2">
                    🎵 Track Type
                  </Label>
                  <p className="text-sm text-purple-300 mt-2">
                    Is this track original or a remix?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.track_type === "original"
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="track_type"
                        className="w-4 h-4 text-purple-500 focus:ring-purple-500 bg-slate-700"
                        checked={formData.track_type === "original"}
                        onChange={() => setFormData({ ...formData, track_type: "original" })}
                      />
                      <div>
                        <span className="text-white font-semibold">Original</span>
                        <p className="text-xs text-purple-300 mt-1">Original composition</p>
                      </div>
                    </label>
                    
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.track_type === "remix"
                          ? 'bg-pink-500/20 border-pink-500'
                          : 'bg-slate-800/50 border-pink-500/20 hover:border-pink-500/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="track_type"
                        className="w-4 h-4 text-pink-500 focus:ring-pink-500 bg-slate-700"
                        checked={formData.track_type === "remix"}
                        onChange={() => setFormData({ ...formData, track_type: "remix" })}
                        required
                      />
                      <div>
                        <span className="text-white font-semibold">Remix *</span>
                        <p className="text-xs text-pink-300 mt-1">Remix of existing track</p>
                      </div>
                    </label>
                  </div>
                  
                  <p className="text-xs text-purple-200 mt-3">
                    <strong>Required:</strong> Please specify whether this is an original track or a remix to ensure proper licensing and distribution.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lyrics" className="text-purple-200">Lyrics</Label>
                <Textarea
                  id="lyrics"
                  placeholder="Add lyrics (optional)"
                  className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50 min-h-32"
                  value={formData.lyrics}
                  onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                />
              </div>

              {formData.release_type !== "single" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200 text-lg">Additional Tracks</Label>
                      {!currentUser?.hasSubscription && currentUser?.hasCredits && (
                        <p className="text-xs text-purple-400 mt-1">
                          You can add up to {currentUser?.availableCredits ? Math.max(0, currentUser?.availableCredits - 1) : 0} more track(s)
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={addTrack}
                      disabled={
                        !currentUser?.hasSubscription && 
                        currentUser?.hasCredits && 
                        additionalTracks.length >= (currentUser?.availableCredits ? Math.max(0, currentUser?.availableCredits - 1) : 0)
                      }
                      className="bg-purple-500 hover:bg-purple-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Add Track
                    </Button>
                  </div>
                  
                  {additionalTracks.length === 0 ? (
                    <div className="text-center py-8 bg-slate-800/30 border border-dashed border-purple-500/30 rounded-lg">
                      <p className="text-purple-300 text-sm">Click "Add Track" to add more songs to your {formData.release_type}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {additionalTracks.map((track, index) => (
                        <Card key={index} className="bg-slate-800/50 border-purple-500/20 p-4">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="text-white font-medium">Track {index + 2}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTrack(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-purple-200 text-sm">Track Title</Label>
                                <Input
                                  placeholder="Track title"
                                  className="bg-slate-700/50 border-purple-500/20 text-white placeholder:text-purple-400/50 text-sm"
                                  value={track.title}
                                  onChange={(e) => updateTrack(index, 'title', e.target.value)}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-purple-200 text-sm">ISRC (Optional)</Label>
                                <Input
                                  placeholder="ISRC code"
                                  className="bg-slate-700/50 border-purple-500/20 text-white placeholder:text-purple-400/50 text-sm"
                                  value={track.isrc}
                                  onChange={(e) => updateTrack(index, 'isrc', e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-purple-200 text-sm">Lyrics (Optional)</Label>
                              <Textarea
                                placeholder="Add lyrics for this track"
                                className="bg-slate-700/50 border-purple-500/20 text-white placeholder:text-purple-400/50 text-sm min-h-20"
                                value={track.lyrics}
                                onChange={(e) => updateTrack(index, 'lyrics', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-purple-200 text-sm">Audio File *</Label>
                              <Input
                                type="file"
                                accept="audio/*"
                                className="bg-slate-700/50 border-purple-500/20 text-white text-sm"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    updateTrack(index, 'audioFile', e.target.files[0]);
                                  }
                                }}
                                required={additionalTracks.length > 0}
                              />
                              {track.audioFile && (
                                <p className="text-xs text-purple-300">Selected: {track.audioFile.name}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Credit limit warning */}
                  {!currentUser?.hasSubscription && currentUser?.hasCredits && (
                    additionalTracks.length >= (currentUser?.availableCredits ? Math.max(0, currentUser?.availableCredits - 1) : 0) && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mt-2">
                        <p className="text-orange-300 text-sm">
                          <span className="font-medium text-orange-200">Credit Limit Reached:</span> 
                          You've used all your available credits for this upload. To add more tracks, please purchase additional credits.
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="audio_file" className="text-purple-200">Audio File *</Label>
                  <Input
                    id="audio_file"
                    type="file"
                    accept="audio/*"
                    className="bg-slate-800/50 border-purple-500/20 text-white"
                    onChange={handleAudioFileChange}
                    required
                  />
                  {audioFile && (
                    <p className="text-sm text-purple-300">Selected: {audioFile.name}</p>
                  )}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mt-2">
                    <p className="text-sm text-purple-300 font-medium mb-2">Audio Format Requirements:</p>
                    <ul className="text-xs text-purple-300 space-y-1 ml-2">
                      <li>• 16-bit, 44.1kHz, Stereo</li>
                      <li>• 24-bit, 48kHz, Stereo</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_art" className="text-purple-200">Cover Art</Label>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-2">
                    <ul className="text-sm text-purple-300 space-y-1">
                      <li>• Size: 3000x3000px minimum</li>
                      <li>• Format: JPG or PNG</li>
                      <li>• RGB color mode</li>
                      <li>• Maximum 10MB file size</li>
                    </ul>
                  </div>
                  <Input
                    id="cover_art"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="bg-slate-800/50 border-purple-500/20 text-white"
                    onChange={handleCoverArtChange}
                  />
                  {coverArt && (
                    <p className="text-sm text-purple-300">Selected: {coverArt.name}</p>
                  )}
                </div>
              </div>

              {uploading && (
                <div className="bg-purple-950/30 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Disc3 className="w-5 h-5 text-purple-400 animate-spin" />
                    <div className="flex-1">
                      <div className="text-sm text-purple-200 mb-2">Uploading... {progress.toFixed(0)}%</div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  disabled={uploading}
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Track"}
                </Button>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-purple-300 hover:text-white" disabled={uploading}>
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

export default Upload;
