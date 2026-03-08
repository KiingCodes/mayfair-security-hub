import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-center mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl prose prose-lg dark:prose-invert">
          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">1. Introduction</h2>
          <p className="text-muted-foreground mb-6">
            These Terms of Service ("Terms") govern your use of the services provided by Mayfair Security Services (CIPC Registration: K2025/638289/07), a PSIRA-registered private security provider operating in South Africa. By engaging our services or using our website and client portal, you agree to be bound by these Terms.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">2. Services</h2>
          <p className="text-muted-foreground mb-3">Mayfair Security Services provides a range of professional security solutions including but not limited to:</p>
          <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
            <li>Security guarding and armed reaction</li>
            <li>VIP and executive protection</li>
            <li>CCTV monitoring, alarms, and electrical fencing</li>
            <li>Mobile patrol and tactical response</li>
            <li>Event security and access control</li>
            <li>Private investigations and undercover operations</li>
            <li>Security training and tactical training</li>
            <li>Armed escorts and automation solutions</li>
          </ul>
          <p className="text-muted-foreground mb-6">
            All services are rendered in accordance with applicable South African legislation, including the Private Security Industry Regulation Act (PSIRA Act).
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">3. Client Portal & Emergency Alerts</h2>
          <p className="text-muted-foreground mb-6">
            Access to the Client Portal requires a registered account. You are responsible for maintaining the confidentiality of your login credentials. The emergency panic button feature is intended for genuine emergencies only. Misuse of the emergency alert system, including false alarms, may result in service suspension and potential legal action.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">4. Service Agreements</h2>
          <p className="text-muted-foreground mb-6">
            Specific service terms, including scope, duration, pricing, and conditions, are detailed in individual service contracts. These Terms supplement but do not replace the terms of any signed service agreement between Mayfair Security Services and the client.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">5. Client Obligations</h2>
          <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
            <li>Provide accurate and complete information when requesting services</li>
            <li>Ensure safe working conditions for security personnel on your premises</li>
            <li>Make timely payments in accordance with the service agreement</li>
            <li>Report any security concerns or incidents to us promptly</li>
            <li>Not interfere with the duties of assigned security personnel</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">6. Liability</h2>
          <p className="text-muted-foreground mb-6">
            Mayfair Security Services shall not be held liable for losses arising from circumstances beyond our reasonable control, including acts of God, civil unrest, or failure of third-party systems. Our liability is limited to the scope of the contracted services and the terms specified in the service agreement. We maintain appropriate insurance coverage as required by PSIRA regulations.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">7. Cancellation & Termination</h2>
          <p className="text-muted-foreground mb-6">
            Either party may terminate services in accordance with the notice period specified in the service agreement. Early termination may be subject to penalties as outlined in the contract. Mayfair Security Services reserves the right to immediately suspend or terminate services in cases of non-payment, breach of terms, or threats to the safety of our personnel.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">8. Intellectual Property</h2>
          <p className="text-muted-foreground mb-6">
            All content on this website, including logos, text, images, and software, is the property of Mayfair Security Services and is protected by South African intellectual property laws. Unauthorised reproduction or distribution is prohibited.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">9. Governing Law</h2>
          <p className="text-muted-foreground mb-6">
            These Terms are governed by the laws of the Republic of South Africa. Any disputes arising from these Terms shall be subject to the jurisdiction of the South African courts.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">10. Changes to Terms</h2>
          <p className="text-muted-foreground mb-6">
            We reserve the right to update these Terms at any time. Changes will be effective upon posting on our website. Continued use of our services after changes constitutes acceptance of the updated Terms.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">11. Contact Us</h2>
          <p className="text-muted-foreground mb-6">
            For questions regarding these Terms, please contact us:<br />
            <strong>Phone:</strong> 068 921 3188<br />
            <strong>WhatsApp:</strong> 062 668 5754<br />
            <strong>Website:</strong> www.mayfairsecurity1.co.za
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
