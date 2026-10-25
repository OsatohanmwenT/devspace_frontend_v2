import { PrivateLeagueInvite } from "~/features/leaderboard";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PrivateLeagueInvite code={code} />;
}
