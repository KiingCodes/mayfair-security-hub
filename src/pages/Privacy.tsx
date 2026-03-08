import Layout from "@/components/Layout";

const Privacy = () => {
  return (
    <Layout>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-center mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl prose prose-lg dark:prose-invert">
          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">1. Introduction</h2>
          <p className="text-muted-foreground mb-6">
            Mayfair Security Services (CIPC Registration: K2025/638289/07), a PSIRA-registered security provider, is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA) of South Africa. This Privacy Policy explains how we collect, use, store, and protect your personal data.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">2. Information We Collect</h2>
          <p className="text-muted-foreground mb-3">We may collect the following personal information:</p>
          <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
            <li>Full name, contact number, and email address</li>
            <li>Physical and postal address</li>
            <li>Company or business name</li>
            <li>Identity or passport numbers (for employment and vetting purposes)</li>
            <li>CCTV footage and access control data at secured premises</li>
            <li>Location data from guard tracking and mobile patrol systems</li>
            <li>Emergency alert details including location and incident type</li>
            <li>Job application information including CVs and qualifications</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
            <li>To provide and manage security services as contracted</li>
            <li>To respond to emergency alerts and panic button activations</li>
            <li>To communicate with clients regarding service updates and incidents</li>
            <li>To process job applications and manage employee records</li>
            <li>To comply with legal and regulatory obligations including PSIRA requirements</li>
            <li>To improve our services and client experience</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">4. Data Sharing</h2>
          <p className="text-muted-foreground mb-6">
            We do not sell or rent your personal information. We may share data with law enforcement agencies when required by law, with emergency services during active incidents, and with regulatory bodies such as PSIRA for compliance purposes. Third-party service providers who assist in delivering our services are bound by confidentiality agreements.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">5. Data Security</h2>
          <p className="text-muted-foreground mb-6">
            We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. This includes encrypted data storage, secure access controls, and regular security audits of our digital systems.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">6. Data Retention</h2>
          <p className="text-muted-foreground mb-6">
            Personal information is retained only for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable legislation. CCTV footage is typically retained for 30 days unless required for investigation purposes.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">7. Your Rights</h2>
          <p className="text-muted-foreground mb-3">Under POPIA, you have the right to:</p>
          <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
            <li>Request access to your personal information held by us</li>
            <li>Request correction or deletion of your personal data</li>
            <li>Object to the processing of your personal information</li>
            <li>Lodge a complaint with the Information Regulator</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">8. Cookies & Analytics</h2>
          <p className="text-muted-foreground mb-6">
            Our website may use cookies and analytics tools to improve user experience and monitor site performance. You can manage cookie preferences through your browser settings.
          </p>

          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">9. Contact Us</h2>
          <p className="text-muted-foreground mb-6">
            For any privacy-related queries or requests, please contact us:<br />
            <strong>Phone:</strong> 068 921 3188<br />
            <strong>WhatsApp:</strong> 062 668 5754<br />
            <strong>Website:</strong> www.mayfairsecurity1.co.za
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
