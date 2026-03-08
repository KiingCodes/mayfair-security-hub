import { Link } from "react-router-dom";
import { Phone, MapPin, Clock } from "lucide-react";
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
            <a
              href="https://wa.me/27626685754"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#20bd5a] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Us
            </a>
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

        {/* Managed By */}
        <div className="border-t border-white/10 mt-6 pt-6 flex items-center justify-center gap-2">
          <span className="text-white/40 text-xs">Designed & managed by</span>
          <a href="https://jeweliq.tech" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:opacity-80 transition-opacity">
            <img src={jeweliqLogo} alt="JewelIQ" className="h-8 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
