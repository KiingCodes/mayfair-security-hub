import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, Users, Award, Target, Clock, Globe,
  CheckCircle, ChevronRight, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import logo from "@/assets/logo.png";

const values = [
  { icon: Shield, title: "Integrity", description: "We uphold the highest ethical standards in all our operations." },
  { icon: Users, title: "Professionalism", description: "Our team maintains professional conduct at all times." },
  { icon: Target, title: "Excellence", description: "We strive for excellence in every service we provide." },
  { icon: Clock, title: "Reliability", description: "Count on us 24/7, 365 days a year without fail." },
];

const certifications = [
  { name: "PSIRA Registered", description: "Private Security Industry Regulatory Authority" },
  { name: "K2025/638289/07", description: "CIPC Registration Number" },
  { name: "SIA Approved", description: "Security Industry Authority Licensed" },
  { name: "ACS Pacesetters", description: "Approved Contractor Scheme" },
  { name: "SafeContractor", description: "Health & Safety Accredited" },
];

const timeline: { year: string; event: string }[] = [];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 gradient-hero relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
                About Mayfair Security Services
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Think Ahead, Protect Smarter. A dedicated security partner 
                committed to earning your trust from day one.
              </p>
              <p className="text-white/80">
                Mayfair Security Services is built on a foundation of integrity, 
                professionalism, and a genuine passion for protecting what matters most. 
                Our team brings years of hands-on experience and a hunger to prove 
                ourselves with every client we serve.
              </p>
            </motion.div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img src={logo} alt="Mayfair Security" className="w-72 h-auto" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="bg-muted rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Target className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-2xl font-heading font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To earn the trust of every client through transparent, reliable, and 
                affordable security solutions. We believe that exceptional service isn't 
                built overnight — it's proven through consistent dedication and results.
              </p>
            </motion.div>
            <motion.div
              className="bg-muted rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Globe className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-2xl font-heading font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                To grow into a trusted name in security by putting our clients first, 
                embracing modern technology, and building long-lasting relationships 
                founded on accountability and excellence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Our Core Values</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="bg-background rounded-xl p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {timeline.length > 0 && <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Our Journey</h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                className="flex gap-6 mb-8 last:mb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-heading font-bold text-primary text-lg">{item.year}</span>
                </div>
                <div className="relative flex-shrink-0">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  {index !== timeline.length - 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-border" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-foreground">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>}

      {/* Certifications */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Certifications & Compliance
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We maintain the highest industry standards and certifications to ensure 
              quality, safety, and compliance in all our operations.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                className="bg-background rounded-xl p-6 flex items-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Award className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-bold">{cert.name}</h4>
                  <p className="text-muted-foreground text-sm">{cert.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Give us the opportunity to earn your trust. Let Mayfair Security Services 
              be your dedicated security partner from the start.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="btn-primary-glow">
                  Get Started Today
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/careers">
                <Button size="lg" variant="outline">
                  Join Our Team
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
