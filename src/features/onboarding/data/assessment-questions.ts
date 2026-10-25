import type { BranchId } from "../types";

type AssessmentQuestion = { prompt: string; options: string[]; answer: number };

// Keyed by branch rather than by role or stage: enough to keep the quiz on
// topic without authoring a separate bank for every one of the ~30 roles.
export const BRANCH_TEST_QUESTIONS: Record<BranchId, AssessmentQuestion[]> = {
  web: [
    {
      prompt: "Which HTML element should wrap a page’s main navigation links?",
      options: ["<nav>", "<div>", "<footer>", "<span>"],
      answer: 0,
    },
    {
      prompt: "Which CSS layout mode arranges items in a single row or column?",
      options: ["Flexbox", "Float", "Position: absolute", "Table layout"],
      answer: 0,
    },
    {
      prompt: "What does the DOM represent?",
      options: [
        "The server’s file system",
        "The page as a tree of nodes",
        "The site’s CSS rules",
        "A JSON API response",
      ],
      answer: 1,
    },
  ],
  mobile: [
    {
      prompt: "What lets an app move a user between screens?",
      options: [
        "A navigator / router",
        "A stylesheet",
        "A database",
        "A build script",
      ],
      answer: 0,
    },
    {
      prompt: "What is “app state” most concerned with?",
      options: [
        "The colour scheme",
        "Data that changes while the app runs",
        "The app’s file size",
        "The app icon",
      ],
      answer: 1,
    },
    {
      prompt: "Why do mobile apps call remote APIs?",
      options: [
        "To change the app icon",
        "To fetch or send data over the network",
        "To compile the code",
        "To sign the app for release",
      ],
      answer: 1,
    },
  ],
  backend: [
    {
      prompt: "Which HTTP method is typically used to create a new resource?",
      options: ["GET", "POST", "DELETE", "HEAD"],
      answer: 1,
    },
    {
      prompt: "What does REST rely on to identify a resource?",
      options: ["A URL", "A cookie only", "A CSS class", "A font"],
      answer: 0,
    },
    {
      prompt: "What is the main job of a database index?",
      options: [
        "Encrypt the data",
        "Speed up lookups",
        "Format dates",
        "Back up the table",
      ],
      answer: 1,
    },
  ],
  data: [
    {
      prompt: "Which SQL command reads data from a table?",
      options: ["SELECT", "INSERT", "DELETE", "DROP"],
      answer: 0,
    },
    {
      prompt: "What does a WHERE clause do in a query?",
      options: [
        "Sorts results",
        "Filters matching records",
        "Creates a new table",
        "Renames a column",
      ],
      answer: 1,
    },
    {
      prompt: "What is the mean of a set of numbers?",
      options: [
        "The middle value",
        "The most frequent value",
        "The sum divided by the count",
        "The largest value",
      ],
      answer: 2,
    },
  ],
  ai: [
    {
      prompt:
        "What does a Python function return when it has no return statement?",
      options: ["0", "None", "An empty string", "It errors"],
      answer: 1,
    },
    {
      prompt: "In machine learning, what is “training data” used for?",
      options: [
        "Testing the final model",
        "Teaching the model patterns",
        "Storing the app’s logs",
        "Styling the output",
      ],
      answer: 1,
    },
    {
      prompt: "What does “overfitting” mean?",
      options: [
        "The model is too simple",
        "The model fits training data well but generalises poorly",
        "The dataset is too small to load",
        "The code fails to run",
      ],
      answer: 1,
    },
  ],
  product: [
    {
      prompt: "What does a product roadmap primarily communicate?",
      options: [
        "Server uptime",
        "What’s planned and roughly when",
        "The company’s tax filings",
        "Employee salaries",
      ],
      answer: 1,
    },
    {
      prompt: "What is a “user story” typically used for?",
      options: [
        "Describing a feature from the user’s perspective",
        "Logging server errors",
        "Naming a database table",
        "Writing marketing copy",
      ],
      answer: 0,
    },
    {
      prompt: "What does prioritisation in product work usually balance?",
      options: [
        "Font choices",
        "Impact against effort",
        "Screen resolution",
        "Server location",
      ],
      answer: 1,
    },
  ],
  marketing: [
    {
      prompt: "What does a marketing “funnel” describe?",
      options: [
        "A pricing model",
        "The stages a customer moves through before converting",
        "A file format",
        "A type of ad blocker",
      ],
      answer: 1,
    },
    {
      prompt: "What is A/B testing used for?",
      options: [
        "Comparing two versions to see which performs better",
        "Testing app crashes",
        "Encrypting user data",
        "Formatting emails",
      ],
      answer: 0,
    },
    {
      prompt: "What does “audience segmentation” mean?",
      options: [
        "Splitting a video into clips",
        "Grouping people by shared traits to target messaging",
        "Sorting files alphabetically",
        "Blocking spam accounts",
      ],
      answer: 1,
    },
  ],
  content_media: [
    {
      prompt: "In video editing, what is a “cut” for?",
      options: [
        "Adding music",
        "Joining or trimming clips together",
        "Rendering the final export",
        "Adjusting the microphone",
      ],
      answer: 1,
    },
    {
      prompt: "What does “pacing” refer to in content?",
      options: [
        "File size",
        "The rhythm and speed at which a piece unfolds",
        "The camera brand used",
        "The upload schedule",
      ],
      answer: 1,
    },
    {
      prompt: "Why does a content creator plan a publishing schedule?",
      options: [
        "To keep audiences engaged consistently",
        "To reduce video resolution",
        "To avoid copyright law",
        "To increase file compression",
      ],
      answer: 0,
    },
  ],
  design: [
    {
      prompt: "What is a wireframe primarily used for?",
      options: [
        "Final visual polish",
        "Laying out structure before visual design",
        "Writing code",
        "Hosting a website",
      ],
      answer: 1,
    },
    {
      prompt: "What does “usability testing” evaluate?",
      options: [
        "Server response time",
        "Whether real users can complete tasks easily",
        "Code test coverage",
        "Font licensing",
      ],
      answer: 1,
    },
    {
      prompt: "What is a design system meant to provide?",
      options: [
        "A single logo file",
        "Reusable, consistent components and rules",
        "A hosting plan",
        "A marketing budget",
      ],
      answer: 1,
    },
  ],
  cloud: [
    {
      prompt: "What does a container (e.g. Docker) package together?",
      options: [
        "Only source code",
        "An app and everything it needs to run",
        "Just the database",
        "A design file",
      ],
      answer: 1,
    },
    {
      prompt: "What is CI/CD primarily used for?",
      options: [
        "Automating building, testing, and deploying code",
        "Designing UI components",
        "Writing marketing copy",
        "Managing employee schedules",
      ],
      answer: 0,
    },
    {
      prompt: "What does a firewall do?",
      options: [
        "Compress files",
        "Control what network traffic is allowed through",
        "Render web pages",
        "Store passwords in plain text",
      ],
      answer: 1,
    },
  ],
};
