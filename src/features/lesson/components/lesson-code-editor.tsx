import type { CodeEditorContent } from "~/types/lesson";
import { FullCodeEditor } from "./full-code-editor";
import { GuidedCodeEditor } from "./guided-code-editor";

export type CodeEditorProps = {
  content: CodeEditorContent;
  // Undefined until the learner has typed: the starter code shows meanwhile.
  code: string | undefined;
  completed: boolean;
  onCodeChange: (code: string) => void;
  onComplete: () => void;
  onContinue: () => void;
};

// A runnable Python exercise: one focused column ("guided"), or the full
// workspace with the exercise beside the editor.
export function LessonCodeEditor(props: CodeEditorProps) {
  return props.content.layout === "guided" ? <GuidedCodeEditor {...props} /> : <FullCodeEditor {...props} />;
}
