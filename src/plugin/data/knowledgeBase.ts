// Knowledge Base - Static example data
// In production, this could be loaded from an external source

import { KnowledgeItem, GlossaryItem } from '../../shared/types';

export interface KnowledgeBase {
  config: {
    brand: string;
    version: string;
  };
  knowledge: {
    foundations: KnowledgeItem[];
    components: KnowledgeItem[];
    patterns: KnowledgeItem[];
  };
  glossary: GlossaryItem[];
}

export const KNOWLEDGE_BASE: KnowledgeBase = {
  config: {
    brand: "FutureDocumentation",
    version: "1.0.0"
  },
  
  knowledge: {
    foundations: [
      {
        id: "kb-colors",
        title: "Color System",
        category: "foundations",
        content: {
          overview: "Semantic color system based on functions.",
          primary: { hex: "#2563EB", usage: "Primary actions, links, focus states" },
          semantic: [
            { name: "Success", hex: "#10B981", usage: "Successful actions" },
            { name: "Warning", hex: "#F59E0B", usage: "Warnings" },
            { name: "Error", hex: "#EF4444", usage: "Errors, critical states" }
          ],
          rules: [
            "Contrast ratio at least 4.5:1 (WCAG AA)",
            "Never use color as the only information carrier"
          ]
        },
        tags: ["colors", "branding", "contrast", "palette"]
      },
      {
        id: "kb-typography",
        title: "Typography",
        category: "foundations",
        content: {
          overview: "Inter as the primary font.",
          fontFamily: { primary: "Inter", mono: "JetBrains Mono" },
          scale: [
            { name: "H1", size: "32px", weight: "700", usage: "Page titles" },
            { name: "H2", size: "24px", weight: "600", usage: "Section headers" },
            { name: "Body", size: "16px", weight: "400", usage: "Body text" },
            { name: "Caption", size: "12px", weight: "400", usage: "Labels, hints" }
          ],
          rules: ["Max line length: 65-75 characters", "No font below 12px"]
        },
        tags: ["typography", "font", "text", "headlines"]
      },
      {
        id: "kb-spacing",
        title: "Spacing & Grid",
        category: "foundations",
        content: {
          overview: "8px grid system for consistent spacing.",
          baseUnit: "8px",
          scale: [
            { name: "space-1", value: "4px", usage: "Micro-spacing" },
            { name: "space-2", value: "8px", usage: "Input padding" },
            { name: "space-4", value: "16px", usage: "Card padding" },
            { name: "space-6", value: "24px", usage: "Section padding" },
            { name: "space-8", value: "32px", usage: "Large sections" }
          ]
        },
        tags: ["spacing", "grid", "layout", "responsive"]
      }
    ],
    components: [
      {
        id: "kb-buttons",
        title: "Buttons",
        category: "components",
        content: {
          overview: "Buttons communicate actions clearly.",
          variants: [
            { name: "Primary", bg: "#2563EB", usage: "Main action per view" },
            { name: "Secondary", bg: "transparent", usage: "Alternative actions" },
            { name: "Destructive", bg: "#EF4444", usage: "Delete actions" }
          ],
          rules: ["Max 1 primary button per area", "Icon left of text"]
        },
        tags: ["buttons", "cta", "actions", "primary"]
      },
      {
        id: "kb-inputs",
        title: "Input Fields",
        category: "components",
        content: {
          overview: "Inputs for user entries with clear error communication.",
          sizing: { height: "40px", padding: "12px", labelSpacing: "6px" },
          states: ["default", "hover", "focus", "error", "disabled"],
          rules: [
            "Label NEVER as placeholder",
            "Mark required fields with asterisk (*)"
          ]
        },
        tags: ["inputs", "forms", "form", "input", "validation"]
      }
    ],
    patterns: [
      {
        id: "kb-navigation",
        title: "Navigation Patterns",
        category: "patterns",
        content: {
          overview: "Hierarchical navigation for orientation.",
          types: {
            topNav: { height: "64px", usage: "Global navigation" },
            sideNav: { width: "256px", usage: "App-internal navigation" },
            tabBar: { height: "56px", usage: "Mobile main navigation, max 5 items" }
          },
          rules: ["Max 7±2 items per level", "Max 3 level nesting"]
        },
        tags: ["navigation", "menu", "sidebar", "mobile"]
      }
    ]
  },
  
  glossary: [
    { term: "Hero Section", definition: "Prominent area at the top of the page.", specs: "Min height: 400px" },
    { term: "CTA", definition: "Call-to-Action – Button that prompts the main action.", specs: "Primary Button" },
    { term: "Card", definition: "Container for related content.", specs: "Padding: 16-24px" },
    { term: "Modal", definition: "Overlay window that forces focus.", specs: "Max width: 480px" },
    { term: "Toast", definition: "Short, non-blocking notification.", specs: "Duration: 4s" },
    { term: "Empty State", definition: "Display when no data is available.", specs: "Illustration + CTA" }
  ]
};
