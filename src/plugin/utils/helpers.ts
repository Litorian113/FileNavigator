// Hilfsfunktionen für das Figma Plugin

/** Node-Typen die dokumentiert werden können (Frames + Komponenten) */
const DOCUMENTABLE_TYPES = ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE'];

/**
 * Prüft ob ein Node dokumentierbar ist (Frame oder Komponente)
 */
export function isDocumentableNode(node: SceneNode): boolean {
  return DOCUMENTABLE_TYPES.includes(node.type);
}

/**
 * Generiert eine eindeutige Screen-ID (SID)
 */
export function generateSID(): string {
  return 'sid-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

/**
 * Sendet eine Nachricht an die UI mit API Key
 */
export function postToUI(message: Record<string, unknown>, apiKey: string): void {
  const msg = Object.assign({}, message, { apiKey: apiKey });
  figma.ui.postMessage(msg);
}
