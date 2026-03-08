import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, MapPin, Clock, DollarSign, Upload, 
  CheckCircle, ChevronRight, GraduationCap, Shield, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

const jobs = [
  {
    title: "Armed Security Officer",
    location: "Multiple Locations",
    type: "Full-time",
    salary: "$45,000 - $60,000",
    requirements: ["Valid firearms license", "3+ years experience", "Clean background", "First aid certified"],
  },
  {
    title: "Unarmed Security Guard",
    location: "Downtown District",
    type: "Full-time / Part-time",
    salary: "$35,000 - $45,000",
    requirements: ["Security license", "High school diploma", "Good communication", "Reliable transport"],
  },
  {
    title: "Mobile Patrol Officer",
    location: "City-wide",
    type: "Full-time",
    salary: "$40,000 - $50,000",
    requirements: ["Valid driver's license", "Security experience", "GPS proficient", "Night shift availability"],
  },
  {
    title: "Event Security Specialist",
    location: "Various Venues",
    type: "Part-time / Contract",
    salary: "$20 - $30/hour",
    requirements: ["Crowd management experience", "Flexible schedule", "Physical fitness", "Team player"],
  },
  {
    title: "Control Room Operator",
    location: "Head Office",
    type: "Full-time",
    salary: "$38,000 - $48,000",
    requirements: ["CCTV monitoring experience", "Computer literate", "Attention to detail", "Shift work"],
  },
  {
    title: "Executive Protection Agent",
    location: "As Assigned",
    type: "Full-time",
    salary: "$60,000 - $80,000",
    requirements: ["5+ years EP experience", "Military/law enforcement background", "Defensive driving", "Passport ready"],
  },
];

const benefits = [
  "Competitive salary packages",
  "Health & dental insurance",
  "Paid training programs",
  "Career advancement opportunities",
  "Uniform provided",
  "Overtime pay",
  "Performance bonuses",
  "Retirement benefits",
];

const trainingInfo = [
  { title: "Basic Security Training", duration: "40 hours", description: "Fundamentals of security operations, legal aspects, and customer service." },
  { title: "Advanced Tactical Training", duration: "80 hours", description: "Threat assessment, defensive techniques, and emergency response." },
  { title: "Firearms Certification", duration: "60 hours", description: "Safe handling, marksmanship, and legal use of firearms." },
  { title: "First Aid & CPR", duration: "16 hours", description: "Emergency medical response and life-saving techniques." },
];

const Careers = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and contact you soon.",
    });
    setFormData({ name: "", email: "", phone: "", position: "", experience: "", message: "" });
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
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
              Join Our Security Team
            </h1>
            <p className="text-xl text-white/90">
              Build a rewarding career protecting people and property. We're looking for 
              dedicated professionals to join our growing team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-semibold uppercase tracking-wider">Why Join Us</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2 mb-6">
                A Career You Can Be Proud Of
              </h2>
              <p className="text-muted-foreground mb-8">
                At Mayfair Security Services, we invest in our people. Join a team that 
                values professionalism, provides excellent training, and offers real 
                opportunities for advancement.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                <Users className="w-10 h-10 mb-4" />
                <p className="text-3xl font-bold">1,200+</p>
                <p className="text-primary-foreground/80">Team Members</p>
              </div>
              <div className="bg-muted rounded-2xl p-6">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <p className="text-3xl font-bold">15+</p>
                <p className="text-muted-foreground">Years Experience</p>
              </div>
              <div className="bg-muted rounded-2xl p-6">
                <GraduationCap className="w-10 h-10 text-primary mb-4" />
                <p className="text-3xl font-bold">100%</p>
                <p className="text-muted-foreground">Paid Training</p>
              </div>
              <div className="bg-charcoal rounded-2xl p-6 text-white">
                <Briefcase className="w-10 h-10 mb-4" />
                <p className="text-3xl font-bold">500+</p>
                <p className="text-white/80">Job Sites</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Open Positions</h2>
            <p className="text-muted-foreground mt-2">Find your next career opportunity</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job.title}
                className="bg-background rounded-xl p-6 border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <h3 className="font-heading font-bold text-lg mb-4">{job.title}</h3>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <DollarSign className="w-4 h-4" />
                    {job.salary}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Requirements:</p>
                  <ul className="text-xs space-y-1">
                    {job.requirements.map((req) => (
                      <li key={req} className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full mt-4 btn-primary-glow" onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Apply Now
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Training */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold uppercase tracking-wider">Training Programs</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2">
              Professional Development
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              All new hires receive comprehensive paid training. We invest in your success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainingInfo.map((training, index) => (
              <motion.div
                key={training.title}
                className="bg-muted rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GraduationCap className="w-10 h-10 text-primary mb-4" />
                <h4 className="font-heading font-bold mb-2">{training.title}</h4>
                <p className="text-sm text-primary font-semibold mb-2">{training.duration}</p>
                <p className="text-sm text-muted-foreground">{training.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-heading font-bold">Apply Now</h2>
              <p className="text-muted-foreground mt-2">
                Submit your application and we'll be in touch
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-background rounded-2xl p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position Applying For *</Label>
                  <Input
                    id="position"
                    required
                    placeholder="e.g., Armed Security Officer"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  placeholder="e.g., 3 years in security"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="message">Additional Information</Label>
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Tell us about yourself and why you want to join our team..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Upload your CV/Resume</p>
                <p className="text-xs text-muted-foreground mb-4">PDF, DOC, DOCX (Max 5MB)</p>
                <Button type="button" variant="outline">
                  Select File
                </Button>
              </div>

              <Button type="submit" size="lg" className="w-full btn-primary-glow">
                Submit Application
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
