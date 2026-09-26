/**
 * Wer ist gerade verbunden? Zählt offene Socket-Verbindungen je Nutzer (mehrere Tabs
 * = mehrere Verbindungen). Liegt im Speicher – passend für eine API-Instanz. Für
 * mehrere Instanzen bräuchte es den Socket.IO-Redis-Adapter und einen gemeinsamen Store.
 */
const connections = new Map<string, Set<string>>();

/** true, wenn das die erste Verbindung des Nutzers ist (→ „ist jetzt online"). */
export function trackConnect(userId: string, socketId: string): boolean {
  const sockets = connections.get(userId);
  if (sockets) {
    sockets.add(socketId);
    return false;
  }
  connections.set(userId, new Set([socketId]));
  return true;
}

/** true, wenn damit die letzte Verbindung geschlossen wurde (→ „ist jetzt offline"). */
export function trackDisconnect(userId: string, socketId: string): boolean {
  const sockets = connections.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size > 0) return false;
  connections.delete(userId);
  return true;
}

export function isOnline(userId: string | { toString(): string }): boolean {
  return connections.has(String(userId));
}

export function onlineUserIds(): string[] {
  return [...connections.keys()];
}
