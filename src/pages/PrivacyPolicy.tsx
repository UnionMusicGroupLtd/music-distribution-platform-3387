import { Link } from "react-router-dom";
import { Music, ArrowLeft, Eye, Lock, Database, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PrivacyPolicy = () => {
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
              <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
              <p className="text-purple-300">Last Updated: {lastUpdated}</p>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    Union Music Group Ltd ("we," "us," or "our") is committed to protecting your privacy 
                    and personal data. This Privacy Policy explains how we collect, use, disclose, and 
                    safeguard your information when you use our music distribution platform ("Service").
                  </p>
                  <p>
                    By using our Service, you agree to the collection and use of information in accordance 
                    with this policy. If you disagree with any part of this privacy policy, please do not 
                    use our Service.
                  </p>
                  <div className="bg-purple-950/30 border border-purple-500/20 rounded-lg p-4">
                    <p className="text-purple-100 font-medium">
                      We comply with the UK Data Protection Act 2018 and the General Data Protection 
                      Regulation (GDPR) for all personal data processing.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    1. Personal Information
                  </h3>
                  <p>We collect information you provide directly to us:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Account Information:</strong> Name, email address, password, artist name</li>
                    <li><strong className="text-white">Payment Details:</strong> Bank account or payment processor information (processed securely)</li>
                    <li><strong className="text-white">Artist Profile:</strong> Biographical information, photos, genre, social media links</li>
                    <li><strong className="text-white">Music Metadata:</strong> Track titles, ISRC codes, songwriter credits, publishing information</li>
                    <li><strong className="text-white">Communications:</strong> Messages, support requests, and feedback</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    2. Automatically Collected Information
                  </h3>
                  <p>We automatically collect certain data when you use our Service:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                    <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, time spent, error reports</li>
                    <li><strong className="text-white">Performance Data:</strong> Loading times, crash reports, system performance</li>
                    <li><strong className="text-white">Location Data:</strong> Approximate location based on IP address (country/region level)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4 flex items-center gap-2">
                    <Cookie className="w-5 h-5" />
                    3. Cookies and Tracking Technologies
                  </h3>
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Remember your preferences and settings</li>
                    <li>Authenticate your session and maintain security</li>
                    <li>Analyze usage patterns and improve our Service</li>
                    <li>Track marketing campaigns and referrals</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
                <div className="text-purple-200 space-y-3">
                  <p>We use the collected information for various purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Service Provision:</strong> Process and distribute your music to DSPs</li>
                    <li><strong className="text-white">Account Management:</strong> Create and maintain your artist account</li>
                    <li><strong className="text-white">Royalty Processing:</strong> Calculate and distribute payments accurately</li>
                    <li><strong className="text-white">Analytics:</strong> Provide streaming data and performance insights</li>
                    <li><strong className="text-white">Communication:</strong> Send important updates, security alerts, and support messages</li>
                    <li><strong className="text-white">Marketing:</strong> Send promotional content (with your consent)</li>
                    <li><strong className="text-white">Security:</strong> Detect fraud, abuse, and technical issues</li>
                    <li><strong className="text-white">Improvement:</strong> Analyze usage patterns to enhance our Service</li>
                    <li><strong className="text-white">Legal Compliance:</strong> Meet regulatory and reporting obligations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Data Sharing and Disclosure</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">3.1 Third-Party Service Providers</h3>
                  <p>We share data with trusted partners who assist our operations:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Digital Service Providers:</strong> Spotify, Apple Music, YouTube Music, TikTok, etc.</li>
                    <li><strong className="text-white">Payment Processors:</strong> Banks, Stripe, PayPal for royalty payments</li>
                    <li><strong className="text-white">Cloud Services:</strong> Hosting, storage, and analytics providers</li>
                    <li><strong className="text-white">Email Services:</strong> Communication and notification platforms</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">3.2 Legal Requirements</h3>
                  <p>We may disclose your information when required by law:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Comply with legal processes and government requests</li>
                    <li>Protect our rights, property, and safety</li>
                    <li>Prevent fraud or illegal activities</li>
                    <li>Enforce our Terms of Service</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">3.3 Business Transfers</h3>
                  <p>
                    Your information may be transferred in connection with a merger, acquisition, 
                    or sale of assets, subject to applicable privacy protections.
                  </p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">3.4 Public Features</h3>
                  <p>
                    Information you make public (artist profiles, social media links) may be accessible 
                    to other users and the general public.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Security Measures
                  </h3>
                  <p>We implement industry-standard security measures:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Encryption:</strong> SSL/TLS encryption for data transmission</li>
                    <li><strong className="text-white">Storage Security:</strong> Encrypted databases and secure cloud storage</li>
                    <li><strong className="text-white">Access Control:</strong> Role-based access and authentication systems</li>
                    <li><strong className="text-white">Payment Security:</strong> PCI DSS compliant payment processing</li>
                    <li><strong className="text-white">Regular Audits:</strong> Security assessments and vulnerability testing</li>
                    <li><strong className="text-white">Monitoring:</strong> Intrusion detection and prevention systems</li>
                  </ul>
                  <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-200">
                      <strong>Important:</strong> While we take reasonable measures to protect your information, 
                      no method of transmission over the Internet is 100% secure.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Your Privacy Rights</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">5.1 UK/GDPR Rights</h3>
                  <p>Under UK data protection law, you have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                    <li><strong className="text-white">Rectification:</strong> Correct inaccurate or incomplete data</li>
                    <li><strong className="text-white">Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                    <li><strong className="text-white">Restriction:</strong> Limit how we process your data</li>
                    <li><strong className="text-white">Portability:</strong> Receive your data in a structured format</li>
                    <li><strong className="text-white">Object:</strong> Object to processing based on legitimate interests</li>
                    <li><strong className="text-white">Consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">5.2 Exercise Your Rights</h3>
                  <p>To exercise your rights, contact us at:</p>
                  <div className="bg-purple-950/30 border border-purple-500/20 rounded-lg p-4">
                    <p className="text-white">Email: privacy@unionmusicgroup.co.uk</p>
                    <p className="text-white">Subject: Privacy Rights Request</p>
                  </div>
                  <p>We will respond to your request within 30 days.</p>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">5.3 Data Deletion</h3>
                  <p>
                    You can delete your account at any time through your profile settings or by 
                    contacting us. Upon deletion, we will:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Remove your personal information from active databases</li>
                    <li>Cease distribution of your music (subject to platform obligations)</li>
                    <li>Retain necessary data for legal and accounting purposes</li>
                    <li>Maintain anonymous usage data for analytics</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
                <div className="text-purple-200 space-y-3">
                  <h3 className="text-xl font-semibold text-purple-100">6.1 Types of Cookies</h3>
                  <p>We use several types of cookies:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Essential Cookies:</strong> Required for basic site functionality</li>
                    <li><strong className="text-white">Performance Cookies:</strong> Collect usage data to improve performance</li>
                    <li><strong className="text-white">Functionality Cookies:</strong> Remember preferences and settings</li>
                    <li><strong className="text-white">Targeting Cookies:</strong> Deliver relevant content and advertisements</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-purple-100 mt-4">6.2 Managing Cookies</h3>
                  <p>
                    You can control cookies through your browser settings. Note that disabling cookies 
                    may affect site functionality.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">International Data Transfers</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    Your information may be transferred to and processed in countries other than your 
                    country of residence. We ensure appropriate safeguards are in place, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                    <li>Compliance with UK adequacy regulations</li>
                    <li>Binding Corporate Rules (BCRs) where applicable</li>
                    <li>Adequacy decisions from relevant authorities</li>
                  </ul>
                  <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-200">
                      We process EU and UK data in accordance with GDPR requirements and maintain 
                      appropriate legal mechanisms for international transfers.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    Our Service is not intended for children under 16 years of age. We do not knowingly 
                    collect personal information from children under 16. If you are a parent or guardian 
                    and believe your child has provided us with personal information, please contact us 
                    immediately.
                  </p>
                  <p>
                    If we discover we have collected personal information from a child under 16 without 
                    parental consent, we will take steps to remove that information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    changes by:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Emailing you at your registered email address</li>
                    <li>Posting a notice on our website</li>
                    <li>Updating the "Last Updated" date at the top of this policy</li>
                  </ul>
                  <p>
                    Your continued use of the Service after any modifications indicates your acceptance 
                    of the updated policy.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Retention Period</h2>
                <div className="text-purple-200 space-y-3">
                  <p>We retain your personal data for different periods based on the purpose:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Account Data:</strong> While your account is active + 7 years after closure</li>
                    <li><strong className="text-white">Transaction Records:</strong> 7 years (legal requirement)</li>
                    <li><strong className="text-white">Music Files:</strong> While distributed + 1 year after removal</li>
                    <li><strong className="text-white">Analytics Data:</strong> 2 years (anonymized after 6 months)</li>
                    <li><strong className="text-white">Communication Records:</strong> 3 years</li>
                  </ul>
                  <p>
                    After the retention period, data is securely deleted or anonymized unless required 
                    for legal purposes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Regulatory Compliance</h2>
                <div className="text-purple-200 space-y-3">
                  <p>We comply with major data protection regulations:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">GDPR:</strong> General Data Protection Regulation (EU/UK)</li>
                    <li><strong className="text-white">Data Protection Act 2018:</strong> UK implementation of GDPR</li>
                    <li><strong className="text-white">PECR:</strong> Privacy and Electronic Communications Regulations</li>
                    <li><strong className="text-white">CCPA:</strong> California Consumer Privacy Act (where applicable)</li>
                  </ul>
                  <div className="bg-green-950/30 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-200">
                      <strong>Compliance Status:</strong> We maintain GDPR compliance through regular 
                      audits, data protection impact assessments, and privacy by design principles.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    For privacy-related questions, concerns, or requests, please contact:
                  </p>
                  <div className="bg-purple-950/30 border border-purple-500/20 rounded-lg p-4">
                    <p className="text-white font-medium">Union Music Group Ltd</p>
                    <p>Privacy Officer: privacy@unionmusicgroup.co.uk</p>
                    <p>General Inquiries: info@unionmusicgroup.co.uk</p>
                    <p>Website: www.distributionunion.com</p>
                    <p className="mt-2 text-sm text-purple-300">
                      Data Protection Registration: ZA123456 (example number)
                    </p>
                  </div>
                  <p>
                    We will respond to all privacy inquiries within 30 days of receipt. For urgent 
                    matters, please include "URGENT - Privacy Request" in your email subject.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Your Consent</h2>
                <div className="text-purple-200 space-y-3">
                  <p>
                    By using Union Music Group's platform, you acknowledge that you have read, understood, 
                    and agree to this Privacy Policy. If you do not agree with our policies and practices, 
                    please do not use our Service.
                  </p>
                  <div className="bg-purple-950/30 border border-purple-500/20 rounded-lg p-4">
                    <p className="text-purple-100 text-sm">
                      This policy was last updated on {lastUpdated} and complies with current data 
                      protection legislation. We regularly review and update our privacy practices to 
                      ensure continued compliance and protection of your personal data.
                    </p>
                  </div>
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

export default PrivacyPolicy;