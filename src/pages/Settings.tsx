import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Sun, Moon, Monitor, LogOut,
  Trash2, User, Mail, Building, Phone, MapPin, Save, Shield, Lock
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import EmailPreferences from "@/components/settings/EmailPreferences";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileForm, setProfileForm] = useState({
    company_name: "",
    phone: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Sync profile data into form once loaded
  if (profile && !profileLoaded) {
    setProfileForm({
      company_name: profile.company_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
    });
    setProfileLoaded(true);
  }

  const handleSaveProfile = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: profileForm.company_name || null,
        phone: profileForm.phone || null,
        address: profileForm.address || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    }
    setSubmitting(false);
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("profiles").delete().eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    toast({ title: "Profile Deleted", description: "Your profile has been removed. Signing out..." });
    setDeleteDialog(false);
    setTimeout(() => signOut(), 1500);
    setSubmitting(false);
  };

  if (!user) {
    navigate("/portal");
    return null;
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="py-10 gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SettingsIcon className="w-8 h-8 text-white" />
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">Settings</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-2xl space-y-8">

          {/* Appearance */}
          <motion.div
            className="bg-muted rounded-2xl p-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" /> Appearance
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Choose your preferred theme</p>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <opt.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div
            className="bg-muted rounded-2xl p-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Account
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Manage your profile information</p>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                <Input value={user.email || ""} disabled className="bg-background/50" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
              </div>

              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <Building className="w-3.5 h-3.5" /> Company Name
                </Label>
                <Input
                  value={profileForm.company_name}
                  onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                  placeholder="Your company name"
                />
              </div>

              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </Label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </Label>
                <Input
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Your address"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={submitting} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div
            className="bg-muted rounded-2xl p-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Update your account password</p>
            <div className="space-y-4">
              <div>
                <Label className="mb-1">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>
              <div>
                <Label className="mb-1">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <Button
                className="w-full"
                disabled={submitting || !passwordForm.newPassword || passwordForm.newPassword.length < 6}
                onClick={async () => {
                  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                    toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
                    return;
                  }
                  setSubmitting(true);
                  const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
                  if (error) {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                  } else {
                    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
                    setPasswordForm({ newPassword: "", confirmPassword: "" });
                  }
                  setSubmitting(false);
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                {submitting ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            className="bg-muted rounded-2xl p-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-primary" /> Session
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Sign out of your account on this device</p>
            <Button variant="outline" onClick={signOut} className="w-full">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your profile data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete My Profile
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Your Profile</DialogTitle>
            <DialogDescription>
              This will permanently delete your profile data. You will be signed out. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProfile} disabled={submitting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {submitting ? "Deleting..." : "Delete Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Settings;
