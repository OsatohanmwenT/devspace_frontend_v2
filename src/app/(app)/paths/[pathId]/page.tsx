import { Suspense } from "react";
import { PathDetailView } from "~/features/paths";

async function PathContent({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = await params;
  return <PathDetailView pathId={pathId} />;
}

export default function Page({ params }: { params: Promise<{ pathId: string }> }) {
  return (
    <Suspense fallback={<main className="min-h-[calc(100vh-64px)]" aria-busy="true" />}>
      <PathContent params={params} />
    </Suspense>
  );
}
