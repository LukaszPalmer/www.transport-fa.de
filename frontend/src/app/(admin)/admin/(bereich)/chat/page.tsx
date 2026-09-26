import type { Metadata } from "next";
import { can, requireStaff } from "@/lib/admin-session";
import { ChatConsole } from "@/components/admin/chat/ChatConsole";
import { NoAccess } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Live-Chat" };

export default async function AdminChatPage({ searchParams }: PageProps<"/admin/chat">) {
  const me = await requireStaff();
  if (!can(me, "can_chat")) return <NoAccess />;
  const { chat } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-display text-2xl font-bold text-primary">Live-Chat</h1>
        <p className="text-sm text-slate-500">Beendete Chats werden nach 24 Stunden automatisch gelöscht.</p>
      </div>
      <ChatConsole initialChatId={typeof chat === "string" && /^[a-f0-9]{24}$/.test(chat) ? chat : undefined} />
    </div>
  );
}
