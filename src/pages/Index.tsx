import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, TrendingUp, Shield, Upload, Play, HeadphonesIcon as Listen, ChevronRight } from "lucide-react";

const Index = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Union Music Group</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/signin">
                <Button variant="ghost" className="text-purple-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Music Distribution Platform for Independent Artists & Labels
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Everywhere.</span>
          </h1>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="text-3xl font-bold text-white mb-1">150M+</div>
              <div className="text-sm text-purple-300">Music Streams Generated</div>
            </Card>
            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-purple-300">Independent Artists & Labels</div>
            </Card>
            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="text-3xl font-bold text-white mb-1">150+</div>
              <div className="text-sm text-purple-300">Digital Music Platforms</div>
            </Card>
            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="text-3xl font-bold text-white mb-1">200+</div>
              <div className="text-sm text-purple-300">Countries with Music Distribution</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Complete Music Distribution Services for Artists</h2>
            <p className="text-lg text-purple-300 max-w-3xl mx-auto">
              Professional music distribution platform with everything independent artists and record labels need to succeed in the digital music industry. From music upload to royalty payouts, we provide transparent artist services and music marketing tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-8 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Easy Music Upload</h3>
              <p className="text-purple-300">
                Upload your tracks with professional metadata management. Set release dates, add artwork, and distribute music to all major streaming platforms. Free ISRC and UPC codes included.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-8 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Music Analytics</h3>
              <p className="text-purple-300">
                Track your music streams, revenue, and audience demographics in real-time. Comprehensive music analytics dashboard showing performance across Spotify, Apple Music, and all digital platforms.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-8 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Fair Music Royalties</h3>
              <p className="text-purple-300">
                Keep 100% of your streaming royalties with transparent reporting. No hidden fees, no deductions from your earnings. Direct payout to artists with detailed royalty statements.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-8 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Global Music Distribution</h3>
              <p className="text-purple-300">
                Distribute music to Spotify, Apple Music, YouTube Music, Amazon Music, TikTok, Instagram, Facebook, Deezer, Tidal, Pandora and 150+ digital platforms worldwide. Reach millions of music listeners globally.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-8 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                <Listen className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Spotify Playlist & Music Pitching</h3>
              <p className="text-purple-300">
                Professional playlist pitching services for Spotify editorial playlists and user-created playlists. Get your music discovered by curators and reach new audiences through strategic music promotion.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 border-purple-500/20 p-8 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Professional Artist Services</h3>
              <p className="text-purple-300">
                Complete artist development services including music marketing tools, royalty advances, label services, and career guidance to help independent artists grow their music business and build sustainable careers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Your Music Distribution Journey Today
            </h2>
            <p className="text-lg text-purple-200 mb-8 max-w-3xl mx-auto">
              Join thousands of independent artists and record labels who trust Union Music Group for professional music distribution services. Upload your music to Spotify, Apple Music, and 150+ platforms with transparent royalty tracking and artist-friendly terms. No hidden fees, keep 100% of your royalties.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Start Your Free Music Distribution Account
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
