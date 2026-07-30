import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import functions from "@/lib/shared/kliv-functions.js";

const MediaPartner = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    partnerTypes: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    if (formData.partnerTypes.length === 0) {
      toast.error("Please select at least one partner type");
      return;
    }

    setLoading(true);

    try {
      // Send form data to edge function using Kliv SDK with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const result = await Promise.race([
        functions.invoke('media-partner-submission', formData),
        timeoutPromise
      ]) as any;

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit form');
      }

      toast.success("Thank you for your interest! We'll be in touch soon.");
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        partnerTypes: []
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      const errorMsg = error instanceof Error && error.message === 'Request timeout' 
        ? "Submission is taking longer than expected. Your application may have been submitted - we'll contact you if so."
        : "Failed to submit form. Please try again or contact us directly.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        partnerTypes: [...formData.partnerTypes, value]
      });
    } else {
      setFormData({
        ...formData,
        partnerTypes: formData.partnerTypes.filter(type => type !== value)
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-purple-300 hover:text-white mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">MEDIA PARTNER</h1>
          <p className="text-purple-300 text-lg">
            Are You part of radio station, owner radio and online media, blog, Editor, etc… become our support partner.
          </p>
          <p className="text-purple-400 text-sm mt-2 italic">* Indicates required field</p>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-900/50 border-purple-500/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div>
              <Label className="text-white mb-3 block">Name *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="First"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Last"
                    className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-white mb-2 flex items-center gap-2">
                Email *
                <span className="text-purple-400 text-xs cursor-help" title="We'll contact you at this email address">
                  <Mail className="w-3 h-3" />
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-400/50"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Partner Type Checkboxes */}
            <div>
              <Label className="text-white mb-3 block">Are you * *</Label>
              <div className="space-y-3">
                {[
                  { id: 'radio-station', label: 'Radio Station' },
                  { id: 'journalist', label: 'Journalist' },
                  { id: 'blogger', label: 'Blogger' },
                  { id: 'magazine', label: 'Magazine' },
                  { id: 'label', label: 'Label' },
                  { id: 'playlist', label: 'Playlist' },
                  { id: 'dj', label: 'DJ' }
                ].map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={option.id}
                      checked={formData.partnerTypes.includes(option.label)}
                      onCheckedChange={(checked) => handleCheckboxChange(option.label, checked === true)}
                      className="border-purple-500/50"
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-purple-200 cursor-pointer hover:text-white"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-start">
              <Button
                type="submit"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Additional Info */}
        <Card className="bg-slate-900/30 border-purple-500/20 p-6 mt-6">
          <h3 className="text-white font-semibold mb-3">Why Become a Media Partner?</h3>
          <ul className="space-y-2 text-purple-300 text-sm">
            <li>• Get exclusive access to new music releases and artists</li>
            <li>• Early access to press releases and music news</li>
            <li>• Partnership opportunities with emerging talent</li>
            <li>• Networking opportunities in the music industry</li>
            <li>• Content collaboration opportunities</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default MediaPartner;
