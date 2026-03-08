import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Password Updated!", description: "You can now sign in with your new password." });
      setTimeout(() => navigate("/portal"), 2000);
    }
    setSubmitting(false);
  };

  if (!isRecovery && !success) {
    return (
      <Layout>
        <section className="py-32">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Invalid or expired reset link. Please request a new password reset.</p>
            <Button className="mt-4" onClick={() => navigate("/portal")}>Go to Portal</Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-muted rounded-2xl p-8">
              {success ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-heading font-bold mb-2">Password Updated!</h2>
                  <p className="text-muted-foreground">Redirecting to portal...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-heading font-bold text-center mb-6">Set New Password</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="password">New Password</Label>
                      <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <Button type="submit" size="lg" className="w-full btn-primary-glow" disabled={submitting}>
                      <Lock className="mr-2 w-5 h-5" />
                      {submitting ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
