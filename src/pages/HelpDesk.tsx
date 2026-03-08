import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle, MessageSquare, Search, Send, ChevronDown, ChevronUp,
  Clock, CheckCircle2, AlertCircle, Plus, ArrowLeft, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import bgContact from "@/assets/bg-contact.jpg";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing & Invoices" },
  { value: "technical", label: "Technical Issue" },
  { value: "guards", label: "Guard Services" },
  { value: "emergency", label: "Emergency" },
  { value: "contracts", label: "Contracts" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  open: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: AlertCircle },
  in_progress: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  resolved: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  closed: { color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
};

const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-600",
  high: "bg-amber-500/10 text-amber-600",
  urgent: "bg-destructive/10 text-destructive",
};

const HelpDesk = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("faq");
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "general", priority: "medium", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFaqs();
    if (user) fetchTickets();
  }, [user]);

  useEffect(() => {
    if (!selectedTicket) return;
    fetchMessages(selectedTicket.id);

    const channel = supabase
      .channel(`ticket-messages-${selectedTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchFaqs = async () => {
    const { data } = await supabase.from("faq_articles").select("*").eq("published", true).order("sort_order");
    if (data) setFaqs(data);
  };

  const fetchTickets = async () => {
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (data) setTickets(data);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticketId).order("created_at");
    if (data) setMessages(data);
  };

  const handleSubmitTicket = async () => {
    if (!user || !ticketForm.subject || !ticketForm.message) return;
    setSubmitting(true);
    try {
      const { data: ticket, error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
      }).select().single();
      if (error) throw error;

      await supabase.from("ticket_messages").insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        message: ticketForm.message,
        is_admin: false,
      });

      toast({ title: "Ticket Created", description: "Your support ticket has been submitted." });
      setTicketForm({ subject: "", category: "general", priority: "medium", message: "" });
      setShowNewTicket(false);
      fetchTickets();
      setSelectedTicket(ticket);
      setActiveTab("tickets");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        message: newMessage.trim(),
        is_admin: false,
      });
      if (error) throw error;
      setNewMessage("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSendingMessage(false);
  };

  const filteredFaqs = faqs.filter(
    f => f.question.toLowerCase().includes(faqSearch.toLowerCase()) || f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const faqCategories = [...new Set(faqs.map(f => f.category))];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={bgContact} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--charcoal))/0.92] via-[hsl(var(--green-dark))/0.85] to-[hsl(var(--charcoal))/0.88]" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Help & Support</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              Help Desk
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Browse FAQs, submit support tickets, and chat with our team in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 -mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-card border rounded-2xl p-1.5 mb-8 shadow-sm">
            <TabsList className="grid w-full grid-cols-3 gap-1 bg-transparent h-auto">
              {[
                { value: "faq", label: "Knowledge Base", icon: HelpCircle },
                { value: "tickets", label: "My Tickets", icon: MessageSquare },
                { value: "new", label: "New Ticket", icon: Plus },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* FAQ / Knowledge Base */}
          <TabsContent value="faq">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={faqSearch}
                  onChange={e => setFaqSearch(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-16">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {faqSearch ? "No matching articles found." : "No FAQ articles published yet."}
                  </p>
                </div>
              ) : (
                faqCategories.map(cat => {
                  const catFaqs = filteredFaqs.filter(f => f.category === cat);
                  if (catFaqs.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h3 className="text-lg font-heading font-bold capitalize mb-3">{cat}</h3>
                      <div className="space-y-2">
                        {catFaqs.map(faq => (
                          <div key={faq.id} className="bg-card border rounded-xl overflow-hidden">
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                            >
                              <span className="font-medium">{faq.question}</span>
                              {expandedFaq === faq.id ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                            </button>
                            {expandedFaq === faq.id && (
                              <div className="px-4 pb-4 text-muted-foreground text-sm whitespace-pre-wrap border-t pt-3">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          </TabsContent>

          {/* My Tickets */}
          <TabsContent value="tickets">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {!user ? (
                <div className="text-center py-16 bg-card border rounded-2xl">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Please sign in to view your tickets.</p>
                  <Button onClick={() => setActiveTab("new")}>Sign in via Client Portal</Button>
                </div>
              ) : selectedTicket ? (
                /* Chat View */
                <div className="bg-card border rounded-2xl overflow-hidden flex flex-col" style={{ height: "70vh" }}>
                  {/* Chat header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold truncate">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={statusConfig[selectedTicket.status]?.color}>
                          {selectedTicket.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className={priorityColor[selectedTicket.priority]}>
                          {selectedTicket.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.is_admin
                            ? "bg-muted text-foreground rounded-bl-md"
                            : "bg-primary text-primary-foreground rounded-br-md"
                        }`}>
                          {msg.is_admin && <p className="text-xs font-semibold mb-1 opacity-70">Support Team</p>}
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-[10px] opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  {selectedTicket.status !== "closed" && (
                    <div className="p-4 border-t flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="rounded-xl"
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()} className="rounded-xl">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Ticket list */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-heading font-bold">My Support Tickets</h2>
                    <Button onClick={() => setActiveTab("new")} className="rounded-xl">
                      <Plus className="w-4 h-4 mr-2" /> New Ticket
                    </Button>
                  </div>
                  {tickets.length === 0 ? (
                    <div className="text-center py-16 bg-card border rounded-2xl">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No tickets yet. Create one to get help.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {tickets.map(ticket => {
                        const sc = statusConfig[ticket.status] || statusConfig.open;
                        const StatusIcon = sc.icon;
                        return (
                          <button
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className="bg-card border rounded-xl p-4 text-left hover:shadow-md transition-all flex items-center gap-4"
                          >
                            <StatusIcon className="w-5 h-5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{ticket.subject}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {CATEGORIES.find(c => c.value === ticket.category)?.label} · {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Badge variant="outline" className={sc.color}>{ticket.status.replace("_", " ")}</Badge>
                              <Badge variant="outline" className={priorityColor[ticket.priority]}>{ticket.priority}</Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* New Ticket */}
          <TabsContent value="new">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {!user ? (
                <div className="text-center py-16 bg-card border rounded-2xl">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Please sign in to submit a ticket.</p>
                  <p className="text-sm text-muted-foreground">Go to the <a href="/portal" className="text-primary underline">Client Portal</a> to sign in first.</p>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto bg-card border rounded-2xl p-6 md:p-8">
                  <h2 className="text-xl font-heading font-bold mb-6">Submit a Support Ticket</h2>
                  <div className="space-y-5">
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={ticketForm.subject}
                        onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="Brief description of your issue"
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={ticketForm.category} onValueChange={v => setTicketForm(f => ({ ...f, category: v }))}>
                          <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select value={ticketForm.priority} onValueChange={v => setTicketForm(f => ({ ...f, priority: v }))}>
                          <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea
                        value={ticketForm.message}
                        onChange={e => setTicketForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Describe your issue in detail..."
                        rows={6}
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={handleSubmitTicket}
                      disabled={submitting || !ticketForm.subject || !ticketForm.message}
                      className="w-full rounded-xl h-12"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HelpDesk;
