"use client";

import { useId, useState } from "react";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Drawer } from "~/components/ui/drawer";
import { LEAGUE_EMOJIS, LEAGUE_KINDS } from "~/config/private-leagues";
import type { PrivateLeague, PrivateLeagueData, PrivateLeaguesData } from "~/types/private-leagues";
import { createPrivateLeague, joinPrivateLeague, updatePrivateLeague } from "../api/private-leagues-api";

const FIELD = "rounded-xl border border-[#e1e1e1] bg-white px-3.5 py-3 text-[15px] text-neutral-800 outline-none focus-visible:border-blue-500 dark:border-night-line dark:bg-[#1f1f1f] dark:text-night-ink";
const LABEL = "text-[13px] font-semibold text-ink-soft dark:text-night-soft";
const SELECTED = "border-[#3d77eb] bg-[#eaf1ff] dark:border-[#88bdf2] dark:bg-[#1f2a3d]";
const UNSELECTED = "border-[#e1e1e1] bg-white hover:border-neutral-400 dark:border-night-line dark:bg-[#1f1f1f] dark:hover:border-[#5a5a60]";

type LeagueFormProps = { onClose: () => void; onComplete: (data: PrivateLeaguesData, id: string) => void };

export function CreateLeagueDrawer({ onClose, onComplete }: LeagueFormProps) {
  const organizerId = useId();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<PrivateLeague["kind"]>("friends");
  const [emoji, setEmoji] = useState(LEAGUE_EMOJIS[0]);
  const [organizerOnly, setOrganizerOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <Drawer title="Create a league" onClose={onClose}>
      <form className="grid gap-4" onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim() || busy) return;
        setBusy(true);
        try {
          const result = await createPrivateLeague(name, emoji, kind, organizerOnly);
          onComplete(result.data, result.id);
        } catch (error) { setError(error instanceof Error ? error.message : "Couldn’t create the league."); setBusy(false); }
      }}>
        <label className="grid gap-1.5"><span className={LABEL}>League name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder={kind === "class" ? "Year 11 Coding Cup" : "Study Crew"} className={FIELD} required /></label>
        <fieldset className="grid gap-1.5">
          <legend className={`mb-1.5 ${LABEL}`}>Who’s it for?</legend>
          <div className="grid grid-cols-2 gap-2 max-[420px]:grid-cols-1">
            {(Object.keys(LEAGUE_KINDS) as PrivateLeague["kind"][]).map((id) => (
              <button key={id} type="button" aria-pressed={kind === id} data-cuelume-toggle onClick={() => setKind(id)} className={`focus-ring grid gap-0.5 rounded-xl border px-3.5 py-3 text-left transition-colors ${kind === id ? SELECTED : UNSELECTED}`}>
                <span className="text-sm font-semibold text-neutral-800 dark:text-night-ink">{LEAGUE_KINDS[id].label}</span>
                <span className="text-xs leading-[1.4] text-ink-soft dark:text-night-soft">{LEAGUE_KINDS[id].description}</span>
              </button>
            ))}
          </div>
          {kind === "class" && (
            <div className="mt-1 flex items-start gap-2.5 rounded-xl px-1 py-1.5">
              <Checkbox id={organizerId} checked={organizerOnly} onCheckedChange={(checked) => setOrganizerOnly(checked === true)} aria-describedby={`${organizerId}-description`} className="mt-0.5" />
              <div className="grid gap-0.5">
                <label htmlFor={organizerId} className="cursor-pointer text-[13px] font-medium text-neutral-800 dark:text-night-ink">I’m organizing, not competing</label>
                <p id={`${organizerId}-description`} className="text-xs text-ink-soft dark:text-night-soft">For teachers and organizers: you run the league and see the dashboard, but you’re not on the board.</p>
              </div>
            </div>
          )}
        </fieldset>
        <fieldset>
          <legend className={`mb-1.5 ${LABEL}`}>Badge</legend>
          <div className="flex flex-wrap gap-2">
            {LEAGUE_EMOJIS.map((option) => <button key={option} type="button" aria-label={`Use ${option} as the league badge`} aria-pressed={emoji === option} data-cuelume-toggle onClick={() => setEmoji(option)} className={`focus-ring grid size-10 place-items-center rounded-xl border text-lg transition-colors ${emoji === option ? SELECTED : UNSELECTED}`}>{option}</button>)}
          </div>
        </fieldset>
        {error && <p role="alert" className="text-[13px] text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" className="min-h-12" disabled={!name.trim() || busy}>{busy ? "Creating…" : "Create league"}</Button>
      </form>
    </Drawer>
  );
}

export function JoinLeagueDrawer({ onClose, onComplete, initialCode }: LeagueFormProps & { initialCode?: string }) {
  const [code, setCode] = useState(initialCode?.toUpperCase() ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Drawer title="Join with a code" onClose={onClose}>
      <form className="grid gap-4" onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        try { const result = await joinPrivateLeague(code); onComplete(result.data, result.id); }
        catch (error) { setError(error instanceof Error ? error.message : "Couldn’t join the league."); setBusy(false); }
      }}>
        <label className="grid gap-1.5">
          <span className={LABEL}>Invite code</span>
          <input autoFocus value={code} onChange={(event) => { setCode(event.target.value.toUpperCase().replace(/\s/g, "")); setError(""); }} maxLength={6} placeholder="ABC234" autoComplete="off" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={error ? "join-code-error" : undefined} className={`${FIELD} font-semibold tracking-[.1em] aria-invalid:border-red-500`} />
          {error && <span id="join-code-error" role="alert" className="text-[13px] text-red-600 dark:text-red-400">{error}</span>}
        </label>
        <Button type="submit" className="min-h-12" disabled={code.length < 6 || busy}>{busy ? "Joining…" : "Join league"}</Button>
      </form>
    </Drawer>
  );
}

export function LeagueSettingsDrawer({ league, onClose, onUpdate }: { league: PrivateLeagueData; onClose: () => void; onUpdate: (data: PrivateLeaguesData) => void }) {
  const [name, setName] = useState(league.name);
  const [removing, setRemoving] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const update = async (changes: Parameters<typeof updatePrivateLeague>[1]) => {
    try { onUpdate(await updatePrivateLeague(league.id, changes)); setNotice("League settings saved."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Couldn’t save changes."); }
  };
  return (
    <Drawer title="League settings" subtitle={league.name} onClose={onClose}>
      <div className="grid gap-6">
        <form className="grid gap-1.5" onSubmit={async (event) => { event.preventDefault(); await update({ name }); }}>
          <label htmlFor="private-league-name" className={LABEL}>League name</label>
          <div className="flex gap-2"><input id="private-league-name" className={`min-w-0 flex-1 ${FIELD}`} value={name} maxLength={40} onChange={(event) => setName(event.target.value)} /><Button variant="neutral" type="submit" disabled={!name.trim() || name.trim() === league.name}>Save</Button></div>
        </form>
        <div className="grid gap-2">
          <span className={LABEL}>Members</span>
          <p className="text-[13px] text-ink-soft dark:text-night-soft">{league.openSpots} open spots — share the code to fill them. Removing someone opens their spot; it stays open until a friend joins with the code.</p>
          <ul className="grid gap-1.5">
            {league.standings.filter((entry) => !entry.isCurrentUser).map((entry) => <li key={entry.id} className="flex items-center gap-3 py-1.5"><Avatar seed={entry.id} size="sm" /><span className="min-w-0 flex-1 truncate text-[13px] text-neutral-800 dark:text-night-ink">{entry.name}</span>{removing === entry.id ? <span className="flex gap-2"><button type="button" className="text-xs font-semibold text-red-600 dark:text-red-400" onClick={async () => { await update({ removeMember: entry.id }); setRemoving(null); }}>Yes, remove</button><button type="button" className="text-xs text-ink-soft dark:text-night-soft" onClick={() => setRemoving(null)}>Cancel</button></span> : <button type="button" className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-soft dark:border-night-line dark:text-night-soft" onClick={() => setRemoving(entry.id)}>Remove</button>}</li>)}
          </ul>
        </div>
        <div className="grid gap-1.5"><span className={LABEL}>Invite code</span><p className="text-[13px] text-ink-soft dark:text-night-soft">Regenerating retires <strong>{league.code}</strong> — anyone with the old code can no longer join.</p><Button variant="neutral" className="min-h-10 justify-self-start text-xs" onClick={() => update({ regenerateCode: true })}>Regenerate code</Button></div>
        {notice && <p role="status" className="text-[13px] text-ink-soft dark:text-night-soft">{notice}</p>}
      </div>
    </Drawer>
  );
}
