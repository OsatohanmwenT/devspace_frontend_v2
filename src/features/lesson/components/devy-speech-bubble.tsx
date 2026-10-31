// Devy's ambient reaction, floating above the footer avatar: a bubble with its
// tail pointing down at the mascot that said it.
export function DevySpeechBubble({ text }: { text: string | undefined }) {
  if (!text) return null;

  return (
    <div
      className="absolute bottom-[calc(100%-32px)] left-[76px] z-10 w-[260px] max-w-[calc(100vw-92px)] animate-speech-in rounded-[20px] border border-[#acd4df] bg-[#f4fbfd] px-4 py-3 text-base leading-[1.55] font-medium text-[#151515] max-[520px]:bottom-[calc(100%+10px)] max-[520px]:left-0 max-[520px]:w-[calc(100vw-40px)] max-[520px]:max-w-[320px] max-[520px]:text-[15px] dark:border-[#40606a] dark:bg-[#1e2b30] dark:text-night-ink"
      role="status"
      aria-live="polite"
    >
      <span key={text} className="block animate-speech-text-in">
        {text}
      </span>
    </div>
  );
}
