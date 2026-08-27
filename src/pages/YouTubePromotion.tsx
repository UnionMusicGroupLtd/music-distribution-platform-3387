import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VIEW_PACKAGES = [
  { views: 1000, price: 6 },
  { views: 5000, price: 24 },
  { views: 10000, price: 46 },
  { views: 50000, price: 108 },
  { views: 100000, price: 225 },
  { views: 200000, price: 475 },
  { views: 1000000, price: 1565 },
];

const YouTubePromotion = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    youtubeLink: '',
    views: 1000,
  });
  const [loading, setLoading] = useState(false);

  const selectedPackage = VIEW_PACKAGES.find(p => p.views === form.views);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.youtubeLink) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!form.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!form.youtubeLink.includes('youtube.com') && !form.youtubeLink.includes('youtu.be')) {
      toast.error('Please enter a valid YouTube link');
      return;
    }

    setLoading(true);
    try {
      // Submit via server function: saves order + emails admin notification
      const functions = (await import('@/lib/shared/kliv-functions.js')).default;
      await functions.invoke('youtube-promotion-order', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        youtubeLink: form.youtubeLink,
        views: form.views,
        price: selectedPackage?.price || 0,
      });
      toast.success('Promotion request submitted successfully!', {
        description: `We will contact you at ${form.email} with payment details for your ${form.views.toLocaleString()} views package ($${selectedPackage?.price}). Note: once the promotion starts and is completed, the amount is non-refundable.`,
        duration: 7000,
      });
      setForm({ firstName: '', lastName: '', email: '', youtubeLink: '', views: 1000 });
    } catch (error) {
      console.error('Error submitting promotion request:', error);
      toast.error('Failed to submit request. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">UMG</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">YouTube View Promotion</h1>
          <p className="text-purple-300 text-lg">
            Boost your music videos with genuine views from real audiences
          </p>
        </div>

        {/* About Promotion */}
        <Card className="bg-slate-900/50 border-purple-500/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Genuine & Professional Promotion</h2>
          <div className="space-y-4 text-purple-200">
            <p>
              Our YouTube view promotion service is <strong className="text-white">100% genuine</strong> — we never use bots, fake accounts, or artificial methods. All views come from real people who discover your music through targeted promotion campaigns.
            </p>
            <p>
              Your campaign is managed by our <strong className="text-white">professional promotion team</strong> with years of experience in music marketing. We place your video in front of audiences who genuinely enjoy your genre, helping you grow your fanbase organically and safely.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-purple-500/10">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm text-white font-medium">100% Real Views</p>
                <p className="text-xs text-purple-300 mt-1">No bots, no fake accounts</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-purple-500/10">
                <div className="text-2xl mb-2">🛡️</div>
                <p className="text-sm text-white font-medium">Safe for Your Channel</p>
                <p className="text-xs text-purple-300 mt-1">Complies with YouTube policies</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-purple-500/10">
                <div className="text-2xl mb-2">👥</div>
                <p className="text-sm text-white font-medium">Professional Team</p>
                <p className="text-xs text-purple-300 mt-1">Experienced music marketers</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Table */}
        <Card className="bg-slate-900/50 border-purple-500/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">View Packages & Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {VIEW_PACKAGES.map((pkg) => (
                  <tr key={pkg.views} className="border-b border-purple-500/10">
                    <td className="py-3 px-4">
                      <Badge className="bg-purple-500/20 text-purple-300">{pkg.views.toLocaleString()} views</Badge>
                    </td>
                    <td className="text-right py-3 px-4 text-white font-medium">${pkg.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Order Form */}
        <Card className="bg-slate-900/50 border-purple-500/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Order Your Promotion</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm text-purple-300">First Name *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="John"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white placeholder:text-purple-400/50 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-purple-300">Last Name *</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Doe"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white placeholder:text-purple-400/50 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-purple-300">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white placeholder:text-purple-400/50 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-purple-300">YouTube Video Link *</label>
              <input
                type="url"
                value={form.youtubeLink}
                onChange={(e) => setForm({ ...form, youtubeLink: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white placeholder:text-purple-400/50 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-purple-300">Views *</label>
              <select
                value={form.views}
                onChange={(e) => setForm({ ...form, views: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-md text-white focus:outline-none focus:border-purple-500"
              >
                {VIEW_PACKAGES.map((pkg) => (
                  <option key={pkg.views} value={pkg.views}>
                    {pkg.views.toLocaleString()} views — ${pkg.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Display */}
            {selectedPackage && (
              <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div>
                  <p className="text-sm text-purple-300">Selected Package</p>
                  <p className="text-lg font-semibold text-white">{selectedPackage.views.toLocaleString()} views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-300">Total Price</p>
                  <p className="text-2xl font-bold text-green-400">${selectedPackage.price}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 text-lg"
            >
              {loading ? 'Submitting...' : `Buy Now — $${selectedPackage?.price || 0}`}
            </Button>
          </form>
        </Card>

        {/* No Refund Policy Note */}
        <Card className="bg-yellow-500/5 border-yellow-500/30 p-5 mt-8">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span>⚠️</span> No Refund Policy
          </h3>
          <p className="text-yellow-200/90 text-sm">
            <strong className="text-yellow-100">Please note:</strong> Once a promotion campaign has <strong className="text-yellow-100">started</strong>, and once it has been <strong className="text-yellow-100">completed</strong>, the amount paid is <strong className="text-yellow-100">non-refundable</strong>. By placing an order, you agree to this policy. Please make sure your video link and package selection are correct before purchasing.
          </p>
        </Card>

        {/* Trust Note */}
        <p className="text-center text-purple-400 text-sm mt-8">
          Our promotion is genuine and handled by our professional team. After submitting your order, we'll contact you with payment details and start your campaign within 24–48 hours.
        </p>
      </div>
    </div>
  );
};

export default YouTubePromotion;
