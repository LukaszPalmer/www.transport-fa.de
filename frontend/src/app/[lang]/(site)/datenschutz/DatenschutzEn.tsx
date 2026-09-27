import { CHAT_RETENTION_HOURS, formattedVatId, LOCATION_HISTORY_DAYS, ownerTitle } from "@fa/shared";
import { company } from "@/content/company";
import { LegalPage } from "@/components/layout/LegalPage";

/** Stand der englischen Fassung – bei Änderungen der deutschen Datenschutzerklärung mitziehen. */
const LAST_UPDATED = "27 September 2026";

/**
 * English translation of the privacy policy. Content must match the German version (page.tsx);
 * the German version is legally binding.
 */
export function DatenschutzEn() {
  const { address, contact } = company;

  return (
    <LegalPage title="Privacy policy">
      <p>
        <em>This is a translation for your convenience. Only the German version (Datenschutzerklärung) is legally binding.</em>
      </p>
      <p>Last updated: {LAST_UPDATED}</p>

      <h2>1. Controller</h2>
      <p>
        {company.legalName}
        <br />
        {address.street}, {address.postalCode} {address.city}, Germany
        <br />
        {ownerTitle("en")}: {company.owner}
        <br />
        Phone: <a href={contact.phoneHref}>{contact.phone}</a> · Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <br />
        VAT ID: {formattedVatId()}
      </p>
      <p>
        For any questions about data protection and to exercise your rights, contact us at{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>. We are not required to appoint a data protection officer
        under Art. 37 GDPR and § 38 BDSG.
      </p>

      <h2>2. Overview and legal bases</h2>
      <p>
        We only process personal data to the extent necessary for the website, your enquiries, our jobs and the customer portal.
        The legal bases are in particular Art. 6(1)(b) GDPR (contract and pre-contractual measures), (c) (legal obligations, e.g.
        retention under commercial and tax law), (f) (legitimate interests, e.g. secure operation) and (a) (consent, where we
        expressly ask for it).
      </p>

      <h2>3. Hosting and server log files</h2>
      <p>
        The website is operated by Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) and delivered from data centres in
        Frankfurt am Main. The customer portal’s programming interface (API) is operated by Railway Corporation (USA) in the
        Europe region. When you visit the site, these providers process technically necessary data (IP address, date and time,
        page requested, browser type) to deliver the website securely and reliably (Art. 6(1)(f) GDPR). Log data is deleted after
        30 days at the latest.
      </p>
      <p>
        We base transfers to the USA on the adequacy decision for the EU-US Data Privacy Framework or on the EU standard
        contractual clauses (Art. 45, 46 GDPR).
      </p>

      <h2>4. Cookies and browser storage</h2>
      <p>We do not use tracking or marketing cookies or analytics tools. Only the following are technically necessary (§ 25(2) no. 2 TDDDG):</p>
      <ul>
        <li>a session cookie after you sign in to the customer portal or admin area (until you sign out, at most 14 days),</li>
        <li>a cookie storing your chosen language (German/English, 1 year) when you change the language,</li>
        <li>an entry in your browser’s local storage if you allow Google Maps in the app presentation (see section 12).</li>
      </ul>
      <p>All fonts are served from our own server; there is no connection to Google Fonts.</p>

      <h2>5. Contact and quote form, enquiries</h2>
      <p>
        We process the data you enter in the form (name, contact details, job details, message) to handle your enquiry and prepare
        a quote (Art. 6(1)(b) GDPR). The enquiry is sent to our team by encrypted email and stored in our customer management
        system for processing (status, notes, follow-up). To prevent abuse, we briefly process your IP address in memory
        (Art. 6(1)(f) GDPR).
      </p>
      <p>
        Enquiries that do not lead to a job are deleted automatically six months after they were last processed. If a job results,
        we keep the enquiry for three years (standard limitation period); invoices are subject to the retention periods in
        section 9.
      </p>

      <h2>6. Job applications</h2>
      <p>
        We process application data including uploaded documents to carry out the application process (§ 26 BDSG, Art. 6(1)(b)
        GDPR). Files are not stored on the web server but sent directly by email. We delete the data no later than six months
        after the process ends, unless you have agreed to longer storage.
      </p>

      <h2>7. Customer portal</h2>
      <p>
        For registration we process your name, address (billing address), email address, optionally your company, and an
        encrypted password (Argon2id). We need the address for jobs and invoices; you can add a phone number in your profile if
        you wish. In the portal we process your
        jobs, documents, quotes, invoices and messages (Art. 6(1)(b) GDPR). For security we store session data (time, IP address,
        browser) and a security log of sign-in events (12 months, Art. 6(1)(f) GDPR).
      </p>
      <p>
        While a transport is under way for you, you can see the vehicle’s position. The GPS data belongs to the vehicle, not to
        you, and is deleted automatically after {LOCATION_HISTORY_DAYS} days.
      </p>

      <h3>Sign in with Google</h3>
      <p>
        If you choose “Sign in with Google”, you are redirected to Google (Google Ireland Ltd., Gordon House, Barrow Street,
        Dublin 4, Ireland). We receive your name, email address and, if applicable, your profile picture. The connection to Google
        is only established after your click (Art. 6(1)(b) GDPR).
      </p>

      <h3>Live chat</h3>
      <p>
        We store live chat messages until the chat is closed and delete them automatically {CHAT_RETENTION_HOURS} hours
        afterwards. If nobody from our team is online and you have allowed it, we notify you of replies by email.
      </p>

      <h3>Deleting your account</h3>
      <p>
        You can delete your account yourself at any time in the settings. We then delete your sign-in data, sessions, jobs,
        documents, messages and email history. Exempt are invoices, credit notes, quotes and order confirmations that we are
        legally required to keep (section 9, Art. 17(3)(b) GDPR): they are no longer visible in the portal, are only used for
        accounting and tax audits and are deleted automatically when the retention period ends. With the deletion confirmation
        we send you your invoices as PDF.
      </p>

      <h2>8. Emails</h2>
      <p>
        We send transactional emails (e.g. confirmation links, invoices, status updates) via Resend (Resend Inc., USA; sent via
        servers in Ireland). You choose which notifications you receive in the customer portal under “Settings”. We send invoices,
        payment reminders and security-related notices regardless. Our mailbox and the contact form emails run via IONOS SE
        (Montabaur, Germany).
      </p>

      <h2>9. Invoices, payments and accounting</h2>
      <p>
        For quotes, invoices and payments we process your name, address, company and VAT ID if applicable, service and payment data
        (Art. 6(1)(b) and (c) GDPR). We issue invoices as e-invoices (ZUGFeRD/XRechnung). For accounting and tax returns we pass
        invoices and booking data to our tax adviser, who is bound by professional secrecy (Art. 6(1)(c) GDPR).
      </p>
      <p>
        Retention periods (§ 147 AO, § 257 HGB): invoices and credit notes 8 years, quotes and order confirmations 6 years, in each
        case from the end of the calendar year in which they were issued. If an invoice is overdue, we remind you of the payment
        by email.
      </p>

      <h2>10. Storage of files and data</h2>
      <p>
        We store customer portal data in a database at MongoDB Inc. (Amazon Web Services data centre in Frankfurt am Main) and
        documents and PDFs at Cloudflare, Inc. (R2 storage with data kept exclusively in the EU). Data processing agreements
        (Art. 28 GDPR) are in place with all service providers.
      </p>

      <h2>11. Reviews</h2>
      <p>
        On our website we show customer reviews that are publicly published on our profiles at review platforms (such as
        Google) – unchanged, with shortened name, town and date (Art. 6(1)(f) GDPR). If you don’t want your review shown here,
        just let us know and we will remove it immediately. Data is only transferred to the platform operators when you click
        the links to the platforms; their privacy policies then apply.
      </p>

      <h2>12. Google Maps</h2>
      <p>
        In the presentation of our tracking app we show a locally stored map by default (map data © OpenStreetMap contributors).
        Only if you click “Load Google Maps” is the Google Maps service (Google Ireland Ltd.) loaded, which transfers your IP
        address, among other things, to Google (Art. 6(1)(a) GDPR). We store your decision locally in your browser; you can revoke
        it at any time by deleting the website data.
      </p>

      <h2>13. Recipients at a glance</h2>
      <ul>
        <li>Vercel Inc. – website hosting</li>
        <li>Railway Corporation – operation of the customer portal API</li>
        <li>MongoDB Inc. – database (Frankfurt am Main)</li>
        <li>Cloudflare, Inc. – file storage (EU)</li>
        <li>Resend Inc. – sending emails</li>
        <li>IONOS SE – mailbox and domain</li>
        <li>Google Ireland Ltd. – only when signing in with Google or after enabling Google Maps</li>
        <li>our tax adviser – accounting and taxes</li>
      </ul>

      <h2>14. Your rights</h2>
      <p>
        You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing
        (Art. 18), data portability (Art. 20) and to withdraw consent with effect for the future (Art. 7(3)). Where we process data
        on the basis of legitimate interests, you can object at any time on grounds relating to your particular situation
        (Art. 21 GDPR).
      </p>
      <p>
        You can also lodge a complaint with a data protection supervisory authority, e.g. the authority responsible for us: the
        State Commissioner for Data Protection and Freedom of Information of North Rhine-Westphalia, Kavalleriestraße 2–4, 40213
        Düsseldorf, <a href="https://www.ldi.nrw.de">www.ldi.nrw.de</a>.
      </p>
    </LegalPage>
  );
}
