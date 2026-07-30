import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, ArrowLeft, Music, Lock, Mail, Phone, Album } from "lucide-react";
import { toast } from "sonner";
import db from "@/lib/shared/kliv-database.js";

const Plans = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadPackages();
    loadCurrentUser();
  }, []);

  const loadPackages = async () => {
    try {
      const packagesData = await db.query("packages", { active: "eq.true" }, { order: "display_order.asc" });
      setPackages(packagesData);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      // Check if user is logged in (basic check)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const formatPrice = (price: number | null, period: string = "") => {
    if (price === null) return "";
    return `$${price.toFixed(2)}${period ? `/${period}` : ""}`;
  };

  const parseFeatures = (featuresJson: string) => {
    try {
      return JSON.parse(featuresJson);
    } catch {
      return [];
    }
  };

  const handleSubscribe = (paypalLink: string) => {
    if (!currentUser) {
      toast.error('Please sign in to subscribe to a plan');
      navigate('/signin');
      return;
    }
    
    // Open PayPal subscription link
    window.open(paypalLink, '_blank');
    
    toast.success('Redirecting to PayPal...', {
      description: 'Complete your subscription on PayPal to activate your plan',
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Union Music Group</span>
            </div>
            <Button
              variant="ghost"
              className="text-purple-300 hover:text-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-12 h-12 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Music Distribution Plans & Pricing</h1>
            </div>
            <p className="text-purple-300 text-lg mb-2">Affordable music distribution services for independent artists and record labels at every stage</p>
            <p className="text-purple-400 text-sm">Professional music distribution pricing with transparent artist-friendly terms. Subscribe securely via PayPal - upgrade or cancel anytime.</p>
          </div>

          {/* Pay As You Go Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Pay As You Go - No Subscription Required</h2>
              <p className="text-purple-300 text-lg">Perfect for occasional releases. Pay only when you upload.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Single Track */}
              <Card className="bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-blue-400 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 bg-blue-600 px-4 py-2 rounded-bl-2xl">
                  <span className="text-white text-sm font-bold">Single Track</span>
                </div>
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl mx-auto mb-4 bg-blue-500/30 flex items-center justify-center">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Single Release</h3>
                  <p className="text-blue-200 text-sm">Perfect for individual tracks</p>
                </div>
                
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-white">$2.99</span>
                    <span className="text-blue-200 font-semibold">per track</span>
                  </div>
                  <p className="text-blue-300 text-sm mt-2">One-time payment • No recurring charges</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  {[
                    'Upload single tracks',
                    'Full distribution to all platforms',
                    'Keep 100% of your royalties',
                    'No commitment or subscription',
                    'Instant delivery to stores',
                    'Professional metadata support'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl"
                    onClick={() => window.open('https://www.paypal.com/ncp/payment/7SYBVJ9NSQMMQ', '_blank')}
                  >
                    Buy Now - $2.99
                  </Button>
                </div>
                
                <p className="text-center text-blue-200 text-xs font-semibold mt-4">
                  Secure payment via PayPal
                </p>
              </Card>

              {/* EP Release */}
              <Card className="bg-gradient-to-br from-purple-700 to-pink-900 border-2 border-purple-400 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 bg-purple-600 px-4 py-2 rounded-bl-2xl">
                  <span className="text-white text-sm font-bold">EP Release</span>
                </div>
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl mx-auto mb-4 bg-purple-500/30 flex items-center justify-center">
                    <Album className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">EP Release</h3>
                  <p className="text-purple-200 text-sm">Perfect for 4-6 track releases</p>
                </div>
                
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-white">$4.99</span>
                    <span className="text-purple-200 font-semibold">per EP</span>
                  </div>
                  <p className="text-purple-300 text-sm mt-2">One-time payment • No recurring charges</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  {[
                    'Upload 4-6 tracks as EP',
                    'Full distribution to all platforms',
                    'Keep 100% of your royalties',
                    'No commitment or subscription',
                    'Priority delivery to stores',
                    'Professional metadata & artwork',
                    'Album cover included'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl"
                    onClick={() => window.open('https://www.paypal.com/ncp/payment/CRM645XPAWB2S', '_blank')}
                  >
                    Buy Now - $4.99
                  </Button>
                </div>
                
                <p className="text-center text-purple-200 text-xs font-semibold mt-4">
                  Secure payment via PayPal
                </p>
              </Card>

              {/* Album Release */}
              <Card className="bg-gradient-to-br from-emerald-700 to-green-900 border-2 border-emerald-400 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 bg-emerald-600 px-4 py-2 rounded-bl-2xl">
                  <span className="text-white text-sm font-bold">Album Release</span>
                </div>
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl mx-auto mb-4 bg-emerald-500/30 flex items-center justify-center">
                    <Album className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Album Release</h3>
                  <p className="text-emerald-200 text-sm">Perfect for full album projects</p>
                </div>
                
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-white">$8.99</span>
                    <span className="text-emerald-200 font-semibold">per album</span>
                  </div>
                  <p className="text-emerald-300 text-sm mt-2">One-time payment • No recurring charges</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  {[
                    'Upload 7+ tracks as album',
                    'Full distribution to all platforms',
                    'Keep 100% of your royalties',
                    'No commitment or subscription',
                    'Priority delivery to stores',
                    'Premium metadata & artwork',
                    'Album cover & promotion',
                    'Advanced analytics included'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl"
                    onClick={() => window.open('https://www.paypal.com/ncp/payment/RHNRYG7732NAW', '_blank')}
                  >
                    Buy Now - $8.99
                  </Button>
                </div>
                
                <p className="text-center text-emerald-200 text-xs font-semibold mt-4">
                  Secure payment via PayPal
                </p>
              </Card>
            </div>
          </div>

          {/* Subscription Plans Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Or Choose a Subscription Plan</h2>
            <p className="text-purple-300 text-lg">Best value for artists releasing music regularly</p>
          </div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="text-center text-purple-400">Loading plans...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {packages.map((pkg) => (
                <div 
                  key={pkg._row_id}
                  className={`relative bg-gradient-to-br ${
                    pkg.package_id === 'silver' 
                      ? 'from-yellow-700 to-orange-900 border-2 border-yellow-400 scale-105 shadow-2xl' 
                      : pkg.package_id === 'white_label'
                      ? 'from-purple-700 to-pink-900 border-2 border-purple-400 shadow-2xl'
                      : 'from-indigo-700 to-purple-900 border-2 border-indigo-400 shadow-2xl'
                  } border rounded-2xl p-8 hover:scale-110 transition-all`}
                >
                  {pkg.package_id === 'silver' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2 text-sm font-bold">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                      pkg.package_id === 'silver' 
                        ? 'bg-yellow-500/30' 
                        : pkg.package_id === 'white_label'
                        ? 'bg-purple-500/30'
                        : 'bg-indigo-500/30'
                    }`}>
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{pkg.name}</h3>
                    <p className={`text-sm ${
                      pkg.package_id === 'silver' 
                        ? 'text-yellow-200' 
                        : pkg.package_id === 'white_label'
                        ? 'text-purple-200'
                        : 'text-indigo-200'
                    }`}>{pkg.description}</p>
                  </div>
                  
                  <div className="text-center mb-6">
                    {pkg.setup_fee && (
                      <div className={`text-sm mb-2 ${
                        pkg.package_id === 'silver' 
                          ? 'text-yellow-200' 
                          : pkg.package_id === 'white_label'
                          ? 'text-purple-200'
                          : 'text-indigo-200'
                      }`}>
                        <span className="font-bold">${pkg.setup_fee.toFixed(2)}</span> setup fee
                      </div>
                    )}
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-white">
                        {pkg.price_yearly 
                          ? formatPrice(pkg.price_yearly, "year")
                          : pkg.price_monthly 
                          ? formatPrice(pkg.price_monthly, "month")
                          : "Custom"
                        }
                      </span>
                    </div>
                    {pkg.package_id === 'white_label' && (
                      <div className={`text-sm mt-2 ${
                        pkg.package_id === 'white_label' ? 'text-purple-200' : ''
                      }`}>
                        + <span className="font-bold">${pkg.price_monthly?.toFixed(2)}</span>/month maintenance
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {parseFeatures(pkg.features).slice(0, 8).map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                      pkg.package_id === 'silver'
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
                        : pkg.package_id === 'white_label'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                    onClick={() => {
                      const paypalLinks: Record<string, string> = {
                        'basic': 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-4XD88406N03958449NC2NMOA',
                        'silver': 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-28J32398VJ727723WNC43SVI',
                        'white_label': 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-5M576636AK744634MNATTUFY'
                      };
                      handleSubscribe(paypalLinks[pkg.package_id] || 'https://www.distributionunion.com/');
                    }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </Button>
                  
                  <p className={`text-center text-xs font-semibold mt-4 ${
                    pkg.package_id === 'silver' 
                      ? 'text-yellow-200' 
                      : pkg.package_id === 'white_label'
                      ? 'text-purple-200'
                      : 'text-indigo-200'
                  }`}>
                    Secure payment via PayPal
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Feature Comparison */}
          <Card className="bg-slate-900/50 border-purple-500/20 p-8 mb-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Plan Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left text-purple-300 pb-4">Feature</th>
                    <th className="text-center text-blue-300 pb-4">Single $2.99</th>
                    <th className="text-center text-purple-300 pb-4">EP $4.99</th>
                    <th className="text-center text-green-300 pb-4">Album $8.99</th>
                    <th className="text-center text-purple-300 pb-4">Basic $4.99/mo</th>
                    <th className="text-center text-yellow-300 pb-4">Silver $40/yr</th>
                    <th className="text-center text-purple-300 pb-4">White Label $399+$40/mo</th>
                  </tr>
                </thead>
                <tbody className="text-purple-200">
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Pricing Model</td>
                    <td className="text-center text-blue-300 font-semibold">$2.99 per single</td>
                    <td className="text-center text-purple-300 font-semibold">$4.99 per EP</td>
                    <td className="text-center text-green-300 font-semibold">$8.99 per album</td>
                    <td className="text-center">$4.99/month</td>
                    <td className="text-center text-yellow-300 font-semibold">$40/year</td>
                    <td className="text-center">$399 + $40/month</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Tracks Included</td>
                    <td className="text-center text-blue-300 font-semibold">1 track</td>
                    <td className="text-center text-purple-300 font-semibold">4-6 tracks</td>
                    <td className="text-center text-green-300 font-semibold">7+ tracks</td>
                    <td className="text-center">Unlimited</td>
                    <td className="text-center text-yellow-300 font-semibold">Unlimited</td>
                    <td className="text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Artists</td>
                    <td className="text-center text-blue-300 font-semibold">1 per upload</td>
                    <td className="text-center text-purple-300 font-semibold">1 per EP</td>
                    <td className="text-center text-green-300 font-semibold">1 per album</td>
                    <td className="text-center">1</td>
                    <td className="text-center text-yellow-300 font-semibold">Unlimited</td>
                    <td className="text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Releases</td>
                    <td className="text-center text-blue-300 font-semibold">Pay per release</td>
                    <td className="text-center text-purple-300 font-semibold">Pay per EP</td>
                    <td className="text-center text-green-300 font-semibold">Pay per album</td>
                    <td className="text-center">Unlimited</td>
                    <td className="text-center text-yellow-300 font-semibold">Unlimited</td>
                    <td className="text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Delivery Time</td>
                    <td className="text-center text-blue-300">48-72h</td>
                    <td className="text-center text-purple-300">48-72h</td>
                    <td className="text-center text-green-300">48-72h</td>
                    <td className="text-center">48-72h</td>
                    <td className="text-center text-yellow-300 font-semibold">24-48h</td>
                    <td className="text-center">24-48h</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Monthly Commitment</td>
                    <td className="text-center text-green-300 font-semibold">✅ No commitment</td>
                    <td className="text-center text-green-300 font-semibold">✅ No commitment</td>
                    <td className="text-center text-green-300 font-semibold">✅ No commitment</td>
                    <td className="text-center text-red-300">❌ Monthly</td>
                    <td className="text-center text-yellow-300">Yearly</td>
                    <td className="text-center">Monthly + Setup</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Album Artwork</td>
                    <td className="text-center text-blue-300">✅ Basic</td>
                    <td className="text-center text-purple-300">✅ Professional</td>
                    <td className="text-center text-green-300 font-semibold">✅ Premium</td>
                    <td className="text-center">✅ Basic</td>
                    <td className="text-center text-yellow-300">✅ Enhanced</td>
                    <td className="text-center">✅ Premium</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Analytics</td>
                    <td className="text-center text-blue-300">✅ Basic</td>
                    <td className="text-center text-purple-300">✅ Basic</td>
                    <td className="text-center text-green-300 font-semibold">✅ Advanced</td>
                    <td className="text-center">✅ Basic</td>
                    <td className="text-center text-yellow-300">✅ Enhanced</td>
                    <td className="text-center">✅ Premium</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Sync Licensing</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-green-300">✅</td>
                    <td className="text-center text-green-300">✅</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Label Creation</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-green-300">✅</td>
                    <td className="text-center text-green-300">✅</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Social Media Monetization</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-green-300">✅</td>
                    <td className="text-center text-green-300">✅</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-4 font-medium">Custom Branding</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-red-300">❌</td>
                    <td className="text-center text-green-300 font-semibold">✅ Full</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Support Level</td>
                    <td className="text-center text-blue-300">Email</td>
                    <td className="text-center text-purple-300">Email</td>
                    <td className="text-center text-green-300">Email</td>
                    <td className="text-center">24/7 Email</td>
                    <td className="text-center text-yellow-300 font-semibold">24/7 Live Chat</td>
                    <td className="text-center">Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* FAQ Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="bg-slate-900/50 border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Can I change plans later?</h4>
                  <p className="text-purple-300 text-sm">Yes, you can upgrade or downgrade your plan at any time through your dashboard.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">How do I cancel?</h4>
                  <p className="text-purple-300 text-sm">You can cancel your subscription anytime from your PayPal account or through our support team.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">What payment methods do you accept?</h4>
                  <p className="text-purple-300 text-sm">We accept all major credit cards, debit cards, and PayPal payments through our secure payment system.</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-300">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Email Support</div>
                    <a href="mailto:support@unionmusicgroup.co.uk" className="text-sm">support@unionmusicgroup.co.uk</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-purple-300">
                  <Phone className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">24/7 Live Support</div>
                    <div className="text-sm">Available for Silver and White Label plans</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-purple-300">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Secure Payment</div>
                    <div className="text-sm">All payments processed securely via PayPal</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-purple-950/50 to-pink-950/50 border-purple-500/20 p-8 text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Ready to start distributing your music?</h2>
            <p className="text-purple-300 mb-6">Join thousands of artists who trust Union Music Group for their music distribution needs.</p>
            <div className="flex gap-4 justify-center">
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                onClick={() => window.open('https://www.distributionunion.com/', '_blank')}
              >
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Plans;