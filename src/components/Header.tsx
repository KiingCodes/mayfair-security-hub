import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Shield, LayoutDashboard, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import logo from "@/assets/mayfair-navbar-logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Gallery", path: "/gallery" },
  { name: "Live Tracking", path: "/tracking" },
  { name: "Careers", path: "/careers" },
  { name: "Contact", path: "/contact" },
  { name: "Help Desk", path: "/help-desk" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useRole();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Mayfair Security Services" className="h-16 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground/80"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {user && isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
            <Link to="/portal">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Shield className="w-4 h-4 mr-2" />
                Client Portal
              </Button>
            </Link>
            {user && (
              <Link to="/settings">
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Settings">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <a href="#">
              <Button className="btn-emergency">
                <Phone className="w-4 h-4 mr-2" />
                Emergency Line
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t animate-fade-in-up">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`font-medium py-2 transition-colors ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-foreground/80"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t">
                {user && isAdmin && (
                  <Link to="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-destructive text-destructive">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/portal" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full border-primary text-primary">
                    <Shield className="w-4 h-4 mr-2" />
                    Client Portal
                  </Button>
                </Link>
                {user && (
                  <Link to="/settings" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                )}
                <a href="#">
                  <Button className="w-full btn-emergency">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Line
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
