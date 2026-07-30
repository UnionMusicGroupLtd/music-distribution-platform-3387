import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Heart, Users, Globe, Award, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Union Music Group</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/signin">
                <Button variant="ghost" className="text-purple-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">About Union Music Group Ltd - Professional Music Distribution Platform</h1>
            <p className="text-xl text-purple-300">
              Leading independent music distribution company empowering artists and record labels worldwide since 2016
            </p>
          </div>

          {/* Our Story */}
          <Card className="bg-purple-950/30 border-purple-500/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-pink-500" />
              <h2 className="text-2xl font-bold text-white">Our Story</h2>
            </div>
            <div className="space-y-4 text-purple-200">
              <p className="leading-relaxed">
                Founded in 2016, Union Music Group Ltd began with a simple yet powerful mission: to give independent artists 
                the same opportunities and support that major label artists receive. Nearly a decade later, we've grown from 
                a small startup to a comprehensive music distribution platform trusted by thousands of artists worldwide.
              </p>
              <p className="leading-relaxed">
                Our journey started when we noticed a gap in the music industry – talented independent musicians struggling 
                to get their music heard and properly compensated. We set out to change that by building a platform that 
                combines professional-grade distribution tools with fair, transparent royalty structures.
              </p>
              <p className="leading-relaxed">
                Over the years, we've evolved from a basic distribution service to a full-fledged music platform, 
                but our core values have remained unchanged: artist-first approach, transparent processes, and 
                unwavering commitment to fair compensation for creators.
              </p>
            </div>
          </Card>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-purple-200 leading-relaxed">
                To democratize music distribution by providing independent artists with professional tools, 
                fair compensation, and global reach. We believe every artist deserves the opportunity to 
                share their music with the world and be fairly rewarded for their creativity.
              </p>
            </Card>

            <Card className="bg-purple-950/30 border-purple-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold text-white">Our Values</h3>
              </div>
              <ul className="text-purple-200 space-y-2">
                <li>• Artist-first approach in every decision</li>
                <li>• Transparent processes and pricing</li>
                <li>• Fair royalty distribution</li>
                <li>• Global music accessibility</li>
                <li>• Continuous innovation</li>
              </ul>
            </Card>
          </div>

          {/* Key Milestones */}
          <Card className="bg-purple-950/30 border-purple-500/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h2 className="text-2xl font-bold text-white">Our Journey</h2>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <span className="text-purple-300 font-bold">2016</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Foundation</h3>
                  <p className="text-purple-300 text-sm">Union Music Group Ltd founded with a mission to support independent artists</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <span className="text-purple-300 font-bold">2018</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Platform Launch</h3>
                  <p className="text-purple-300 text-sm">Launched our digital distribution platform with global store coverage</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <span className="text-purple-300 font-bold">2020</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Global Expansion</h3>
                  <p className="text-purple-300 text-sm">Expanded to serve artists across 6 continents with multi-language support</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <span className="text-purple-300 font-bold">2024</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Advanced Analytics</h3>
                  <p className="text-purple-300 text-sm">Enhanced platform with comprehensive analytics and royalty tracking</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border border-purple-500/30">
                  <span className="text-white font-bold">2026</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Decade of Excellence</h3>
                  <p className="text-purple-300 text-sm">Celebrating 10 years of empowering independent artists worldwide</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Section */}
          <Card className="bg-gradient-to-r from-purple-950/50 to-pink-950/50 border-purple-500/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Our Impact</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">10+</div>
                <div className="text-purple-300">Years of Service</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">50k+</div>
                <div className="text-purple-300">Artists</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">1000+</div>
                <div className="text-purple-300">Labels</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">200+</div>
                <div className="text-purple-300">Countries Reached</div>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <Card className="bg-purple-950/30 border-purple-500/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Join Our Journey</h2>
            <p className="text-purple-300 mb-6">
              Be part of the next chapter in independent music. Whether you're an emerging artist or an established creator, 
              Union Music Group Ltd is here to help you succeed.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Start Your Journey
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="border-purple-500/50 text-purple-300">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-purple-300 text-sm">
              © 2016-2026 Union Music Group Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/terms-of-service" className="text-purple-300 hover:text-white">Terms of Service</Link>
              <Link to="/privacy-policy" className="text-purple-300 hover:text-white">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;