import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  MapPin, Users, Clock, FileText, AlertTriangle,
  CheckCircle, ChevronRight, Shield, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const trackingFeatures = [
  {
    icon: MapPin,
    title: "Patrol Locations",
    description: "Real-time GPS tracking of all patrol units and security personnel on your property.",
  },
  {
    icon: CheckCircle,
    title: "Guard Check-ins",
    description: "Automated checkpoint verification with timestamp and location data.",
  },
  {
    icon: FileText,
    title: "Patrol Reports",
    description: "Detailed daily, weekly, and monthly patrol activity reports.",
  },
  {
    icon: AlertTriangle,
    title: "Incident Reports",
    description: "Immediate incident notifications with photos and detailed documentation.",
  },
];

const reportTypes = [
  { name: "Suspicious Activity", icon: Eye, color: "bg-yellow-500" },
  { name: "Theft Reports", icon: AlertTriangle, color: "bg-accent" },
  { name: "Patrol Logs", icon: FileText, color: "bg-primary" },
  { name: "Daily Reports", icon: Clock, color: "bg-blue-500" },
];

const mockGuards: { name: string; status: string; zone: string; lastCheckIn: string }[] = [];

const LiveTracking = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 gradient-hero relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              <span className="text-white font-semibold">Live Feature</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
              Real-Time Guard Tracking
            </h1>
            <p className="text-xl text-white/90">
              Monitor your security team in real-time. Track patrol locations, view check-ins, 
              and access reports—all from one dashboard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trackingFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="card-service text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Dashboard */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold uppercase tracking-wider">Dashboard Preview</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2">
              See How It Works
            </h2>
          </motion.div>

          <motion.div
            className="bg-background rounded-2xl p-6 lg:p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold">Live Map View</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Live
                  </div>
                </div>
                <div className="bg-secondary rounded-xl h-80 flex items-center justify-center relative overflow-hidden">
                  {/* Mock map markers */}
                  <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: "0.5s" }}>
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: "1s" }}>
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="text-center z-10">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Interactive Map View</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Active Guards</p>
                  <p className="text-3xl font-heading font-bold text-primary">12</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Check-ins Today</p>
                  <p className="text-3xl font-heading font-bold">48</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Incidents</p>
                  <p className="text-3xl font-heading font-bold text-primary">0</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Coverage</p>
                  <p className="text-3xl font-heading font-bold">100%</p>
                </div>
              </div>
            </div>

            {/* Guard List */}
            <div className="mt-6">
              <h3 className="font-heading font-bold mb-4">Active Security Personnel</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockGuards.map((guard) => (
                  <div key={guard.name} className="bg-muted rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{guard.name}</p>
                        <p className="text-xs text-muted-foreground">{guard.zone}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        guard.status === "On Patrol" ? "bg-primary/20 text-primary" :
                        guard.status === "At Checkpoint" ? "bg-blue-500/20 text-blue-600" :
                        "bg-yellow-500/20 text-yellow-600"
                      }`}>
                        {guard.status}
                      </span>
                      <span className="text-muted-foreground">{guard.lastCheckIn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Report Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold uppercase tracking-wider">Incident Reports Portal</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2">
              Comprehensive Reporting System
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTypes.map((report, index) => (
              <motion.div
                key={report.name}
                className="card-service text-center cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-16 h-16 rounded-2xl ${report.color} flex items-center justify-center mx-auto mb-4`}>
                  <report.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading font-bold">{report.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
              Ready to See Your Security in Real-Time?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Access live tracking when you become a Mayfair Security Services client. 
              Contact us to learn more about our comprehensive security solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/portal">
                <Button size="lg" className="btn-primary-glow">
                  Access Client Portal
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-charcoal">
                  Contact Us
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default LiveTracking;
