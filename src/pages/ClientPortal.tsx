import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, Lock, Eye, FileText, Users, Download,
  ChevronRight, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const portalFeatures = [
  { icon: FileText, title: "View Invoices", description: "Access and download all your invoices" },
  { icon: Eye, title: "Patrol Reports", description: "Real-time patrol activity reports" },
  { icon: Download, title: "Download Contracts", description: "Access your service agreements" },
  { icon: Users, title: "Request Guards", description: "Request additional security personnel" },
];

const ClientPortal = () => {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      toast({
        title: "Login Feature",
        description: "Client portal login requires backend integration. Contact us for access.",
      });
    } else {
      toast({
        title: "Registration Request Sent",
        description: "We'll set up your portal access within 24 hours.",
      });
    }
  };

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
            <Shield className="w-16 h-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
              Client Portal
            </h1>
            <p className="text-xl text-white/90">
              Access your secure dashboard to manage invoices, view reports, 
              and request services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Login/Register */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold mb-8">
                Everything You Need in One Place
              </h2>
              <div className="space-y-6">
                {portalFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="flex items-start gap-4 bg-muted rounded-xl p-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-accent/10 rounded-xl border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">New client?</strong> Contact us to set up your 
                  portal access. Existing clients should have received login credentials via email.
                </p>
                <Link to="/contact" className="inline-flex items-center text-primary font-semibold text-sm mt-2">
                  Contact Support <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-muted rounded-2xl p-8">
                <div className="flex justify-center mb-6">
                  <img src={logo} alt="Mayfair Security" className="h-20" />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      isLogin ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      !isLogin ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                    onClick={() => setIsLogin(false)}
                  >
                    Request Access
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  {!isLogin && (
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  )}

                  {isLogin && (
                    <div className="text-right">
                      <a href="#" className="text-sm text-primary hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full btn-primary-glow">
                    <Lock className="mr-2 w-5 h-5" />
                    {isLogin ? 'Sign In' : 'Request Access'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>Need help? Contact us at</p>
                  <a href="mailto:support@mayfairsecurity.com" className="text-primary font-semibold">
                    support@mayfairsecurity.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ClientPortal;
