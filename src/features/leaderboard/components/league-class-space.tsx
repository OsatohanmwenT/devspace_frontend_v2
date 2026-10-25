"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "~/components/ui/avatar";
import { LEAGUE_CHANNELS } from "~/config/private-leagues";
import type { PrivateLeagueData, PrivateLeaguesData } from "~/types/private-leagues";
import { postLeagueMessage } from "../api/private-leagues-api";

type LeagueClassSpaceProps = {
  league: PrivateLeagueData;
  data: PrivateLeaguesData;
  initialChannel: string;
  onBack: () => void;
  onUpdate: (data: PrivateLeaguesData) => void;
  onSwitch: (id: string) => void;
};

export function LeagueClassSpace({ league, data, initialChannel, onBack, onUpdate, onSwitch }: LeagueClassSpaceProps) {
  const [active, setActive] = useState(initialChannel);
  const [showList, setShowList] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const contacts = league.standings.filter((entry) => !entry.isCurrentUser);
  const channel = LEAGUE_CHANNELS.find((entry) => entry.id === active);
  const contact = contacts.find((entry) => `dm:${entry.id}` === active);
  const lead = league.leadId === "you" ? "you, the lead" : contacts.find((entry) => entry.id === league.leadId)?.name ?? "the lead";
  const messages = data.messages[league.id]?.[active] ?? [];
  const disabled = channel?.leadOnly && league.ownerId !== "you";
  const open = (key: string) => { setActive(key); setShowList(false); setText(""); setError(""); };

  useEffect(() => {
    const wasLocked = document.body.classList.contains("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !event.defaultPrevented) onBack(); };
    document.addEventListener("keydown", onKey);
    return () => { if (!wasLocked) document.body.classList.remove("overflow-hidden"); document.removeEventListener("keydown", onKey); };
  }, [onBack]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [active, messages.length]);

  return (
    <div className="fixed inset-0 z-40 flex bg-white text-neutral-800 dark:bg-[#1c1c20] dark:text-night-ink" role="dialog" aria-modal="true" aria-label={`${league.name} class space`}>
      <nav aria-label="Your leagues" className={`flex w-[72px] flex-none flex-col items-center gap-2 overflow-y-auto bg-[#e8e6e1] py-3 dark:bg-[#111113] ${showList ? "" : "max-[720px]:hidden"}`}>
        <button type="button" aria-label="Back to the league page" onClick={onBack} className="focus-ring grid size-12 place-items-center rounded-[24px] bg-white text-xl dark:bg-[#232327]">‹</button>
        <span className="my-1 h-0.5 w-8 bg-neutral-300 dark:bg-white/10" />
        {data.leagues.map((entry) => <button key={entry.id} type="button" aria-label={entry.name} aria-current={entry.id === league.id ? "page" : undefined} onClick={() => entry.id !== league.id && onSwitch(entry.id)} className={`focus-ring grid size-12 place-items-center text-[22px] transition-all ${entry.id === league.id ? "rounded-2xl bg-blue-600 text-white" : "rounded-[24px] bg-white hover:rounded-2xl hover:bg-blue-600 dark:bg-[#232327]"}`}>{entry.emoji}</button>)}
      </nav>
      <aside className={`flex w-60 flex-none flex-col bg-[#f1efe9] max-[720px]:flex-1 dark:bg-[#17171b] ${showList ? "" : "max-[720px]:hidden"}`}>
        <header className="flex h-12 flex-none items-center gap-2 border-b border-black/8 px-4 dark:border-white/6"><strong className="min-w-0 flex-1 truncate text-[15px] font-semibold">{league.name}</strong><span className="text-[11px] font-semibold text-ink-soft uppercase dark:text-night-soft">{league.kind === "class" ? "Class" : "Friends"}</span></header>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-2 py-4">
          <div className="grid gap-0.5"><span className="px-2 text-[11px] font-bold tracking-[.06em] text-ink-soft uppercase dark:text-night-soft">Information</span>{LEAGUE_CHANNELS.filter((entry) => entry.leadOnly).map((entry) => <button key={entry.id} type="button" onClick={() => open(entry.id)} aria-current={active === entry.id ? "page" : undefined} className={`focus-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[15px] ${active === entry.id ? "bg-white font-semibold dark:bg-white/8" : "text-ink-soft hover:bg-white/60 dark:text-night-soft dark:hover:bg-white/5"}`}><span className="text-lg text-neutral-500">#</span>{entry.name}<span className="ml-auto text-[11px]" aria-label="Only the lead can post">🔒</span></button>)}</div>
          <div className="grid gap-0.5"><span className="px-2 text-[11px] font-bold tracking-[.06em] text-ink-soft uppercase dark:text-night-soft">Community</span>{LEAGUE_CHANNELS.filter((entry) => !entry.leadOnly).map((entry) => <button key={entry.id} type="button" onClick={() => open(entry.id)} aria-current={active === entry.id ? "page" : undefined} className={`focus-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[15px] ${active === entry.id ? "bg-white font-semibold dark:bg-white/8" : "text-ink-soft hover:bg-white/60 dark:text-night-soft dark:hover:bg-white/5"}`}><span className="text-lg text-neutral-500">#</span>{entry.name}</button>)}</div>
          <div className="grid gap-0.5">
            <span className="px-2 text-[11px] font-bold tracking-[.06em] text-ink-soft uppercase dark:text-night-soft">Direct messages</span>
            {contacts.length > 8 && <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find someone" aria-label="Find someone to message" className="focus-ring mx-1 mb-1 h-8 rounded-md bg-[#e8e6e1] px-2.5 text-[13px] outline-none dark:bg-[#111113]" />}
            {contacts.filter((entry) => entry.name.toLowerCase().includes(query.trim().toLowerCase())).map((entry) => <button key={entry.id} type="button" onClick={() => open(`dm:${entry.id}`)} aria-current={active === `dm:${entry.id}` ? "page" : undefined} className={`focus-ring flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left ${active === `dm:${entry.id}` ? "bg-white dark:bg-white/8" : "hover:bg-white/60 dark:hover:bg-white/5"}`}><Avatar seed={entry.id} size="sm" /><span className="min-w-0 flex-1 truncate text-sm text-ink-soft dark:text-night-soft">{entry.name}</span>{entry.id === league.leadId && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300">LEAD</span>}</button>)}
          </div>
          <p className="mt-auto px-2 text-[11px] leading-[1.45] text-ink-soft dark:text-night-soft">Demo: classmates are simulated, so they won’t reply. Your messages are saved on this device.</p>
        </div>
        <div className="flex h-14 flex-none items-center gap-2.5 bg-[#e8e6e1] px-3 dark:bg-[#111113]"><Avatar seed="you" size="sm" /><div className="grid"><strong className="text-[13px]">You</strong><span className="text-[11px] text-ink-soft dark:text-night-soft">{league.ownerId === "you" ? league.organizerOnly ? "Lead · organizing" : "Lead" : "Member"}</span></div></div>
      </aside>
      <section className={`flex min-w-0 flex-1 flex-col ${showList ? "max-[720px]:hidden" : ""}`} aria-label={channel ? `#${channel.name}` : contact?.name}>
        <header className="flex h-12 flex-none items-center gap-3 border-b border-black/8 px-4 dark:border-white/6">
          <button type="button" aria-label="Channels and messages" onClick={() => setShowList(true)} className="focus-ring hidden size-8 place-items-center rounded-md max-[720px]:grid">☰</button>
          <strong className="truncate text-base font-semibold">{channel ? `# ${channel.name}` : contact?.name}</strong>
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft max-[720px]:hidden dark:text-night-soft">{channel?.topic ?? contact?.role}</span>
          <button type="button" aria-label={showMembers ? "Hide member list" : "Show member list"} aria-pressed={showMembers} onClick={() => setShowMembers(!showMembers)} className="focus-ring hidden rounded-md px-2 py-1 text-xs min-[1100px]:block">Members</button>
        </header>
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto pb-4">
              <div className="grid gap-2 px-4 pt-8 pb-2"><span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-[#ecebe6] text-[34px] dark:bg-[#2c2c31]">{channel ? "#" : <Avatar seed={contact?.id ?? "you"} size="lg" />}</span><h2 className="text-[26px] font-bold">{channel ? `Welcome to #${channel.name}` : contact?.name}</h2><p className="text-sm text-ink-soft dark:text-night-soft">{channel ? channel.leadOnly ? `Updates from ${lead}. Everyone in ${league.name} sees these.` : `${channel.topic}. Everyone in ${league.name} can read and post here.` : `This is the start of your conversation with ${contact?.name}.`}</p></div>
              {messages.map((message, index) => <div key={message.id} className={`mt-4 flex gap-4 border-l-2 px-4 py-1 ${active === "announcements" ? "border-[#ffb454] bg-[#ffb454]/6" : "border-transparent hover:bg-black/3 dark:hover:bg-white/3"}`}><Avatar seed={message.authorId} /><div className="grid min-w-0 gap-0.5"><span className="flex flex-wrap items-baseline gap-2"><strong className="text-[15px] font-semibold">{message.name}</strong>{message.authorId === league.leadId && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300">LEAD</span>}<time dateTime={new Date(message.at).toISOString()} className="text-xs text-ink-soft dark:text-night-soft">{new Date(message.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time>{index === 0 && <span className="text-[11px] text-ink-soft dark:text-night-soft">{new Date(message.at).toLocaleDateString()}</span>}</span><p className="text-[15px] leading-[1.45] whitespace-pre-wrap break-words">{message.text}</p></div></div>)}
            </div>
            <div className="flex-none px-4 pt-1 pb-5">
              {disabled ? <p className="rounded-lg bg-[#f1efea] px-4 py-3 text-sm text-ink-soft dark:bg-[#2a2a2e] dark:text-night-soft">Only {lead} can post in #announcements. Reply in #general, or message them directly.</p> : <form className="flex items-end gap-2 rounded-lg bg-[#f1efea] px-2 py-1.5 dark:bg-[#2a2a2e]" onSubmit={async (event) => { event.preventDefault(); if (!text.trim() || sending) return; setSending(true); try { onUpdate(await postLeagueMessage(league.id, active, text)); setText(""); setError(""); } catch (error) { setError(error instanceof Error ? error.message : "Couldn’t send message."); } finally { setSending(false); } }}><textarea key={active} value={text} autoFocus onChange={(event) => setText(event.target.value.slice(0, 2000))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} aria-label={channel ? `Message #${channel.name}` : `Message ${contact?.name}`} placeholder={channel ? `Message #${channel.name}` : `Message ${contact?.name}`} className="min-h-9 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none" /><button type="submit" disabled={!text.trim() || sending} aria-label="Send message" className="focus-ring grid size-9 place-items-center rounded-md text-xl text-blue-600 disabled:opacity-30 dark:text-blue-300">↑</button></form>}
              {error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>
          {showMembers && <aside className="hidden w-56 flex-none overflow-y-auto bg-[#f1efe9] p-4 min-[1100px]:block dark:bg-[#17171b]"><h3 className="mb-3 text-[11px] font-bold tracking-[.06em] text-ink-soft uppercase dark:text-night-soft">Members — {league.standings.length + (league.organizerOnly ? 1 : 0)}</h3>{league.organizerOnly && <div className="mb-3 flex items-center gap-2"><Avatar seed="you" size="sm" /><span className="text-sm">You · Lead</span></div>}{league.standings.map((entry) => <button key={entry.id} type="button" disabled={entry.isCurrentUser} onClick={() => open(`dm:${entry.id}`)} className="focus-ring mb-2 flex w-full items-center gap-2 rounded-md py-1 text-left"><Avatar seed={entry.id} size="sm" /><span className="truncate text-sm text-ink-soft dark:text-night-soft">{entry.name}{entry.id === league.leadId ? " · Lead" : ""}</span></button>)}</aside>}
        </div>
      </section>
    </div>
  );
}
