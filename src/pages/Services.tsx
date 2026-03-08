import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, Users, Camera, Car, UserCheck, AlertTriangle, 
  Building, Lock, Eye, Radio, Dog, Flashlight, 
  ChevronRight, CheckCircle, Phone, Crosshair, Search,
  Zap, GraduationCap, Truck, Target, Cog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import bgServices from "@/assets/bg-services.jpg";

const services = [
  {
    icon: Shield,
    title: "Security Guarding",
    description: "Professional uniformed security officers for access control, monitoring, and protection at commercial, residential, and industrial properties.",
    features: ["24/7 Availability", "Background Verified", "First Aid Certified", "Patrol Trained"],
  },
  {
    icon: Crosshair,
    title: "Armed Reaction",
    description: "Rapid armed response teams on standby to respond to alarms, panic signals, and security breaches within minutes.",
    features: ["Rapid Response", "Armed Officers", "GPS Dispatched", "24/7 Coverage"],
  },
  {
    icon: UserCheck,
    title: "VIP Protection",
    description: "Close protection services for VIPs, executives, dignitaries, and high-net-worth individuals by former military and law enforcement professionals.",
    features: ["Risk Assessment", "Secure Transport", "Travel Security", "Discreet Service"],
  },
  {
    icon: Search,
    title: "Investigations",
    description: "Private investigation services including corporate fraud, background checks, surveillance, and forensic investigations by licensed investigators.",
    features: ["Corporate Fraud", "Background Checks", "Surveillance", "Forensic Analysis"],
  },
  {
    icon: Camera,
    title: "CCTV & Alarms",
    description: "Design, installation, and 24/7 remote monitoring of CCTV systems and alarm systems from our state-of-the-art control room.",
    features: ["Live Monitoring", "HD Cameras", "Cloud Recording", "Instant Alerts"],
  },
  {
    icon: Building,
    title: "Special Events",
    description: "Comprehensive security for concerts, corporate events, weddings, festivals, and public gatherings of any size with crowd management expertise.",
    features: ["Crowd Management", "Access Control", "Emergency Planning", "VIP Handling"],
  },
  {
    icon: Zap,
    title: "Electrical Fencing",
    description: "Supply, installation, and maintenance of electric fencing systems for perimeter protection of residential, commercial, and industrial properties.",
    features: ["Perimeter Protection", "Energizer Systems", "Alarm Integration", "Maintenance Plans"],
  },
  {
    icon: Cog,
    title: "Automation",
    description: "Smart gate automation, garage door motors, access control systems, and integrated security automation for modern properties.",
    features: ["Gate Motors", "Garage Automation", "Biometric Access", "Smart Integration"],
  },
  {
    icon: GraduationCap,
    title: "Security Training",
    description: "PSIRA-accredited security training courses for individuals and organizations including grades A–E, firearm competency, and specialized skills.",
    features: ["PSIRA Accredited", "Grades A–E", "Firearm Training", "Certification"],
  },
  {
    icon: Target,
    title: "Tactical Training",
    description: "Advanced tactical training programs for security professionals, law enforcement, and private clients including combat readiness and scenario-based drills.",
    features: ["Combat Readiness", "Scenario Drills", "Firearm Proficiency", "Team Tactics"],
  },
  {
    icon: Truck,
    title: "Armed Escorts",
    description: "Armed escort and convoy protection services for high-value cargo, cash-in-transit, VIP motorcades, and sensitive logistics operations.",
    features: ["Cash-in-Transit", "Convoy Protection", "Route Planning", "Armed Personnel"],
  },
  {
    icon: Eye,
    title: "Undercover Operations",
    description: "Covert operatives deployed for internal theft investigations, workplace surveillance, corporate intelligence, and loss prevention.",
    features: ["Covert Agents", "Internal Theft", "Corporate Intel", "Loss Prevention"],
  },
  {
    icon: AlertTriangle,
    title: "Tactical Response",
    description: "Elite tactical response unit for high-threat situations including hostage scenarios, armed confrontations, and critical incident management.",
    features: ["Rapid Deployment", "High-Threat Trained", "Crisis Management", "Police Liaison"],
  },
  {
    icon: Car,
    title: "Mobile Patrol Services",
    description: "GPS-tracked patrol vehicles conducting random and scheduled patrols of your property with real-time reporting and alarm response.",
    features: ["GPS Tracking", "Randomized Routes", "Instant Reporting", "Alarm Response"],
  },
  {
    icon: Lock,
    title: "Access Control Systems",
    description: "Design, installation, and management of electronic access control systems including biometrics, key cards, and visitor management.",
    features: ["Biometric Access", "Key Card Systems", "Visitor Management", "Integration Ready"],
  },
  {
    icon: Dog,
    title: "K-9 Security Units",
    description: "Trained security dogs with handlers for patrol, detection, and high-security applications at events and facilities.",
    features: ["Detection Dogs", "Patrol K-9", "Trained Handlers", "Event Support"],
  },
  {
    icon: Radio,
    title: "Risk Assessment & Consulting",
    description: "Professional security audits, vulnerability assessments, and customized security planning by certified industry experts.",
    features: ["Site Surveys", "Threat Analysis", "Security Planning", "Compliance Review"],
  },
];

const Services = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={bgServices} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--charcoal))/0.88] via-[hsl(var(--green-dark))/0.82] to-[hsl(var(--charcoal))/0.9]" />
        </div>
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
              <a href="tel:+27689213188">
                <Button size="lg" variant="outline">
                  <Phone className="mr-2 w-5 h-5" />
                  Call 068 921 3188
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
