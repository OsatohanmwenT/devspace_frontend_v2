import { Suspense } from "react";
import { LessonView } from "~/features/lesson";

async function Lesson({ params }: { params: PageProps<"/lesson/[lessonId]">["params"] }) {
  const { lessonId } = await params;
  return <LessonView lessonId={lessonId} />;
}

// Reading the route params is runtime data, so it streams in behind a boundary.
export default function Page(props: PageProps<"/lesson/[lessonId]">) {
  return (
    <Suspense>
      <Lesson params={props.params} />
    </Suspense>
  );
}
