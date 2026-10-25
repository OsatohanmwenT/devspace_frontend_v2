"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { CheckIcon } from "~/components/ui/icons";
import { BackLink } from "~/components/ui/nav-link";
import { useLoad } from "~/hooks/use-load";
import { useToast } from "~/providers/toast-provider";
import type { LeaderboardEntry } from "~/types/leaderboard";
import type { PrivateLeagueData, PrivateLeaguesData } from "~/types/private-leagues";
import { getPrivateLeagues, leavePrivateLeague } from "../api/private-leagues-api";
import { CompetitorDrawer } from "./competitor-drawer";
import { CreateLeagueDrawer, JoinLeagueDrawer, LeagueSettingsDrawer } from "./private-league-forms";
import { LeaderboardRow } from "./leaderboard-row";
import { LeagueClassSpace } from "./league-class-space";
import { LeagueOrganizerDashboard } from "./league-organizer-dashboard";

function CopyIcon() {
  return <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" /><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="2" /></svg>;
}

function PrivateLeagueDetail({ league, data, onBack, onUpdate, onSwitch, initialPage }: { league: PrivateLeagueData; data: PrivateLeaguesData; onBack: () => void; onUpdate: (data: PrivateLeaguesData) => void; onSwitch: (id: string) => void; initialPage: "standings" | "space" }) {
  const toast = useToast();
  const [settings, setSettings] = useState(false);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);
  const [page, setPage] = useState<"standings" | "space" | "dashboard">(initialPage);
  const [conversation, setConversation] = useState("general");
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const isOwner = league.ownerId === "you";
  const userIndex = league.standings.findIndex((entry) => entry.isCurrentUser);
  const you = league.standings[userIndex];
  const above = league.standings[userIndex - 1];
  const below = league.standings[userIndex + 1];

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async (kind: "code" | "link") => {
    const value = kind === "code" ? league.code : `${window.location.origin}/league/${league.code}`;
    try { await navigator.clipboard.writeText(value); setCopied(kind); toast(kind === "code" ? "Invite code copied" : "Invite link copied"); }
    catch { toast(value); }
  };
  const tabs = ([{ id: "standings", label: "Standings" }, { id: "space", label: "Class space" }, ...(isOwner ? [{ id: "dashboard", label: "Dashboard" }] : [])] as { id: typeof page; label: string }[]);
  const nav = (
    <nav aria-label="League sections" className="flex gap-1 border-b border-[#e4e2dc] dark:border-[#2e2e30]">
      {tabs.map((tab) => <button key={tab.id} type="button" aria-current={page === tab.id ? "page" : undefined} onClick={() => setPage(tab.id)} className={`focus-ring -mb-px min-h-11 border-b-2 px-4 text-sm font-semibold transition-colors ${page === tab.id ? "border-blue-600 text-neutral-800 dark:text-night-ink" : "border-transparent text-ink-soft hover:text-neutral-800 dark:text-night-soft dark:hover:text-night-ink"}`}>{tab.label}</button>)}
    </nav>
  );

  return (
    <>
      {page === "space" ? (
        <LeagueClassSpace key={`${league.id}:${conversation}`} league={league} data={data} initialChannel={conversation} onBack={() => setPage("standings")} onUpdate={onUpdate} onSwitch={onSwitch} />
      ) : page === "dashboard" ? (
        <LeagueOrganizerDashboard league={league} nav={nav} onBack={() => setPage("standings")} onSettings={() => setSettings(true)} onSelect={setSelected} onUpdate={onUpdate} onMessage={(id) => { setConversation(`dm:${id}`); setPage("space"); }} />
      ) : (
        <div className="grid gap-5">
          <div className="flex items-center justify-between gap-3"><BackLink onClick={onBack}>All private leagues</BackLink>{isOwner && <button type="button" className="focus-ring text-[13px] font-medium text-blue-600 hover:underline dark:text-blue-300" onClick={() => setSettings(true)}>League settings</button>}</div>
          <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 rounded-2xl border border-[#eeeeeb] bg-white p-5 dark:border-night-line dark:bg-[#1a1a1c]">
            <div className="flex min-w-0 items-start gap-4 min-[520px]:items-center">
              <span aria-hidden="true" className="grid size-14 flex-none place-items-center rounded-2xl bg-[#f0f0ee] text-2xl dark:bg-[#262626]">{league.emoji}</span>
              <div className="grid min-w-0 gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1"><h1 className="truncate text-xl font-semibold text-neutral-800 dark:text-night-ink">{league.name}</h1>{league.kind === "class" && <span className="rounded-full bg-blue-600/15 px-2 py-0.5 text-[10px] font-bold tracking-[.05em] text-blue-700 uppercase dark:text-blue-300">Class</span>}{league.organizerOnly && <span className="rounded-full bg-[#eeeeeb] px-2 py-0.5 text-[10px] font-bold tracking-[.05em] text-ink-soft uppercase dark:bg-[#2a2a2e] dark:text-night-soft">Organizer</span>}</div>
                {you ? <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft dark:text-night-soft"><strong className="text-neutral-800 dark:text-night-ink">You’re #{you.rank} of {league.standings.length}</strong><span>{league.standings.length === 1 ? "Just you so far — share the code to get a race going." : above ? above.score === you.score ? `Level with ${above.name} — one more coin passes them.` : `${above.score - you.score} coins behind ${above.name}.` : below?.score === you.score ? `Tied with ${below.name} at the top.` : `${you.score - (below?.score ?? 0)} coins clear of ${below?.name}.`}</span></p> : <p className="text-sm text-ink-soft dark:text-night-soft"><strong className="text-neutral-800 dark:text-night-ink">You’re organizing</strong> · {league.standings.length} participants competing</p>}
              </div>
            </div>
            <div className="grid justify-items-start gap-1.5 min-[760px]:justify-items-end">
              <span className="text-[11px] font-semibold tracking-[.08em] text-[#737371] uppercase dark:text-[#7d7d80]">Invite friends</span>
              <div className="flex items-center gap-1.5"><button type="button" aria-label={`Copy invite code ${league.code}`} onClick={() => copy("code")} className="focus-ring inline-flex min-h-10 items-center gap-2.5 rounded-xl border border-[#e1e1e1] bg-[#faf9f6] pr-3 pl-3.5 text-neutral-800 dark:border-night-line dark:bg-night-card dark:text-night-ink"><span className="text-[15px] font-semibold tracking-[.14em] tabular-nums">{league.code}</span>{copied === "code" ? <CheckIcon className="size-4 text-teal-600 dark:text-teal-400" /> : <CopyIcon />}</button><button type="button" onClick={() => copy("link")} className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-blue-600 hover:bg-blue-500/10 dark:text-blue-300">{copied === "link" ? <CheckIcon className="size-4" /> : <CopyIcon />}{copied === "link" ? "Link copied" : "Copy link"}</button></div>
            </div>
          </header>
          {nav}
          <ol className="overflow-hidden rounded-3xl bg-white p-1.5 shadow-[0_1px_3px_rgba(20,20,20,0.06)] dark:bg-[#1a1a1c] dark:shadow-none" aria-label={`${league.name} standings`}>
            {league.standings.map((entry) => <li key={entry.id} className="border-t border-[#ebe9e4] first:border-t-0 dark:border-night-line"><LeaderboardRow entry={entry} onSelect={setSelected} /></li>)}
            {isOwner && Array.from({ length: league.openSpots }, (_, index) => <li key={`open-${index}`} className="border-t border-[#ebe9e4] dark:border-night-line"><button type="button" onClick={() => copy("link")} className="focus-ring flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-[13px] text-[#737371] hover:bg-neutral-100 dark:text-[#7d7d80] dark:hover:bg-[#262626]"><span aria-hidden="true" className="ml-8 grid size-10 flex-none place-items-center rounded-full border border-dashed border-neutral-300 text-lg dark:border-[#5a5a60]">+</span>Open spot — copy the invite link</button></li>)}
          </ol>
          <p className="text-xs text-[#737371] dark:text-[#7d7d80]">Ranked by the same Season Devy Coins as the official board — joining or leaving never changes anyone’s official rank, coins, or promotion.</p>
          {confirmingLeave ? (
            <div role="alertdialog" aria-label={isOwner ? "Delete league?" : "Leave league?"} className="grid gap-3 rounded-2xl border border-red-400/50 bg-red-500/5 px-5 py-4"><p className="text-[13px] text-neutral-800 dark:text-night-ink">{isOwner ? `You own ${league.name}. Deleting it retires code ${league.code} and removes the board for everyone.` : `Leave ${league.name}? You can rejoin any time with code ${league.code}.`} Your official coins and rank aren’t affected.</p><div className="flex gap-2"><button type="button" className="rounded-lg border border-red-500 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400" onClick={async () => { onUpdate(await leavePrivateLeague(league.id)); onBack(); }}>{isOwner ? "Yes, delete it" : "Yes, leave"}</button><Button variant="neutral" className="min-h-9 text-xs" onClick={() => setConfirmingLeave(false)}>Cancel</Button></div></div>
          ) : <button type="button" onClick={() => setConfirmingLeave(true)} className="focus-ring justify-self-start text-[13px] font-medium text-red-600 hover:underline dark:text-red-400">{isOwner ? "Delete league" : "Leave league"}</button>}
        </div>
      )}
      {settings && <LeagueSettingsDrawer league={league} onClose={() => setSettings(false)} onUpdate={onUpdate} />}
      {selected && <CompetitorDrawer entry={selected} leagueName={league.name} seasonIndex={data.seasonIndex} onClose={() => setSelected(null)} />}
    </>
  );
}

function PrivateLeaguesContent({ initial, onBack, initialCode }: { initial: PrivateLeaguesData; onBack: () => void; initialCode?: string }) {
  const [data, setData] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialPage, setInitialPage] = useState<"standings" | "space">("standings");
  const [dialog, setDialog] = useState<"create" | "join" | null>(initialCode ? "join" : null);
  const selected = data.leagues.find((league) => league.id === selectedId);
  const complete = (next: PrivateLeaguesData, id: string) => { setData(next); setInitialPage("standings"); setSelectedId(id); setDialog(null); };
  return (
    <main className="mx-auto grid w-[min(100%,904px)] content-start gap-6 px-[22px] pt-8 pb-16 max-[900px]:px-[18px] max-tab:pt-6" aria-label="Private leagues">
      {selected ? <PrivateLeagueDetail key={selected.id} league={selected} data={data} initialPage={initialPage} onBack={() => { setSelectedId(null); setInitialPage("standings"); }} onUpdate={setData} onSwitch={(id) => { setInitialPage("space"); setSelectedId(id); }} /> : (
        <>
          <div className="justify-self-start"><BackLink onClick={onBack}>Back to your league</BackLink></div>
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-semibold text-neutral-800 dark:text-night-ink">Private leagues</h1><div className="flex gap-2"><Button variant="neutral" className="min-h-10 text-sm" onClick={() => setDialog("join")}>Join with code</Button><Button className="min-h-10 text-sm" onClick={() => setDialog("create")}>Create a league</Button></div></div>
            {data.leagues.length === 0 ? <section className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-5 py-10 text-center dark:border-night-line"><span aria-hidden="true" className="text-3xl">🏁</span><strong className="text-[15px] font-semibold text-neutral-800 dark:text-night-ink">Race the people you actually know</strong><p className="max-w-[420px] text-sm text-ink-soft dark:text-night-soft">Start a league for your study group or classmates, or join one with a friend’s 6-character code.</p><Button className="mt-1 min-h-10 text-sm" onClick={() => setDialog("create")}>Create your first league</Button></section> : (
              <ul className="grid gap-3">
                {data.leagues.map((league) => {
                  const you = league.standings.find((entry) => entry.isCurrentUser);
                  return <li key={league.id}><button type="button" onClick={() => setSelectedId(league.id)} className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-[#eeeeeb] bg-white px-5 py-4 text-left transition-colors hover:border-neutral-300 dark:border-night-line dark:bg-[#1a1a1c] dark:hover:border-[#5a5a60]"><span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-xl bg-[#f0f0ee] text-lg dark:bg-[#262626]">{league.emoji}</span><span className="grid min-w-0 flex-1 gap-0.5"><span className="flex flex-wrap items-center gap-2"><strong className="truncate text-[15px] font-semibold text-neutral-800 dark:text-night-ink">{league.name}</strong>{league.kind === "class" && <span className="rounded-full bg-blue-600/15 px-1.5 py-px text-[10px] font-bold text-blue-700 dark:text-blue-300">CLASS</span>}{league.ownerId === "you" && <span className="rounded-full bg-[#eeeeeb] px-1.5 py-px text-[10px] font-bold text-ink-soft dark:bg-[#2a2a2e] dark:text-night-soft">{league.organizerOnly ? "ORGANIZER" : "OWNER"}</span>}</span><span className="text-[13px] text-ink-soft dark:text-night-soft">{league.standings.length} of {league.capacity} {league.kind === "class" ? "participants" : "members"} · code {league.code}</span></span>{you ? <span className="grid flex-none justify-items-end"><strong className={`text-lg font-semibold tabular-nums ${you.rank === 1 ? "text-[#b8860b] dark:text-[#ffcf8b]" : "text-neutral-800 dark:text-night-ink"}`}>#{you.rank}</strong><span className="text-[11px] text-[#737371] dark:text-[#7d7d80]">your place</span></span> : <span aria-hidden="true" className="text-ink-soft dark:text-night-soft">→</span>}</button></li>;
                })}
              </ul>
            )}
          </div>
        </>
      )}
      {dialog === "create" && <CreateLeagueDrawer onClose={() => setDialog(null)} onComplete={complete} />}
      {dialog === "join" && <JoinLeagueDrawer initialCode={initialCode} onClose={() => setDialog(null)} onComplete={complete} />}
    </main>
  );
}

export function PrivateLeaguesView({ onBack, initialCode }: { onBack: () => void; initialCode?: string }) {
  const result = useLoad(getPrivateLeagues);
  if (result.status === "error") return <main className="mx-auto max-w-[860px] p-6 text-neutral-800 dark:text-night-ink" role="alert">Couldn’t load private leagues. Refresh to try again.</main>;
  if (result.status !== "ready") return <main className="min-h-dvh" aria-busy="true" />;
  return <PrivateLeaguesContent initial={result.data} onBack={onBack} initialCode={initialCode} />;
}

export function PrivateLeagueInvite({ code }: { code: string }) {
  const router = useRouter();
  return <PrivateLeaguesView initialCode={code} onBack={() => router.push("/leaderboard")} />;
}
