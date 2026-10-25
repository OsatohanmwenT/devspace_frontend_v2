export type CustomRouteStage = {
  label: string;
  title: string;
  description: string;
};

// The route Devy proposes for a learner's own goal, before it becomes a path.
export type CustomRoute = {
  id: string;
  title: string;
  goal: string;
  experience: string;
  outcome: string;
  startingPoint: string;
  comfort: string;
  comfortOptions: string[];
  outcomeQuestion: string;
  outcomeOptions: string[];
  focus: string[];
  skip: string[];
  sections: string[];
  stages: CustomRouteStage[];
  project: string;
};
