/**
 * E-Mail-Vorlagen: Klartext (Pflicht, beste Zustellbarkeit) und schlichtes,
 * markengerechtes HTML. Alle Nutzereingaben werden escaped.
 */

interface RenderedMail {
  subject: string;
  text: string;
  html: string;
}

const BRAND = "FA Transport";
const COLOR_PRIMARY = "#0b132b";
const COLOR_ACCENT = "#38bdf8";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function layout(heading: string, paragraphs: string[], action: { label: string; url: string }, footnote: string): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p}</p>`).join("");
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f8fafc;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:${COLOR_PRIMARY}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:${COLOR_PRIMARY};padding:24px 32px;color:#ffffff;font-size:18px;font-weight:700">${BRAND} <span style="color:${COLOR_ACCENT}">Kundenportal</span></td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 16px;font-size:22px">${heading}</h1>${body}
<p style="margin:24px 0"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:${COLOR_ACCENT};color:${COLOR_PRIMARY};text-decoration:none;font-weight:700;padding:14px 24px;border-radius:12px">${action.label}</a></p>
<p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.6">Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br><span style="word-break:break-all">${escapeHtml(action.url)}</span></p>
<p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6">${footnote}</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function verificationMail(firstName: string, url: string): RenderedMail {
  const greeting = `Hallo ${firstName},`;
  return {
    subject: `Bitte bestätigen Sie Ihre E-Mail-Adresse – ${BRAND}`,
    text:
      `${greeting}\n\nwillkommen im Kundenportal von ${BRAND}! Bitte bestätigen Sie Ihre E-Mail-Adresse ` +
      `über diesen Link (24 Stunden gültig):\n\n${url}\n\n` +
      `Falls Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.\n\nIhr Team von ${BRAND}`,
    html: layout(
      "E-Mail-Adresse bestätigen",
      [escapeHtml(greeting), `willkommen im Kundenportal von ${BRAND}! Bitte bestätigen Sie Ihre E-Mail-Adresse – danach sehen Sie alle Aufträge, Dokumente und Rechnungen.`],
      { label: "E-Mail-Adresse bestätigen", url },
      "Der Link ist 24 Stunden gültig. Falls Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.",
    ),
  };
}

export function passwordResetMail(firstName: string, url: string): RenderedMail {
  const greeting = `Hallo ${firstName},`;
  return {
    subject: `Passwort zurücksetzen – ${BRAND} Kundenportal`,
    text:
      `${greeting}\n\nSie haben das Zurücksetzen Ihres Passworts angefordert. Der folgende Link ist 60 Minuten gültig:\n\n${url}\n\n` +
      `Falls Sie das nicht waren, können Sie diese E-Mail ignorieren – Ihr Passwort bleibt unverändert.\n\nIhr Team von ${BRAND}`,
    html: layout(
      "Neues Passwort festlegen",
      [escapeHtml(greeting), "Sie haben das Zurücksetzen Ihres Passworts angefordert. Über den Button legen Sie ein neues Passwort fest."],
      { label: "Neues Passwort festlegen", url },
      "Der Link ist 60 Minuten gültig und nur einmal verwendbar. Falls Sie das nicht waren, können Sie diese E-Mail ignorieren – Ihr Passwort bleibt unverändert.",
    ),
  };
}
