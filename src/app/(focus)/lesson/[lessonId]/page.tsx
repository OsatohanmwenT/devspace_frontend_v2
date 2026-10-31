import { Suspense } from "react";
import { LessonScene, LessonView } from "~/features/lesson";

async function Lesson({ params }: { params: PageProps<"/lesson/[lessonId]">["params"] }) {
  const { lessonId } = await params;
  return <LessonView lessonId={lessonId} />;
}

// Reading the route params is runtime data, so it streams in behind a boundary.
export default function Page(props: PageProps<"/lesson/[lessonId]">) {
  return (
    <Suspense fallback={<LessonScene />}>
      <Lesson params={props.params} />
    </Suspense>
  );
}
