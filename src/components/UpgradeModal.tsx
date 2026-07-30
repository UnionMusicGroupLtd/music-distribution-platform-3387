import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Crown, Music, Zap, Shield, Check, X, Disc3 } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planType: 'payg' | 'ep' | 'album' | 'basic' | 'silver' | 'white') => void;
}

const UpgradeModal = ({ isOpen, onClose, onSubscribe }: UpgradeModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'payg',
      name: 'Single Release',
      price: '$2.99',
      period: 'per track',
      badge: 'No Commitment',
      badgeColor: 'bg-blue-500 text-white',
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        { text: 'Single Track Upload', included: true },
        { text: 'Full Distribution', included: true },
        { text: '100% Royalties', included: true },
        { text: 'All Platforms', included: true },
        { text: 'No Subscription', included: true },
        { text: 'Pay Only When You Upload', included: true },
      ],
      paypalLink: 'https://www.paypal.com/ncp/payment/7SYBVJ9NSQMMQ'
    },
    {
      id: 'ep',
      name: 'EP Release',
      price: '$4.99',
      period: 'per EP',
      badge: 'Best Value',
      badgeColor: 'bg-purple-500 text-white',
      gradient: 'from-purple-500 to-pink-500',
      features: [
        { text: '4-6 Track Upload', included: true },
        { text: 'Full Distribution', included: true },
        { text: '100% Royalties', included: true },
        { text: 'All Platforms', included: true },
        { text: 'No Subscription', included: true },
        { text: 'Professional Artwork', included: true },
      ],
      paypalLink: 'https://www.paypal.com/ncp/payment/CRM645XPAWB2S'
    },
    {
      id: 'album',
      name: 'Album Release',
      price: '$8.99',
      period: 'per album',
      badge: 'Premium',
      badgeColor: 'bg-green-500 text-white',
      gradient: 'from-green-500 to-emerald-500',
      features: [
        { text: '7+ Track Upload', included: true },
        { text: 'Full Distribution', included: true },
        { text: '100% Royalties', included: true },
        { text: 'All Platforms', included: true },
        { text: 'No Subscription', included: true },
        { text: 'Premium Artwork', included: true },
        { text: 'Advanced Analytics', included: true },
      ],
      paypalLink: 'https://www.paypal.com/ncp/payment/RHNRYG7732NAW'
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$4.99',
      period: '/month',
      badge: 'Popular',
      badgeColor: 'bg-purple-500 text-white',
      gradient: 'from-purple-500 to-pink-500',
      features: [
        { text: 'Unlimited Releases', included: true },
        { text: '150+ Digital Stores', included: true },
        { text: '100% Royalties', included: true },
        { text: 'Priority Delivery', included: true },
        { text: 'Basic Analytics', included: true },
        { text: 'Email Support', included: true },
      ],
      paypalLink: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-4XD88406N03958449NC2NMOA'
    },
    {
      id: 'silver',
      name: 'Silver Pack',
      price: '$40',
      period: '/year',
      badge: 'Best Value',
      badgeColor: 'bg-yellow-500 text-white',
      gradient: 'from-yellow-500 to-orange-500',
      features: [
        { text: 'Everything in Basic', included: true },
        { text: 'Playlist Pitching', included: true },
        { text: 'Advanced Analytics', included: true },
        { text: 'Priority Support', included: true },
        { text: 'Custom Label Name', included: true },
        { text: ' faster Delivery (24-48h)', included: true },
      ],
      paypalLink: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-28J32398VJ727723WNC43SVI'
    },
    {
      id: 'white',
      name: 'White Label',
      price: '$399',
      period: '+ $40/month',
      badge: 'Premium',
      badgeColor: 'bg-pink-500 text-white',
      gradient: 'from-pink-500 to-purple-500',
      features: [
        { text: 'Everything in Silver', included: true },
        { text: 'Custom Branding', included: true },
        { text: 'Unlimited Artists', included: true },
        { text: 'White Label Platform', included: true },
        { text: 'Dedicated Account Manager', included: true },
        { text: 'API Access', included: true },
      ],
      paypalLink: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-5M576636AK744634MNATTUFY'
    }
  ];

  const handleSubscribe = (planType: 'payg' | 'ep' | 'album' | 'basic' | 'silver' | 'white') => {
    const plan = plans.find(p => p.id === planType);
    if (plan) {
      window.open(plan.paypalLink, '_blank');
      onSubscribe(planType);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            Choose Your Perfect Plan
          </DialogTitle>
          <DialogDescription className="text-purple-300">
            Pay As You Go for occasional releases, or choose a subscription plan for regular music distribution
          </DialogDescription>
        </DialogHeader>

        {/* Pay As You Go Section */}
        <div className="mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Single Track */}
            <Card 
              className={`relative bg-gradient-to-br from-blue-700 to-blue-900 border-2 ${
                selectedPlan === 'payg' ? 'border-blue-400' : 'border-blue-500/30'
              } hover:border-blue-400 transition-all cursor-pointer p-6`}
              onClick={() => setSelectedPlan('payg')}
            >
              <div className="absolute top-3 right-3">
                <Badge className="bg-blue-500 text-white text-xs">
                  Single Track
                </Badge>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Single Release</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">$2.99</span>
                      <span className="text-blue-200 text-xs">per track</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {plans.find(p => p.id === 'payg')?.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs">
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-white">{feature.text}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe('payg');
                  }}
                >
                  Upload Single
                </Button>
              </div>
            </Card>

            {/* EP Release */}
            <Card 
              className={`relative bg-gradient-to-br from-purple-700 to-pink-900 border-2 ${
                selectedPlan === 'ep' ? 'border-purple-400' : 'border-purple-500/30'
              } hover:border-purple-400 transition-all cursor-pointer p-6`}
              onClick={() => setSelectedPlan('ep')}
            >
              <div className="absolute top-3 right-3">
                <Badge className="bg-purple-500 text-white text-xs">
                  EP Release
                </Badge>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                    <Disc3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">EP Release</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">$4.99</span>
                      <span className="text-purple-200 text-xs">per EP</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {plans.find(p => p.id === 'ep')?.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs">
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-white">{feature.text}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe('ep');
                  }}
                >
                  Upload EP
                </Button>
              </div>
            </Card>

            {/* Album Release */}
            <Card 
              className={`relative bg-gradient-to-br from-emerald-700 to-green-900 border-2 ${
                selectedPlan === 'album' ? 'border-green-400' : 'border-green-500/30'
              } hover:border-green-400 transition-all cursor-pointer p-6`}
              onClick={() => setSelectedPlan('album')}
            >
              <div className="absolute top-3 right-3">
                <Badge className="bg-emerald-500 text-white text-xs">
                  Album Release
                </Badge>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <Disc3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Album Release</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">$8.99</span>
                      <span className="text-emerald-200 text-xs">per album</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {plans.find(p => p.id === 'album')?.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs">
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-white">{feature.text}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe('album');
                  }}
                >
                  Upload Album
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Subscription Plans Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Or Choose a Subscription Plan</h3>
          <p className="text-purple-300 text-sm">Best value for artists releasing music regularly</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.filter(p => p.id !== 'payg' && p.id !== 'ep' && p.id !== 'album').map((plan) => (
            <Card 
              key={plan.id}
              className={`relative bg-gradient-to-br ${
                plan.id === 'basic' 
                  ? 'from-indigo-700 to-purple-900 border-2 border-indigo-400' 
                  : plan.id === 'silver'
                  ? 'from-yellow-700 to-orange-900 border-2 border-yellow-400'
                  : 'from-purple-700 to-pink-900 border-2 border-purple-400'
              } ${
                selectedPlan === plan.id ? 'ring-2 ring-white' : ''
              } hover:scale-105 transition-all cursor-pointer p-6`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="absolute top-4 right-4">
                <Badge className={plan.badgeColor}>
                  {plan.badge}
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === 'basic' && <Music className="w-5 h-5 text-indigo-300" />}
                  {plan.id === 'silver' && <Zap className="w-5 h-5 text-yellow-300" />}
                  {plan.id === 'white' && <Shield className="w-5 h-5 text-purple-300" />}
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-purple-200">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-white' : 'text-purple-300'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full bg-gradient-to-r ${
                  plan.id === 'basic'
                    ? 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                    : plan.id === 'silver'
                    ? 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                    : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } text-white font-semibold`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe(plan.id as 'basic' | 'silver' | 'white');
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Subscribe Now
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-6 bg-purple-900/30 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-purple-300" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-2">Why Choose Union Music Group?</h4>
              <ul className="text-sm text-purple-300 space-y-1">
                <li>• <strong className="text-purple-200">150+ Digital Stores:</strong> Spotify, Apple Music, Amazon, TikTok, and more</li>
                <li>• <strong className="text-purple-200">100% Royalties:</strong> Keep all your earnings</li>
                <li>• <strong className="text-purple-200">No Hidden Fees:</strong> Transparent pricing, no surprises</li>
                <li>• <strong className="text-purple-200">Fast Delivery:</strong> Your music live within 48-72 hours</li>
                <li>• <strong className="text-purple-200">24/7 Support:</strong> Expert help whenever you need it</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 text-sm text-purple-400">
          <p>✅ Cancel anytime • No long-term contracts</p>
          <Button variant="ghost" className="text-purple-400 hover:text-white" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;