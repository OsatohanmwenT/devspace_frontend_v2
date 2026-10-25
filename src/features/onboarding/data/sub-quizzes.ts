import type { BranchId, Option } from "../types";

type SubQuiz = { prompt: string; options: Option[] };

// Asks what someone has enjoyed or wants to make, not the same role choice in
// different words, which is what made "help me choose" useless in v2.
export const roleSubQuiz: Record<BranchId, SubQuiz> = {
  web: {
    prompt: "Which of these would you rather spend an afternoon on?",
    options: [
      {
        value: "frontend_developer",
        label: "Getting a page to look and behave exactly right",
      },
      {
        value: "fullstack_developer",
        label: "Making a form actually save something and come back",
      },
      {
        value: "ui_ux_developer",
        label: "Turning a designer’s file into a working screen",
      },
    ],
  },
  mobile: {
    prompt: "Which phone do you actually use day to day?",
    options: [
      {
        value: "ios_developer",
        label: "iPhone — and I mostly build for people who use one",
      },
      {
        value: "android_developer",
        label: "Android — and I mostly build for people who use one",
      },
      {
        value: "cross_platform_developer",
        label: "It varies, and I’d rather write things once",
      },
    ],
  },
  backend: {
    prompt: "A feature is slow. What would you enjoy digging into?",
    options: [
      { value: "backend_developer", label: "The logic deciding what happens" },
      {
        value: "database_developer",
        label: "How the data is stored and queried",
      },
      {
        value: "api_systems_engineer",
        label: "How the services talk to each other",
      },
    ],
  },
  data: {
    prompt:
      "Someone hands you a messy spreadsheet. What do you want to do with it?",
    options: [
      { value: "data_analyst", label: "Find out what it’s telling us" },
      {
        value: "data_engineer",
        label: "Make it arrive clean automatically next time",
      },
      {
        value: "business_intelligence",
        label: "Turn it into something the team checks weekly",
      },
      { value: "data_scientist", label: "Use it to predict what happens next" },
    ],
  },
  ai: {
    prompt: "Which finished result would you be proudest of?",
    options: [
      {
        value: "ml_engineer",
        label: "A model that makes accurate predictions",
      },
      {
        value: "ai_app_developer",
        label: "An app people use that happens to run on AI",
      },
      {
        value: "automation_developer",
        label: "A script that saves you an hour every week",
      },
    ],
  },
  product: {
    prompt:
      "In a project you’ve been part of, what did you naturally end up doing?",
    options: [
      {
        value: "product_manager",
        label: "Arguing for what was worth building",
      },
      {
        value: "business_analyst",
        label: "Working out what people actually needed",
      },
      {
        value: "technical_project_coordinator",
        label: "Keeping everyone unblocked and on schedule",
      },
    ],
  },
  marketing: {
    prompt: "Which result would you most enjoy working toward?",
    options: [
      {
        value: "digital_marketer",
        label:
          "A campaign that reaches the right people and improves over time",
      },
      {
        value: "social_media_manager",
        label:
          "A social presence that earns attention and builds a real community",
      },
    ],
  },
  content_media: {
    prompt: "Which result would you most enjoy creating?",
    options: [
      {
        value: "video_editor",
        label: "A polished story shaped from raw footage",
      },
      {
        value: "content_creator",
        label: "Original content that people choose to watch, read, or share",
      },
    ],
  },
  design: {
    prompt: "Which would bother you most in an app you use?",
    options: [
      { value: "ui_ux_designer", label: "A screen that’s confusing to use" },
      {
        value: "product_designer",
        label: "A feature that solves the wrong problem",
      },
      {
        value: "design_systems_specialist",
        label: "Buttons that look different on every page",
      },
      {
        value: "graphic_designer",
        label:
          "A layout whose type, colour, and composition do not work together",
      },
    ],
  },
  cloud: {
    prompt: "Which problem would you rather be the one to solve?",
    options: [
      {
        value: "devops_engineer",
        label: "Shipping takes all day and often breaks",
      },
      {
        value: "cloud_engineer",
        label: "The bill is high and nobody knows what’s running",
      },
      {
        value: "cybersecurity_specialist",
        label: "Nobody has checked whether this is safe",
      },
    ],
  },
};

// The "I'm not sure" destination at the branch question: resolves a branch
// from what someone enjoys, then rejoins the normal flow.
export const branchTriage: SubQuiz = {
  prompt: "No problem. Which of these sounds most like a good day?",
  options: [
    { value: "web", label: "Making something people can click around in" },
    { value: "design", label: "Deciding how something should look and feel" },
    { value: "data", label: "Finding the story hidden in a pile of numbers" },
    { value: "ai", label: "Teaching a computer to do something on its own" },
    {
      value: "backend",
      label: "Building the machinery nobody sees but everyone relies on",
    },
    { value: "mobile", label: "Making something that lives on a phone" },
    { value: "product", label: "Working out what’s worth building and why" },
    {
      value: "marketing",
      label: "Helping the right people discover and choose a product",
    },
    {
      value: "content_media",
      label:
        "Turning an idea into something people want to watch, read, or share",
    },
    { value: "cloud", label: "Keeping everything running, safe and online" },
  ],
};
