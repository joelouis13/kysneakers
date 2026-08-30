import type { Metadata } from "next";

import { LegalSection as Section } from "@/components/legal/legal-section";
import { RESELLER_DISCLAIMER } from "@/lib/data/disclaimer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl tracking-wide text-foreground sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: 30 August 2026</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Welcome to <strong className="text-foreground">KYSneakers.nl</strong>. These Terms and Conditions
        govern your use of our website and the purchase of products through our online store.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        By accessing or using KYSneakers.nl, you agree to these Terms and Conditions. Please read them
        carefully before placing an order.
      </p>

      <Section title="1. About KYSneakers">
        <p>KYSneakers.nl is an online store offering footwear and related products to customers.</p>
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

      <Section title="2. Applicability">
        <p>
          These Terms and Conditions apply to all purchases made through KYSneakers.nl and to the use of
          our website.
        </p>
        <p>By placing an order, you confirm that you have read and accepted these Terms and Conditions.</p>
        <p>
          We reserve the right to update these Terms and Conditions when necessary. The version applicable
          to your order is the version in effect at the time you place your order.
        </p>
      </Section>

      <Section title="3. Products and Product Information">
        <p>
          We make every reasonable effort to ensure that product descriptions, photographs, prices, sizes,
          colours and other information on our website are accurate.
        </p>
        <p>
          However, colours displayed on your device may differ slightly from the actual product due to
          screen settings and other technical factors.
        </p>
        <p>
          We reserve the right to correct errors or inaccuracies on the website, including product
          descriptions, prices and availability.
        </p>
      </Section>

      <Section title="4. Prices">
        <p>
          All prices displayed on the website are stated in euros (€) and include VAT where applicable,
          unless otherwise stated.
        </p>
        <p>Any applicable delivery charges will be displayed during the checkout process before you complete your purchase.</p>
        <p>We reserve the right to change product prices at any time. Price changes will not affect orders that have already been accepted.</p>
      </Section>

      <Section title="5. Orders">
        <p>When you place an order through KYSneakers.nl, you are making an offer to purchase the selected products.</p>
        <p>
          After placing an order, you will receive an order confirmation by email. The order confirmation
          confirms that we have received your order; it does not necessarily mean that the order has been
          accepted if there is an issue with product availability, payment or other circumstances.
        </p>
        <p>We reserve the right to refuse or cancel an order where there is a legitimate reason, including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>The product is unavailable.</li>
          <li>There is an obvious pricing or product information error.</li>
          <li>Payment cannot be successfully processed.</li>
          <li>We reasonably suspect fraudulent or unauthorized activity.</li>
          <li>Delivery to the specified address is not possible.</li>
        </ul>
        <p>If we cancel an order after payment has been received, we will refund the amount paid for the cancelled order.</p>
      </Section>

      <Section title="6. Payment">
        <p>Payment must be completed using the payment methods made available at checkout.</p>
        <p>You agree to provide accurate and complete payment information.</p>
        <p>
          KYSneakers.nl does not store complete payment card details unless specifically stated otherwise.
          Payment information may be processed by third-party payment providers in accordance with their
          own terms and privacy policies.
        </p>
      </Section>

      <Section title="7. Delivery">
        <p>We deliver orders to the locations specified during checkout.</p>
        <p>
          Estimated delivery times are provided for guidance and may vary due to circumstances outside our
          reasonable control, including courier delays, public holidays, severe weather or other
          unforeseen events.
        </p>
        <p>Once your order has been dispatched, you may receive tracking information where available.</p>
        <p>If an order is delayed or appears to be lost, please contact us so that we can investigate the matter with the delivery provider.</p>
      </Section>

      <Section title="8. Right of Withdrawal">
        <p>
          If you are a consumer purchasing online within the European Union, you generally have the legal
          right to withdraw from your purchase within <strong className="text-foreground">14 days</strong>{" "}
          without giving a reason, subject to applicable legal exceptions.
        </p>
        <p>The withdrawal period normally begins on the day you, or a person designated by you, receives the goods.</p>
        <p>To exercise your right of withdrawal, you must clearly inform us of your decision before the withdrawal period expires.</p>
        <p>
          Returned products should be handled with reasonable care. Where permitted by law, you may be
          responsible for any diminished value resulting from handling beyond what is necessary to
          establish the nature, characteristics and functioning of the product.
        </p>
        <p>Certain products may be excluded from the right of withdrawal where a legal exception applies.</p>
      </Section>

      <Section title="9. Returns">
        <p>To return an eligible product, contact us using the customer service details provided on our website.</p>
        <p>
          Products should preferably be returned in their original condition and packaging, together with
          any accessories and documentation supplied with the product.
        </p>
        <p>The specific return procedure, return address and any applicable return costs will be communicated through our returns process.</p>
        <p>Nothing in this section limits any mandatory consumer rights provided by Dutch or European law.</p>
      </Section>

      <Section title="10. Refunds">
        <p>Where a refund is due, we will process it using the original payment method where reasonably possible.</p>
        <p>Refunds will be made within the period required by applicable law.</p>
        <p>
          Where a customer exercises the statutory right of withdrawal, we may wait until we have received
          the returned goods or the customer has provided evidence that the goods have been sent back,
          whichever occurs first, where permitted by law.
        </p>
      </Section>

      <Section title="11. Faulty or Incorrect Products">
        <p>If you receive a product that is defective, damaged or different from what you ordered, please contact us as soon as reasonably possible.</p>
        <p>Consumers retain their statutory rights concerning goods that do not conform to the purchase agreement.</p>
        <p>We may request photographs or other information to help us investigate the issue.</p>
      </Section>

      <Section title="12. Intellectual Property &amp; Trademarks">
        <p>
          You may not copy, reproduce, distribute, modify or commercially exploit website content without
          prior written permission, except where permitted by law.
        </p>
        <p>{RESELLER_DISCLAIMER}</p>
      </Section>

      <Section title="13. Website Use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Use the website for unlawful purposes.</li>
          <li>Attempt to gain unauthorized access to our systems.</li>
          <li>Introduce malicious software or harmful code.</li>
          <li>Interfere with the operation or security of the website.</li>
          <li>Use automated systems to collect website content without permission.</li>
          <li>Provide false or misleading information when placing an order.</li>
        </ul>
        <p>We reserve the right to restrict access to the website where necessary to protect our systems, customers or business.</p>
      </Section>

      <Section title="14. Availability of the Website">
        <p>
          We aim to keep KYSneakers.nl available and functioning properly. However, we cannot guarantee
          that the website will always be available, uninterrupted or free from technical errors.
        </p>
        <p>We may temporarily suspend or modify the website for maintenance, security, updates or other legitimate reasons.</p>
      </Section>

      <Section title="15. Limitation of Liability">
        <p>Nothing in these Terms and Conditions excludes or limits liability where such exclusion or limitation is prohibited by applicable law.</p>
        <p>
          To the extent permitted by law, KYSneakers will not be responsible for losses that could not
          reasonably have been foreseen at the time the agreement was entered into or for circumstances
          outside our reasonable control.
        </p>
        <p>Consumers&apos; mandatory statutory rights remain unaffected.</p>
      </Section>

      <Section title="16. Force Majeure">
        <p>
          We are not responsible for failure or delay caused by circumstances beyond our reasonable
          control, including natural disasters, serious technical failures, disruptions to
          telecommunications, strikes, transportation problems, government actions or other exceptional
          events.
        </p>
      </Section>

      <Section title="17. Complaints">
        <p>If you have a complaint about an order, product or our service, please contact us first so that we can try to resolve the matter.</p>
        <p>Please provide your order number and a clear description of the issue.</p>
        <p>We aim to respond to complaints within a reasonable period.</p>
      </Section>

      <Section title="18. Applicable Law">
        <p>These Terms and Conditions are governed by the laws of the Netherlands, subject to any mandatory consumer protection rights that apply in your country of residence.</p>
        <p>Where permitted by law, disputes will be submitted to the competent courts in the Netherlands.</p>
      </Section>

      <Section title="19. Contact">
        <p>If you have questions about these Terms and Conditions, please contact:</p>
        <dl className="mt-2 space-y-1">
          <div><dt className="inline font-medium text-foreground">Business address: </dt><dd className="inline">Woutertje Pietersestraat 27 1, 1061DE Amsterdam</dd></div>
          <div><dt className="inline font-medium text-foreground">Email: </dt><dd className="inline">support@kysneakers.nl</dd></div>
        </dl>
      </Section>
    </div>
  );
}
