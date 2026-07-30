import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Crown, CheckCircle, Shield, Zap, Globe, AlertCircle } from "lucide-react";

const CoverSongLicensing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Union Music Group</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Easy Song Branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white">easysong</h1>
              <p className="text-green-300 text-sm">Easy Song Licensing</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="bg-slate-900/50 border-purple-500/20 p-8 mb-8">
          {/* Main Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              LICENSE YOUR COVER SONGS
            </h2>
          </div>

          {/* Why You Need Licensing */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-blue-300 font-semibold mb-2">Why You Need a License</h3>
                <p className="text-white mb-3">
                  Whenever you record a song that someone else wrote, you need to get permission from the copyright holders.
                </p>
                <p className="text-purple-300 mb-2">
                  This is true <span className="text-white font-semibold">even if you are giving away your recording</span>.
                </p>
                <p className="text-purple-300">
                  Contacting the copyright holders for each song can be <span className="text-white font-semibold">difficult and time consuming</span>.
                </p>
              </div>
            </div>
          </div>

          {/* License Types */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Types of Licenses You Need</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-purple-300 font-semibold mb-2">Mechanical License</h4>
                <p className="text-white text-sm">
                  Required for distributing cover songs in any format (download, CD, vinyl, etc.)
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-purple-300 font-semibold mb-2">Synchronization License</h4>
                <p className="text-white text-sm">
                  Required for using cover songs in videos, films, or other visual media
                </p>
              </div>
            </div>
          </div>

          {/* Help Sources */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Getting Help with Licensing</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-white text-sm">Public performance rights organizations</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-white text-sm">Specific agencies that represent music rights holders</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-white text-sm">Service providers who specialize in music licensing</p>
              </div>
            </div>
          </div>

          {/* US Artists Special Section */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-green-300 font-semibold mb-2">For Artists in the United States</h3>
                <p className="text-white mb-3">
                  We have partnered with a specialist caring for over <span className="text-green-300 font-semibold">30,000 clients since 2005</span> (as of 2016).
                </p>
                <p className="text-purple-300">
                  Our partner will take care of <span className="text-white font-semibold">every single detail for you</span> for a flat rate fee.
                </p>
              </div>
            </div>
          </div>

          {/* What You Need */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-orange-300 font-semibold mb-2">Remember</h3>
                <p className="text-white">
                  You need to obtain a <span className="text-orange-300 font-semibold">Mechanical License</span> to legally distribute cover songs.
                </p>
              </div>
            </div>
          </div>

          {/* Easy Song Licensing Partner */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Globe className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-purple-300 font-semibold mb-2">Our Partnership with Easy Song Licensing</h3>
                <p className="text-white mb-3">
                  Our partners <span className="text-purple-300 font-semibold">Easy Song Licensing</span> offer simple and cheap solutions to legally distribute your cover songs.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-white text-sm">Distribute on <span className="text-purple-300 font-semibold">Bandcamp, SoundCloud, iTunes, Spotify</span> and others</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-white text-sm">Any format: <span className="text-purple-300 font-semibold">download, CD, vinyl, etc.</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-white text-sm">Flat rate fee structure</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-white text-sm">Expert handling of all licensing details</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to License Your Cover Songs?
          </h3>
          <p className="text-purple-300 mb-6">
            Get your mechanical and synchronization licenses quickly and easily through our trusted partner.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://www.easysonglicensing.com/referral.aspx?PartnerID=226" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <Crown className="w-5 h-5" />
              Buy Now
            </a>
            <Link 
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-purple-300">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Trusted by 30,000+ artists since 2005</span>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-purple-400 text-sm mb-4">
            Questions about cover song licensing?
          </p>
          <Link 
            to="/contact" 
            className="text-purple-300 hover:text-white font-medium"
          >
            Contact our support team →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-purple-400 text-sm">
            <p>© 2016-2026 Union Music Group Ltd. All rights reserved.</p>
            <p className="mt-2">
              In partnership with Easy Song Licensing - Making cover song licensing simple and affordable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoverSongLicensing;