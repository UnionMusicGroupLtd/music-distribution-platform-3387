import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, ChevronDown, ChevronUp, Award, CheckCircle, TrendingUp, DollarSign, Shield, Users, Globe, Headphones, Zap } from "lucide-react";
import { useState } from "react";

const FAQs = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const FAQItem = ({ id, question, answer, highlight = false }: { id: string; question: string; answer: any; highlight?: boolean }) => (
    <div className={`border rounded-lg overflow-hidden ${highlight ? 'border-purple-500/50 bg-purple-950/30' : 'border-purple-500/20 bg-slate-900/30'}`}>
      <button
        onClick={() => toggleExpand(id)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-purple-500/10 transition-colors"
      >
        <span className={`font-semibold ${highlight ? 'text-white' : 'text-purple-200'}`}>{question}</span>
        {expandedItems.has(id) ? (
          <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0 ml-4" />
        )}
      </button>
      {expandedItems.has(id) && (
        <div className="px-6 pb-6 text-purple-300">
          {answer}
        </div>
      )}
    </div>
  );

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
            <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-purple-300">
              Everything you need to know about Union Music Group Ltd
            </p>
          </div>

          {/* General Questions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              General Questions
            </h2>
            
            <div className="space-y-4">
              <FAQItem 
                id="what-is-union-music-group"
                question="What is Union Music Group Ltd?"
                answer={
                  <div className="space-y-3">
                    <p>Union Music Group Ltd is a professional music distribution service founded in 2016, dedicated to empowering independent artists worldwide. We provide comprehensive digital distribution, royalty collection, and artist development services.</p>
                    <p>With over 10 years of experience, we've helped 50,000+ artists and 1,000+ labels distribute their music to 200+ countries, ensuring fair compensation and transparent processes for every creator.</p>
                  </div>
                }
              />

              <FAQItem 
                id="how-does-distribution-work"
                question="How does music distribution work?"
                answer={
                  <div className="space-y-3">
                    <p>Our distribution process is simple and efficient:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li><strong>Upload:</strong> Submit your music with metadata and cover art through our dashboard</li>
                      <li><strong>Processing:</strong> We quality-check and format your release for all platforms</li>
                      <li><strong>Distribution:</strong> Your music is sent to 200+ digital stores and streaming platforms</li>
                      <li><strong>Collection:</strong> We collect royalties from all platforms and consolidate them</li>
                      <li><strong>Payment:</strong> Receive your earnings directly with transparent reporting</li>
                    </ol>
                    <p>Most releases go live within 48-72 hours after approval, with some stores taking up to 2 weeks.</p>
                  </div>
                }
              />

              <FAQItem 
                id="what-platforms-do-you-support"
                question="What platforms do you distribute to?"
                answer={
                  <div className="space-y-3">
                    <p>We distribute to 200+ digital stores and streaming platforms worldwide, including:</p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-purple-950/30 p-3 rounded-lg">
                        <div className="font-semibold text-white mb-1">Major Streaming</div>
                        <div className="text-sm">Spotify, Apple Music, YouTube Music, Amazon Music, Tidal, Deezer</div>
                      </div>
                      <div className="bg-purple-950/30 p-3 rounded-lg">
                        <div className="font-semibold text-white mb-1">Social Platforms</div>
                        <div className="text-sm">TikTok, Instagram Music, Facebook, YouTube Shorts, Twitch</div>
                      </div>
                      <div className="bg-purple-950/30 p-3 rounded-lg">
                        <div className="font-semibold text-white mb-1">Download Stores</div>
                        <div className="text-sm">iTunes, Google Play, Amazon MP3, Beatport, Bandcamp</div>
                      </div>
                      <div className="bg-purple-950/30 p-3 rounded-lg">
                        <div className="font-semibold text-white mb-1">Global Markets</div>
                        <div className="text-sm">Asia, Africa, Middle East, Latin America regional platforms</div>
                      </div>
                    </div>
                  </div>
                }
              />

              <FAQItem 
                id="do-i-keep-my-rights"
                question="Do I keep my rights to the music?"
                answer={
                  <div className="space-y-3">
                    <p><strong className="text-green-400">Yes! You keep 100% of your rights and ownership.</strong></p>
                    <p>Unlike many other distributors, Union Music Group Ltd operates on a non-exclusive basis. This means:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>You retain full copyright ownership of your masters and compositions</li>
                      <li>You can cancel anytime and continue using other distributors simultaneously</li>
                      <li>No hidden clauses or long-term contracts</li>
                      <li>Your music stays online forever (unless you choose to take it down)</li>
                    </ul>
                  </div>
                }
                highlight={true}
              />
            </div>
          </div>

          {/* Pricing & Payments */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-400" />
              Pricing & Payments
            </h2>
            
            <div className="space-y-4">
              <FAQItem 
                id="pricing-plans"
                question="What are your pricing plans?"
                answer={
                  <div className="space-y-4">
                    <p>We offer flexible pricing plans designed for independent artists:</p>
                    <div className="space-y-3">
                      <div className="bg-purple-950/50 border border-purple-500/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-white">Basic Plan</div>
                          <div className="text-purple-300 font-bold">$4.99/month</div>
                        </div>
                        <div className="text-sm text-purple-300">1 Artist • Unlimited releases • All digital stores • 100% royalties</div>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-950/50 to-orange-950/50 border border-yellow-500/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-white">Silver Pack</div>
                          <div className="text-yellow-300 font-bold">$40.00/year</div>
                        </div>
                        <div className="text-sm text-purple-300">Unlimited artists • 24-48h delivery • Sync licensing • Label creation</div>
                      </div>
                      <div className="bg-purple-950/50 border border-purple-500/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-white">White Label</div>
                          <div className="text-purple-300 font-bold">$399 + $40/month</div>
                        </div>
                        <div className="text-sm text-purple-300">Custom branding • Own website • Full backend access • Custom domain</div>
                      </div>
                    </div>
                  </div>
                }
              />

              <FAQItem 
                id="how-much-royalties"
                question="How much royalties do I keep?"
                answer={
                  <div className="space-y-3">
                    <p><strong className="text-green-400">You keep 100% of your royalties!</strong></p>
                    <p>We don't take any percentage of your earnings. You receive:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>100% of streaming royalties from Spotify, Apple Music, etc.</li>
                      <li>100% of download revenue from iTunes, Amazon, etc.</li>
                      <li>100% of performance royalties when available</li>
                      <li>Direct payment with full transparency and reporting</li>
                    </ul>
                    <p>We only charge our service fee - your earnings are completely yours.</p>
                  </div>
                }
                highlight={true}
              />

              <FAQItem 
                id="payment-frequency"
                question="How often do I get paid?"
                answer={
                  <div className="space-y-3">
                    <p>Artists receive monthly payments once they reach the $50 minimum threshold:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Monthly Processing:</strong> All royalties are calculated and processed each month</li>
                      <li><strong>$50 Minimum:</strong> Payments are released when you earn at least $50</li>
                      <li><strong>Multiple Options:</strong> Bank transfer, PayPal, or other payment methods</li>
                      <li><strong>Detailed Reports:</strong> Complete breakdown of your earnings by platform</li>
                    </ul>
                    <p>Unpaid balances roll over to the next month - you never lose your earnings.</p>
                  </div>
                }
              />
            </div>
          </div>

          {/* Comparisons */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Comparisons with Other Distributors
            </h2>
            
            <div className="space-y-4">
              <FAQItem 
                id="vs-cdbaby"
                question="How does Union Music Group compare to CD Baby?"
                answer={
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-950/30 border border-green-500/30 p-4 rounded-lg">
                        <div className="font-bold text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Union Music Group
                        </div>
                        <ul className="text-sm space-y-2">
                          <li>✅ $4.99/month vs $9.95-$29.95/year</li>
                          <li>✅ 100% royalties vs 9% commission</li>
                          <li>✅ No hidden fees</li>
                          <li>✅ 48-72h delivery vs 5-10 days</li>
                          <li>✅ Personal support available</li>
                          <li>✅ Custom label options</li>
                        </ul>
                      </div>
                      <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-lg">
                        <div className="font-bold text-red-400 mb-3">CD Baby</div>
                        <ul className="text-sm space-y-2">
                          <li>❌ Expensive pricing tiers</li>
                          <li>❌ 9% commission on sales</li>
                          <li>❌ Hidden fees for some features</li>
                          <li>❌ Slower delivery times</li>
                          <li>❌ Limited support options</li>
                          <li>❌ No custom branding</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-purple-300 text-sm">Union Music Group offers better value, faster delivery, and keeps more money in your pocket.</p>
                  </div>
                }
                highlight={true}
              />

              <FAQItem 
                id="vs-distrokid"
                question="How does Union Music Group compare to DistroKid?"
                answer={
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-950/30 border border-green-500/30 p-4 rounded-lg">
                        <div className="font-bold text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Union Music Group
                        </div>
                        <ul className="text-sm space-y-2">
                          <li>✅ Monthly payments vs yearly lump sums</li>
                          <li>✅ 24/7 personal support available</li>
                          <li>✅ No upload limits on any plan</li>
                          <li>✅ Detailed analytics dashboard</li>
                          <li>✅ Custom label & branding options</li>
                          <li>✅ Sync licensing opportunities</li>
                        </ul>
                      </div>
                      <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-lg">
                        <div className="font-bold text-red-400 mb-3">DistroKid</div>
                        <ul className="text-sm space-y-2">
                          <li>❌ Yearly subscription only</li>
                          <li>❌ Limited customer support</li>
                          <li>❌ Upload limits on lower tiers</li>
                          <li>❌ Basic analytics only</li>
                          <li>❌ No custom branding</li>
                          <li>❌ Limited sync licensing</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-purple-300 text-sm">While DistroKid is popular, Union Music Group provides better support, flexible payments, and more comprehensive services.</p>
                  </div>
                }
                highlight={true}
              />

              <FAQItem 
                id="vs-tunecore"
                question="How does Union Music Group compare to TuneCore?"
                answer={
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-950/30 border border-green-500/30 p-4 rounded-lg">
                        <div className="font-bold text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Union Music Group
                        </div>
                        <ul className="text-sm space-y-2">
                          <li>✅ $4.99/month vs $9.99-$49.99/release</li>
                          <li>✅ 100% royalties vs varies by plan</li>
                          <li>✅ No per-release fees</li>
                          <li>✅ Unlimited releases included</li>
                          <li>✅ 48-72h delivery times</li>
                          <li>✅ Personal support & guidance</li>
                        </ul>
                      </div>
                      <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-lg">
                        <div className="font-bold text-red-400 mb-3">TuneCore</div>
                        <ul className="text-sm space-y-2">
                          <li>❌ Per-release pricing model</li>
                          <li>❌ Complex commission structure</li>
                          <li>❌ Annual fees per release</li>
                          <li>❌ Can get expensive for active artists</li>
                          <li>❌ Slower processing times</li>
                          <li>❌ Limited personal support</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-purple-300 text-sm">Union Music Group's simple pricing and unlimited releases save you money while providing superior support.</p>
                  </div>
                }
                highlight={true}
              />
            </div>
          </div>

          {/* Why Union Music Group */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" />
              Why Union Music Group Ltd?
            </h2>
            
            <div className="space-y-4">
              <FAQItem 
                id="why-choose-us"
                question="Why choose Union Music Group Ltd over other distributors?"
                answer={
                  <div className="space-y-4">
                    <p>We combine the best features of all distributors with unique advantages:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-purple-950/50 p-4 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <div className="font-bold text-white">Lightning Fast</div>
                        </div>
                        <p className="text-sm text-purple-300">48-72 hour delivery to all platforms</p>
                      </div>
                      <div className="bg-purple-950/50 p-4 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-green-400" />
                          <div className="font-bold text-white">Best Value</div>
                        </div>
                        <p className="text-sm text-purple-300">From $4.99/month, 100% royalties</p>
                      </div>
                      <div className="bg-purple-950/50 p-4 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-blue-400" />
                          <div className="font-bold text-white">100% Ownership</div>
                        </div>
                        <p className="text-sm text-purple-300">Keep all your rights and revenue</p>
                      </div>
                      <div className="bg-purple-950/50 p-4 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="w-5 h-5 text-purple-400" />
                          <div className="font-bold text-white">24/7 Support</div>
                        </div>
                        <p className="text-sm text-purple-300">Real help from real people</p>
                      </div>
                      <div className="bg-purple-950/50 p-4 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-5 h-5 text-green-400" />
                          <div className="font-bold text-white">Global Reach</div>
                        </div>
                        <p className="text-sm text-purple-300">200+ countries, all major platforms</p>
                      </div>
                      <div className="bg-purple-950/50 p-4 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-blue-400" />
                          <div className="font-bold text-white">Proven Track Record</div>
                        </div>
                        <p className="text-sm text-purple-300">10+ years, 50k+ artists served</p>
                      </div>
                    </div>
                  </div>
                }
                highlight={true}
              />

              <FAQItem 
                id="unique-features"
                question="What makes Union Music Group unique?"
                answer={
                  <div className="space-y-3">
                    <p>Several features set us apart from other distributors:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Custom Label Creation:</strong> Build your own brand with our White Label service</li>
                      <li><strong>Sync Licensing:</strong> Opportunities for TV, film, and commercial placements</li>
                      <li><strong>Advanced Analytics:</strong> Detailed insights into your audience and performance</li>
                      <li><strong>Artist Development:</strong> Guidance on marketing, promotion, and career growth</li>
                      <li><strong>Transparent Reporting:</strong> Complete visibility into your earnings and data</li>
                      <li><strong>No Long-Term Contracts:</strong> Freedom to change distributors whenever you want</li>
                    </ul>
                  </div>
                }
              />

              <FAQItem 
                id="reliability"
                question="How reliable is Union Music Group Ltd?"
                answer={
                  <div className="space-y-3">
                    <p>Our track record speaks for itself:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-purple-950/30 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">10+</div>
                        <div className="text-xs text-purple-300">Years Experience</div>
                      </div>
                      <div className="bg-purple-950/30 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">50k+</div>
                        <div className="text-xs text-purple-300">Happy Artists</div>
                      </div>
                      <div className="bg-purple-950/30 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">1000+</div>
                        <div className="text-xs text-purple-300">Label Partners</div>
                      </div>
                      <div className="bg-purple-950/30 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">200+</div>
                        <div className="text-xs text-purple-300">Countries Served</div>
                      </div>
                    </div>
                    <p className="text-sm text-purple-300 mt-4">We've built trust through consistent service, fair practices, and genuine artist support since 2016.</p>
                  </div>
                }
              />
            </div>
          </div>

          {/* Technical & Support */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Headphones className="w-6 h-6 text-purple-400" />
              Technical & Support
            </h2>
            
            <div className="space-y-4">
              <FAQItem 
                id="technical-requirements"
                question="What are the technical requirements for uploads?"
                answer={
                  <div className="space-y-3">
                    <p>To ensure the best quality and fast processing, we require:</p>
                    <div className="bg-purple-950/30 p-4 rounded-lg space-y-2">
                      <div><strong className="text-white">Audio Format:</strong> WAV files, 24-bit, 48kHz (preferred) or 16-bit, 44.1kHz, Stereo</div>
                      <div><strong className="text-white">Cover Art:</strong> 3000x3000px minimum, JPG/PNG format, RGB color mode</div>
                      <div><strong className="text-white">Metadata:</strong> Complete track information, ISRC codes (optional), UPC codes (optional)</div>
                      <div><strong className="text-white">File Size:</strong> Maximum 500MB per audio file</div>
                    </div>
                    <p className="text-sm text-purple-300">We provide templates and guidelines to help you prepare your releases correctly.</p>
                  </div>
                }
              />

              <FAQItem 
                id="customer-support"
                question="What kind of customer support do you offer?"
                answer={
                  <div className="space-y-3">
                    <p>We pride ourselves on exceptional customer support:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>24/7 Availability:</strong> Support team available around the clock</li>
                      <li><strong>Multiple Channels:</strong> Email, phone, live chat, and support tickets</li>
                      <li><strong>Fast Response:</strong> Most inquiries answered within 2-4 hours</li>
                      <li><strong>Expert Team:</strong> Knowledgeable staff who understand the music industry</li>
                      <li><strong>Artist Success:</strong> Dedicated support for your career growth</li>
                    </ul>
                    <p className="text-sm text-purple-300">Unlike many competitors, we provide real support from real people, not automated bots.</p>
                  </div>
                }
              />

              <FAQItem 
                id="account-cancellation"
                question="Can I cancel my account anytime?"
                answer={
                  <div className="space-y-3">
                    <p><strong className="text-green-400">Yes, absolutely! No long-term contracts or commitments.</strong></p>
                    <p>You can cancel your subscription anytime with:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>No cancellation fees or penalties</li>
                      <li>Your music stays online (as per platform policies)</li>
                      <li>You continue to collect royalties from existing releases</li>
                      <li>Freedom to use other distributors simultaneously</li>
                      <li>Easy cancellation through your dashboard</li>
                    </ul>
                    <p className="text-sm text-purple-300">We believe in giving artists complete freedom and flexibility.</p>
                  </div>
                }
                highlight={true}
              />
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-purple-950/50 to-pink-950/50 border-purple-500/20 p-8 text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
            <p className="text-purple-300 mb-6">
              Our support team is here to help you succeed in your music career.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Start Your Journey
                </Button>
              </Link>
              <a href="mailto:support@unionmusicgroup.co.uk">
                <Button variant="outline" className="border-purple-500/50 text-purple-300">
                  Contact Support
                </Button>
              </a>
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

export default FAQs;