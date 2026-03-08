import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, Users, Camera, Car, UserCheck, AlertTriangle, 
  Building, Lock, Eye, Radio, Dog, Flashlight, 
  ChevronRight, CheckCircle, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const services = [
  {
    icon: Shield,
    title: "Armed Security Guards",
    description: "Highly trained armed security personnel licensed to carry firearms. Ideal for high-risk environments, banks, jewelry stores, and VIP protection.",
    features: ["Licensed & Certified", "Extensive Training", "Background Verified", "Tactical Response Ready"],
  },
  {
    icon: Users,
    title: "Unarmed Security Officers",
    description: "Professional uniformed security officers for access control, monitoring, and customer service at commercial and residential properties.",
    features: ["Customer Focused", "24/7 Availability", "Patrol Trained", "First Aid Certified"],
  },
  {
    icon: Car,
    title: "Mobile Patrol Services",
    description: "GPS-tracked patrol vehicles conducting random and scheduled patrols of your property with real-time reporting.",
    features: ["GPS Tracking", "Randomized Routes", "Instant Reporting", "Alarm Response"],
  },
  {
    icon: Camera,
    title: "CCTV Monitoring",
    description: "24/7 remote video surveillance from our state-of-the-art monitoring center with immediate incident response.",
    features: ["Live Monitoring", "Video Analytics", "Cloud Recording", "Instant Alerts"],
  },
  {
    icon: UserCheck,
    title: "Executive Protection",
    description: "Close protection services for VIPs, executives, and high-net-worth individuals by former military and law enforcement professionals.",
    features: ["Risk Assessment", "Secure Transport", "Travel Security", "Discreet Service"],
  },
  {
    icon: Building,
    title: "Event Security",
    description: "Comprehensive security solutions for concerts, corporate events, private parties, and public gatherings of any size.",
    features: ["Crowd Management", "Access Control", "Emergency Planning", "VIP Handling"],
  },
  {
    icon: AlertTriangle,
    title: "Risk Assessment & Consulting",
    description: "Professional security audits, vulnerability assessments, and customized security planning by certified experts.",
    features: ["Site Surveys", "Threat Analysis", "Security Planning", "Compliance Review"],
  },
  {
    icon: Lock,
    title: "Access Control Systems",
    description: "Design, installation, and management of electronic access control systems including biometrics and key card systems.",
    features: ["Biometric Access", "Key Card Systems", "Visitor Management", "Integration Ready"],
  },
  {
    icon: Eye,
    title: "Surveillance Systems",
    description: "Installation and maintenance of advanced CCTV, IP cameras, and integrated security systems.",
    features: ["HD Cameras", "Night Vision", "Remote Access", "Smart Analytics"],
  },
  {
    icon: Radio,
    title: "Alarm Response",
    description: "Rapid response to alarm activations with armed or unarmed officers available 24/7 across our service area.",
    features: ["Fast Response", "24/7 Availability", "Verified Response", "Police Liaison"],
  },
  {
    icon: Dog,
    title: "K-9 Security Units",
    description: "Trained security dogs with handlers for patrol, detection, and high-security applications.",
    features: ["Detection Dogs", "Patrol K-9", "Trained Handlers", "Event Support"],
  },
  {
    icon: Flashlight,
    title: "Loss Prevention",
    description: "Retail security specialists focused on reducing shrinkage, shoplifting, and internal theft.",
    features: ["Undercover Officers", "CCTV Monitoring", "Staff Training", "Investigation Support"],
  },
];

const Services = () => {
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
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
              Our Security Services
            </h1>
            <p className="text-xl text-white/90">
              Comprehensive security solutions tailored to protect your people, property, and assets. 
              From armed guards to advanced surveillance systems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="card-service"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Get Quote
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Need a Custom Security Solution?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Contact us for a free security assessment. Our experts will design 
              a tailored solution for your specific needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="btn-primary-glow">
                  Request Free Assessment
                </Button>
              </Link>
              <a href="#">
                <Button size="lg" variant="outline">
                  <Phone className="mr-2 w-5 h-5" />
                  Call Us Now
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
