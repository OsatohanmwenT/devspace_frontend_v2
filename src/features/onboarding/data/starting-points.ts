import type { Option } from "../types";

const ladder = (...steps: [string, string][]): Option[] => [
  ...steps.map(([value, label]) => ({ value, label })),
  { value: "not_sure", label: "Not sure, place me where it makes sense" },
];

// frontend_developer and backend_developer have no bare entry: both are
// STACK_ROLES, so their real ladder always comes from the `${role}_${stack}`
// keys below (see stackOptions / resolveLadderKey).
export const startingPointOptions: Record<string, Option[]> = {
  frontend_developer_react: ladder(
    ["html_css_basics", "HTML & CSS basics"],
    ["js_fundamentals", "JavaScript fundamentals"],
    ["dom_interactivity", "DOM manipulation / interactivity"],
    ["react_basics", "React basics"],
    ["react_routing_apis", "React with routing & APIs"],
  ),
  frontend_developer_vue: ladder(
    ["html_css_basics", "HTML & CSS basics"],
    ["js_fundamentals", "JavaScript fundamentals"],
    ["vue_basics", "Vue basics"],
    ["vue_composition_state", "Vue composition & state"],
    ["vue_routing_apis", "Vue with routing & APIs"],
  ),
  frontend_developer_angular: ladder(
    ["html_css_basics", "HTML & CSS basics"],
    ["js_fundamentals", "JavaScript fundamentals"],
    ["typescript_basics", "TypeScript basics"],
    ["angular_basics", "Angular basics"],
    ["angular_routing_state", "Angular routing & state"],
  ),
  frontend_developer_foundations: ladder(
    ["html_css_basics", "HTML & CSS basics"],
    ["js_fundamentals", "JavaScript fundamentals"],
    ["dom_interactivity", "DOM manipulation / interactivity"],
  ),
  fullstack_developer: ladder(
    ["html_css_js_basics", "HTML, CSS & JavaScript basics"],
    ["frontend_framework_basics", "Frontend framework basics"],
    ["backend_fundamentals", "Backend fundamentals"],
    ["databases_apis", "Databases & APIs"],
    ["fullstack_integration", "Connecting frontend, backend & database"],
  ),
  ui_ux_developer: ladder(
    ["design_fundamentals", "Design fundamentals"],
    ["figma_basics", "Figma / prototyping basics"],
    ["html_css_for_designers", "HTML & CSS for designers"],
    ["design_handoff", "Prototyping & developer handoff"],
    ["basic_frontend_implementation", "Implementing designs in code"],
  ),

  ios_developer: ladder(
    ["swift_basics", "Swift basics"],
    ["swiftui_basics", "SwiftUI / UIKit basics"],
    ["navigation_state", "Navigation & app state"],
    ["networking_apis", "Networking & APIs"],
    ["app_store_deployment", "App Store deployment"],
  ),
  android_developer: ladder(
    ["kotlin_basics", "Kotlin basics"],
    ["jetpack_compose_basics", "Jetpack Compose / UI basics"],
    ["navigation_state", "Navigation & app state"],
    ["networking_apis", "Networking & APIs"],
    ["play_store_deployment", "Play Store deployment"],
  ),
  cross_platform_developer: ladder(
    ["js_dart_basics", "JavaScript / Dart basics"],
    ["component_widget_basics", "Component & widget basics"],
    ["navigation_state", "Navigation & app state"],
    ["native_device_features", "Native APIs & device features"],
    ["publishing_both_stores", "Publishing to app stores"],
  ),

  backend_developer_node: ladder(
    ["js_fundamentals", "JavaScript fundamentals"],
    ["http_rest_basics", "HTTP & REST basics"],
    ["databases_queries", "Databases & queries"],
    ["auth_security", "Authentication & security"],
    ["api_design_scaling", "API design & scaling"],
  ),
  backend_developer_python: ladder(
    ["python_fundamentals", "Python fundamentals"],
    ["http_rest_basics", "HTTP & REST basics"],
    ["databases_queries", "Databases & queries"],
    ["auth_security", "Authentication & security"],
    ["api_design_scaling", "API design & scaling"],
  ),
  backend_developer_java: ladder(
    ["java_fundamentals", "Java fundamentals"],
    ["http_rest_basics", "HTTP & REST basics"],
    ["databases_queries", "Databases & queries"],
    ["auth_security", "Authentication & security"],
    ["api_design_scaling", "API design & scaling"],
  ),
  backend_developer_csharp: ladder(
    ["csharp_fundamentals", "C# fundamentals"],
    ["http_rest_basics", "HTTP & REST basics"],
    ["databases_queries", "Databases & queries"],
    ["auth_security", "Authentication & security"],
    ["api_design_scaling", "API design & scaling"],
  ),
  database_developer: ladder(
    ["sql_fundamentals", "SQL fundamentals"],
    ["schema_design", "Schema design & normalization"],
    ["indexing_optimization", "Indexing & query optimization"],
    ["nosql_basics", "NoSQL basics"],
    ["migrations_backups", "Migrations & backups"],
  ),
  api_systems_engineer: ladder(
    ["networking_fundamentals", "HTTP & networking fundamentals"],
    ["rest_graphql_design", "REST / GraphQL API design"],
    ["authn_authz", "Authentication & authorization"],
    ["caching_performance", "Caching & performance"],
    ["microservices_design", "Microservices & system design"],
  ),

  data_analyst: ladder(
    ["excel_fundamentals", "Spreadsheet fundamentals"],
    ["sql_fundamentals", "SQL fundamentals"],
    ["data_cleaning_viz", "Data cleaning & visualization"],
    ["statistics_basics", "Statistics basics"],
    ["dashboarding", "Dashboarding"],
  ),
  data_engineer: ladder(
    ["python_sql_fundamentals", "Python & SQL fundamentals"],
    ["etl_basics", "ETL pipeline basics"],
    ["data_warehousing", "Data warehousing"],
    ["workflow_orchestration", "Workflow orchestration"],
    ["cloud_data_platforms", "Cloud data platforms"],
  ),
  business_intelligence: ladder(
    ["excel_fundamentals", "Excel fundamentals"],
    ["power_bi_basics", "Power BI basics"],
    ["data_modeling", "Data modeling"],
    ["dax_formulas", "DAX formulas"],
    ["dashboard_design", "Dashboard design"],
  ),
  data_scientist: ladder(
    ["python_statistics_basics", "Python & statistics fundamentals"],
    ["pandas_data_wrangling", "Data wrangling with pandas"],
    ["data_visualization", "Data visualization"],
    ["ml_basics", "Machine learning basics"],
    ["model_eval_deployment", "Model evaluation & deployment"],
  ),

  ml_engineer: ladder(
    ["python_fundamentals", "Python fundamentals"],
    ["math_stats_for_ml", "Math & statistics for ML"],
    ["core_ml_algorithms", "Core ML algorithms"],
    ["model_training_eval", "Model training & evaluation"],
    ["deployment_mlops", "Deployment & MLOps"],
  ),
  ai_app_developer: ladder(
    ["python_fundamentals", "Python fundamentals"],
    ["working_with_llm_apis", "Working with LLM APIs"],
    ["prompt_engineering", "Prompt engineering"],
    ["building_ai_apps", "Building AI-powered apps"],
    ["vector_db_rag", "Vector databases & RAG"],
  ),
  automation_developer: ladder(
    ["python_js_fundamentals", "Python / JavaScript fundamentals"],
    ["scripting_basics", "Scripting & automation basics"],
    ["working_with_apis", "Working with APIs"],
    ["scheduling_workflows", "Scheduling & workflows"],
    ["bots_integrations", "Bots & integrations"],
  ),

  product_manager: ladder(
    ["product_fundamentals", "Product fundamentals"],
    ["user_research_basics", "User research basics"],
    ["roadmapping_prioritization", "Roadmapping & prioritization"],
    ["working_with_eng_design", "Working with engineering & design"],
    ["metrics_analytics", "Metrics & analytics"],
  ),
  business_analyst: ladder(
    ["business_analysis_fundamentals", "Business analysis fundamentals"],
    ["requirements_gathering", "Requirements gathering"],
    ["data_analysis_basics", "Data analysis basics"],
    ["process_mapping", "Process mapping"],
    ["stakeholder_communication", "Stakeholder communication"],
  ),
  technical_project_coordinator: ladder(
    ["project_management_fundamentals", "Project management fundamentals"],
    ["agile_scrum_basics", "Agile & Scrum basics"],
    ["pm_tools", "Tools (Jira / Trello)"],
    ["technical_communication", "Technical communication"],
    ["risk_timeline_tracking", "Risk & timeline tracking"],
  ),
  digital_marketer: ladder(
    ["marketing_fundamentals", "Marketing fundamentals"],
    ["audience_research", "Audience research"],
    ["content_campaigns", "Content and campaigns"],
    ["channel_analytics", "Channels and analytics"],
    ["campaign_optimisation", "Campaign optimisation"],
  ),
  social_media_manager: ladder(
    ["social_media_fundamentals", "Social media fundamentals"],
    ["audience_content_basics", "Audience and content basics"],
    ["content_planning", "Content planning"],
    ["community_management", "Community management"],
    ["social_analytics", "Social analytics"],
  ),

  video_editor: ladder(
    ["editing_fundamentals", "Editing fundamentals"],
    ["timeline_basics", "Timeline and sequence basics"],
    ["audio_and_pacing", "Audio and pacing"],
    ["colour_and_graphics", "Colour and motion graphics"],
    ["portfolio_edit", "Producing a portfolio edit"],
  ),
  content_creator: ladder(
    ["content_fundamentals", "Content fundamentals"],
    ["audience_and_ideas", "Audience and idea development"],
    ["production_basics", "Content production basics"],
    ["publishing_workflow", "Publishing workflow"],
    ["content_strategy", "Content strategy and growth"],
  ),

  ui_ux_designer: ladder(
    ["design_fundamentals", "Design fundamentals"],
    ["wireframing_prototyping", "Wireframing & prototyping"],
    ["user_research_basics", "User research basics"],
    ["usability_testing", "Usability testing"],
    ["design_systems", "Design systems"],
  ),
  product_designer: ladder(
    ["design_fundamentals", "Design fundamentals"],
    ["end_to_end_design_process", "End-to-end design process"],
    ["prototyping_testing", "Prototyping & testing"],
    ["collaborating_with_engineering", "Collaborating with engineering"],
    ["design_systems", "Design systems"],
  ),
  design_systems_specialist: ladder(
    ["design_fundamentals", "Design fundamentals"],
    ["component_libraries", "Component libraries"],
    ["design_tokens", "Design tokens"],
    ["documentation_governance", "Documentation & governance"],
    ["cross_team_collaboration", "Cross-team collaboration"],
  ),
  graphic_designer: ladder(
    ["design_fundamentals", "Design fundamentals"],
    ["layout_typography", "Layout and typography"],
    ["colour_composition", "Colour and composition"],
    ["brand_design", "Brand design"],
    ["portfolio_system", "Building a portfolio system"],
  ),

  devops_engineer: ladder(
    ["linux_cli_basics", "Linux & command line basics"],
    ["git_version_control", "Version control (Git)"],
    ["ci_cd_pipelines", "CI/CD pipelines"],
    ["containers_docker", "Containers (Docker)"],
    ["iac_cloud_basics", "Infrastructure as code"],
  ),
  cloud_engineer: ladder(
    ["cloud_fundamentals", "Cloud fundamentals"],
    ["networking_basics", "Networking basics"],
    ["compute_storage_services", "Compute & storage services"],
    ["infrastructure_as_code", "Infrastructure as code"],
    ["security_cost_management", "Security & cost management"],
  ),
  cybersecurity_specialist: ladder(
    ["networking_security_fundamentals", "Networking & security fundamentals"],
    ["owasp_vulnerabilities", "Common vulnerabilities (OWASP)"],
    ["security_tools_monitoring", "Security tools & monitoring"],
    ["incident_response", "Incident response"],
    ["pentesting_basics", "Penetration testing basics"],
  ),
};
