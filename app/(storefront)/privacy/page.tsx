import type { Metadata } from "next";

import { LegalSection as Section } from "@/components/legal/legal-section";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl tracking-wide text-foreground sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: 30 August 2026</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        At <strong className="text-foreground">KYSneakers.nl</strong>, we respect your privacy and are
        committed to protecting your personal data.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This Privacy Policy explains what personal information we collect, why we collect it, how we use
        it, how we protect it, and what rights you have under applicable privacy laws, including the{" "}
        <strong className="text-foreground">General Data Protection Regulation (GDPR/AVG)</strong>.
      </p>

      <Section title="1. Who We Are">
        <p>The data controller responsible for your personal data is:</p>
        <dl className="mt-2 space-y-1">
          <div><dt className="inline font-medium text-foreground">Business name: </dt><dd className="inline">KYSneakers &amp; clothing</dd></div>
          <div><dt className="inline font-medium text-foreground">Trading name: </dt><dd className="inline">KYSneakers &amp; clothing</dd></div>
          <div><dt className="inline font-medium text-foreground">Website: </dt><dd className="inline">kysneakers.nl</dd></div>
          <div><dt className="inline font-medium text-foreground">Business address: </dt><dd className="inline">Woutertje Pietersestraat 27 1, 1061DE Amsterdam</dd></div>
          <div><dt className="inline font-medium text-foreground">Email: </dt><dd className="inline">support@kysneakers.nl</dd></div>
          <div><dt className="inline font-medium text-foreground">Chamber of Commerce (KVK): </dt><dd className="inline">42139127</dd></div>
          <div><dt className="inline font-medium text-foreground">VAT Number: </dt><dd className="inline">NL005527539B30</dd></div>
        </dl>
      </Section>

      <Section title="2. Personal Data We Collect">
        <p>Depending on how you use our website, we may collect the following information:</p>
        <p className="font-medium text-foreground">Information you provide directly</p>
        <p>When you create an account, place an order, contact us or use certain features of the website, we may collect:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Full name</li>
          <li>Billing address</li>
          <li>Delivery address</li>
          <li>Email address</li>
          <li>Telephone number</li>
          <li>Account login information</li>
          <li>Order history</li>
          <li>Products purchased</li>
          <li>Information provided when contacting customer support</li>
        </ul>
        <p className="font-medium text-foreground">Payment information</p>
        <p>Payments may be processed through third-party payment providers.</p>
        <p>Where applicable, payment providers process payment information directly. KYSneakers does not need to store your complete payment card details to process your order.</p>
        <p>The information processed may include payment status, transaction reference and other information necessary to confirm and manage your payment.</p>
      </Section>

      <Section title="3. Information Collected Automatically">
        <p>When you visit KYSneakers.nl, certain technical information may be collected automatically, such as:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>IP address</li>
          <li>Browser type</li>
          <li>Device type</li>
          <li>Operating system</li>
          <li>Pages visited</li>
          <li>Date and time of visits</li>
          <li>Website interactions</li>
          <li>Referring website</li>
          <li>Technical information relating to website performance and security</li>
        </ul>
        <p>This information may be collected through cookies and similar technologies.</p>
      </Section>

      <Section title="4. How We Use Your Personal Data">
        <p>We may use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Process and deliver orders.</li>
          <li>Process payments.</li>
          <li>Manage your customer account.</li>
          <li>Communicate with you about your order.</li>
          <li>Respond to questions and customer service requests.</li>
          <li>Process returns, refunds and complaints.</li>
          <li>Improve our website and services.</li>
          <li>Detect and prevent fraud or unauthorized activity.</li>
          <li>Maintain website security.</li>
          <li>Comply with legal and accounting obligations.</li>
          <li>Send marketing communications where we have a lawful basis to do so.</li>
        </ul>
      </Section>

      <Section title="5. Legal Bases for Processing">
        <p>Depending on the circumstances, we process personal data on one or more of the following legal bases:</p>
        <p className="font-medium text-foreground">Contract</p>
        <p>We process information necessary to fulfil your order and provide the services you request.</p>
        <p className="font-medium text-foreground">Legal obligation</p>
        <p>We may need to process and retain certain information to comply with tax, accounting, consumer protection and other legal requirements.</p>
        <p className="font-medium text-foreground">Legitimate interests</p>
        <p>We may process certain information where necessary for legitimate business interests, such as improving our services, protecting our website against fraud and maintaining security, provided that your rights and interests do not override those interests.</p>
        <p className="font-medium text-foreground">Consent</p>
        <p>Where required, we will ask for your consent before processing personal data, such as for certain marketing communications or non-essential cookies.</p>
        <p>You may withdraw consent at any time where processing is based on consent.</p>
      </Section>

      <Section title="6. Sharing Your Personal Data">
        <p>We may share relevant personal information with trusted third parties where necessary to operate our business, including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Payment service providers.</li>
          <li>Delivery and courier companies.</li>
          <li>Website hosting providers.</li>
          <li>IT and technical service providers.</li>
          <li>Website analytics providers.</li>
          <li>Customer service providers.</li>
          <li>Accounting, legal or professional advisers.</li>
          <li>Government authorities where legally required.</li>
        </ul>
        <p>We only share information where there is a legitimate reason and, where required, an appropriate legal basis.</p>
      </Section>

      <Section title="7. Payment Providers">
        <p>When you make a payment, your payment may be processed by a third-party payment provider.</p>
        <p>The payment provider may process your payment information according to its own privacy policy and terms.</p>
        <p>KYSneakers may receive information such as payment confirmation, transaction ID and payment status so that we can fulfil your order.</p>
      </Section>

      <Section title="8. Delivery Companies">
        <p>To deliver your order, we may provide the delivery provider with information necessary for delivery, such as:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name.</li>
          <li>Delivery address.</li>
          <li>Telephone number, where necessary.</li>
          <li>Email address, where necessary.</li>
          <li>Order or tracking information.</li>
        </ul>
      </Section>

      <Section title="9. Cookies">
        <p>KYSneakers.nl may use cookies and similar technologies.</p>
        <p>Cookies may be used for purposes such as:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Keeping items in your shopping cart.</li>
          <li>Remembering your preferences.</li>
          <li>Maintaining customer sessions.</li>
          <li>Improving website functionality.</li>
          <li>Understanding website usage.</li>
          <li>Website security.</li>
          <li>Marketing and analytics, where applicable and permitted.</li>
        </ul>
        <p>Where required, we will request your consent before placing non-essential cookies on your device.</p>
        <p>You can also manage cookies through your browser settings.</p>
      </Section>

      <Section title="10. Marketing Communications">
        <p>If you subscribe to our marketing communications, we may use your email address to send information about products, promotions, offers or other updates.</p>
        <p>Where required by law, we will obtain your consent before sending marketing communications.</p>
        <p>You can unsubscribe from marketing emails at any time by using the unsubscribe option provided in the email or by contacting us.</p>
      </Section>

      <Section title="11. Data Retention">
        <p>We retain personal information only for as long as necessary for the purposes described in this Privacy Policy or for as long as required by law.</p>
        <p>For example, certain transaction and financial records may need to be retained for statutory accounting and tax purposes.</p>
        <p>When information is no longer required, it will be securely deleted or anonymized where appropriate.</p>
      </Section>

      <Section title="12. Data Security">
        <p>We take reasonable technical and organizational measures to protect personal data against unauthorized access, loss, misuse, alteration or disclosure.</p>
        <p>However, no online transmission or electronic storage system can be guaranteed to be completely secure.</p>
      </Section>

      <Section title="13. Your Privacy Rights">
        <p>Depending on applicable law, you may have the right to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Request access to your personal data.</li>
          <li>Request correction of inaccurate personal data.</li>
          <li>Request deletion of your personal data.</li>
          <li>Request restriction of processing.</li>
          <li>Object to certain processing.</li>
          <li>Request data portability.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>Lodge a complaint with a data protection authority.</li>
        </ul>
        <p>Some rights are subject to legal exceptions.</p>
      </Section>

      <Section title="14. How to Exercise Your Rights">
        <p>To exercise your privacy rights, contact us at:</p>
        <p><span className="font-medium text-foreground">Email: </span>support@kysneakers.nl</p>
        <p>Please provide enough information for us to verify your identity and process your request securely.</p>
        <p>We will respond within the period required by applicable data protection law.</p>
      </Section>

      <Section title="15. Children's Privacy">
        <p>Our website is intended for general consumers and is not specifically directed at children.</p>
        <p>We do not knowingly collect personal information from children where doing so would be unlawful.</p>
      </Section>

      <Section title="16. International Data Transfers">
        <p>Some service providers we use may process personal data outside the European Economic Area (EEA).</p>
        <p>Where personal data is transferred outside the EEA, we will take appropriate steps to ensure that the transfer complies with applicable data protection law.</p>
      </Section>

      <Section title="17. Third-Party Websites">
        <p>Our website may contain links to third-party websites or services.</p>
        <p>We are not responsible for the privacy practices or content of third-party websites. We recommend reviewing their privacy policies before providing personal information.</p>
      </Section>

      <Section title="18. Changes to This Privacy Policy">
        <p>We may update this Privacy Policy from time to time to reflect changes to our services, technology or legal requirements.</p>
        <p>The updated version will be published on KYSneakers.nl with a revised &quot;Last updated&quot; date.</p>
      </Section>

      <Section title="19. Contact Us">
        <p>If you have questions about this Privacy Policy or how we handle your personal data, contact:</p>
        <dl className="mt-2 space-y-1">
          <div><dt className="inline font-medium text-foreground">Business name: </dt><dd className="inline">KYSneakers &amp; clothing</dd></div>
          <div><dt className="inline font-medium text-foreground">Trading name: </dt><dd className="inline">KYSneakers &amp; clothing</dd></div>
          <div><dt className="inline font-medium text-foreground">Website: </dt><dd className="inline">kysneakers.nl</dd></div>
          <div><dt className="inline font-medium text-foreground">Business address: </dt><dd className="inline">Woutertje Pietersestraat 27 1, 1061DE Amsterdam</dd></div>
          <div><dt className="inline font-medium text-foreground">Email: </dt><dd className="inline">support@kysneakers.nl</dd></div>
          <div><dt className="inline font-medium text-foreground">Chamber of Commerce (KVK): </dt><dd className="inline">42139127</dd></div>
          <div><dt className="inline font-medium text-foreground">VAT Number: </dt><dd className="inline">NL005527539B30</dd></div>
        </dl>
      </Section>
    </div>
  );
}
