import { MainKnowledgeBase } from '../../shared/types';
import { postToUI } from '../utils/helpers';

let mainKnowledgeBase: MainKnowledgeBase | null = null;

/**
 * Loads the Main Knowledge Base from clientStorage
 */
export async function loadMainKnowledgeBase(apiKey: string): Promise<MainKnowledgeBase | null> {
  try {
    const data = await figma.clientStorage.getAsync('mainKnowledgeBase');
    mainKnowledgeBase = data || null;
    console.log('Main Knowledge Base loaded:', mainKnowledgeBase?.projectName || 'None');
    
    postToUI({
      type: 'main-knowledge-base-loaded',
      data: mainKnowledgeBase
    }, apiKey);
    
    return mainKnowledgeBase;
  } catch (error) {
    console.error('Error loading Main Knowledge Base:', error);
    postToUI({
      type: 'main-knowledge-base-loaded',
      data: null
    }, apiKey);
    return null;
  }
}

/**
 * Saves the Main Knowledge Base to clientStorage
 */
export async function saveMainKnowledgeBase(data: MainKnowledgeBase, apiKey: string): Promise<void> {
  try {
    await figma.clientStorage.setAsync('mainKnowledgeBase', data);
    mainKnowledgeBase = data;
    console.log('Main Knowledge Base saved:', data.projectName);
    figma.notify(`Project "${data.projectName}" saved! ✓`);
    
    postToUI({
      type: 'main-knowledge-base-saved',
      data: mainKnowledgeBase
    }, apiKey);
  } catch (error) {
    console.error('Error saving:', error);
    figma.notify('Error saving project.');
  }
}

/**
 * Returns the current Main Knowledge Base
 */
export function getMainKnowledgeBase(): MainKnowledgeBase | null {
  return mainKnowledgeBase;
}
