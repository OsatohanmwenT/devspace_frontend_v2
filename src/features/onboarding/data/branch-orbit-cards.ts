import type { BranchId } from "../types";

export type OrbitPart = string | { text: string; tone: "keyword" | "value" };
export type OrbitCard = { lines: OrbitPart[][]; output?: OrbitPart[] };

// Three small examples per branch. Text and emphasis stay here; presentation
// and the Output row belong to the BranchOrbit component.
export const BRANCH_ORBIT_CARDS: Record<BranchId, OrbitCard[]> = {
  web: [
    { lines: [["<", { text: "button", tone: "keyword" }, " onClick={submit}>"], ["  Send"]] },
    { lines: [["fetch(", { text: "'/api/users'", tone: "value" }, ")"]] },
    { lines: [["useState(", { text: "0", tone: "value" }, ")"]] },
  ],
  mobile: [
    { lines: [[{ text: "Navigator", tone: "keyword" }, ".push(Profile())"]] },
    { lines: [["onTap: () => like()"]] },
    { lines: [["StatusBar.setStyle(", { text: "'light'", tone: "value" }, ")"]] },
  ],
  backend: [
    { lines: [[{ text: "POST", tone: "keyword" }, " /api/orders"]], output: ["201 Created"] },
    { lines: [[{ text: "SELECT", tone: "keyword" }, " * FROM users"]] },
    { lines: [["cache.set(key, value)"]] },
  ],
  data: [
    { lines: [[{ text: "SELECT", tone: "keyword" }, " avg(revenue)"]] },
    { lines: [["df.groupby(", { text: "'region'", tone: "value" }, ").sum()"]] },
    { lines: [["chart.plot(x, y)"]] },
  ],
  ai: [
    { lines: [["model.fit(training_data)"]] },
    { lines: [["predict(image)"]], output: ['"cat" (98%)'] },
    { lines: [["automate(daily_report)"]] },
  ],
  product: [
    { lines: [[{ text: "As a", tone: "keyword" }, " user, I want"], ["faster checkout."]] },
    { lines: [["Impact: ", { text: "High", tone: "value" }, " · Effort: Low"]] },
    { lines: [["Sprint 12 — 8 stories"]] },
  ],
  marketing: [
    { lines: [[{ text: "A/B test", tone: "keyword" }, ": Subject A"]], output: ["open rate 34% ↑"] },
    { lines: [["segment: age 18–24"]] },
    { lines: [["CTR: 2.4%"]], output: ["3.1% ↑"] },
  ],
  content_media: [
    { lines: [["00:12 — cut to B-roll"]] },
    { lines: [['caption: "wait for it…"']] },
    { lines: [["publish: Tue 9am"]] },
  ],
  design: [
    { lines: [["spacing: ", { text: "8px", tone: "value" }]] },
    { lines: [["radius: ", { text: "12px", tone: "value" }]] },
    { lines: [["contrast: ", { text: "4.6:1 ✓", tone: "value" }]] },
  ],
  cloud: [
    { lines: [[{ text: "docker build", tone: "keyword" }, " ."]] },
    { lines: [["kubectl apply -f api.yaml"]] },
    { lines: [["uptime()"]], output: ["99.98%"] },
  ],
};
