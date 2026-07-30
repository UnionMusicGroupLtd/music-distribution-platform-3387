import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, Globe, Disc3, Music } from "lucide-react";
import { useState, useEffect } from "react";

interface TrackPlayerProps {
  track: any;
}

export const TrackPlayer = ({ track }: TrackPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const mockDuration = 184; // 3:04 in seconds

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!track.file_path) {
      console.warn('No audio file available');
      return;
    }
    
    if (!audioRef) {
      const audio = new Audio(track.file_path);
      setAudioRef(audio);
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      });
      
      audio.volume = volume / 100;
      
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Error playing audio:', err);
      });
    } else {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        audioRef.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Error playing audio:', err);
        });
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef || !audioRef.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.currentTime = percent * audioRef.duration;
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    setVolume(percent);
    if (audioRef) {
      audioRef.volume = percent / 100;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.remove();
      }
    };
  }, [audioRef]);

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-purple-950/80 border-purple-500/20 overflow-hidden">
      {/* Album Art & Status Header */}
      <div className="relative">
        {track.cover_art ? (
          <img 
            src={track.cover_art} 
            alt={track.title}
            className="w-full h-64 object-cover"
            style={{ width: '100%' }}
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Disc3 className="w-16 h-16 text-purple-400" />
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {track.status || 'draft'}
          </Badge>
          {track.explicit_content === 'yes' && (
            <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
              ⚠️ Explicit
            </Badge>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-1">{track.title}</h3>
        {track.album_name && (
          <p className="text-purple-300 text-sm mb-4">{track.album_name}</p>
        )}

        {/* Audio Player Controls */}
        {!track.file_path ? null : (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-purple-300 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || mockDuration)}</span>
              </div>
              <div 
                className="w-full bg-slate-700 rounded-full h-2 cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button 
                size="lg" 
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={handlePlayPause}
                disabled={!track.file_path}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <div 
                className="w-24 bg-slate-700 rounded-full h-1 cursor-pointer"
                onClick={handleVolumeChange}
              >
                <div 
                  className="bg-purple-500 h-1 rounded-full transition-all"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>
            
            {!track.file_path && (
              <div className="text-center text-xs text-purple-400 mt-2">
                No audio file available
              </div>
            )}
          </div>
        )}

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetadataCard 
            icon={<Globe className="w-4 h-4" />}
            label="ISRC"
            value={track.isrc || 'Not assigned'}
            color="purple"
          />
          <MetadataCard 
            icon={<Disc3 className="w-4 h-4" />}
            label="UPC/EAN"
            value={track.upc || 'Not assigned'}
            color="pink"
          />
          <MetadataCard 
            icon={<Disc3 className="w-4 h-4" />}
            label="Grid Code"
            value={track.grid_code || 'Not assigned'}
            color="blue"
          />
          <MetadataCard 
            icon={<Disc3 className="w-4 h-4" />}
            label="Catalog Number"
            value={track.catalog_number || 'Not assigned'}
            color="green"
          />
          <MetadataCard 
            icon={<Music className="w-4 h-4" />}
            label="Main Artist"
            value={track.main_artist_name || 'Not specified'}
            color="purple"
          />
          <MetadataCard 
            icon={<Music className="w-4 h-4" />}
            label="Featuring Artist"
            value={track.featuring_artist_name || 'None'}
            color="pink"
          />
          <MetadataCard 
            icon={<Disc3 className="w-4 h-4" />}
            label="P-Line"
            value={track.p_line || 'Not specified'}
            color="orange"
            fullRow
          />
          <MetadataCard 
            icon={<Disc3 className="w-4 h-4" />}
            label="C-Line"
            value={track.c_line || 'Not specified'}
            color="red"
            fullRow
          />
          <MetadataCard 
            icon={<Disc3 className="w-4 h-4" />}
            label="Copyright Year"
            value={track.copyright_year || 'Not specified'}
            color="purple"
          />
          <MetadataCard 
            icon={<Music className="w-4 h-4" />}
            label="Genre"
            value={track.genre || 'Not specified'}
            color="blue"
          />
          <MetadataCard 
            icon={<Music className="w-4 h-4" />}
            label="Sub-Genre"
            value={track.sub_genre || 'Not specified'}
            color="purple"
          />
          <MetadataCard 
            icon={<Globe className="w-4 h-4" />}
            label="Language"
            value={track.language ? track.language.charAt(0).toUpperCase() + track.language.slice(1) : 'Not specified'}
            color="purple"
          />
          <MetadataCard 
            icon={<Music className="w-4 h-4" />}
            label="Producer"
            value={track.producer_name || 'Not specified'}
            color="pink"
          />
          <MetadataCard 
            icon={<Music className="w-4 h-4" />}
            label="Mixing & Mastering"
            value={track.mixing_mastering || 'Not specified'}
            color="purple"
          />
          <MetadataCard 
            icon={<Globe className="w-4 h-4" />}
            label="Country"
            value={track.country_register ? track.country_register.toUpperCase() : 'Not specified'}
            color="blue"
          />
          <MetadataCard 
            icon={<Music className="w-4 h-4" />}
            label="Track Type"
            value={track.track_type ? track.track_type.charAt(0).toUpperCase() + track.track_type.slice(1) : 'Not specified'}
            color="purple"
          />
          <MetadataCard 
            icon={<Music className="w-4 h-4" />}
            label="AI Usage"
            value={track.uses_ai === 'yes' ? 'Uses AI Tools' : 'No AI Tools'}
            color={track.uses_ai === 'yes' ? 'blue' : 'green'}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-purple-400">Duration:</div>
            <div className="text-white">{formatTime(mockDuration)}</div>
            <div className="text-purple-400">Release Date:</div>
            <div className="text-white">{track.release_date || 'Not set'}</div>
            <div className="text-purple-400">Language:</div>
            <div className="text-white capitalize">{track.language || 'Not set'}</div>
            <div className="text-purple-400">Instruments:</div>
            <div className="text-white capitalize">{track.instruments ? track.instruments.split(',').length + ' selected' : 'None'}</div>
            <div className="text-purple-400">Status:</div>
            <div className="text-white capitalize">{track.status || 'draft'}</div>
            <div className="text-purple-400">Explicit Content:</div>
            <div className="text-white capitalize">
              {track.explicit_content === 'yes' ? (
                <span className="text-orange-300 font-semibold">⚠️ Yes - Explicit</span>
              ) : (
                <span className="text-green-300">✓ No - Clean</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface MetadataCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  fullRow?: boolean;
}

const MetadataCard = ({ icon, label, value, color, fullRow = false }: MetadataCardProps) => {
  const colorClasses = {
    purple: 'bg-purple-500/10 border-purple-500/20',
    pink: 'bg-pink-500/10 border-pink-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
    red: 'bg-red-500/10 border-red-500/20'
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-3 ${fullRow ? 'col-span-2' : ''}`}>
      <div className="flex items-start gap-2">
        <div className={`text-${color}-400 mt-0.5`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className={`text-${color}-300 text-xs font-medium mb-1`}>{label}</div>
          <div className="text-white text-sm truncate">{value}</div>
        </div>
      </div>
    </div>
  );
};

export default TrackPlayer;
