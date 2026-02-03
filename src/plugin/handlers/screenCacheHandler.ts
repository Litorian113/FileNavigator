import { ScreenData } from '../../shared/types';

// Screen-Cache für schnelle Suche
let screenCache: ScreenData[] = [];

/**
 * Baut den Screen-Cache neu auf (durchsucht alle Seiten)
 */
export async function rebuildScreenCache(): Promise<ScreenData[]> {
  screenCache = [];
  
  // Lade alle Seiten für documentAccess: dynamic-page
  await figma.loadAllPagesAsync();
  
  // Durchsuche ALLE Seiten im Dokument
  for (const page of figma.root.children) {
    findFramesShallow(page.children, 0);
  }
  
  console.log(`Screen-Cache aktualisiert: ${screenCache.length} dokumentierte Screens`);
  return screenCache;
}

/**
 * Flache Suche mit Tiefenlimit um Einfrieren zu verhindern
 */
function findFramesShallow(nodes: readonly SceneNode[], depth: number): void {
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

/**
 * Aktualisiert einen einzelnen Screen im Cache (schnell)
 */
export function updateScreenInCache(sid: string, screenData: ScreenData): void {
  const existingIndex = screenCache.findIndex(s => s.sid === sid);
  if (existingIndex >= 0) {
    screenCache[existingIndex] = screenData;
  } else {
    screenCache.push(screenData);
  }
}

/**
 * Gibt den aktuellen Screen-Cache zurück
 */
export function getScreenCache(): ScreenData[] {
  return screenCache;
}

/**
 * Sucht einen Screen im Cache anhand der SID
 */
export function findScreenBySid(sid: string): ScreenData | undefined {
  return screenCache.find(s => s.sid === sid);
}
