import guidebookJson from "../data/guidebook-entries.json";
import resourcesJson from "../data/learning-resources.json";

type TopicRecord = (typeof resourcesJson)["python-foundations"]["topics"][number];
export type CheatsheetTopic = Omit<TopicRecord, "guidebook"> & { guidebook?: { mentalModel?: string } };
export type GuidebookEntry = (typeof guidebookJson)["python-foundations"][number];

const resources = resourcesJson as Record<string, { topics: CheatsheetTopic[] }>;
const guidebook = guidebookJson as Record<string, GuidebookEntry[]>;

// Both are empty for a region whose lessons have not been written yet.
export const getRegionTopics = (regionId: string) => resources[regionId]?.topics ?? [];
export const getGuidebookEntries = (regionId: string) => guidebook[regionId] ?? [];

// Reference is what you reach for when stuck, so it is never gated: looking up
// syntax mid-lesson is the whole point of a cheatsheet.
export const getLessonTopics = (lessonId: string) =>
  Object.values(resources)
    .flatMap((resource) => resource.topics)
    .filter((topic) => topic.lessonId === lessonId);
