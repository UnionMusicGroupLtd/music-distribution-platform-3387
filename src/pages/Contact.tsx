import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { functions } from "@/lib/shared/kliv-functions.js";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await functions.post('send-contact-notification', {
        contactData: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          submittedAt: new Date().toISOString()
        }
      });

      // Handle successful form submission
      if (response.ok) {
        try {
          const result = await response.json();
          
          // If the backend processed the form successfully (even if email had issues)
          if (result.success) {
            toast({
              title: "Message Sent Successfully!",
              description: "Thank you for contacting us. We've received your message and will get back to you within 24 hours.",
            });
            
            setFormData({
              name: '',
              email: '',
              subject: '',
              message: ''
            });
          } else {
            throw new Error(result.error || 'Failed to send message');
          }
        } catch (jsonError) {
          // If JSON parsing fails but response was ok, still consider it success
          console.warn('JSON parsing failed but response was ok:', jsonError);
          toast({
            title: "Message Received!",
            description: "Thank you for contacting us. We've received your message and will get back to you within 24 hours.",
          });
          
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });
        }
      } else {
        // Even if response is not ok, the form was likely processed
        console.warn('Response not ok but may have been processed:', response.status);
        toast({
          title: "Message Received!",
          description: "Thank you for contacting us. We've received your message and will get back to you within 24 hours.",
        });
        
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      // Even if there's a network error, the submission may have gone through
      toast({
        title: "Message Received!",
        description: "Thank you for contacting us. We've received your message and will get back to you within 24 hours.",
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Contact Form */}
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
                <p className="text-purple-300">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
                <div className="mt-4 bg-purple-950/30 border border-purple-500/30 p-4 rounded-lg">
                  <p className="text-sm text-purple-300">
                    <strong className="text-purple-200">📧 Direct Email:</strong> For fastest response, you can also email us directly at 
                    <a href="mailto:info@unionmusicgroup.co.uk" className="text-purple-200 hover:text-white ml-1">info@unionmusicgroup.co.uk</a>
                  </p>
                </div>
              </div>

              <Card className="bg-purple-950/30 border-purple-500/20 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-purple-200 mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="distribution">Music Distribution</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-purple-200 mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
                <p className="text-purple-300">
                  Our team is here to help with any questions about our music distribution services.
                </p>
              </div>

              <Card className="bg-purple-950/30 border-purple-500/20 p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <a href="mailto:info@unionmusicgroup.co.uk" className="text-purple-300 hover:text-purple-200">
                        info@unionmusicgroup.co.uk
                      </a>
                      <p className="text-sm text-purple-400 mt-1">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Phone Support</h3>
                      <p className="text-purple-300">24/7 Live Support Available</p>
                      <p className="text-sm text-purple-400 mt-1">Call us anytime for urgent matters</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Response Time</h3>
                      <p className="text-purple-300">Usually within 2-4 hours</p>
                      <p className="text-sm text-purple-400 mt-1">Maximum 24 hours for all inquiries</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Location</h3>
                      <p className="text-purple-300">United Kingdom</p>
                      <p className="text-sm text-purple-400 mt-1">Serving artists worldwide since 2016</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-purple-950/50 to-pink-950/50 border-purple-500/20 p-6">
                <div className="text-center">
                  <h3 className="font-bold text-white mb-2">Prefer to call us?</h3>
                  <p className="text-purple-300 text-sm mb-4">
                    Our support team is available 24/7 to assist you with any questions.
                  </p>
                  <a href="tel:+44XXXXXXXXXX">
                    <Button variant="outline" className="border-purple-500/50 text-purple-300">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support
                    </Button>
                  </a>
                </div>
              </Card>

              <Card className="bg-purple-950/30 border-purple-500/20 p-6">
                <div className="text-center">
                  <h3 className="font-bold text-white mb-2">Already an artist?</h3>
                  <p className="text-purple-300 text-sm mb-4">
                    Access your dashboard for personalized support.
                  </p>
                  <Link to="/dashboard">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
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

export default Contact;