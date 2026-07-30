import { Link } from "react-router-dom";
import { Music, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TermsOfService = () => {
  const lastUpdated = "January 1, 2026";

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
            <Link to="/">
              <Button variant="ghost" className="text-purple-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-900/50 border-purple-500/20 p-8 md:p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
              <p className="text-purple-300">Last Updated: {lastUpdated}</p>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    By accessing or using Union Music Group's music distribution platform ("Service"), 
                    you agree to be bound by these Terms of Service ("Terms"). If you do not agree 
                    to these Terms, please do not use our Service.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and Union Music Group Ltd. 
                    We reserve the right to modify these Terms at any time, and your continued use of 
                    the Service constitutes acceptance of any changes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    Union Music Group provides a music distribution platform that allows artists to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Upload and distribute music to digital service providers (DSPs)</li>
                    <li>Track streaming analytics and royalty earnings</li>
                    <li>Manage artist profiles and music catalogs</li>
                    <li>Access promotional and marketing tools</li>
                    <li>Receive royalty payments for eligible streams</li>
                  </ul>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any aspect of the Service 
                    at any time with or without notice.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">3.1 Account Creation</h3>
                  <p>
                    To use our Service, you must create an account and provide accurate, complete, 
                    and current information. You are responsible for maintaining the confidentiality 
                    of your account credentials and for all activities that occur under your account.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-purple-100 mt-4">3.2 Account Security</h3>
                  <p>
                    You agree to notify us immediately of any unauthorized use of your account or any 
                    other breach of security. We will not be liable for any loss or damage arising 
                    from your failure to comply with this section.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">3.3 Account Termination</h3>
                  <p>
                    We reserve the right to suspend or terminate your account at any time for any 
                    reason, including but not limited to violation of these Terms or fraudulent activity.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Music Distribution Services</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">4.1 Content Requirements</h3>
                  <p>
                    By uploading music to our platform, you represent and warrant that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You own all rights to the music or have obtained necessary permissions</li>
                    <li>The content does not infringe upon any third-party rights</li>
                    <li>All metadata and information provided is accurate</li>
                    <li>The content complies with all applicable laws and regulations</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">4.2 Distribution Rights</h3>
                  <p>
                    You grant Union Music Group the non-exclusive right to distribute your music 
                    to DSPs and other platforms. You maintain ownership of all copyrights and other 
                    intellectual property rights in your music.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">4.3 Quality Control</h3>
                  <p>
                    We reserve the right to review and approve all content before distribution. 
                    Content that does not meet our quality standards or violates these Terms may 
                    be rejected or removed from distribution.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Royalties and Payments</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">5.1 Revenue Collection</h3>
                  <p>
                    We collect royalties from DSPs on your behalf and distribute them according to 
                    our payment schedule and terms. Royalty rates vary by platform and territory.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">5.2 Payment Processing</h3>
                  <p>
                    Payments will be processed monthly once your earnings reach the minimum threshold 
                    of $50 USD. You must provide valid payment information to receive royalties.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">5.3 Revenue Share</h3>
                  <p>
                    For free tier users, Union Music Group retains a percentage of collected royalties 
                    as specified in your subscription plan. Premium users keep 100% of their royalties 
                    minus applicable processing fees.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">5.4 Reporting</h3>
                  <p>
                    We provide detailed royalty reports through our dashboard. While we strive for 
                    accuracy, we cannot guarantee the completeness of data provided by DSPs.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. User Content and Conduct</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">6.1 Content Standards</h3>
                  <p>
                    You agree not to upload content that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Contains viruses, malware, or harmful code</li>
                    <li>Is defamatory, obscene, or offensive</li>
                    <li>Infringes upon intellectual property rights</li>
                    <li>Violates any applicable laws or regulations</li>
                    <li>Contains false or misleading information</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">6.2 User Conduct</h3>
                  <p>
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use the Service for any illegal purpose</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the Service</li>
                    <li>Impersonate any person or entity</li>
                    <li>Spam or harass other users</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">7.1 Your Content</h3>
                  <p>
                    You retain all rights to the music you upload. By using our Service, you grant 
                    us a license to distribute, promote, and otherwise use your content as necessary 
                    to provide our services.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">7.2 Platform Content</h3>
                  <p>
                    The Service, including all software, design, text, graphics, and other content, 
                    is owned by Union Music Group and protected by intellectual property laws.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">7.3 Trademarks</h3>
                  <p>
                    Union Music Group, the Union Music Group logo, and related trademarks are the 
                    property of Union Music Group Ltd. and may not be used without permission.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    To the maximum extent permitted by law, Union Music Group shall not be liable for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Any indirect, incidental, special, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Distribution errors or delays by DSPs</li>
                    <li>Inaccurate royalty reporting by third parties</li>
                    <li>Service interruptions or outages</li>
                  </ul>
                  <p>
                    Our total liability shall not exceed the amount of fees paid by you in the 
                    twelve (12) months preceding the claim.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Indemnification</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    You agree to indemnify and hold harmless Union Music Group, its officers, directors, 
                    employees, and affiliates from any claims, damages, losses, liabilities, and expenses 
                    (including legal fees) arising from:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Content you upload or distribute through our platform</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">10.1 Termination by You</h3>
                  <p>
                    You may terminate your account at any time by contacting us or using the account 
                    deletion feature. Upon termination, you will remain responsible for any outstanding 
                    obligations.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">10.2 Termination by Us</h3>
                  <p>
                    We may suspend or terminate your account immediately for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Breach of these Terms</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Violation of intellectual property rights</li>
                    <li>Inactivity for 12 months or more</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Dispute Resolution</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">11.1 Governing Law</h3>
                  <p>
                    These Terms shall be governed by the laws of the United Kingdom. Any disputes 
                    arising under these Terms shall be resolved in accordance with UK law.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">11.2 Arbitration</h3>
                  <p>
                    Any disputes shall be resolved through binding arbitration in accordance with 
                    the rules of the London Court of International Arbitration.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">12. General Provisions</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">12.1 Entire Agreement</h3>
                  <p>
                    These Terms constitute the entire agreement between you and Union Music Group 
                    regarding the Service.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">12.2 Severability</h3>
                  <p>
                    If any provision of these Terms is found to be invalid or unenforceable, the 
                    remaining provisions shall remain in full force.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">12.3 Waiver</h3>
                  <p>
                    Our failure to enforce any right or provision of these Terms shall not constitute 
                    a waiver of such right or provision.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">12.4 Force Majeure</h3>
                  <p>
                    We shall not be liable for any failure or delay in performance due to causes 
                    beyond our reasonable control.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    For questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-purple-950/30 border border-purple-500/20 rounded-lg p-4">
                    <p className="text-white font-medium">Union Music Group Ltd</p>
                    <p>Email: info@unionmusicgroup.co.uk</p>
                    <p>Website: www.distributionunion.com</p>
                  </div>
                  <p>
                    By using our Service, you acknowledge that you have read, understood, and agree 
                    to be bound by these Terms of Service.
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-purple-500/20">
              <p className="text-purple-300 text-sm">
                © {new Date().getFullYear()} Union Music Group Ltd. All rights reserved.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;