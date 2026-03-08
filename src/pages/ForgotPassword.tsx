import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Email Sent!", description: "Check your inbox for the reset link." });
    }
    setSubmitting(false);
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-muted rounded-2xl p-8">
              {sent ? (
                <div className="text-center">
                  <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-heading font-bold mb-2">Check Your Email</h2>
                  <p className="text-muted-foreground">We've sent a password reset link to <strong>{email}</strong></p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-heading font-bold text-center mb-6">Forgot Password</h2>
                  <p className="text-muted-foreground text-center mb-6">Enter your email and we'll send you a reset link.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <Button type="submit" size="lg" className="w-full btn-primary-glow" disabled={submitting}>
                      <Mail className="mr-2 w-5 h-5" />
                      {submitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                </>
              )}
              <div className="mt-6 text-center">
                <a href="/portal" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPassword;
