import type { BranchId, Option } from "../types";

export const roleOptions: Record<BranchId, Option[]> = {
  web: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "frontend_developer", label: "Frontend Developer" },
    { value: "fullstack_developer", label: "Full-Stack Developer" },
    {
      value: "ui_ux_developer",
      label: "UI Engineer",
      note: "Builds interfaces from designs",
    },
  ],
  mobile: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "ios_developer", label: "Mobile Developer (iOS)" },
    { value: "android_developer", label: "Mobile Developer (Android)" },
    { value: "cross_platform_developer", label: "Cross-Platform Developer" },
  ],
  backend: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "backend_developer", label: "Backend Developer" },
    { value: "database_developer", label: "Database Developer" },
    { value: "api_systems_engineer", label: "API / Systems Engineer" },
  ],
  data: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "data_analyst", label: "Data Analyst" },
    { value: "data_engineer", label: "Data Engineer" },
    { value: "business_intelligence", label: "Business Intelligence" },
    { value: "data_scientist", label: "Data Scientist" },
  ],
  ai: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "ml_engineer", label: "Machine Learning Engineer" },
    { value: "ai_app_developer", label: "AI Application Developer" },
    { value: "automation_developer", label: "Automation Developer" },
  ],
  product: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "product_manager", label: "Product Manager" },
    {
      value: "business_analyst",
      label: "Business Analyst",
      note: "Requirements and process, not dashboards",
    },
    {
      value: "technical_project_coordinator",
      label: "Technical Project Coordinator",
    },
  ],
  marketing: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "digital_marketer", label: "Digital Marketer" },
    { value: "social_media_manager", label: "Social Media Manager" },
  ],
  content_media: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "video_editor", label: "Video Editor" },
    { value: "content_creator", label: "Content Creator" },
  ],
  design: [
    { value: "help_me_choose", label: "Help me choose" },
    {
      value: "ui_ux_designer",
      label: "UI/UX Designer",
      note: "Designs the interface rather than building it",
    },
    { value: "product_designer", label: "Product Designer" },
    { value: "design_systems_specialist", label: "Design Systems Specialist" },
    { value: "graphic_designer", label: "Graphic Designer" },
  ],
  cloud: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "devops_engineer", label: "DevOps Engineer" },
    { value: "cloud_engineer", label: "Cloud Engineer" },
    { value: "cybersecurity_specialist", label: "Cybersecurity Specialist" },
  ],
};
