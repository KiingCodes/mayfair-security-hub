
-- Invoices table: admin creates invoices for clients
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  invoice_number text NOT NULL,
  description text,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid',
  due_date date,
  file_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete invoices" ON public.invoices
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Client contracts table: admin uploads contracts for clients
CREATE TABLE public.client_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.client_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own contracts" ON public.client_contracts
  FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert contracts" ON public.client_contracts
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete contracts" ON public.client_contracts
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Guard requests table: clients can request additional guards
CREATE TABLE public.guard_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  location text NOT NULL,
  date_needed date NOT NULL,
  time_needed text,
  duration text NOT NULL DEFAULT '8 hours',
  num_guards integer NOT NULL DEFAULT 1,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.guard_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guard requests" ON public.guard_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert guard requests" ON public.guard_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update guard requests" ON public.guard_requests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guard_requests_updated_at BEFORE UPDATE ON public.guard_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
