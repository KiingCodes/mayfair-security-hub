import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactInfo = [
  { icon: Phone, title: "24/7 Emergency Hotline", value: "Your Number Here", link: "#", accent: true },
  { icon: Phone, title: "General Inquiries", value: "Your Number Here", link: "#" },
  { icon: Mail, title: "Email Us", value: "your@email.com", link: "#" },
  { icon: MessageCircle, title: "WhatsApp", value: "Your Number Here", link: "#" },
  { icon: MapPin, title: "Head Office", value: "Your Address Here" },
  { icon: Clock, title: "Office Hours", value: "Mon-Fri: 8AM-6PM | Emergency: 24/7" },
];

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || null,
        service: formData.service.trim() || null,
        message: formData.message.trim(),
      });

      if (error) throw error;

      // Send email notification (fire and forget)
      supabase.functions.invoke("send-notification", {
        body: {
          type: "contact",
          data: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            company: formData.company.trim(),
            service: formData.service.trim(),
            message: formData.message.trim(),
          },
        },
      });

      toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", phone: "", company: "", service: "", message: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 gradient-hero relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">Contact Us</h1>
            <p className="text-xl text-white/90">Get in touch for a free security consultation. Our team is available 24/7 to answer your questions.</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl font-heading font-bold mb-4">Get In Touch</h2>
                <p className="text-muted-foreground">Whether you need immediate security assistance or want to discuss a custom solution, we're here to help.</p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    className={`rounded-xl p-6 ${info.accent ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <info.icon className={`w-8 h-8 mb-3 ${info.accent ? '' : 'text-primary'}`} />
                    <p className={`text-sm ${info.accent ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>{info.title}</p>
                    {info.link ? (
                      <a href={info.link} className="font-semibold hover:underline">{info.value}</a>
                    ) : (
                      <p className="font-semibold text-sm">{info.value}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-muted rounded-2xl p-8">
                <h3 className="text-2xl font-heading font-bold mb-6">Request a Quote</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" required maxLength={100} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required maxLength={255} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" required maxLength={20} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" maxLength={100} value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="service">Service Required</Label>
                    <Input id="service" maxLength={200} placeholder="e.g., Armed Guards, Mobile Patrol, Event Security" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" rows={4} required maxLength={1000} placeholder="Tell us about your security needs..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>

                  <Button type="submit" size="lg" className="w-full btn-primary-glow" disabled={submitting}>
                    <Send className="mr-2 w-5 h-5" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Area Map */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Our Service Areas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We provide security services across the metropolitan area and surrounding regions. Contact us to confirm coverage in your area.</p>
          </motion.div>

          <motion.div className="bg-background rounded-2xl p-8" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="bg-secondary rounded-xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-20 h-20 text-primary mx-auto mb-4" />
                <p className="text-xl font-heading font-bold mb-2">Interactive Map</p>
                <p className="text-muted-foreground mb-4">50+ Service Locations</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Downtown", "Midtown", "Suburbs", "Industrial", "Commercial", "Residential"].map((area) => (
                    <span key={area} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">{area}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
