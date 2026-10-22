import { COMPANY } from "@fa/shared";
import { button, checklist, escapeHtml, heading, infoCard, legalFooterLine, linkFallback, note, paragraph, renderLayout, signature, smallText } from "./layout";
import type {
  AccountDeletedInput,
  ChatReplyInput,
  InvitationMailInput,
  InvoiceDeliveryInput,
  InvoiceIssuedInput,
  PaymentReminderMailInput,
  RenderedMail,
  SecurityNoticeInput,
  ShipmentUpdateInput,
  WelcomeMailInput,
} from "./templates";

/**
 * Englische Fassungen der Kunden-E-Mails (Profilsprache „en“). Aufbau und Inhalt entsprechen
 * templates.ts – Änderungen dort bitte hier mitziehen. Belege (PDF) bleiben deutsch.
 */

const locale = "en" as const;

const PORTAL_FEATURES = [
  "Jobs, dates and status at a glance at any time",
  "Quotes, invoices and documents to download",
  "Live tracking of shipments – including driver and arrival time",
  "A direct line to your contact person",
];

function textFooter(): string {
  return `\n\nKind regards\nYour ${COMPANY.name} team\n\n—\n${COMPANY.legalName} · ${COMPANY.address.street} · ${COMPANY.address.postalCode} ${COMPANY.address.city} · Germany\n${COMPANY.contact.phone} · ${COMPANY.contact.email} · ${COMPANY.websiteUrl}\n${legalFooterLine(locale)}`;
}

const optOutText = (settingsUrl: string) => `You can unsubscribe from this notification in the customer portal settings: ${settingsUrl}`;

export function welcomeMailEn({ firstName, email, customerNumber, signInMethod, portalUrl }: WelcomeMailInput): RenderedMail {
  const method = signInMethod === "google" ? "With your Google account" : "With email and password";
  const contactLine = `Questions? Simply reply to this email or call us: ${COMPANY.contact.phone} (${COMPANY.contact.hoursEn}).`;

  return {
    subject: `Welcome to ${COMPANY.name}, ${firstName}!`,
    text:
      `Hello ${firstName},\n\ngreat to have you! Your customer account at ${COMPANY.name} is set up.\n\n` +
      `Customer number: ${customerNumber}\nEmail: ${email}\nSign-in: ${method}\n\n` +
      `In the customer portal you'll find:\n${PORTAL_FEATURES.map((feature) => `• ${feature}`).join("\n")}\n\n` +
      `Go to the customer portal: ${portalUrl}\n\n${contactLine}` +
      textFooter(),
    html: renderLayout({
      locale,
      preheader: `Your customer account is set up – customer number ${customerNumber}.`,
      eyebrow: "Welcome aboard",
      title: `Great to have you, ${firstName}!`,
      intro: "Your customer account is set up. From now on, all your jobs, dates and documents are in one place.",
      body: [
        paragraph(`Hello ${firstName},`),
        paragraph(
          `thank you for registering with ${COMPANY.name}. Whether it's a removal, a clearance or a transport – the customer portal keeps you up to date at all times.`,
        ),
        infoCard([
          ["Customer number", customerNumber],
          ["Email", email],
          ["Sign-in", method],
        ]),
        heading("What the portal offers"),
        checklist(PORTAL_FEATURES),
        button("Go to the customer portal", portalUrl),
        smallText(
          `Please quote your customer number <strong style="color:#0b132b">${escapeHtml(customerNumber)}</strong> with any enquiry – that helps us help you faster.`,
        ),
        note(contactLine),
        signature(locale),
      ],
      reason: `You are receiving this email because a customer account at ${COMPANY.name} was created for ${email}.`,
    }),
  };
}

export function verificationMailEn(firstName: string, url: string, purpose: "register" | "change"): RenderedMail {
  if (purpose === "change") {
    return {
      subject: `Please confirm your new email address – ${COMPANY.name}`,
      text:
        `Hello ${firstName},\n\nyour customer account at ${COMPANY.name} now uses this email address. Please confirm it ` +
        `via this link (valid for 24 hours):\n\n${url}\n\nIf you did not request this, please contact us.` +
        textFooter(),
      html: renderLayout({
        locale,
        preheader: "One click – and your new email address is confirmed.",
        eyebrow: "New email address",
        title: "Please confirm your new address",
        intro: "Your customer account now uses this email address.",
        body: [
          paragraph(`Hello ${firstName},`),
          paragraph("please confirm your new email address – after that you will see all your jobs, documents and invoices in the customer portal again."),
          button("Confirm email address", url),
          linkFallback(url, locale),
          note(`The link is valid for 24 hours. If you did not request this change, please contact us immediately: ${COMPANY.contact.phone}.`),
          signature(locale),
        ],
        reason: `You are receiving this email because this address was entered for a customer account at ${COMPANY.name}.`,
      }),
    };
  }
  return {
    subject: `Please confirm your email address – ${COMPANY.name}`,
    text:
      `Hello ${firstName},\n\nwelcome to the ${COMPANY.name} customer portal! Please confirm your email address ` +
      `via this link (valid for 24 hours):\n\n${url}\n\n` +
      `If you did not register, you can ignore this email.` +
      textFooter(),
    html: renderLayout({
      locale,
      preheader: "Just one click – and your customer account is ready.",
      eyebrow: "Almost there",
      title: "Please confirm your email address",
      intro: "Just one click – and your customer account is ready.",
      body: [
        paragraph(`Hello ${firstName},`),
        paragraph(
          `thank you for registering with ${COMPANY.name}! Please confirm your email address – after that you will see all your jobs, documents and invoices in the customer portal.`,
        ),
        button("Confirm email address", url),
        linkFallback(url, locale),
        note("The link is valid for 24 hours. If you did not register with us, you can simply ignore this email."),
        signature(locale),
      ],
      reason: `You are receiving this email because a customer account at ${COMPANY.name} was created with this address.`,
    }),
  };
}

export function passwordResetMailEn(firstName: string, url: string): RenderedMail {
  return {
    subject: `Reset your password – ${COMPANY.name} customer portal`,
    text:
      `Hello ${firstName},\n\nyou requested a password reset. The following link is valid for 60 minutes:\n\n${url}\n\n` +
      `If this wasn't you, you can ignore this email – your password stays unchanged.` +
      textFooter(),
    html: renderLayout({
      locale,
      preheader: "Set a new password now – the link is valid for 60 minutes.",
      eyebrow: "Security",
      title: "Set a new password",
      intro: "You requested to reset your password.",
      body: [
        paragraph(`Hello ${firstName},`),
        paragraph("use the button to set a new password for your customer account. For security reasons, all existing sign-ins will then be ended."),
        button("Set a new password", url),
        linkFallback(url, locale),
        note("The link is valid for 60 minutes and can only be used once. If this wasn't you, you can ignore this email – your password stays unchanged."),
        signature(locale),
      ],
      reason: `You are receiving this email because a new password was requested for your customer account at ${COMPANY.name}.`,
    }),
  };
}

export function invitationMailEn({ firstName, email, customerNumber, url, googleSignIn }: InvitationMailInput): RenderedMail {
  const googleLine = "If your email address is a Google account, you can also sign in without a password using “Sign in with Google”.";
  const contactLine = `Questions? Simply reply to this email or call us: ${COMPANY.contact.phone} (${COMPANY.contact.hoursEn}).`;

  return {
    subject: `Your customer account at ${COMPANY.name} is set up`,
    text:
      `Hello ${firstName},\n\nwe have created a customer account for you at ${COMPANY.name}.\n\n` +
      `Customer number: ${customerNumber}\nEmail: ${email}\n\n` +
      `Set your password using this link (valid for 7 days):\n\n${url}\n\n` +
      (googleSignIn ? `${googleLine}\n\n` : "") +
      `In the customer portal you'll find:\n${PORTAL_FEATURES.map((feature) => `• ${feature}`).join("\n")}\n\n` +
      `If the link has expired, you can request a new one at any time via “Forgot password”.\n\n${contactLine}` +
      textFooter(),
    html: renderLayout({
      locale,
      preheader: `Your customer account is set up – customer number ${customerNumber}. Set your password now.`,
      eyebrow: "Welcome",
      title: `Your customer account is ready, ${firstName}`,
      intro: "We have created a customer account for you. Set your password now – then you can see your jobs, invoices and documents online at any time.",
      body: [
        paragraph(`Hello ${firstName},`),
        paragraph(`thank you for your order with ${COMPANY.name}. So that you have everything in one place, we have set up a customer account for you.`),
        infoCard([
          ["Customer number", customerNumber],
          ["Email", email],
        ]),
        button("Set your password", url),
        linkFallback(url, locale),
        ...(googleSignIn ? [smallText(googleLine)] : []),
        heading("What the portal offers"),
        checklist(PORTAL_FEATURES),
        note(`The link is valid for 7 days and can only be used once. If it has expired, simply request a new one via “Forgot password”. ${contactLine}`),
        signature(locale),
      ],
      reason: `You are receiving this email because ${COMPANY.name} created a customer account for you under ${email}.`,
    }),
  };
}

export function securityNoticeMailEn({ firstName, changedBy, passwordChanged, newEmail, loginUrl }: SecurityNoticeInput): RenderedMail {
  const parts = [newEmail ? "email address" : undefined, passwordChanged ? "password" : undefined].filter((part): part is string => part !== undefined);
  const what = parts.join(" and ");
  const who =
    changedBy === "staff"
      ? `Our team has reset the ${what} of your customer account.`
      : `The ${what} of your customer account ${parts.length > 1 ? "have" : "has"} just been changed.`;
  const rows: Array<[string, string]> = [["Changed", what]];
  if (newEmail) rows.push(["New email address", newEmail]);
  rows.push(["Time", new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin" }).format(new Date())]);
  const warning = `If you did not request this, please contact us immediately: ${COMPANY.contact.phone} or ${COMPANY.contact.email}.`;
  const relogin = "For security reasons, all other sign-ins have been ended – please sign in again there.";
  const title = `${what.charAt(0).toUpperCase()}${what.slice(1)} changed`;

  return {
    subject: `Security notice: ${what} changed – ${COMPANY.name}`,
    text: `Hello ${firstName},\n\n${who}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${relogin}\n\nSign in: ${loginUrl}\n\n${warning}` + textFooter(),
    html: renderLayout({
      locale,
      preheader: who,
      eyebrow: "Security",
      title,
      intro: who,
      body: [paragraph(`Hello ${firstName},`), paragraph(who), infoCard(rows), paragraph(relogin), button("Sign in", loginUrl), note(warning), signature(locale)],
      reason: `You are receiving this email because the sign-in details of your customer account at ${COMPANY.name} have changed.`,
    }),
  };
}

export function shipmentUpdateMailEn({ firstName, shipmentNumber, route, headline, message, driver, url, settingsUrl }: ShipmentUpdateInput): RenderedMail {
  const rows: Array<[string, string]> = [
    ["Job", shipmentNumber],
    ["Route", route],
  ];
  if (driver) {
    rows.push(["Driver", driver.name], ["Phone", driver.phone]);
    if (driver.plate) rows.push(["Registration", driver.plate]);
  }
  const optOut = optOutText(settingsUrl);
  return {
    subject: `${headline} – job ${shipmentNumber}`,
    text: `Hello ${firstName},\n\n${message}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nTrack live: ${url}\n\n${optOut}` + textFooter(),
    html: renderLayout({
      locale,
      preheader: message,
      eyebrow: `Job ${shipmentNumber}`,
      title: headline,
      intro: message,
      body: [paragraph(`Hello ${firstName},`), paragraph(message), infoCard(rows), button("View job", url), smallText(escapeHtml(optOut)), signature(locale)],
      reason: `You are receiving this email because you enabled notifications about your jobs at ${COMPANY.name}.`,
    }),
  };
}

export function invoiceIssuedMailEn({ firstName, typeLabel, number, amount, deadline, paidNote, shipmentNumber, url, settingsUrl }: InvoiceIssuedInput): RenderedMail {
  const rows: Array<[string, string]> = [
    [`${typeLabel.charAt(0).toUpperCase()}${typeLabel.slice(1)}`, number],
    ["Amount", amount],
  ];
  if (deadline) rows.push(deadline);
  if (shipmentNumber) rows.push(["Job", shipmentNumber]);
  if (paidNote) rows.push(["Status", paidNote]);

  const message = `we have provided a new ${typeLabel} for you. You'll find it in the customer portal – where you can view, print and download it as PDF at any time.`;
  const optOut = optOutText(settingsUrl);
  return {
    subject: `Your ${typeLabel} ${number} – ${COMPANY.name}`,
    text: `Hello ${firstName},\n\n${message}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nView in the customer portal: ${url}\n\n${optOut}` + textFooter(),
    html: renderLayout({
      locale,
      preheader: `${typeLabel} ${number} for ${amount}`,
      eyebrow: `${typeLabel} ${number}`,
      title: `Your ${typeLabel} is ready`,
      intro: "View, print and download – at any time in the customer portal.",
      body: [paragraph(`Hello ${firstName},`), paragraph(message), infoCard(rows), button(`View ${typeLabel}`, url), smallText(escapeHtml(optOut)), signature(locale)],
      reason: `You are receiving this email because you enabled notifications about invoices and quotes at ${COMPANY.name}.`,
    }),
  };
}

export function invoiceDeliveryMailEn({ greetingName, number, issueDate, amount, payment, shipmentNumber, fileName, url }: InvoiceDeliveryInput): RenderedMail {
  const hello = greetingName ? `Hello ${greetingName},` : "Hello,";
  const rows: Array<[string, string]> = [
    ["Invoice number", number],
    ["Invoice date", issueDate],
    ["Invoice amount", amount],
  ];
  if (shipmentNumber) rows.push(["Job", shipmentNumber]);
  if ("dueDate" in payment) {
    rows.push(["Payable by", payment.dueDate], ["IBAN", payment.iban], ["Payment reference", number]);
  } else {
    rows.push(["Status", payment.paidNote]);
  }

  const message = `please find attached our invoice ${number}. It is attached as a PDF – an e-invoice in ZUGFeRD format that can be printed and read directly by accounting software. The invoice itself is issued in German. You can also find it in the customer portal at any time.`;
  const request =
    "dueDate" in payment
      ? `Please transfer the amount to ${payment.accountHolder} by ${payment.dueDate}. The invoice also contains a GiroCode for your banking app.`
      : undefined;
  return {
    subject: `Your invoice ${number} – ${COMPANY.name}`,
    text:
      `${hello}\n\n${message}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n` +
      (request ? `${request}\n\n` : "") +
      `Attachment: ${fileName}\nView in the customer portal: ${url}` +
      textFooter(),
    html: renderLayout({
      locale,
      preheader: `Invoice ${number} for ${amount}`,
      eyebrow: `Invoice ${number}`,
      title: "Your invoice",
      intro: "You'll find the PDF attached to this email and at any time in the customer portal.",
      body: [
        paragraph(hello),
        paragraph(message),
        infoCard(rows),
        ...(request ? [paragraph(request)] : []),
        button("View in the customer portal", url),
        smallText(`Attachment: ${escapeHtml(fileName)}`),
        signature(locale),
      ],
      reason: `You are receiving this email because ${COMPANY.name} has issued you an invoice.`,
    }),
  };
}

export function chatReplyMailEn({ firstName, staffName, preview, url, settingsUrl }: ChatReplyInput): RenderedMail {
  const optOut = optOutText(settingsUrl);
  return {
    subject: `New reply from ${staffName} – ${COMPANY.name}`,
    text: `Hello ${firstName},\n\n${staffName} replied to you in the chat:\n\n“${preview}”\n\nGo to the chat: ${url}\n\n${optOut}` + textFooter(),
    html: renderLayout({
      locale,
      preheader: `${staffName}: ${preview}`,
      eyebrow: "Live chat",
      title: "You have a new reply",
      intro: `${staffName} replied to you in the chat.`,
      body: [
        paragraph(`Hello ${firstName},`),
        paragraph(`${staffName} replied to you in the chat:`),
        note(`“${preview}”`),
        button("Go to the chat", url),
        smallText(escapeHtml(optOut)),
        signature(locale),
      ],
      reason: `You are receiving this email because you enabled notifications about chat replies at ${COMPANY.name}.`,
    }),
  };
}

export function accountDeletedMailEn({ firstName, attached, omitted, retained }: AccountDeletedInput): RenderedMail {
  const greeting = firstName ? `Hello ${firstName},` : "Hello,";
  const deletedText = `as requested, we have deleted your customer account at ${COMPANY.name} – including your sign-in, all jobs, documents and messages.`;
  const invoiceText =
    attached > 0
      ? `So that you don't miss anything, you'll find ${attached === 1 ? "your invoice" : `your ${attached} invoices`} attached to this email as PDF.${omitted > 0 ? ` We'll gladly send you ${omitted} more on request.` : ""}`
      : "";
  const retentionText =
    retained > 0
      ? `We are legally required to keep your invoices and documents (up to 8 years, § 147 AO). They are no longer visible in the portal and will be deleted automatically when the period ends. You can request a copy at any time from ${COMPANY.contact.email}.`
      : "";
  const warning = `If you did not request the deletion, please contact us immediately: ${COMPANY.contact.phone}.`;

  return {
    subject: `Your customer account has been deleted – ${COMPANY.name}`,
    text: [greeting, deletedText, invoiceText, retentionText, warning].filter(Boolean).join("\n\n") + textFooter(),
    html: renderLayout({
      locale,
      preheader: attached > 0 ? "Your account has been deleted – your invoices are attached." : "Your customer account has been deleted.",
      eyebrow: "Account deleted",
      title: "Sorry to see you go",
      intro: "Your customer account has been deleted.",
      body: [
        paragraph(greeting),
        paragraph(deletedText),
        ...(invoiceText ? [paragraph(invoiceText)] : []),
        paragraph("You are welcome back at any time – a new account is set up in a minute."),
        ...(retentionText ? [note(retentionText)] : []),
        note(warning),
        signature(locale),
      ],
      reason: `You are receiving this email as confirmation that your customer account at ${COMPANY.name} has been deleted.`,
    }),
  };
}

const REMINDER_TITLE = { 1: "Payment reminder", 2: "First reminder notice", 3: "Second reminder notice" } as const;

export function paymentReminderMailEn(input: PaymentReminderMailInput): RenderedMail {
  const title = REMINDER_TITLE[input.level];
  const hello = input.greetingName ? `Hello ${input.greetingName},` : "Hello,";
  const message =
    input.level === 1
      ? `this may have slipped your attention: we have not yet received payment for our invoice ${input.number} dated ${input.issueDate}, which was due on ${input.dueDate}.`
      : `unfortunately, our invoice ${input.number} dated ${input.issueDate} is still unpaid despite being due on ${input.dueDate}${input.level === 3 ? " and our previous reminder notice" : " and our payment reminder"}.`;
  const request = `Please transfer ${input.amount} to ${input.accountHolder} (IBAN ${input.iban}) by ${input.newDueDate}, quoting ${input.number} as the payment reference.`;
  const closing =
    input.level === 3
      ? "If payment is not received by then, we reserve the right to take further steps. If you have already transferred the amount, please disregard this letter."
      : "If you have already transferred the amount, please disregard this email. If you have any questions, we are happy to help.";
  const rows: Array<[string, string]> = [
    ["Invoice number", input.number],
    ["Invoice date", input.issueDate],
    ["Due since", input.dueDate],
    ["Amount outstanding", input.amount],
    ["Please pay by", input.newDueDate],
  ];
  return {
    subject: `${title}: invoice ${input.number} – ${COMPANY.name}`,
    text:
      `${hello}\n\n${message}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${request}\n\n${closing}` +
      (input.url ? `\n\nInvoice in the customer portal: ${input.url}` : "") +
      textFooter(),
    html: renderLayout({
      locale,
      preheader: `${title} for invoice ${input.number} of ${input.amount}`,
      eyebrow: title,
      title: input.level === 1 ? "A friendly reminder" : title,
      intro: `Invoice ${input.number} is still open.`,
      body: [
        paragraph(hello),
        paragraph(message),
        infoCard(rows),
        paragraph(request),
        ...(input.url ? [button("View invoice", input.url)] : []),
        note(closing),
        signature(locale),
      ],
      reason: `You are receiving this email because an invoice from ${COMPANY.name} to you is still open.`,
    }),
  };
}
