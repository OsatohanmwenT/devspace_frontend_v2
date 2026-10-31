import { Suspense } from "react";
import { PathDetailView } from "~/features/paths";

async function PathDetail({ params }: { params: PageProps<"/paths/[pathId]">["params"] }) {
  const { pathId } = await params;
  return <PathDetailView pathId={pathId} />;
}

// Reading the route params is runtime data, so it streams in behind a boundary.
export default function Page(props: PageProps<"/paths/[pathId]">) {
  return (
    <Suspense>
      <PathDetail params={props.params} />
    </Suspense>
  );
}
