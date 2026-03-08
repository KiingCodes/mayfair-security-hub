import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Send, Plus, Trash2, Save, Edit, ArrowLeft, CheckCircle2,
  Clock, AlertCircle, HelpCircle, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing & Invoices" },
  { value: "technical", label: "Technical Issue" },
  { value: "guards", label: "Guard Services" },
  { value: "emergency", label: "Emergency" },
  { value: "contracts", label: "Contracts" },
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

const AdminHelpDesk = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subTab, setSubTab] = useState("tickets");

  // Tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FAQ state
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqDialog, setFaqDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "general", published: true });
  const [savingFaq, setSavingFaq] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchFaqs();

    const channel = supabase
      .channel("admin-tickets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => fetchTickets())
      .on("postgres_changes", { event: "*", schema: "public", table: "ticket_messages" }, () => {
        if (selectedTicket) fetchMessages(selectedTicket.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;
    fetchMessages(selectedTicket.id);

    const channel = supabase
      .channel(`admin-chat-${selectedTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTickets = async () => {
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (data) setTickets(data);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticketId).order("created_at");
    if (data) setMessages(data);
  };

  const fetchFaqs = async () => {
    const { data } = await supabase.from("faq_articles").select("*").order("sort_order");
    if (data) setFaqs(data);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        message: newMessage.trim(),
        is_admin: true,
      });
      if (error) throw error;

      // Auto-update status to in_progress if it was open
      if (selectedTicket.status === "open") {
        await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", selectedTicket.id);
        setSelectedTicket((t: any) => ({ ...t, status: "in_progress" }));
        fetchTickets();
      }
      setNewMessage("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSendingMessage(false);
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    const { error } = await supabase.from("support_tickets").update({ status }).eq("id", ticketId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Ticket marked as ${status.replace("_", " ")}.` });
      if (selectedTicket?.id === ticketId) setSelectedTicket((t: any) => ({ ...t, status }));
      fetchTickets();
    }
  };

  // FAQ CRUD
  const openFaqDialog = (faq?: any) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category, published: faq.published });
    } else {
      setEditingFaq(null);
      setFaqForm({ question: "", answer: "", category: "general", published: true });
    }
    setFaqDialog(true);
  };

  const handleSaveFaq = async () => {
    if (!faqForm.question || !faqForm.answer) return;
    setSavingFaq(true);
    try {
      if (editingFaq) {
        const { error } = await supabase.from("faq_articles").update(faqForm).eq("id", editingFaq.id);
        if (error) throw error;
        toast({ title: "Updated", description: "FAQ article updated." });
      } else {
        const { error } = await supabase.from("faq_articles").insert(faqForm);
        if (error) throw error;
        toast({ title: "Created", description: "FAQ article added." });
      }
      setFaqDialog(false);
      fetchFaqs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSavingFaq(false);
  };

  const deleteFaq = async (id: string) => {
    const { error } = await supabase.from("faq_articles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "FAQ article removed." });
      fetchFaqs();
    }
  };

  const filteredTickets = statusFilter === "all" ? tickets : tickets.filter(t => t.status === statusFilter);

  return (
    <div className="space-y-6">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="tickets" className="gap-1.5"><MessageSquare className="w-4 h-4" /> Tickets ({tickets.filter(t => t.status === "open" || t.status === "in_progress").length})</TabsTrigger>
          <TabsTrigger value="faq" className="gap-1.5"><HelpCircle className="w-4 h-4" /> FAQ Articles ({faqs.length})</TabsTrigger>
        </TabsList>

        {/* Tickets Management */}
        <TabsContent value="tickets">
          {selectedTicket ? (
            <div className="bg-card border rounded-2xl overflow-hidden flex flex-col" style={{ height: "65vh" }}>
              <div className="p-4 border-b flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold truncate">{selectedTicket.subject}</h3>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORIES.find(c => c.value === selectedTicket.category)?.label} · {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Select value={selectedTicket.status} onValueChange={v => updateTicketStatus(selectedTicket.id, v)}>
                  <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.is_admin
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {!msg.is_admin && <p className="text-xs font-semibold mb-1 opacity-70">Client</p>}
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-[10px] opacity-50 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Reply to client..."
                  className="rounded-xl"
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()} className="rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tickets</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">{filteredTickets.length} tickets</span>
              </div>

              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 bg-card border rounded-2xl">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No tickets found.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredTickets.map(ticket => {
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
        </TabsContent>

        {/* FAQ Management */}
        <TabsContent value="faq">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold">FAQ Articles</h3>
              <Button onClick={() => openFaqDialog()} className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add Article
              </Button>
            </div>

            {faqs.length === 0 ? (
              <div className="text-center py-12 bg-card border rounded-2xl">
                <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No FAQ articles yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map(faq => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium max-w-xs truncate">{faq.question}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{faq.category}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={faq.published ? "default" : "outline"}>
                            {faq.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openFaqDialog(faq)}><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteFaq(faq.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* FAQ Dialog */}
      <Dialog open={faqDialog} onOpenChange={setFaqDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingFaq ? "Edit FAQ Article" : "Add FAQ Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input
                value={faqForm.question}
                onChange={e => setFaqForm(f => ({ ...f, question: e.target.value }))}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                value={faqForm.answer}
                onChange={e => setFaqForm(f => ({ ...f, answer: e.target.value }))}
                rows={5}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={faqForm.category} onValueChange={v => setFaqForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch checked={faqForm.published} onCheckedChange={v => setFaqForm(f => ({ ...f, published: v }))} />
                <Label>{faqForm.published ? "Published" : "Draft"}</Label>
              </div>
            </div>
            <Button onClick={handleSaveFaq} disabled={savingFaq || !faqForm.question || !faqForm.answer} className="w-full rounded-xl">
              <Save className="w-4 h-4 mr-2" />
              {savingFaq ? "Saving..." : editingFaq ? "Update Article" : "Add Article"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHelpDesk;
