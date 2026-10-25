import explorePathsJson from "./explore-paths.json";
import pathShelvesJson from "./path-shelves.json";
import type { ExplorePath, Path } from "./types";
import { readDb } from "~/mocks/mock-db";

export const pathShelves = pathShelvesJson as unknown as Path[];
export const explorePaths = explorePathsJson as unknown as ExplorePath[];

// Authored paths use their own regions. Any other path keeps its own identity
// (title, description, emblem) and borrows the authored region structure, so a
// learner who picks Backend Developer sees Backend Developer rather than being
// silently shown machine learning.
export function getPath(pathId: string): Path {
  const custom = readDb().customPaths?.[pathId];
  if (custom) return custom;
  const authored = pathShelves.find((path) => path.id === pathId);
  if (authored) return authored;

  const stub = explorePaths.find((path) => path.id === pathId);
  if (!stub) return pathShelves[0];

  return {
    ...pathShelves[0],
    id: stub.id,
    family: stub.family,
    title: stub.title,
    description: stub.description,
    emblem: stub.image,
  };
}
