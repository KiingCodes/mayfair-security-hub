import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, Users, Camera, Car, UserCheck, AlertTriangle, 
  Building, Lock, Eye, FileText, MapPin, Clock, 
  ChevronRight, Phone, CheckCircle, Award, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import logo from "@/assets/logo.png";

const services = [
  { icon: Shield, title: "Armed Guards", description: "Highly trained armed security personnel for maximum protection" },
  { icon: Users, title: "Unarmed Guards", description: "Professional security officers for corporate & residential sites" },
  { icon: Car, title: "Mobile Patrol", description: "Round-the-clock patrol services with GPS tracking" },
  { icon: Camera, title: "CCTV Monitoring", description: "24/7 surveillance and remote monitoring services" },
  { icon: UserCheck, title: "Executive Protection", description: "VIP and executive close protection services" },
  { icon: Building, title: "Event Security", description: "Comprehensive security for events of all sizes" },
  { icon: AlertTriangle, title: "Risk Assessment", description: "Professional security audits and vulnerability analysis" },
  { icon: Lock, title: "Access Control", description: "Advanced access management and visitor screening" },
];

const stats = [
  { value: "500+", label: "Active Clients" },
  { value: "1,200+", label: "Security Officers" },
  { value: "24/7", label: "Emergency Response" },
  { value: "15+", label: "Years Experience" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🛡️ Trusted Security Partner Since 2008
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight mb-6">
                Professional Security Solutions You Can{" "}
                <span className="text-accent">Trust</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-xl">
                Think Ahead, Protect Smarter. We provide comprehensive security services 
                with real-time tracking, instant reporting, and 24/7 emergency response.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact">
                  <Button size="lg" className="btn-emergency text-lg px-8">
                    Get Instant Quote
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary text-lg px-8">
                    Our Services
                  </Button>
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Award className="w-5 h-5 text-white" />
                  <span>ISO Certified</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="w-5 h-5 text-white" />
                  <span>5-Star Rated</span>
                </div>
              </div>
            </motion.div>

            {/* Logo Display */}
            <motion.div
              className="hidden lg:flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-20 scale-150" />
                <img 
                  src={logo} 
                  alt="Mayfair Security Services" 
                  className="relative w-80 h-auto drop-shadow-2xl animate-float"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-charcoal">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-3xl md:text-4xl font-heading font-black text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold uppercase tracking-wider">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2 mb-4">
              Comprehensive Security Solutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From armed guards to advanced surveillance, we offer complete security services 
              tailored to your specific needs.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="card-service group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <service.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                <Link 
                  to="/services" 
                  className="inline-flex items-center text-primary font-semibold text-sm hover:gap-2 transition-all"
                >
                  Learn More <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" className="btn-primary-glow">
                View All Services
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Tracking CTA */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🔴 Live Feature
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Real-Time Guard Tracking
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Monitor your security team in real-time. Track patrol locations, view guard check-ins, 
                access patrol reports, and receive instant incident notifications—all from your dashboard.
              </p>
              <ul className="space-y-4 mb-8">
                {["GPS Patrol Tracking", "Guard Check-in Logs", "Incident Reports", "Daily Activity Summaries"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white">
                    <CheckCircle className="w-5 h-5 text-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/tracking">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  <Eye className="mr-2 w-5 h-5" />
                  View Live Tracking Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                  <span className="text-white font-semibold">Live Tracking Dashboard</span>
                </div>
                <div className="bg-charcoal/50 rounded-xl h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
                    <p className="text-white/70">Interactive Map Preview</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">12</p>
                    <p className="text-xs text-white/70">Active Guards</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">48</p>
                    <p className="text-xs text-white/70">Check-ins Today</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-xs text-white/70">Incidents</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Client Portal CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-muted rounded-2xl p-8">
                <div className="space-y-4">
                  {[
                    { icon: FileText, label: "View & Download Invoices" },
                    { icon: Eye, label: "Access Patrol Reports" },
                    { icon: FileText, label: "Download Contracts" },
                    { icon: Users, label: "Request Additional Guards" },
                    { icon: AlertTriangle, label: "Submit Incident Reports" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center gap-4 bg-background rounded-xl p-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-semibold uppercase tracking-wider">Client Portal</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2 mb-6">
                Manage Everything in One Place
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Access your secure client portal to view invoices, download reports, 
                manage contracts, and request additional security services—anytime, anywhere.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/portal">
                  <Button size="lg" className="btn-primary-glow">
                    <Lock className="mr-2 w-5 h-5" />
                    Client Login
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    Request Access
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-gradient-to-r from-charcoal to-charcoal/90 rounded-3xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Ready to Secure Your Property?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Get started in minutes. Request a free quote or call our 24/7 hotline 
              for immediate assistance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="btn-emergency text-lg">
                  Get Free Quote
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:+1234567890">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-charcoal text-lg">
                  <Phone className="mr-2 w-5 h-5" />
                  Call Now
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Area Map Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold uppercase tracking-wider">Coverage Area</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2 mb-4">
              We Cover Your Area
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our security services extend across the metropolitan area and beyond. 
              Check if we serve your location.
            </p>
          </motion.div>

          <motion.div
            className="bg-muted rounded-2xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-secondary rounded-xl h-80 flex items-center justify-center mb-6">
              <div className="text-center">
                <MapPin className="w-20 h-20 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive Service Area Map</p>
                <p className="text-sm text-muted-foreground">50+ Service Locations</p>
              </div>
            </div>
            <Link to="/contact">
              <Button size="lg" className="btn-primary-glow">
                Check Your Area
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-heading font-bold text-muted-foreground">
              Certifications & Compliance
            </h3>
          </motion.div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["ISO 9001:2015", "PSIRA Certified", "SIA Approved", "BSIA Member", "ACS Pacesetters"].map((cert, index) => (
              <motion.div
                key={cert}
                className="flex items-center gap-2 text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Award className="w-6 h-6 text-primary" />
                <span className="font-semibold">{cert}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
