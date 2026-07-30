const Footer = ({ hideQuickLinks = false }: { hideQuickLinks?: boolean }) => {
  return (
    <footer className="bg-slate-950 border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Links */}
        <div className="grid md:grid-cols-6 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">UMG</span>
              </div>
              <span className="text-xl font-bold text-white">Union Music Group</span>
            </div>
            <p className="text-purple-300 text-sm">
              Professional music distribution services for independent artists worldwide.
            </p>
          </div>

          {!hideQuickLinks && (
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/signin" className="text-purple-300 hover:text-white text-sm">Sign In</a></li>
                <li><a href="/signup" className="text-purple-300 hover:text-white text-sm">Sign Up</a></li>
                <li><a href="/dashboard" className="text-purple-300 hover:text-white text-sm">Dashboard</a></li>
                <li><a href="/upload" className="text-purple-300 hover:text-white text-sm">Upload Music</a></li>
                <li>
                  <a href="/plans" className="text-yellow-300 hover:text-yellow-200 text-sm font-medium">
                    Plans & Pricing
                  </a>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="text-purple-300 hover:text-white text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="https://tawk.to/chat/62655595b0d10b6f3e6f1b5a/1g1dtckbc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  24/7 Live Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="/cover-song-licensing" className="text-purple-300 hover:text-white text-sm">
                  Cover Song Licensing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Become Partner</h4>
            <ul className="space-y-2">
              <li>
                <a href="/media-partner" className="text-purple-300 hover:text-white text-sm">
                  Media Partner
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/unionmusicgroupltd/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-all flex items-center justify-center group"
                aria-label="Instagram"
              >
                <svg className="w-8 h-8 text-pink-300 group-hover:text-pink-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/c/UnionMusicGroup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-all flex items-center justify-center group"
                aria-label="YouTube"
              >
                <svg className="w-8 h-8 text-pink-300 group-hover:text-pink-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 2 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 4.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-500/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-purple-300 text-sm">
              © 2016-2026 Union Music Group Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/about" className="text-purple-300 hover:text-white">About Us</a>
              <a href="/faqs" className="text-purple-300 hover:text-white">FAQs</a>
              <a href="/terms-of-service" className="text-purple-300 hover:text-white">Terms of Service</a>
              <a href="/privacy-policy" className="text-purple-300 hover:text-white">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;