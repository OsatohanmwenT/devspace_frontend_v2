import { getMockProfile } from "~/mocks/profile";
import { getMockProgressSummary } from "~/mocks/progress";
import type { ProgressSummary } from "~/types/progress";

// Mock-backed for now. When the backend exists, only this body changes.
export async function getProgressSummary(): Promise<ProgressSummary> {
  return getMockProgressSummary(getMockProfile());
}
