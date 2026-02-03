import { MainKnowledgeBase } from '../../shared/types';
import { postToUI } from '../utils/helpers';

let mainKnowledgeBase: MainKnowledgeBase | null = null;

/**
 * Lädt die Main Knowledge Base aus dem clientStorage
 */
export async function loadMainKnowledgeBase(apiKey: string): Promise<MainKnowledgeBase | null> {
  try {
    const data = await figma.clientStorage.getAsync('mainKnowledgeBase');
    mainKnowledgeBase = data || null;
    console.log('Main Knowledge Base geladen:', mainKnowledgeBase?.projectName || 'Keine');
    
    postToUI({
      type: 'main-knowledge-base-loaded',
      data: mainKnowledgeBase
    }, apiKey);
    
    return mainKnowledgeBase;
  } catch (error) {
    console.error('Fehler beim Laden der Main Knowledge Base:', error);
    postToUI({
      type: 'main-knowledge-base-loaded',
      data: null
    }, apiKey);
    return null;
  }
}

/**
 * Speichert die Main Knowledge Base im clientStorage
 */
export async function saveMainKnowledgeBase(data: MainKnowledgeBase, apiKey: string): Promise<void> {
  try {
    await figma.clientStorage.setAsync('mainKnowledgeBase', data);
    mainKnowledgeBase = data;
    console.log('Main Knowledge Base gespeichert:', data.projectName);
    figma.notify(`Projekt "${data.projectName}" gespeichert! ✓`);
    
    postToUI({
      type: 'main-knowledge-base-saved',
      data: mainKnowledgeBase
    }, apiKey);
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    figma.notify('Fehler beim Speichern des Projekts.');
  }
}

/**
 * Gibt die aktuelle Main Knowledge Base zurück
 */
export function getMainKnowledgeBase(): MainKnowledgeBase | null {
  return mainKnowledgeBase;
}
