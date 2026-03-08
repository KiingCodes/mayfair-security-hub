import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  UserCheck, Lock, Shield, LogOut, Save, Upload, Camera,
  Phone, Mail, MapPin, Award, AlertTriangle, KeyRound, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const StaffPortal = () => {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { isStaff, isAdmin, loading: roleLoading } = useRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const mustChangePassword = user?.user_metadata?.must_change_password === true;

  const [form, setForm] = useState({
    full_name: "",
    id_number: "",
    phone: "",
    email: "",
    psira_number: "",
    psira_expiry: "",
    skills: "",
    certifications: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    position: "guard",
  });

  useEffect(() => {
    if (user) fetchProfile();
    else setLoadingProfile(false);
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("staff_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setForm({
        full_name: data.full_name || "",
        id_number: data.id_number || "",
        phone: data.phone || "",
        email: data.email || "",
        psira_number: data.psira_number || "",
        psira_expiry: data.psira_expiry || "",
        skills: (data.skills || []).join(", "),
        certifications: (data.certifications || []).join(", "),
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_phone: data.emergency_contact_phone || "",
        emergency_contact_relation: data.emergency_contact_relation || "",
        position: data.position || "guard",
      });
    }
    setLoadingProfile(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(loginData.email, loginData.password);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome!", description: "You're signed in." });
    }
    setSubmitting(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      let photoUrl = profile?.photo_url || "";

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/photo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("staff-photos")
          .upload(path, photoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("staff-photos").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const payload = {
        user_id: user.id,
        full_name: form.full_name,
        id_number: form.id_number,
        phone: form.phone,
        email: form.email || user.email,
        photo_url: photoUrl,
        psira_number: form.psira_number,
        psira_expiry: form.psira_expiry || null,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        emergency_contact_relation: form.emergency_contact_relation,
        position: form.position,
      };

      if (profile) {
        const { error } = await supabase.from("staff_profiles").update(payload).eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("staff_profiles").insert(payload);
        if (error) throw error;
      }

      toast({ title: "Saved", description: "Your profile has been updated." });
      fetchProfile();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  // Not logged in — show login form
  if (!user && !authLoading) {
    return (
      <Layout>
        <section className="py-20 gradient-hero relative">
          <div className="container mx-auto px-4 text-center relative z-10">
            <UserCheck className="w-16 h-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">Staff Portal</h1>
            <p className="text-white/90 text-lg">Secure access for Mayfair Security staff members</p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 max-w-md">
            <div className="bg-muted rounded-2xl p-8">
              <div className="flex justify-center mb-6">
                <img src={logo} alt="Mayfair Security" className="h-20" />
              </div>
              <h2 className="text-xl font-heading font-bold text-center mb-6">Staff Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <Button type="submit" size="lg" className="w-full btn-primary-glow" disabled={submitting}>
                  <Lock className="mr-2 w-5 h-5" />
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Staff accounts are created by your administrator. Contact admin if you don't have access.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Loading
  if (authLoading || roleLoading || loadingProfile) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  // Logged in but not staff/admin — show access denied
  if (user && !isStaff && !isAdmin) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-accent mx-auto mb-6" />
            <h1 className="text-2xl font-heading font-bold mb-4">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              This portal is only for Mayfair Security staff members. If you believe this is an error, contact your administrator.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={signOut}>Sign Out</Button>
              <Link to="/"><Button>Go Home</Button></Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Staff profile form
  return (
    <Layout>
      <section className="py-6 gradient-hero">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-heading font-bold text-white">Staff Portal</h1>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-foreground">
                  <Shield className="mr-2 w-4 h-4" /> Admin Dashboard
                </Button>
              </Link>
            )}
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-foreground" onClick={signOut}>
              <LogOut className="mr-2 w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-2xl p-8">
          <h2 className="text-xl font-heading font-bold mb-6">
            {profile ? "Edit Your Profile" : "Create Your Profile"}
          </h2>

          <div className="space-y-6">
            {/* Photo */}
            <div className="flex items-center gap-6">
              {(profile?.photo_url || photoFile) ? (
                <img
                  src={photoFile ? URL.createObjectURL(photoFile) : profile?.photo_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <Label>Profile Photo</Label>
                <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="mt-1" />
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div>
                <Label>ID Number</Label>
                <Input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={user?.email} />
              </div>
            </div>

            {/* PSIRA */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>PSIRA Registration Number</Label>
                <Input value={form.psira_number} onChange={(e) => setForm({ ...form, psira_number: e.target.value })} />
              </div>
              <div>
                <Label>PSIRA Expiry Date</Label>
                <Input type="date" value={form.psira_expiry} onChange={(e) => setForm({ ...form, psira_expiry: e.target.value })} />
              </div>
            </div>

            {/* Skills & Certs */}
            <div>
              <Label>Skills (comma-separated)</Label>
              <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Armed response, CCTV monitoring, First aid" />
            </div>
            <div>
              <Label>Certifications (comma-separated)</Label>
              <Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="e.g. PSIRA Grade A, First Aid Level 2" />
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" /> Emergency Contact
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} />
                </div>
                <div>
                  <Label>Relation</Label>
                  <Input value={form.emergency_contact_relation} onChange={(e) => setForm({ ...form, emergency_contact_relation: e.target.value })} placeholder="e.g. Spouse, Parent" />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full btn-primary-glow" disabled={submitting || !form.full_name}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
            </Button>
          </div>
        </motion.div>

        {/* Change Password Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border rounded-2xl p-8 mt-6">
          <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Change Password
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
              />
            </div>
            <Button
              onClick={async () => {
                if (passwordData.newPassword.length < 6) {
                  toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
                  return;
                }
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                  toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
                  return;
                }
                setChangingPassword(true);
                const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
                if (error) {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                } else {
                  toast({ title: "Password Updated", description: "Your password has been changed successfully." });
                  setPasswordData({ newPassword: "", confirmPassword: "" });
                }
                setChangingPassword(false);
              }}
              disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              variant="outline"
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default StaffPortal;
