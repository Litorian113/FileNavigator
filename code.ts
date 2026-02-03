figma.showUI(__html__, { width: 420, height: 680, themeColors: true });

// API Key aus dem Build-Prozess (wird durch esbuild ersetzt)
declare const process: { env: { OPENAI_API_KEY: string } };
const apiKey = process.env.OPENAI_API_KEY;

// ============================================
// MAIN KNOWLEDGE BASE - Projekt-spezifische Daten
// (Gespeichert in clientStorage, persistiert über Sessions)
// ============================================
interface MainKnowledgeBase {
  projectName: string;
  vision: string;
  audience: string;
  features: string;
  design: string;
  terminology: string;
  createdAt: string;
  updatedAt: string;
}

let mainKnowledgeBase: MainKnowledgeBase | null = null;

// Lädt Main Knowledge Base beim Start
async function loadMainKnowledgeBase() {
  try {
    const data = await figma.clientStorage.getAsync('mainKnowledgeBase');
    mainKnowledgeBase = data || null;
    console.log('Main Knowledge Base geladen:', mainKnowledgeBase ? mainKnowledgeBase.projectName : 'Keine');
    
    // Sende an UI
    figma.ui.postMessage({
      type: 'main-knowledge-base-loaded',
      data: mainKnowledgeBase,
      apiKey: apiKey
    });
  } catch (error) {
    console.error('Fehler beim Laden der Main Knowledge Base:', error);
    figma.ui.postMessage({
      type: 'main-knowledge-base-loaded',
      data: null,
      apiKey: apiKey
    });
  }
}

// Speichert Main Knowledge Base
async function saveMainKnowledgeBase(data: MainKnowledgeBase) {
  try {
    await figma.clientStorage.setAsync('mainKnowledgeBase', data);
    mainKnowledgeBase = data;
    console.log('Main Knowledge Base gespeichert:', data.projectName);
    figma.notify(`Projekt "${data.projectName}" gespeichert! ✓`);
    
    figma.ui.postMessage({
      type: 'main-knowledge-base-saved',
      data: mainKnowledgeBase,
      apiKey: apiKey
    });
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    figma.notify('Fehler beim Speichern des Projekts.');
  }
}

// ============================================
// KNOWLEDGE BASE - Eingebettete Daten
// (Simuliert Confluence/externe Datenbank)
// ============================================

const KNOWLEDGE_BASE = {
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
          overview: "FutureDocumentation nutzt ein semantisches Farbsystem basierend auf Funktionen.",
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
          overview: "FutureDocumentation verwendet Inter als primäre Schrift.",
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
          ],
          breakpoints: [
            { name: "mobile", value: "0-639px" },
            { name: "tablet", value: "640-1023px" },
            { name: "desktop", value: "1024px+" }
          ]
        },
        tags: ["spacing", "abstände", "grid", "layout", "responsive"]
      }
    ],
    components: [
      {
        id: "kb-icons",
        title: "Icon System",
        category: "components",
        content: {
          overview: "Lucide Icons als Standard-Iconset.",
          sizes: [
            { name: "xs", size: "16px", usage: "Inline mit Text" },
            { name: "sm", size: "20px", usage: "Buttons, Inputs" },
            { name: "md", size: "24px", usage: "Navigation, Standard" },
            { name: "lg", size: "32px", usage: "Empty States" }
          ],
          navigation: {
            topNav: { size: "24px", touchTarget: "48px" },
            sideNav: { size: "20px", touchTarget: "40px" },
            tabBar: { size: "24px", touchTarget: "48px" }
          },
          rules: ["Touch-Target mindestens 44x44px", "Icons erben Farbe (currentColor)"]
        },
        tags: ["icons", "navigation", "touch", "größe", "size"]
      },
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
          sizes: [
            { name: "sm", height: "32px", usage: "Kompakte Bereiche" },
            { name: "md", height: "40px", usage: "Standard" },
            { name: "lg", height: "48px", usage: "Prominente CTAs" }
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
            "Pflichtfelder mit Sternchen (*) markieren",
            "Fehlermeldungen spezifisch formulieren"
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
    { term: "Hero Section", definition: "Prominenter Bereich am Seitenanfang mit Hauptüberschrift und CTA.", specs: "Min-Höhe: 400px" },
    { term: "CTA", definition: "Call-to-Action – Button der zur Hauptaktion auffordert.", specs: "Primary Button" },
    { term: "Card", definition: "Container für zusammengehörige Inhalte.", specs: "Padding: 16-24px, Radius: 8px" },
    { term: "Modal", definition: "Überlagerndes Fenster das Fokus erzwingt.", specs: "Max-Width: 480px/640px" },
    { term: "Toast", definition: "Kurze, nicht-blockierende Benachrichtigung.", specs: "Duration: 4s" },
    { term: "Empty State", definition: "Darstellung wenn keine Daten vorhanden.", specs: "Illustration + CTA" },
    { term: "Skeleton", definition: "Platzhalter während Inhalte laden.", specs: "Animierte Graustufen" }
  ],
  
  // Screens werden zur Laufzeit aus PluginData befüllt
  screens: [] as Array<{sid: string, name: string, description: string, features: string[], linkedKnowledge: string[]}>
};

// ============================================
// SCREEN CACHE - Für schnelle Suche
// ============================================
let screenCache: Array<{sid: string, name: string, description: string, features: string, category: string, nodeId: string}> = [];

// Verfügbare Kategorien für Screens
const SCREEN_CATEGORIES = [
  { id: 'pages', label: 'Seiten', icon: 'file' },
  { id: 'flows', label: 'User Flows', icon: 'git-branch' },
  { id: 'components', label: 'Component Specs', icon: 'box' },
  { id: 'tests', label: 'UX Tests', icon: 'clipboard' },
  { id: 'archive', label: 'Archiv', icon: 'archive' }
];

// Cache beim Start und nach Änderungen aktualisieren
async function rebuildScreenCache() {
  screenCache = [];
  
  // Lade alle Seiten für documentAccess: dynamic-page
  await figma.loadAllPagesAsync();
  
  // Durchsuche ALLE Seiten im Dokument
  for (const page of figma.root.children) {
    // Nur 2 Ebenen tief suchen (Page -> Section/Group -> Frame)
    findFramesShallow(page.children, 0);
  }
  
  console.log(`Screen-Cache aktualisiert: ${screenCache.length} dokumentierte Screens`);
}

// Flache Suche mit Tiefenlimit um Einfrieren zu verhindern
function findFramesShallow(nodes: readonly SceneNode[], depth: number) {
  // Max 3 Ebenen tief (0, 1, 2)
  if (depth > 2) return;
  
  for (const node of nodes) {
    // Wenn es ein Frame mit SID ist, zur Liste hinzufügen
    if (node.type === 'FRAME') {
      const sid = node.getPluginData('sid');
      if (sid) {
        screenCache.push({
          sid: sid,
          name: node.name,
          description: node.getPluginData('altText') || '',
          features: node.getPluginData('features') || '',
          category: node.getPluginData('category') || 'pages',
          nodeId: node.id
        });
        // Nicht weiter in diesen Frame hinein suchen (Performance)
        continue;
      }
    }
    
    // Nur in Sections und Groups weiter suchen, nicht in jeden Frame
    if (node.type === 'SECTION' || node.type === 'GROUP') {
      if ('children' in node && node.children) {
        findFramesShallow(node.children, depth + 1);
      }
    }
  }
}

// Schnelle Cache-Aktualisierung ohne alle Seiten neu zu laden
function updateScreenInCache(sid: string, screenData: typeof screenCache[0]) {
  const existingIndex = screenCache.findIndex(s => s.sid === sid);
  if (existingIndex >= 0) {
    // Update existierenden Eintrag
    screenCache[existingIndex] = screenData;
  } else {
    // Neuen Eintrag hinzufügen
    screenCache.push(screenData);
  }
}

// Hilfsfunktion: Einfache UUID generieren
function generateSID(): string {
  return 'sid-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

// Hilfsfunktion: Knowledge Base durchsuchen (Main KB + Screens)
function searchKnowledgeBase(query: string): Array<{type: string, id: string, title: string, snippet: string, tags: string[]}> {
  const results: Array<{type: string, id: string, title: string, snippet: string, tags: string[]}> = [];
  const lowerQuery = query.toLowerCase();
  
  // Durchsuche Main Knowledge Base (aus Onboarding)
  if (mainKnowledgeBase) {
    const kbFields = [
      { id: 'vision', title: '🚀 Projekt & Vision', content: mainKnowledgeBase.vision || '' },
      { id: 'audience', title: '👥 Zielgruppe', content: mainKnowledgeBase.audience || '' },
      { id: 'features', title: '✨ Kernfeatures', content: mainKnowledgeBase.features || '' },
      { id: 'design', title: '🎨 Designsprache', content: mainKnowledgeBase.design || '' },
      { id: 'terminology', title: '📖 Terminologie', content: mainKnowledgeBase.terminology || '' }
    ];
    
    for (const field of kbFields) {
      if (field.content && field.content.toLowerCase().includes(lowerQuery)) {
        // Finde den relevanten Ausschnitt
        const lowerContent = field.content.toLowerCase();
        const matchIndex = lowerContent.indexOf(lowerQuery);
        const start = Math.max(0, matchIndex - 30);
        const end = Math.min(field.content.length, matchIndex + lowerQuery.length + 70);
        let snippet = field.content.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < field.content.length) snippet = snippet + '...';
        
        results.push({
          type: 'project',
          id: field.id,
          title: `${mainKnowledgeBase.projectName}: ${field.title}`,
          snippet: snippet,
          tags: [mainKnowledgeBase.projectName]
        });
      }
    }
  }
  
  return results;
}

// Hilfsfunktion: Knowledge-Eintrag per ID holen
function getKnowledgeById(id: string) {
  const allKnowledge = [
    ...KNOWLEDGE_BASE.knowledge.foundations,
    ...KNOWLEDGE_BASE.knowledge.components,
    ...KNOWLEDGE_BASE.knowledge.patterns
  ];
  return allKnowledge.find(item => item.id === id);
}

// Funktion, um UI mit Daten der aktuellen Auswahl zu füttern
function updateUI() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'selection-empty', apiKey: apiKey });
    return;
  }

  const node = selection[0];

  // Prüfen, ob es ein Frame ist
  if (node.type !== 'FRAME') {
    figma.ui.postMessage({ type: 'wrong-type', apiKey: apiKey });
    return;
  }

  // Daten aus dem Frame lesen (PluginData ist wie dein lokales JSON am Objekt)
  const storedAltText = node.getPluginData('altText');
  const storedSID = node.getPluginData('sid');
  const storedFeatures = node.getPluginData('features');
  const storedLinkedKnowledge = node.getPluginData('linkedKnowledge');
  const storedCategory = node.getPluginData('category');

  figma.ui.postMessage({
    type: 'update-data',
    altText: storedAltText || '',
    sid: storedSID || 'Noch keine SID',
    nodeName: node.name,
    features: storedFeatures || '',
    linkedKnowledge: storedLinkedKnowledge || '',
    category: storedCategory || 'pages',
    categories: SCREEN_CATEGORIES,
    apiKey: apiKey // API Key an UI senden
  });
}

// Event: Wenn der Nutzer in Figma etwas anderes auswählt
figma.on('selectionchange', () => {
  updateUI();
});

// Initialer Aufruf beim Start
updateUI();
rebuildScreenCache().then(() => {
  console.log('Initial cache ready');
}); // Cache initial befüllen
loadMainKnowledgeBase(); // Main KB laden

figma.ui.onmessage = msg => {
  // ============================================
  // MAIN KNOWLEDGE BASE HANDLERS
  // ============================================
  
  if (msg.type === 'get-main-knowledge-base') {
    // Schon beim Start geladen, nochmal senden falls UI es verpasst hat
    figma.ui.postMessage({
      type: 'main-knowledge-base-loaded',
      data: mainKnowledgeBase,
      apiKey: apiKey
    });
  }
  
  if (msg.type === 'save-main-knowledge-base') {
    saveMainKnowledgeBase(msg.data);
  }
  
  if (msg.type === 'save-alt-text') {
    const selection = figma.currentPage.selection;

    if (selection.length === 1 && selection[0].type === 'FRAME') {
      const node = selection[0];
      
      // 1. SID prüfen oder erstellen
      let sid = node.getPluginData('sid');
      if (!sid) {
        sid = generateSID();
        node.setPluginData('sid', sid);
      }

      // 2. Alt Text speichern
      node.setPluginData('altText', msg.altText);

      // Feedback an UI und Console
      console.log(`Gespeichert für Frame "${node.name}":`, { sid, altText: msg.altText });
      
      // UI aktualisieren, damit die neue SID angezeigt wird falls sie neu war
      updateUI();
      
      figma.notify("Alt-Text und SID gespeichert!");
    } else {
      figma.notify("Bitte genau einen Frame auswählen.");
    }
  }

  if (msg.type === 'search-frames') {
    const query = msg.query.toLowerCase();
    if (!query) {
      figma.notify("Bitte Suchbegriff eingeben.");
      return;
    }

    // Suche auf der aktuellen Seite nach Frames mit passendem Alt-Text
    const matches = figma.currentPage.findAll(node => {
      if (node.type !== 'FRAME') return false;
      const altText = node.getPluginData('altText');
      return !!(altText && altText.toLowerCase().includes(query));
    });

    if (matches.length > 0) {
      // Selektiere die gefundenen Frames
      figma.currentPage.selection = matches;
      // Zoome auf die Auswahl
      figma.viewport.scrollAndZoomIntoView(matches);
      figma.notify(`${matches.length} Frame(s) gefunden!`);
    } else {
      figma.notify("Keine Frames mit diesem Text gefunden.");
    }
  }

  // NEU: Sammelt alle Frames mit Alt-Text für die AI-Suche
  if (msg.type === 'collect-all-frames') {
    const frames = figma.currentPage.findAll(node => node.type === 'FRAME');
    const searchableData = [];

    for (const node of frames) {
      const altText = node.getPluginData('altText');
      const sid = node.getPluginData('sid');
      
      if (altText && sid) {
        searchableData.push({
          sid: sid,
          name: node.name,
          description: altText
        });
      }
    }

    figma.ui.postMessage({ 
      type: 'search-data-response', 
      data: searchableData,
      query: msg.query 
    });
  }

  // NEU: Zoomt zu einem spezifischen Frame anhand der SID
  if (msg.type === 'zoom-to-sid') {
    // Erst im Cache suchen (schneller)
    const cachedScreen = screenCache.find(s => s.sid === msg.sid);
    
    if (cachedScreen) {
      figma.getNodeByIdAsync(cachedScreen.nodeId).then(node => {
        if (node) {
          figma.currentPage.selection = [node as SceneNode];
          figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
          figma.notify(`Gefunden: ${node.name}`);
        } else {
          // Node existiert nicht mehr, Cache neu bauen
          rebuildScreenCache().catch(console.error);
          figma.notify("Frame wurde gelöscht oder verschoben.");
        }
      });
      return;
    }
    
    // Fallback: Durchsuche alle (für den Fall, dass Cache nicht aktuell ist)
    const node = figma.currentPage.findOne(n => n.getPluginData('sid') === msg.sid);
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
      figma.notify(`Gefunden: ${node.name}`);
      rebuildScreenCache().catch(console.error); // Cache aktualisieren
    } else {
      figma.notify("Frame konnte nicht gefunden werden (evtl. gelöscht?).");
    }
  }

  if (msg.type === 'get-image-for-ai') {
    const selection = figma.currentPage.selection;
    if (selection.length === 1 && selection[0].type === 'FRAME') {
      const node = selection[0];
      // Exportiere Frame als PNG (halbe Größe reicht für Analyse und spart Daten)
      node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 0.5 } })
        .then(bytes => {
          figma.ui.postMessage({ type: 'image-data', bytes: bytes });
        })
        .catch(err => {
          console.error(err);
          figma.notify("Fehler beim Exportieren des Bildes");
          figma.ui.postMessage({ type: 'image-error' });
        });
    }
  }

  // ============================================
  // KNOWLEDGE BASE HANDLERS
  // ============================================
  
  // Sendet die komplette Knowledge Base an die UI
  if (msg.type === 'get-knowledge-base') {
    figma.ui.postMessage({
      type: 'knowledge-base-data',
      data: KNOWLEDGE_BASE,
      screens: screenCache,
      categories: SCREEN_CATEGORIES
    });
  }
  
  // Suche in der Knowledge Base
  if (msg.type === 'search-knowledge') {
    const results = searchKnowledgeBase(msg.query);
    const lowerQuery = msg.query.toLowerCase();
    
    // Schnelle Suche über den Cache statt über alle Frames
    for (const screen of screenCache) {
      const matchInName = screen.name.toLowerCase().includes(lowerQuery);
      const matchInDesc = screen.description.toLowerCase().includes(lowerQuery);
      const matchInFeatures = screen.features.toLowerCase().includes(lowerQuery);
      
      if (matchInName || matchInDesc || matchInFeatures) {
        results.push({
          type: 'screen',
          id: screen.sid,
          title: screen.name,
          snippet: screen.description.substring(0, 100) + (screen.description.length > 100 ? '...' : ''),
          tags: screen.features ? screen.features.split(',').map((f: string) => f.trim()) : []
        });
      }
    }
    
    figma.ui.postMessage({
      type: 'search-results',
      query: msg.query,
      results: results
    });
  }
  
  // Holt Details eines Knowledge-Eintrags
  if (msg.type === 'get-knowledge-detail') {
    const item = getKnowledgeById(msg.id);
    if (item) {
      figma.ui.postMessage({
        type: 'knowledge-detail',
        data: item
      });
    }
  }
  
  // Speichert erweiterte Frame-Daten (mit Features)
  if (msg.type === 'save-screen-data') {
    const selection = figma.currentPage.selection;
    if (selection.length === 1 && selection[0].type === 'FRAME') {
      const node = selection[0];
      
      let sid = node.getPluginData('sid');
      if (!sid) {
        sid = generateSID();
        node.setPluginData('sid', sid);
      }
      
      node.setPluginData('altText', msg.description || '');
      node.setPluginData('features', msg.features || '');
      node.setPluginData('linkedKnowledge', msg.linkedKnowledge || '');
      node.setPluginData('category', msg.category || 'pages');
      
      // Cache schnell aktualisieren (ohne alle Seiten neu zu laden!)
      updateScreenInCache(sid, {
        sid: sid,
        name: node.name,
        description: msg.description || '',
        features: msg.features || '',
        category: msg.category || 'pages',
        nodeId: node.id
      });
      
      // Sende aktualisierten Screen-Cache an UI für Browse-Ansicht
      figma.ui.postMessage({
        type: 'screens-updated',
        screens: screenCache,
        categories: SCREEN_CATEGORIES
      });
      
      console.log(`Screen gespeichert: "${node.name}"`, { sid, features: msg.features, category: msg.category });
      updateUI();
      figma.notify("Screen dokumentiert! ✓");
    }
  }
  
  // Holt alle dokumentierten Screens
  if (msg.type === 'get-all-screens') {
    const frames = figma.currentPage.findAll(node => node.type === 'FRAME');
    const screens = [];
    
    for (const node of frames) {
      const sid = node.getPluginData('sid');
      if (sid) {
        screens.push({
          sid: sid,
          name: node.name,
          description: node.getPluginData('altText') || '',
          features: node.getPluginData('features') || '',
          linkedKnowledge: node.getPluginData('linkedKnowledge') || ''
        });
      }
    }
    
    figma.ui.postMessage({
      type: 'all-screens-data',
      screens: screens
    });
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
