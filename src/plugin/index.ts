// Figma Plugin Entry Point

import { PluginMessage } from '../shared/types';
import { SCREEN_CATEGORIES } from './data/categories';
import { KNOWLEDGE_BASE } from './data/knowledgeBase';
import { generateSID, postToUI } from './utils/helpers';
import { 
  loadMainKnowledgeBase, 
  saveMainKnowledgeBase, 
  getMainKnowledgeBase 
} from './handlers/knowledgeBaseHandler';
import { 
  rebuildScreenCache, 
  updateScreenInCache, 
  getScreenCache,
  findScreenBySid 
} from './handlers/screenCacheHandler';
import { searchKnowledgeBase, getKnowledgeById } from './handlers/searchHandler';

// API Key aus dem Build-Prozess
declare const process: { env: { OPENAI_API_KEY: string } };
const apiKey = process.env.OPENAI_API_KEY || '';

// Plugin UI anzeigen
figma.showUI(__html__, { width: 420, height: 680, themeColors: true });

// ============================================
// UI UPDATE
// ============================================

function updateUI(): void {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    postToUI({ type: 'selection-empty' }, apiKey);
    return;
  }

  const node = selection[0];

  if (node.type !== 'FRAME') {
    postToUI({ type: 'wrong-type' }, apiKey);
    return;
  }

  postToUI({
    type: 'update-data',
    altText: node.getPluginData('altText') || '',
    sid: node.getPluginData('sid') || 'Noch keine SID',
    nodeName: node.name,
    features: node.getPluginData('features') || '',
    linkedKnowledge: node.getPluginData('linkedKnowledge') || '',
    category: node.getPluginData('category') || 'pages',
    categories: SCREEN_CATEGORIES
  }, apiKey);
}

// ============================================
// EVENT HANDLERS
// ============================================

figma.on('selectionchange', () => {
  updateUI();
});

// ============================================
// MESSAGE HANDLER
// ============================================

figma.ui.onmessage = (msg: PluginMessage) => {
  
  // Main Knowledge Base
  if (msg.type === 'get-main-knowledge-base') {
    postToUI({
      type: 'main-knowledge-base-loaded',
      data: getMainKnowledgeBase()
    }, apiKey);
  }
  
  if (msg.type === 'save-main-knowledge-base') {
    saveMainKnowledgeBase(msg.data, apiKey);
  }
  
  // Screen Data
  if (msg.type === 'save-alt-text') {
    const selection = figma.currentPage.selection;
    if (selection.length === 1 && selection[0].type === 'FRAME') {
      const node = selection[0];
      
      let sid = node.getPluginData('sid');
      if (!sid) {
        sid = generateSID();
        node.setPluginData('sid', sid);
      }
      
      node.setPluginData('altText', msg.altText);
      updateUI();
      figma.notify("Alt-Text und SID gespeichert!");
    } else {
      figma.notify("Bitte genau einen Frame auswählen.");
    }
  }
  
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
      
      updateScreenInCache(sid, {
        sid: sid,
        name: node.name,
        description: msg.description || '',
        features: msg.features || '',
        category: msg.category || 'pages',
        nodeId: node.id
      });
      
      figma.ui.postMessage({
        type: 'screens-updated',
        screens: getScreenCache(),
        categories: SCREEN_CATEGORIES,
        apiKey
      });
      
      updateUI();
      figma.notify("Screen dokumentiert! ✓");
    }
  }
  
  // Search
  if (msg.type === 'search-frames') {
    const query = msg.query.toLowerCase();
    if (!query) {
      figma.notify("Bitte Suchbegriff eingeben.");
      return;
    }

    const matches = figma.currentPage.findAll(node => {
      if (node.type !== 'FRAME') return false;
      const altText = node.getPluginData('altText');
      return !!(altText && altText.toLowerCase().includes(query));
    });

    if (matches.length > 0) {
      figma.currentPage.selection = matches;
      figma.viewport.scrollAndZoomIntoView(matches);
      figma.notify(`${matches.length} Frame(s) gefunden!`);
    } else {
      figma.notify("Keine Frames mit diesem Text gefunden.");
    }
  }
  
  if (msg.type === 'search-knowledge') {
    const results = searchKnowledgeBase(msg.query);
    postToUI({
      type: 'search-results',
      query: msg.query,
      results: results
    }, apiKey);
  }
  
  // Navigation
  if (msg.type === 'zoom-to-sid') {
    const cachedScreen = findScreenBySid(msg.sid);
    
    if (cachedScreen) {
      figma.getNodeByIdAsync(cachedScreen.nodeId).then(node => {
        if (node) {
          figma.currentPage.selection = [node as SceneNode];
          figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
          figma.notify(`Gefunden: ${node.name}`);
        } else {
          rebuildScreenCache().catch(console.error);
          figma.notify("Frame wurde gelöscht oder verschoben.");
        }
      });
      return;
    }
    
    const node = figma.currentPage.findOne(n => n.getPluginData('sid') === msg.sid);
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
      figma.notify(`Gefunden: ${node.name}`);
      rebuildScreenCache().catch(console.error);
    } else {
      figma.notify("Frame konnte nicht gefunden werden.");
    }
  }
  
  // Knowledge Base
  if (msg.type === 'get-knowledge-base') {
    figma.ui.postMessage({
      type: 'knowledge-base-data',
      data: KNOWLEDGE_BASE,
      screens: getScreenCache(),
      categories: SCREEN_CATEGORIES,
      apiKey
    });
  }
  
  if (msg.type === 'get-knowledge-detail') {
    const item = getKnowledgeById(msg.id);
    if (item) {
      figma.ui.postMessage({
        type: 'knowledge-detail',
        data: item,
        apiKey
      });
    }
  }
  
  if (msg.type === 'get-all-screens') {
    figma.ui.postMessage({
      type: 'all-screens-data',
      screens: getScreenCache(),
      apiKey
    });
  }
  
  // Image Export für AI
  if (msg.type === 'get-image-for-ai') {
    const selection = figma.currentPage.selection;
    if (selection.length === 1 && selection[0].type === 'FRAME') {
      const node = selection[0];
      node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 0.5 } })
        .then(bytes => {
          figma.ui.postMessage({ type: 'image-data', bytes: bytes, apiKey });
        })
        .catch(err => {
          console.error(err);
          figma.notify("Fehler beim Exportieren des Bildes");
          figma.ui.postMessage({ type: 'image-error', apiKey });
        });
    }
  }
  
  if (msg.type === 'collect-all-frames') {
    const frames = figma.currentPage.findAll(node => node.type === 'FRAME');
    const searchableData = frames
      .filter(node => node.getPluginData('sid') && node.getPluginData('altText'))
      .map(node => ({
        sid: node.getPluginData('sid'),
        name: node.name,
        description: node.getPluginData('altText')
      }));

    figma.ui.postMessage({ 
      type: 'search-data-response', 
      data: searchableData,
      query: msg.query,
      apiKey
    });
  }
  
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// ============================================
// INITIALIZATION
// ============================================

// Initiales UI-Update
updateUI();

// Cache aufbauen
rebuildScreenCache().then(() => {
  console.log('Initial cache ready');
});

// Main Knowledge Base laden
loadMainKnowledgeBase(apiKey);
