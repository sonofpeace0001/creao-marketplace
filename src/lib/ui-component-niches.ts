// Full UI-component category taxonomy for the marketplace's component browser sidebar.
// "CREAO Exclusive" adds categories beyond the standard set. Every entry appears here
// whether or not a template has shipped yet — counts simply read 0 until a batch fills
// them in.

export type NicheSection = "Marketing Blocks" | "UI Components" | "CREAO Exclusive";

export interface NicheEntry {
  name: string;
  section: NicheSection;
}

export const NICHE_SECTIONS: NicheSection[] = [
  "Marketing Blocks",
  "UI Components",
  "CREAO Exclusive",
];

// Not a component niche: it lists the full landing pages (kind = 'page') and links to
// the Landing Pages tab of the hub, so it sits alphabetically among the categories.
export const LANDING_PAGES_NICHE = "Landing Pages";
export const LANDING_PAGES_HREF = "/components?type=pages";

const MARKETING_BLOCKS: string[] = [
  "Announcements",
  "ASCII Art",
  "Backgrounds",
  "Borders",
  "Calls to Action",
  "Clients",
  "Comparisons",
  "Contact Sections",
  "Device Mockups",
  "Docks",
  "Effects & Particles",
  "FAQs",
  "Features",
  "Footers",
  "Galleries",
  "Gradients",
  "Heroes",
  "Hooks",
  "Illustrations",
  "Images",
  LANDING_PAGES_NICHE,
  "Logo Clouds",
  "Maps",
  "Marquees",
  "Navigation Menus",
  "Pricing Sections",
  "Scroll Areas",
  "Scroll Effects",
  "Shaders",
  "Stats & KPIs",
  "Steppers",
  "Team Sections",
  "Testimonials",
  "Text Animations",
  "Texts",
  "Timelines",
  "Videos",
];

const UI_COMPONENTS: string[] = [
  "Accordions",
  "AI Chats",
  "Alerts",
  "Avatars",
  "Badges",
  "Buttons",
  "Calendars",
  "Cards",
  "Carousels",
  "Charts & Data Viz",
  "Checkboxes",
  "Cursors",
  "Dashboards",
  "Date Pickers",
  "Dialogs / Modals",
  "Dropdowns",
  "Empty States",
  "File Trees",
  "File Uploads",
  "Forms",
  "Globes",
  "Grids & Bento",
  "Icons",
  "Inputs",
  "Links",
  "Lists",
  "Loaders & Skeletons",
  "Menus",
  "Notifications",
  "Numbers",
  "Onboarding",
  "Paginations",
  "Popovers",
  "Profiles",
  "Progress",
  "Radio Groups",
  "Search Bars",
  "Selects",
  "Sidebars",
  "Sign Ins",
  "Sign ups",
  "Sliders",
  "Spinner Loaders",
  "Switches & Keyboards",
  "Tables",
  "Tabs",
  "Tags",
  "Terminals & Code Blocks",
  "Text Areas",
  "Toasts",
  "Toggles",
  "Tooltips",
];

// Categories beyond the standard component-marketplace taxonomy.
const CREAO_EXCLUSIVE: string[] = [
  "AI Agents",
  "Chatbots & Live Chat",
  "Waitlists",
  "Changelogs",
  "Roadmaps",
  "Documentation Blocks",
  "Blog Layouts",
  "Email Templates",
  "Web3 & Crypto",
  "Command Palettes",
  "Kanban Boards",
  "Billing & Invoices",
  "Settings Panels",
  "Cookie Consent",
];

export const UI_COMPONENT_NICHES: NicheEntry[] = [
  ...MARKETING_BLOCKS.map((name) => ({ name, section: "Marketing Blocks" as const })),
  ...UI_COMPONENTS.map((name) => ({ name, section: "UI Components" as const })),
  ...CREAO_EXCLUSIVE.map((name) => ({ name, section: "CREAO Exclusive" as const })),
];

export function nichesBySection(section: NicheSection): NicheEntry[] {
  return UI_COMPONENT_NICHES.filter((n) => n.section === section);
}
