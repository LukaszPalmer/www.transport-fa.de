/**
 * Beendet noch laufende Dev-Server dieses Projekts (läuft automatisch vor `npm run dev`).
 * Unter Windows überleben `next dev` und `tsx watch` oft das Schließen des Terminals.
 * Diese Waisen belegen Port 3000/4000: Das neue Frontend weicht auf 3001 aus (CORS
 * blockt den Login), das neue Backend stürzt mit EADDRINUSE ab, und Turbopack kann
 * irgendwann keine Worker mehr starten (Exit-Code 0xc0000142).
 * Erkannt werden nur Dev-Prozesse aus genau diesem Ordner – Worktrees und andere
 * Skripte (z. B. `npm run admin`) bleiben unberührt.
 */
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const isWindows = process.platform === "win32";
// Kommandozeilen vereinheitlichen: Groß-/Kleinschreibung, Backslashes, Anführungszeichen,
// file-URLs (%20) und npm-Shims („node_modules\.bin\\..\next\…“).
const normalize = (text) =>
  text.toLowerCase().replaceAll("%20", " ").replaceAll('"', "").replace(/[\\/]+/g, "/").replaceAll("/.bin/../", "/");

const modules = `${normalize(resolve(dirname(fileURLToPath(import.meta.url)), ".."))}/node_modules/`;
const devSignatures = [
  "next/dist/bin/next dev",
  "next/dist/server/lib/start-server.js",
  "tsx/dist/cli.mjs watch",
  "tsx/dist/loader.mjs src/server.ts",
  "concurrently/dist/bin/index.js",
];

function listNodeProcesses() {
  if (isWindows) {
    const script =
      "ConvertTo-Json -Compress -InputObject @(Get-CimInstance Win32_Process | Where-Object Name -eq node.exe | Select-Object ProcessId,CommandLine)";
    const output = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], { encoding: "utf8" });
    return [].concat(JSON.parse(output || "[]")).map((p) => ({ pid: p.ProcessId, command: p.CommandLine ?? "" }));
  }
  return execFileSync("ps", ["-axo", "pid=,command="], { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim().match(/^(\d+)\s+(.*)$/))
    .filter(Boolean)
    .map(([, pid, command]) => ({ pid: Number(pid), command }));
}

let processes = [];
try {
  processes = listNodeProcesses();
} catch (error) {
  // Aufräumen ist nur eine Hilfe – `npm run dev` soll daran nie scheitern.
  console.warn(`Laufende Dev-Server konnten nicht geprüft werden: ${error.message}`);
}

const stale = processes.filter(({ pid, command }) => {
  const cmd = normalize(command);
  return pid !== process.pid && devSignatures.some((signature) => cmd.includes(modules + signature));
});

for (const { pid } of stale) {
  try {
    // /T beendet den ganzen Prozessbaum (inkl. Turbopack-Worker), /F ohne Rückfrage.
    if (isWindows) execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    else process.kill(pid, "SIGTERM");
  } catch {
    // bereits mit einem übergeordneten Prozess beendet
  }
}
if (stale.length > 0) console.log(`Alte Dev-Server beendet (PID ${stale.map((p) => p.pid).join(", ")}).`);
