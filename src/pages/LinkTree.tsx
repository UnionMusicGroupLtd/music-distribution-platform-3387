import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Link as LinkIcon, Share2, Loader2 } from "lucide-react";
import db from "@/lib/shared/kliv-database.js";

// Using window.location to get the ID parameter to avoid import issues
const getIdFromUrl = () => {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1] || '';
};

const LinkTree = () => {
  const id = getIdFromUrl();
  const [linkTree, setLinkTree] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLinkTree();
  }, []); // Load on mount since we get ID from URL

  const loadLinkTree = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentId = getIdFromUrl();
      if (!currentId) {
        setError('Link tree ID not provided');
        return;
      }

      // Try to find by custom slug first
      let trees = await db.query('link_trees', { custom_slug: `eq.${currentId}`, status: 'eq.active' });
      
      // If not found by slug, try by ID
      if (!Array.isArray(trees) || trees.length === 0) {
        trees = await db.query('link_trees', { _row_id: `eq.${currentId}`, status: 'eq.active' });
      }

      if (!Array.isArray(trees) || trees.length === 0) {
        setError('Link tree not found or inactive');
        return;
      }

      const tree = trees[0];
      setLinkTree(tree);

      // Load links for this tree
      const treeLinks = await db.query('link_tree_links', { 
        link_tree_id: `eq.${tree._row_id}`, 
        status: 'eq.active' 
      });

      if (Array.isArray(treeLinks)) {
        // Sort by order_index
        setLinks(treeLinks.sort((a, b) => a.order_index - b.order_index));
        
        // Increment click counts
        for (const link of treeLinks) {
          await db.update('link_tree_links', { _row_id: `eq.${link._row_id}` }, {
            click_count: (link.click_count || 0) + 1
          });
        }
      }

    } catch (err) {
      console.error('Error loading link tree:', err);
      setError('Failed to load link tree');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  const getIconForType = (iconType: string) => {
    // No emojis - using clean text only
    return '';
  };

  const shareLinkTree = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: linkTree?.title || 'My Music Links',
          text: linkTree?.description || '',
          url: url
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Loading link tree...</p>
        </div>
      </div>
    );
  }

  if (error || !linkTree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-900/50 border-red-500/20 p-12 text-center max-w-md">
          <Music className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Link Tree Not Found</h1>
          <p className="text-purple-300 mb-6">{error || 'This link tree does not exist or has been deactivated.'}</p>
          <a href="/">
            <Button className="bg-purple-500 hover:bg-purple-600">
              Go to Homepage
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Main Card */}
        <Card className="bg-white rounded-t-3xl shadow-lg overflow-hidden">
          {/* Cover Art Hero */}
          {linkTree.profile_image && (
            <div className="w-full aspect-square">
              <img 
                src={linkTree.profile_image} 
                alt={linkTree.artist_name || 'Profile'}
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}

          {/* Dark Title Band */}
          <div className="bg-gray-900 px-6 py-4">
            <h1 className="text-xl font-bold text-white text-center mb-1">
              {linkTree.artist_name && linkTree.title 
                ? `${linkTree.artist_name} - ${linkTree.title}`
                : linkTree.title || 'My Music Links'}
            </h1>
            {linkTree.description && (
              <p className="text-gray-400 text-sm text-center">{linkTree.description}</p>
            )}
            <p className="text-gray-500 text-xs text-center mt-2">
              Choose your preferred music service
            </p>
          </div>

          {/* Platform Links */}
          <div className="bg-white">
            {links.map((link, index) => {
              const getButtonColor = (platform: string) => {
                const colors: { [key: string]: string } = {
                  spotify: 'bg-green-500',
                  apple: 'bg-red-500',
                  youtube: 'bg-red-600',
                  amazon: 'bg-blue-500',
                  soundcloud: 'bg-orange-500',
                  deezer: 'bg-purple-500',
                  tidal: 'bg-black',
                  bandcamp: 'bg-green-600',
                  tiktok: 'bg-pink-500',
                  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
                  facebook: 'bg-blue-600'
                };
                return colors[link.icon] || 'bg-gray-500';
              };

              return (
                <div 
                  key={link._row_id}
                  className="px-6 py-4 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleLinkClick(link.url)}
                >
                  <div className="flex items-center justify-between">
                    {/* Platform Name and Icon */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-medium text-lg">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-gray-500 text-sm">{link.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      className={`${getButtonColor(link.icon)} text-white px-6 py-2 rounded-full font-medium text-sm hover:opacity-90 transition-opacity`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLinkClick(link.url);
                      }}
                    >
                      {getButtonText(link.title, link.icon)}
                    </button>
                  </div>
                </div>
              );
            })}

            {links.length === 0 && (
              <div className="px-6 py-12 text-center">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No links available yet</p>
              </div>
            )}
          </div>

          {/* Share Button */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <Button
              onClick={shareLinkTree}
              variant="outline"
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share This Link
            </Button>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 text-center">
            <p className="text-gray-500 text-xs">Powered by Union Music Group</p>
          </div>
        </Card>
      </div>
    </div>
  );

  // Helper function to determine button text based on platform
  function getButtonText(title: string, icon: string): string {
    const lowerTitle = title.toLowerCase();
    const lowerIcon = icon.toLowerCase();
    
    if (lowerTitle.includes('pre') || lowerIcon.includes('spotify') || lowerIcon.includes('apple')) {
      if (lowerIcon.includes('spotify')) return 'Pre-Save';
      if (lowerIcon.includes('apple')) return 'Pre-Add';
      if (lowerIcon.includes('amazon')) return 'Pre-Save';
      return 'Pre-Save';
    }
    
    return 'Listen Now';
  }
};

export default LinkTree;