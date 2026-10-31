// A quick Python highlighter: not a real parser, just enough tokenizing to stop
// code samples reading as unstyled plaintext.
const KEYWORDS = [
  "def", "return", "if", "elif", "else", "for", "while", "import", "from", "as", "class", "True", "False", "None", "and", "or", "not",
  "in", "is", "print", "lambda", "try", "except", "finally", "with", "pass", "break", "continue", "yield", "global", "assert", "del", "raise",
];

const TOKEN_PATTERN = new RegExp(
  `(#[^\\n]*)|('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")|\\b(${KEYWORDS.join("|")})\\b|\\b(\\d+\\.?\\d*)\\b|([A-Za-z_]\\w*)(?=\\()`,
  "g",
);

export type TokenType = "comment" | "string" | "keyword" | "number" | "function" | "plain";

// The code surface stays dark in both app themes, so these need no light variant.
export const TOKEN_CLASSES: Record<TokenType, string> = {
  comment: "italic text-[#6a9955]",
  string: "text-[#ce9178]",
  keyword: "text-[#569cd6]",
  number: "text-[#b5cea8]",
  function: "text-[#dcdcaa]",
  plain: "text-[#d4d4d4]",
};

export function tokenizePython(code: string): { type: TokenType; value: string }[] {
  const tokens: { type: TokenType; value: string }[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    if (match.index > lastIndex) tokens.push({ type: "plain", value: code.slice(lastIndex, match.index) });
    const [full, comment, string, keyword, number, fn] = match;
    if (comment) tokens.push({ type: "comment", value: comment });
    else if (string) tokens.push({ type: "string", value: string });
    else if (keyword) tokens.push({ type: "keyword", value: keyword });
    else if (number) tokens.push({ type: "number", value: number });
    else if (fn) tokens.push({ type: "function", value: fn });
    lastIndex = match.index + full.length;
  }
  if (lastIndex < code.length) tokens.push({ type: "plain", value: code.slice(lastIndex) });
  return tokens;
}
