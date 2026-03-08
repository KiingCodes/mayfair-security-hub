import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import jeweliqLogo from "@/assets/jeweliq-logo.png";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-6">Mayfair Security Services</h3>
            <p className="text-white/70 mb-6">
              Think Ahead, Protect Smarter. Your dedicated partner in comprehensive security solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/services" className="text-white/70 hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link to="/about" className="text-white/70 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/tracking" className="text-white/70 hover:text-primary transition-colors">Live Tracking</Link></li>
              <li><Link to="/careers" className="text-white/70 hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/portal" className="text-white/70 hover:text-primary transition-colors">Client Portal</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6">Our Services</h4>
            <ul className="space-y-3">
              <li><Link to="/services" className="text-white/70 hover:text-primary transition-colors">Armed Guards</Link></li>
              <li><Link to="/services" className="text-white/70 hover:text-primary transition-colors">Mobile Patrol</Link></li>
              <li><Link to="/services" className="text-white/70 hover:text-primary transition-colors">Event Security</Link></li>
              <li><Link to="/services" className="text-white/70 hover:text-primary transition-colors">CCTV Monitoring</Link></li>
              <li><Link to="/services" className="text-white/70 hover:text-primary transition-colors">Executive Protection</Link></li>
              <li><Link to="/services" className="text-white/70 hover:text-primary transition-colors">Risk Assessment</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-white/70">WhatsApp</p>
                  <a href="https://wa.me/27626685754" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-primary transition-colors">062 668 5754</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-white/70">Call Us</p>
                  <a href="tel:+27689213188" className="font-semibold hover:text-primary transition-colors">068 921 3188</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-white/70">Website</p>
                  <a href="https://www.mayfairsecurity1.co.za" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-primary transition-colors">www.mayfairsecurity1.co.za</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-white/70">Operating Hours</p>
                  <p className="font-semibold">24/7 - 365 Days</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Mayfair Security Services. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-white/60 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/60 hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
