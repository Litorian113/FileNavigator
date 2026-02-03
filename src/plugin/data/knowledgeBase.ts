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
        title: "Farbsystem",
        category: "foundations",
        content: {
          overview: "Semantisches Farbsystem basierend auf Funktionen.",
          primary: { hex: "#2563EB", usage: "Primäre Aktionen, Links, Fokus-States" },
          semantic: [
            { name: "Success", hex: "#10B981", usage: "Erfolgreiche Aktionen" },
            { name: "Warning", hex: "#F59E0B", usage: "Warnungen" },
            { name: "Error", hex: "#EF4444", usage: "Fehler, kritische Zustände" }
          ],
          rules: [
            "Kontrast-Ratio mindestens 4.5:1 (WCAG AA)",
            "Farbe nie als einziger Informationsträger"
          ]
        },
        tags: ["farben", "colors", "branding", "kontrast"]
      },
      {
        id: "kb-typography",
        title: "Typografie",
        category: "foundations",
        content: {
          overview: "Inter als primäre Schrift.",
          fontFamily: { primary: "Inter", mono: "JetBrains Mono" },
          scale: [
            { name: "H1", size: "32px", weight: "700", usage: "Seitentitel" },
            { name: "H2", size: "24px", weight: "600", usage: "Section Headers" },
            { name: "Body", size: "16px", weight: "400", usage: "Fließtext" },
            { name: "Caption", size: "12px", weight: "400", usage: "Labels, Hinweise" }
          ],
          rules: ["Max Zeilenlänge: 65-75 Zeichen", "Keine Schrift unter 12px"]
        },
        tags: ["typografie", "schrift", "font", "text", "headlines"]
      },
      {
        id: "kb-spacing",
        title: "Spacing & Grid",
        category: "foundations",
        content: {
          overview: "8px Grid-System für konsistente Abstände.",
          baseUnit: "8px",
          scale: [
            { name: "space-1", value: "4px", usage: "Micro-Spacing" },
            { name: "space-2", value: "8px", usage: "Input Padding" },
            { name: "space-4", value: "16px", usage: "Card Padding" },
            { name: "space-6", value: "24px", usage: "Section Padding" },
            { name: "space-8", value: "32px", usage: "Große Sections" }
          ]
        },
        tags: ["spacing", "abstände", "grid", "layout", "responsive"]
      }
    ],
    components: [
      {
        id: "kb-buttons",
        title: "Buttons",
        category: "components",
        content: {
          overview: "Buttons kommunizieren Aktionen klar.",
          variants: [
            { name: "Primary", bg: "#2563EB", usage: "Hauptaktion pro Screen" },
            { name: "Secondary", bg: "transparent", usage: "Alternative Aktionen" },
            { name: "Destructive", bg: "#EF4444", usage: "Lösch-Aktionen" }
          ],
          rules: ["Max 1 Primary Button pro Bereich", "Icon links vom Text"]
        },
        tags: ["buttons", "cta", "aktionen", "primary"]
      },
      {
        id: "kb-inputs",
        title: "Input Felder",
        category: "components",
        content: {
          overview: "Inputs für Benutzereingaben mit klarer Fehlerkommunikation.",
          sizing: { height: "40px", padding: "12px", labelSpacing: "6px" },
          states: ["default", "hover", "focus", "error", "disabled"],
          rules: [
            "Label NIE als Placeholder",
            "Pflichtfelder mit Sternchen (*) markieren"
          ]
        },
        tags: ["inputs", "forms", "formular", "eingabe", "validation"]
      }
    ],
    patterns: [
      {
        id: "kb-navigation",
        title: "Navigation Patterns",
        category: "patterns",
        content: {
          overview: "Hierarchische Navigation für Orientierung.",
          types: {
            topNav: { height: "64px", usage: "Globale Navigation" },
            sideNav: { width: "256px", usage: "App-interne Navigation" },
            tabBar: { height: "56px", usage: "Mobile Haupt-Navigation, max 5 Items" }
          },
          rules: ["Max 7±2 Items pro Level", "Max 3 Level Verschachtelung"]
        },
        tags: ["navigation", "menu", "sidebar", "mobile"]
      }
    ]
  },
  
  glossary: [
    { term: "Hero Section", definition: "Prominenter Bereich am Seitenanfang.", specs: "Min-Höhe: 400px" },
    { term: "CTA", definition: "Call-to-Action – Button der zur Hauptaktion auffordert.", specs: "Primary Button" },
    { term: "Card", definition: "Container für zusammengehörige Inhalte.", specs: "Padding: 16-24px" },
    { term: "Modal", definition: "Überlagerndes Fenster das Fokus erzwingt.", specs: "Max-Width: 480px" },
    { term: "Toast", definition: "Kurze, nicht-blockierende Benachrichtigung.", specs: "Duration: 4s" },
    { term: "Empty State", definition: "Darstellung wenn keine Daten vorhanden.", specs: "Illustration + CTA" }
  ]
};
