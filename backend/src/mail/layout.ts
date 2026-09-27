import { COMPANY, formattedVatId, hasRegisterEntry, ownerTitle, type Locale } from "@fa/shared";

/**
 * E-Mail-Layout im Stil der Website (Navy #0b132b, Akzent #38bdf8).
 * E-Mail-tauglich: Tabellen, Inline-Styles, keine Web-Fonts von Drittservern
 * (Datenschutz), Logo als eingebettetes Bild (CID), mobil lesbar.
 */

export const LOGO_CID = "fa-logo";

const C = {
  navy: "#0b132b",
  navyText: "#cbd5e1",
  accent: "#38bdf8",
  accentBright: "#00e5ff",
  accentInk: "#0369a1",
  text: "#334155",
  heading: "#0b132b",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#f8fafc",
  page: "#eef2f7",
};

const FONT_HEADING = "'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif";
const FONT_BODY = "Inter,'Segoe UI',Helvetica,Arial,sans-serif";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

// --- Bausteine (liefern fertiges HTML; Texte werden escaped) ---------------------

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:16px;line-height:1.65;color:${C.text}">${escapeHtml(text)}</p>`;
}

/** Kleinerer Hinweistext unter Buttons – nur für eigene, bereits escapte Inhalte. */
export function smallText(html: string): string {
  return `<p style="margin:16px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:1.6;color:${C.muted}">${html}</p>`;
}

export function heading(text: string): string {
  return `<h2 style="margin:32px 0 12px;font-family:${FONT_HEADING};font-size:18px;line-height:1.3;font-weight:700;color:${C.heading}">${escapeHtml(text)}</h2>`;
}

/** „Bulletproof"-Button: funktioniert auch in Outlook (Tabelle statt CSS-Button). */
export function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px">
<tr><td align="center" bgcolor="${C.accent}" style="border-radius:12px;background:${C.accent}">
<a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:16px 28px;font-family:${FONT_HEADING};font-size:16px;font-weight:700;line-height:1;color:${C.navy};text-decoration:none;border-radius:12px">${escapeHtml(label)}&nbsp;&rarr;</a>
</td></tr></table>`;
}

/** Link zum Kopieren, falls der Button nicht funktioniert. */
export function linkFallback(url: string, locale: Locale = "de"): string {
  const hint = locale === "en" ? "If the button doesn't work, copy this link into your browser:" : "Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:";
  return `<p style="margin:12px 0 0;font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${C.muted}">${hint}<br>
<a href="${escapeHtml(url)}" style="color:${C.accentInk};word-break:break-all">${escapeHtml(url)}</a></p>`;
}

/** Hellgraue Info-Box mit Zeilen „Bezeichnung – Wert". */
export function infoCard(rows: Array<[label: string, value: string]>): string {
  const body = rows
    .map(
      ([label, value], index) => `<tr>
<td class="ic lbl" valign="top" style="padding:12px 20px;${index > 0 ? `border-top:1px solid ${C.border};` : ""}font-family:${FONT_BODY};font-size:14px;white-space:nowrap;color:${C.muted}">${escapeHtml(label)}</td>
<td class="ic val" align="right" valign="top" style="padding:12px 20px;${index > 0 ? `border-top:1px solid ${C.border};` : ""}font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${C.heading};word-break:break-word;overflow-wrap:anywhere">${escapeHtml(value)}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;background:${C.surface};border:1px solid ${C.border};border-radius:14px;border-collapse:separate">${body}</table>`;
}

/** Liste mit Häkchen im Markenstil. */
export function checklist(items: string[]): string {
  const rows = items
    .map(
      (item) => `<tr>
<td valign="top" width="30" style="padding:6px 0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="20" height="20" align="center" bgcolor="#e0f2fe" style="width:20px;height:20px;border-radius:10px;background:#e0f2fe;font-family:Arial,sans-serif;font-size:12px;font-weight:700;line-height:20px;color:${C.accentInk}">&#10003;</td></tr></table>
</td>
<td style="padding:6px 0;font-family:${FONT_BODY};font-size:15px;line-height:1.55;color:${C.text}">${escapeHtml(item)}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px">${rows}</table>`;
}

/** Dezenter Hinweis (z. B. Sicherheit, Gültigkeit). */
export function note(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0"><tr>
<td style="padding:16px 18px;background:${C.surface};border-left:3px solid ${C.accent};border-radius:8px;font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${C.muted}">${escapeHtml(text)}</td>
</tr></table>`;
}

export function signature(locale: Locale = "de"): string {
  const [closing, team] = locale === "en" ? ["Kind regards", `Your ${COMPANY.name} team`] : ["Herzliche Grüße", `Ihr Team von ${COMPANY.name}`];
  return `<p style="margin:32px 0 0;font-family:${FONT_BODY};font-size:16px;line-height:1.65;color:${C.text}">${closing}<br>
<strong style="color:${C.heading}">${escapeHtml(team)}</strong></p>`;
}

// --- Gesamtlayout -------------------------------------------------------------------

export interface LayoutOptions {
  /** Vorschautext im Posteingang (unsichtbar im Mailtext). */
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  /** Inhaltsbausteine (HTML aus den Funktionen oben). */
  body: string[];
  /** Warum der Empfänger diese Mail bekommt. */
  reason: string;
  /** Sprache der Mail (Kunden: Profilsprache). Standard Deutsch. */
  locale?: Locale;
}

/** Pflichtangaben im Fuß jeder Mail (§ 35a GmbHG bzw. § 37a HGB): Vertretung, Register, USt-IdNr. */
export function legalFooterLine(locale: Locale = "de"): string {
  return [
    `${ownerTitle(locale)}: ${COMPANY.owner}`,
    hasRegisterEntry() ? `${COMPANY.register.court}, ${COMPANY.register.number}` : "",
    `${locale === "en" ? "VAT ID" : "USt-IdNr."} ${formattedVatId()}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function renderLayout({ preheader, eyebrow, title, intro, body, reason, locale = "de" }: LayoutOptions): string {
  const site = COMPANY.websiteUrl;
  const address = `${COMPANY.address.street} · ${COMPANY.address.postalCode} ${COMPANY.address.city}`;
  const labels =
    locale === "en"
      ? { portal: "Customer portal", imprint: "Legal notice", privacy: "Privacy" }
      : { portal: "Kundenportal", imprint: "Impressum", privacy: "Datenschutz" };

  return `<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(title)}</title>
<style>
  @media (max-width:620px){
    .outer{padding:16px 8px!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .title{font-size:25px!important}
    .ic{padding:10px 14px!important}
  }
  @media (max-width:480px){
    .hide-sm{display:none!important}
    .lbl,.val{display:block!important;width:auto!important;text-align:left!important}
    .val{border-top:0!important;padding-top:0!important}
  }
  a{color:${C.accentInk}}
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page}">
<tr><td align="center" class="outer" style="padding:32px 12px">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

<!-- Kopf: Navy mit Logo, Überschrift und Akzentlinie wie auf der Website -->
<tr><td bgcolor="${C.navy}" class="px" style="background:${C.navy};border-radius:20px 20px 0 0;padding:28px 40px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td valign="middle">
      <a href="${site}" target="_blank" style="text-decoration:none">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle" style="padding-right:12px"><img src="cid:${LOGO_CID}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;border:0;border-radius:10px"></td>
          <td valign="middle" style="font-family:${FONT_HEADING};font-size:20px;line-height:1;color:#ffffff;white-space:nowrap"><strong style="font-weight:800">FA</strong> <span style="font-weight:500">Transport</span></td>
        </tr></table>
      </a>
    </td>
    <td align="right" valign="middle" class="hide-sm" style="font-family:${FONT_BODY};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.accent}">${labels.portal}</td>
  </tr></table>
</td></tr>
<tr><td bgcolor="${C.navy}" class="px" style="background:${C.navy};padding:36px 40px 40px">
  <p style="margin:0 0 12px;font-family:${FONT_BODY};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.accent}">${escapeHtml(eyebrow)}</p>
  <h1 class="title" style="margin:0;font-family:${FONT_HEADING};font-size:30px;line-height:1.2;font-weight:800;letter-spacing:-0.5px;color:#ffffff">${escapeHtml(title)}</h1>
  <p style="margin:14px 0 0;font-family:${FONT_BODY};font-size:16px;line-height:1.6;color:${C.navyText}">${escapeHtml(intro)}</p>
</td></tr>
<tr><td height="4" bgcolor="${C.accent}" style="height:4px;line-height:4px;font-size:0;background:${C.accent};background-image:linear-gradient(90deg,${C.accentBright},${C.accent} 55%,#a5f3fc)">&nbsp;</td></tr>

<!-- Inhalt -->
<tr><td bgcolor="#ffffff" class="px" style="background:#ffffff;border-radius:0 0 20px 20px;padding:40px">
${body.join("\n")}
</td></tr>

<!-- Fuß -->
<tr><td class="px" style="padding:28px 40px 8px;font-family:${FONT_BODY};font-size:13px;line-height:1.7;color:${C.muted};text-align:center">
  <strong style="color:${C.heading}">${escapeHtml(COMPANY.legalName)}</strong><br>
  ${escapeHtml(address)}<br>
  <a href="${escapeHtml(COMPANY.contact.phoneHref)}" style="color:${C.muted};text-decoration:none">${escapeHtml(COMPANY.contact.phone)}</a>
  &nbsp;·&nbsp; <a href="mailto:${COMPANY.contact.email}" style="color:${C.muted};text-decoration:none">${COMPANY.contact.email}</a><br>
  <span style="font-size:12px">${escapeHtml(legalFooterLine(locale))}</span><br>
  <a href="${site}/impressum" style="color:${C.accentInk}">${labels.imprint}</a> &nbsp;·&nbsp; <a href="${site}/datenschutz" style="color:${C.accentInk}">${labels.privacy}</a> &nbsp;·&nbsp; <a href="${site}" style="color:${C.accentInk}">${site.replace(/^https?:\/\//, "")}</a>
  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8">${escapeHtml(reason)}</p>
</td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body>
</html>`;
}
