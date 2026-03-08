import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, Lock, Eye, FileText, Users, Download,
  ChevronRight, LogOut, LayoutDashboard, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import logo from "@/assets/logo.png";
import ClientDashboard from "@/components/portal/ClientDashboard";

const portalFeatures = [
  { icon: FileText, title: "View Invoices", description: "Access and download all your invoices" },
  { icon: Eye, title: "Patrol Reports", description: "Real-time patrol activity reports" },
  { icon: Download, title: "Download Contracts", description: "Access your service agreements" },
  { icon: Users, title: "Request Guards", description: "Request additional security personnel" },
];

const ClientPortal = () => {
  const { toast } = useToast();
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { isAdmin } = useRole();
  const [isLogin, setIsLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back!", description: "You're now signed in." });
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(formData.email, formData.password, formData.company);
      if (error) {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account Created!", description: "You're now signed in." });
      }
    }
    setSubmitting(false);
  };

  // If user is logged in, show dashboard
  if (user) {
    return (
      <Layout>
        <section className="py-8 gradient-hero">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-heading font-bold text-white">Client Dashboard</h1>
            </div>
            <Link to="/settings">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-foreground">
                <Settings className="mr-2 w-4 h-4" /> Settings
              </Button>
            </Link>
          </div>
        </section>
        {isAdmin && (
          <section className="container mx-auto px-4 -mt-4 mb-6">
            <Link to="/admin">
              <motion.div
                className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-primary via-primary/90 to-accent shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--accent)/0.3),transparent_60%)]" />
                <div className="relative flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10">
                    <LayoutDashboard className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-black text-lg text-primary-foreground tracking-tight">Admin Dashboard</h3>
                    <p className="text-sm text-primary-foreground/80">Manage clients, staff, gallery & system settings</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center group-hover:bg-primary-foreground/25 transition-colors">
                    <ChevronRight className="w-5 h-5 text-primary-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </section>
        )}
        <ClientDashboard />
      </Layout>
    );
  }

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
                    Register
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
                      minLength={6}
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
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full btn-primary-glow" disabled={submitting}>
                    <Lock className="mr-2 w-5 h-5" />
                    {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ClientPortal;
