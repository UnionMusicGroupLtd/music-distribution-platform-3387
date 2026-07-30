import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Edit2, Check, X, Clock, Globe, Disc3, Music, Save, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminTrackPlayerProps {
  track: any;
  onUpdateTrack: (trackId: number, updates: any) => void;
  onDownloadFile: (url: string, filename: string) => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onSetPending: () => void;
  onSendMessage?: (message: string) => void;
}

export const AdminTrackPlayer = ({ 
  track, 
  onUpdateTrack, 
  onDownloadFile, 
  onApprove, 
  onReject, 
  onSetPending,
  onSendMessage
}: AdminTrackPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: track.title || '',
    isrc: track.isrc || '',
    upc: track.upc || '',
    catalog_number: track.catalog_number || '',
    grid_code: track.grid_code || '',
    genre: track.genre || '',
    language: track.language || '',
    qc_notes: track.qc_notes || ''
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const mockDuration = 184; // 3:04 in seconds

  const handleSaveEdit = () => {
    onUpdateTrack(track._row_id, editData);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="w-3 h-3" />;
      case 'rejected': return <X className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      default: return <Disc3 className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Album Art & Status Header */}
      <div className="relative">
        {track.cover_art ? (
          <img 
            src={track.cover_art} 
            alt={track.title}
            className="w-full h-64 object-cover rounded-lg"
            style={{ width: '100%' }}
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
            <Disc3 className="w-16 h-16 text-purple-400" />
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge className={`${getStatusColor(track.approval_status)} border flex items-center gap-1`}>
            {getStatusIcon(track.approval_status)}
            {track.approval_status || 'pending'}
          </Badge>
          {track.explicit_content === 'yes' && (
            <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
              ⚠️ Explicit
            </Badge>
          )}
        </div>

        {/* Download Buttons */}
        <div className="absolute top-4 left-4 flex gap-2">
          {track.cover_art && (
            <Button
              size="sm"
              onClick={() => onDownloadFile(track.cover_art, `cover_${track.title}.jpg`)}
              className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
            >
              <Download className="w-4 h-4 mr-1" />
              Cover Art
            </Button>
          )}
          {track.file_path && (
            <Button
              size="sm"
              onClick={() => onDownloadFile(track.file_path, `${track.title}.mp3`)}
              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
            >
              <Download className="w-4 h-4 mr-1" />
              Audio File
            </Button>
          )}
        </div>
      </div>

      {/* Track Info with Edit */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white text-xl font-semibold"
                placeholder="Track Title"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={editData.isrc}
                  onChange={(e) => setEditData({ ...editData, isrc: e.target.value })}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white text-sm"
                  placeholder="ISRC Code"
                />
                <input
                  type="text"
                  value={editData.upc}
                  onChange={(e) => setEditData({ ...editData, upc: e.target.value })}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white text-sm"
                  placeholder="UPC/EAN Code"
                />
                <input
                  type="text"
                  value={editData.catalog_number}
                  onChange={(e) => setEditData({ ...editData, catalog_number: e.target.value })}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white text-sm"
                  placeholder="Catalog Number"
                />
                <input
                  type="text"
                  value={editData.grid_code}
                  onChange={(e) => setEditData({ ...editData, grid_code: e.target.value })}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white text-sm"
                  placeholder="Grid Code"
                />
                <input
                  type="text"
                  value={editData.genre}
                  onChange={(e) => setEditData({ ...editData, genre: e.target.value })}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white text-sm"
                  placeholder="Genre"
                />
                <input
                  type="text"
                  value={editData.language}
                  onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white text-sm"
                  placeholder="Language"
                />
              </div>
              <textarea
                value={editData.qc_notes}
                onChange={(e) => setEditData({ ...editData, qc_notes: e.target.value })}
                className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white text-sm"
                placeholder="QC Notes"
                rows={2}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{track.title}</h3>
              {track.album_name && (
                <p className="text-purple-300 text-sm mb-2">{track.album_name}</p>
              )}
            </div>
          )}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
              setEditData({
                title: track.title || '',
                isrc: track.isrc || '',
                upc: track.upc || '',
                catalog_number: track.catalog_number || '',
                grid_code: track.grid_code || '',
                genre: track.genre || '',
                language: track.language || '',
                qc_notes: track.qc_notes || ''
              });
            } else {
              setIsEditing(true);
            }
          }}
          className="text-purple-300 hover:text-white"
        >
          {isEditing ? <XCircle className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Audio Player Controls */}
      {!track.file_path ? null : (
        <div className="bg-slate-800/50 rounded-lg p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-purple-300 mb-1">
              <span>{formatTime(progress * mockDuration / 100)}</span>
              <span>{formatTime(mockDuration)}</span>
            </div>
            <div 
              className="w-full bg-slate-700 rounded-full h-2 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                setProgress(percent);
              }}
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
              onClick={() => setIsPlaying(!isPlaying)}
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
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                setVolume(percent);
              }}
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

          {/* Admin Action Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="flex-1 bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="flex-1 bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                  disabled={track.approval_status === 'approved'}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason && reason.trim()) {
                      onReject(reason);
                    } else if (reason !== null) {
                      toast.error('Please provide a rejection reason');
                    }
                  }}
                  className="flex-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                  disabled={track.approval_status === 'rejected'}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={onSetPending}
                  className="flex-1 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30"
                  disabled={track.approval_status === 'pending'}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Set Pending
                </Button>
              </>
            )}
          </div>
      
      {/* Send Message Section */}
      {!isEditing && onSendMessage && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium text-sm">Send Message to Artist</h4>
            <Music className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex gap-2">
            <textarea
              id={`message-${track._row_id}`}
              className="flex-1 bg-slate-700/50 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-400/50"
              placeholder="Enter your message to the artist..."
              rows={2}
            />
            <Button
              size="sm"
              onClick={() => {
                const textarea = document.getElementById(`message-${track._row_id}`) as HTMLTextAreaElement;
                const message = textarea?.value?.trim();
                if (message) {
                  onSendMessage(message);
                  textarea.value = '';
                } else {
                  toast.error('Please enter a message');
                }
              }}
              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30"
            >
              Send
            </Button>
          </div>
        </div>
      )}

      {/* Detailed Metadata Grid (when not editing) */}
      {!isEditing && (
        <div className="space-y-4">
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
              icon={<Disc3 className="w-4 h-4" />}
              label="Label"
              value={track.label_name || 'Union Music Group Ltd'}
              color="orange"
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
              color="pink"
            />
            <MetadataCard 
              icon={<Music className="w-4 h-4" />}
              label="Main Artist"
              value={track.main_artist_name || 'Not specified'}
              color="green"
            />
            <MetadataCard 
              icon={<Music className="w-4 h-4" />}
              label="Featuring Artist"
              value={track.featuring_artist_name || 'None'}
              color="blue"
            />
            <MetadataCard 
              icon={<Music className="w-4 h-4" />}
              label="Songwriter"
              value={track.songwriter_name || 'Not specified'}
              color="purple"
            />
            <MetadataCard 
              icon={<Music className="w-4 h-4" />}
              label="Composer"
              value={track.composer_name || 'Not specified'}
              color="pink"
            />
            <MetadataCard 
              icon={<Music className="w-4 h-4" />}
              label="Producer"
              value={track.producer_name || 'Not specified'}
              color="green"
            />
            <MetadataCard 
              icon={<Music className="w-4 h-4" />}
              label="Mixing & Mastering"
              value={track.mixing_mastering || 'Not specified'}
              color="blue"
            />
            <MetadataCard 
              icon={<Globe className="w-4 h-4" />}
              label="Country Register"
              value={track.country_register || 'Not specified'}
              color="purple"
            />
            <MetadataCard 
              icon={<Music className="w-4 h-4" />}
              label="Track Type"
              value={track.track_type ? track.track_type.charAt(0).toUpperCase() + track.track_type.slice(1) : 'Not specified'}
              color="green"
            />
            <MetadataCard 
              icon={<Music className="w-4 h-4" />}
              label="AI Usage"
              value={track.uses_ai === 'yes' ? 'Uses AI Tools' : 'No AI Tools'}
              color={track.uses_ai === 'yes' ? 'blue' : 'green'}
            />
            <MetadataCard 
              icon={<Disc3 className="w-4 h-4" />}
              label="P-Line"
              value={track.p_line || 'Not specified'}
              color="pink"
              fullRow
            />
            <MetadataCard 
              icon={<Disc3 className="w-4 h-4" />}
              label="C-Line"
              value={track.c_line || 'Not specified'}
              color="green"
              fullRow
            />
            <MetadataCard 
              icon={<Disc3 className="w-4 h-4" />}
              label="Copyright Year"
              value={track.copyright_year || 'Not specified'}
              color="blue"
            />
            <MetadataCard 
              icon={<Globe className="w-4 h-4" />}
              label="Release Type"
              value={track.album_name && track.album_name !== track.title ? 'Album/EP' : 'Single'}
              color="purple"
            />
            <MetadataCard 
              icon={<Disc3 className="w-4 h-4" />}
              label="Selected Stores"
              value={track.selected_stores ? track.selected_stores.split(',').length + ' platforms' : 'None'}
              color="pink"
            />
            {track.qc_notes && (
              <MetadataCard 
                icon={<Music className="w-4 h-4" />}
                label="QC Notes"
                value={track.qc_notes}
                color="yellow"
                fullRow
              />
            )}
            {track.lyrics && (
              <MetadataCard 
                icon={<Music className="w-4 h-4" />}
                label="Lyrics"
                value={track.lyrics.substring(0, 100) + (track.lyrics.length > 100 ? '...' : '')}
                color="purple"
                fullRow
              />
            )}
          </div>
          
          {/* Store Platforms Detail */}
          {track.selected_stores && (
            <div className="bg-slate-800/30 rounded-lg p-3 border border-purple-500/10">
              <div className="text-xs text-purple-400 mb-2">Distribution Platforms:</div>
              <div className="flex flex-wrap gap-1">
                {track.selected_stores.split(',').map((store: string, idx: number) => (
                  <span key={idx} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded border border-purple-500/20">
                    {store.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      <div className="pt-4 border-t border-purple-500/20">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-purple-400">Duration:</div>
          <div className="text-white">{formatTime(mockDuration)}</div>
          <div className="text-purple-400">Release Date:</div>
          <div className="text-white">{track.release_date || 'Not set'}</div>
          <div className="text-purple-400">Upload Status:</div>
          <div className="text-white capitalize">{track.approval_status || 'pending'}</div>
          <div className="text-purple-400">Distribution Status:</div>
          <div className="text-white capitalize">{track.distribution_status || 'pending'}</div>
          {!track.file_path && (
            <>
              <div className="text-purple-400">Audio Status:</div>
              <div className="text-blue-300 text-xs">Removed for storage</div>
            </>
          )}
          <div className="text-purple-400">Explicit Content:</div>
          <div className="text-white capitalize">
            {track.explicit_content === 'yes' ? (
              <span className="text-orange-300 font-semibold">⚠️ Yes - Explicit</span>
            ) : (
              <span className="text-green-300">✓ No - Clean</span>
            )}
          </div>
          {track.album_name && track.album_name !== track.title && (
            <>
              <div className="text-purple-400">Album Name:</div>
              <div className="text-white">{track.album_name}</div>
            </>
          )}
          <div className="text-purple-400">Uploaded:</div>
          <div className="text-white">
            {track._created_at ? new Date(track._created_at * 1000).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </div>
    </div>
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
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    red: 'bg-red-500/10 border-red-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20'
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

export default AdminTrackPlayer;