"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { CoinIcon } from "~/components/ui/game-icon";
import { useToast } from "~/providers/toast-provider";
import type { LeaderboardEntry } from "~/types/leaderboard";
import type { PrivateLeagueData, PrivateLeaguesData } from "~/types/private-leagues";
import { updatePrivateLeague } from "../api/private-leagues-api";

const SECTIONS = ["Overview", "Recognition", "Weekly progress", "Daily activity", "Participants"];
const PANEL = "rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(20,20,20,0.06)] dark:bg-[#1a1a1c] dark:shadow-none";

type DashboardProps = {
  league: PrivateLeagueData;
  nav: ReactNode;
  onBack: () => void;
  onSettings: () => void;
  onSelect: (entry: LeaderboardEntry) => void;
  onMessage: (id: string) => void;
  onUpdate: (data: PrivateLeaguesData) => void;
};

export function LeagueOrganizerDashboard({ league, nav, onBack, onSettings, onSelect, onMessage, onUpdate }: DashboardProps) {
  const toast = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState("Overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<"rank" | "score" | "last7" | "activeDays">("rank");
  const [ascending, setAscending] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [removing, setRemoving] = useState<string[] | null>(null);
  const participants = league.standings;
  const active = participants.filter((entry) => entry.lastActive !== null && entry.lastActive < 3);
  const nudge = participants.filter((entry) => entry.lastActive === null || entry.lastActive >= 3);
  const total = participants.reduce((sum, entry) => sum + entry.score, 0);
  const weekCoins = participants.reduce((sum, entry) => sum + entry.last7, 0);
  const sortedCoins = participants.map((entry) => entry.score).sort((a, b) => a - b);
  const middle = Math.floor(sortedCoins.length / 2);
  const median = sortedCoins.length === 0 ? 0 : sortedCoins.length % 2 ? sortedCoins[middle] : (sortedCoins[middle - 1] + sortedCoins[middle]) / 2;
  const weekLeaders = [...participants].sort((a, b) => b.last7 - a.last7).slice(0, 3);
  const consistent = [...participants].sort((a, b) => b.activeDays - a.activeDays).filter((entry) => entry.activeDays / league.daysIn >= 0.8).slice(0, 3);
  const rising = [...participants].filter((entry) => entry.last7 > entry.score - entry.last7).sort((a, b) => (b.last7 * 2 - b.score) - (a.last7 * 2 - a.score)).slice(0, 3);
  const rows = participants.filter((entry) => entry.name.toLowerCase().includes(query.trim().toLowerCase()) && (filter === "All" || filter === "Active" && entry.lastActive !== null && entry.lastActive < 3 || filter === "Needs a nudge" && (entry.lastActive === null || entry.lastActive >= 3)))
    .sort((a, b) => ascending ? a[sort] - b[sort] : b[sort] - a[sort]);
  const selectable = rows.filter((entry) => !entry.isCurrentUser).map((entry) => entry.id);
  const allSelected = selectable.length > 0 && selectable.every((id) => selected.includes(id));
  const maxDaily = Math.max(1, ...league.dailyTotals);

  useEffect(() => {
    const wasLocked = document.body.classList.contains("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !event.defaultPrevented) onBack(); };
    document.addEventListener("keydown", onKey);
    return () => { if (!wasLocked) document.body.classList.remove("overflow-hidden"); document.removeEventListener("keydown", onKey); };
  }, [onBack]);

  const jump = (label: string) => {
    setSection(label);
    scrollRef.current?.querySelector(`#dash-${label.replaceAll(" ", "-")}`)?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const exportCsv = () => {
    const records = [["Rank", "Name", "Season coins", "Last 7 days", "Active days"], ...participants.map((entry) => [entry.rank, entry.name, entry.score, entry.last7, entry.activeDays])];
    const csv = records.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${league.name.replace(/[^\w-]+/g, "-").toLowerCase()}-standings.csv`; link.click(); URL.revokeObjectURL(url);
  };
  const copyReminders = async () => {
    const text = participants.filter((entry) => selected.includes(entry.id)).map((entry) => `Hi ${entry.name.split(" ")[0]}, a quick lesson or practice round today will help you keep moving in ${league.name}.`).join("\n\n");
    try { await navigator.clipboard.writeText(text); toast("Reminders copied"); } catch { toast("Couldn’t copy reminders. Please allow clipboard access."); }
  };

  return (
    <div className="fixed inset-0 z-35 flex flex-col bg-[#fafaf8] text-neutral-800 dark:bg-[#111113] dark:text-night-ink" role="dialog" aria-modal="true" aria-label={`${league.name} organizer dashboard`}>
      <header className="flex min-h-14 flex-none items-center gap-3 border-b border-line bg-white px-4 dark:border-white/8 dark:bg-[#17171b]"><button type="button" aria-label="Back to the league page" onClick={onBack} className="focus-ring grid size-9 flex-none place-items-center rounded-lg text-xl hover:bg-neutral-100 dark:hover:bg-white/5">‹</button><span className="grid size-8 flex-none place-items-center rounded-lg bg-neutral-100 dark:bg-white/8">{league.emoji}</span><div className="grid min-w-0 leading-tight"><strong className="truncate text-[15px] font-semibold">{league.name}</strong><span className="truncate text-[11px] text-ink-soft dark:text-night-soft">Organizer dashboard · Day {league.daysIn} of 28</span></div><div className="ml-2 hidden self-stretch min-[820px]:block [&>nav]:h-full [&>nav]:border-b-0">{nav}</div><span className="flex-1" /><button type="button" className="focus-ring hidden text-[13px] font-medium text-blue-600 hover:underline min-[560px]:block dark:text-blue-300" onClick={onSettings}>League settings</button><Button variant="neutral" className="min-h-9 flex-none text-[13px]" onClick={exportCsv}>Export CSV</Button></header>
      <nav aria-label="Dashboard sections" className="flex flex-none gap-1.5 overflow-x-auto border-b border-line px-4 py-2.5 min-[1024px]:hidden dark:border-white/8">{SECTIONS.map((label) => <button key={label} type="button" onClick={() => jump(label)} className={`focus-ring flex-none rounded-full px-3.5 py-1.5 text-[13px] font-medium ${section === label ? "bg-blue-600 text-white" : "bg-white text-ink-soft dark:bg-[#232327] dark:text-night-soft"}`}>{label}</button>)}</nav>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 flex-none border-r border-line p-4 min-[1024px]:block dark:border-white/8"><span className="mb-2 block px-3 text-[11px] font-bold tracking-[.06em] text-ink-soft uppercase dark:text-night-soft">On this page</span><nav aria-label="Dashboard sections" className="grid gap-0.5">{SECTIONS.map((label) => <button key={label} type="button" onClick={() => jump(label)} aria-current={section === label ? "true" : undefined} className={`focus-ring rounded-lg px-3 py-2 text-left text-sm ${section === label ? "bg-white font-semibold dark:bg-[#26262a]" : "text-ink-soft hover:bg-neutral-100 dark:text-night-soft dark:hover:bg-white/5"}`}>{label}</button>)}</nav></aside>
        <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto grid w-full max-w-[1320px] gap-8 px-8 pt-8 pb-16 max-[1024px]:px-6 max-tab:px-4 max-tab:pt-5">
            <section id="dash-Overview" className="grid scroll-mt-6 gap-4"><div><h1 className="text-2xl font-semibold">Organizer dashboard</h1><p className="text-sm text-ink-soft dark:text-night-soft">How {league.name} is doing this season</p></div><div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[420px]:grid-cols-1">{[{ label: "Participants", value: participants.length, detail: `${league.openSpots} open spots` }, { label: "Active recently", value: active.length, detail: `${nudge.length} may need a nudge` }, { label: "Coins this week", value: weekCoins, detail: "Verified progress in the last 7 days" }, { label: "Median season coins", value: median, detail: `${total} across the league` }].map((stat) => <div key={stat.label} className={`grid content-start gap-1 ${PANEL}`}><span className="text-[11px] font-semibold tracking-[.08em] text-ink-soft uppercase dark:text-night-soft">{stat.label}</span><strong className="text-[26px] font-semibold tabular-nums">{stat.value}</strong><span className="text-xs text-ink-soft dark:text-night-soft">{stat.detail}</span></div>)}</div></section>
            <section id="dash-Recognition" className="grid scroll-mt-6 gap-4"><div><h2 className="text-lg font-semibold">Recognition</h2><p className="text-[13px] text-ink-soft dark:text-night-soft">Who to call out, and who to check in on</p></div><div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-tab:grid-cols-1">{[{ title: "Rising stars", people: league.daysIn > 7 ? rising : [], empty: "Picked from week two, once there’s a last week to improve on." }, { title: "Consistent stars", people: consistent, empty: "No one has been active on 80% of days yet." }, { title: "Needs a nudge", people: nudge.slice(0, 3), empty: "Everyone has earned a coin in the last few days." }, { title: "Top this week", people: weekLeaders, empty: "No one has earned a coin this week yet." }].map((group) => <div key={group.title} className={`grid content-start gap-3 ${PANEL}`}><h3 className="text-[15px] font-semibold">{group.title}</h3>{group.people.length ? group.people.map((entry) => <button key={entry.id} type="button" disabled={entry.isCurrentUser} onClick={() => onSelect(entry)} className="focus-ring flex items-center gap-2 rounded-lg text-left"><Avatar seed={entry.id} size="sm" /><span className="min-w-0 flex-1 truncate text-[13px]">{entry.name}</span><span className="text-xs text-ink-soft dark:text-night-soft">{entry.last7} <CoinIcon /></span></button>) : <p className="text-xs leading-relaxed text-ink-soft dark:text-night-soft">{group.empty}</p>}</div>)}</div></section>
            <section id="dash-Weekly-progress" className={`grid scroll-mt-6 gap-4 ${PANEL}`}><h2 className="text-[15px] font-semibold">Weekly progress</h2><p className="text-sm text-ink-soft dark:text-night-soft">{weekCoins} coins earned in the last 7 days · {participants.filter((entry) => entry.last7 > 0).length} learners made progress</p><div className="grid grid-cols-3 gap-3 max-tab:grid-cols-1">{weekLeaders.map((entry) => <button key={entry.id} type="button" disabled={entry.isCurrentUser} onClick={() => onSelect(entry)} className="focus-ring flex items-center gap-3 rounded-xl border border-line p-3 text-left dark:border-night-line"><Avatar seed={entry.id} /><span className="grid min-w-0"><strong className="truncate text-sm">{entry.name}</strong><span className="text-xs text-ink-soft dark:text-night-soft">{entry.last7} coins this week</span></span></button>)}</div></section>
            <section id="dash-Daily-activity" className={`grid scroll-mt-6 gap-4 ${PANEL}`}><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-[15px] font-semibold">Coins earned per day</h2><span className="text-xs text-ink-soft dark:text-night-soft">Whole league · this season</span></div><svg viewBox="0 0 560 180" className="h-44 w-full" role="img" aria-label="Whole league coin activity for the 28-day season">{[0, 70, 140].map((y) => <line key={y} x1="0" y1={y + 10} x2="560" y2={y + 10} className="stroke-neutral-200 dark:stroke-white/10" />)}{league.dailyTotals.map((coins, index) => { const height = Math.max(2, coins / maxDaily * 140); return <rect key={index} x={index * 20 + 3} y={150 - height} width="14" height={height} rx="2" tabIndex={index < league.daysIn ? 0 : -1} className={index < league.daysIn ? "fill-blue-600 focus:fill-blue-400" : "fill-neutral-200 dark:fill-white/8"}><title>Day {index + 1}: {coins} coins{index >= league.daysIn ? ", still to come" : ""}</title></rect>; })}<text x="3" y="175" className="fill-neutral-500 text-[11px]">Day 1</text><text x="515" y="175" className="fill-neutral-500 text-[11px]">Day 28</text></svg></section>
            <section id="dash-Participants" className={`grid scroll-mt-6 gap-4 ${PANEL}`}>
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-[15px] font-semibold">Participants</h2><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search participants" placeholder="Search participants" className="focus-ring rounded-xl border border-line bg-transparent px-3 py-2 text-[13px] dark:border-night-line" /></div>
              <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">{["All", "Active", "Needs a nudge"].map((label) => <button key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)} className={`focus-ring min-h-8 rounded-full border px-3 text-xs font-medium ${filter === label ? "border-blue-500 bg-blue-50 dark:bg-blue-500/15" : "border-line text-ink-soft dark:border-night-line dark:text-night-soft"}`}>{label}</button>)}</div>
              {selected.length > 0 && <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line px-4 py-2.5 dark:border-night-line"><span className="mr-auto text-[13px]">{selected.length} selected</span><button type="button" className="text-xs text-blue-600 dark:text-blue-300" onClick={copyReminders}>Copy reminders</button><button type="button" className="text-xs text-red-600 dark:text-red-400" onClick={() => setRemoving(selected)}>Remove</button><button type="button" className="text-xs text-ink-soft dark:text-night-soft" onClick={() => setSelected([])}>Clear</button></div>}
              {removing && <div role="alertdialog" aria-label="Remove participants?" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-400/50 p-3 text-[13px]"><span className="mr-auto">Remove {removing.length} participants? Their spots open for someone with the code.</span><button type="button" className="font-semibold text-red-600 dark:text-red-400" onClick={async () => { try { for (const id of removing) onUpdate(await updatePrivateLeague(league.id, { removeMember: id })); setRemoving(null); setSelected([]); } catch { toast("Couldn’t remove participants."); } }}>Yes, remove</button><button type="button" onClick={() => setRemoving(null)}>Cancel</button></div>}
              <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-[13px]"><caption className="sr-only">Participant stats for this season, {league.daysIn} days in.</caption><thead><tr className="border-b border-line dark:border-night-line"><th className="p-2"><Checkbox aria-label="Select all shown participants" checked={allSelected ? true : selected.some((id) => selectable.includes(id)) ? "indeterminate" : false} disabled={selectable.length === 0} onCheckedChange={(checked) => setSelected(checked === true ? selectable : [])} /></th>{([{ key: "rank", label: "Rank" }, { key: "name", label: "Learner" }, { key: "score", label: "Season coins" }, { key: "last7", label: "Last 7 days" }, { key: "activeDays", label: "Active days" }] as const).map((column) => <th key={column.key} scope="col" className="px-2.5 py-3 text-[11px] font-semibold tracking-[.06em] text-ink-soft uppercase dark:text-night-soft">{column.key === "name" ? column.label : <button type="button" className="focus-ring whitespace-nowrap" onClick={() => { setAscending(sort === column.key ? !ascending : column.key === "rank"); setSort(column.key); }}>{column.label}{sort === column.key ? ascending ? " ↑" : " ↓" : ""}</button>}</th>)}<th className="p-2 text-xs font-medium text-ink-soft dark:text-night-soft">Last active</th><th className="p-2"><span className="sr-only">Actions</span></th></tr></thead><tbody>{rows.map((entry) => <tr key={entry.id} className={`border-b border-line last:border-0 dark:border-white/8 ${entry.isCurrentUser ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-neutral-50 dark:hover:bg-white/3"}`}><td className="p-2">{!entry.isCurrentUser && <Checkbox aria-label={`Select ${entry.name}`} checked={selected.includes(entry.id)} onCheckedChange={(checked) => setSelected(checked === true ? [...selected, entry.id] : selected.filter((id) => id !== entry.id))} />}</td><td className="px-2.5 py-3 font-semibold tabular-nums">{entry.rank}</td><td className="px-2.5 py-3"><button type="button" disabled={entry.isCurrentUser} onClick={() => onSelect(entry)} className="focus-ring flex items-center gap-3 rounded-lg text-left"><Avatar seed={entry.id} size="sm" /><span className="grid min-w-[130px]"><strong className="text-[13px] font-semibold">{entry.name}</strong><span className="text-[11px] text-ink-soft dark:text-night-soft">{entry.role}</span></span></button></td><td className="px-2.5 py-3 tabular-nums">{entry.score}</td><td className="px-2.5 py-3 tabular-nums">{entry.last7}</td><td className="px-2.5 py-3 tabular-nums">{entry.activeDays} of {league.daysIn}</td><td className="px-2 py-3 text-xs text-ink-soft dark:text-night-soft">{entry.lastActive === null ? "Never" : entry.lastActive === 0 ? "Today" : `${entry.lastActive}d ago`}</td><td className="px-2 py-3">{!entry.isCurrentUser && <button type="button" className="focus-ring text-xs font-medium text-blue-600 dark:text-blue-300" onClick={() => onMessage(entry.id)}>Message</button>}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="py-8 text-center text-sm text-ink-soft dark:text-night-soft">No participants match your search.</p>}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
