// Figma Plugin Entry Point

import { PluginMessage } from '../shared/types';
import { SCREEN_CATEGORIES } from './data/categories';
import { KNOWLEDGE_BASE } from './data/knowledgeBase';
import { generateSID, postToUI, isDocumentableNode } from './utils/helpers';
import { 
  loadMainKnowledgeBase, 
  saveMainKnowledgeBase, 
  getMainKnowledgeBase 
} from './handlers/knowledgeBaseHandler';
import { 
  rebuildScreenCache, 
  updateScreenInCache, 
  getScreenCache,
  findScreenBySid,
  removeScreenFromCache,
  loadScreenCache
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

  if (!isDocumentableNode(node)) {
    postToUI({ type: 'wrong-type' }, apiKey);
    return;
  }

  // Auto-Kategorie basierend auf Node-Typ bestimmen
  const isComponentType = node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE';
  const savedCategory = node.getPluginData('category');
  const defaultCategory = isComponentType ? 'components' : 'pages';

  postToUI({
    type: 'update-data',
    altText: node.getPluginData('altText') || '',
    sid: node.getPluginData('sid') || 'No SID yet',
    nodeName: node.name,
    features: node.getPluginData('features') || '',
    linkedKnowledge: node.getPluginData('linkedKnowledge') || '',
    category: savedCategory || defaultCategory,
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
    if (selection.length === 1 && isDocumentableNode(selection[0])) {
      const node = selection[0];
      
      let sid = node.getPluginData('sid');
      if (!sid) {
        sid = generateSID();
        node.setPluginData('sid', sid);
      }
      
      node.setPluginData('altText', msg.altText);
      updateUI();
      figma.notify("Alt text and SID saved!");
    } else {
      figma.notify("Please select a frame or component.");
    }
  }
  
  if (msg.type === 'save-screen-data') {
    const selection = figma.currentPage.selection;
    if (selection.length === 1 && isDocumentableNode(selection[0])) {
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
        nodeId: node.id,
        pageId: figma.currentPage.id,
        pageName: figma.currentPage.name
      });
      
      figma.ui.postMessage({
        type: 'screens-updated',
        screens: getScreenCache(),
        categories: SCREEN_CATEGORIES,
        apiKey
      });
      
      updateUI();
      figma.notify("Component documented! ✓");
    }
  }
  
  // Delete screen documentation
  if (msg.type === 'delete-screen-data') {
    const sid = msg.sid;
    if (!sid) {
      figma.notify("No SID provided.");
      return;
    }
    
    // Find the node with this SID and clear its plugin data
    const cachedScreen = findScreenBySid(sid);
    if (cachedScreen) {
      figma.getNodeByIdAsync(cachedScreen.nodeId).then(node => {
        if (node) {
          // Clear all plugin data from the node
          node.setPluginData('sid', '');
          node.setPluginData('altText', '');
          node.setPluginData('features', '');
          node.setPluginData('linkedKnowledge', '');
          node.setPluginData('category', '');
        }
        
        // Remove from cache
        removeScreenFromCache(sid);
        
        // Update UI
        figma.ui.postMessage({
          type: 'screens-updated',
          screens: getScreenCache(),
          categories: SCREEN_CATEGORIES,
          apiKey
        });
        
        figma.notify("Documentation removed ✓");
      });
    } else {
      // Just remove from cache if node not found
      removeScreenFromCache(sid);
      figma.ui.postMessage({
        type: 'screens-updated',
        screens: getScreenCache(),
        categories: SCREEN_CATEGORIES,
        apiKey
      });
      figma.notify("Documentation removed ✓");
    }
  }
  
  // Search
  if (msg.type === 'search-frames') {
    const query = msg.query.toLowerCase();
    if (!query) {
      figma.notify("Please enter a search term.");
      return;
    }

    const matches = figma.currentPage.findAll(node => {
      if (!isDocumentableNode(node)) return false;
      const altText = node.getPluginData('altText');
      return !!(altText && altText.toLowerCase().includes(query));
    });

    if (matches.length > 0) {
      figma.currentPage.selection = matches;
      figma.viewport.scrollAndZoomIntoView(matches);
      figma.notify(`${matches.length} frame(s) found!`);
    } else {
      figma.notify("No frames found with this text.");
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
      // Function to zoom to node after page switch
      const zoomToNode = () => {
        figma.getNodeByIdAsync(cachedScreen.nodeId).then(node => {
          if (node) {
            figma.currentPage.selection = [node as SceneNode];
            figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
            figma.notify(`Found: ${node.name}`);
          } else {
            rebuildScreenCache().catch(console.error);
            figma.notify("Frame was deleted or moved.");
          }
        });
      };
      
      // Check if we need to switch pages
      if (cachedScreen.pageId && cachedScreen.pageId !== figma.currentPage.id) {
        // Find and switch to the target page
        const targetPage = figma.root.children.find(page => page.id === cachedScreen.pageId);
        if (targetPage) {
          figma.setCurrentPageAsync(targetPage).then(() => {
            figma.notify(`Switched to page: ${targetPage.name}`);
            zoomToNode();
          });
        } else {
          zoomToNode();
        }
      } else {
        zoomToNode();
      }
      return;
    }
    
    // Fallback: Search on current page
    const node = figma.currentPage.findOne(n => n.getPluginData('sid') === msg.sid);
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
      figma.notify(`Found: ${node.name}`);
      rebuildScreenCache().catch(console.error);
    } else {
      figma.notify("Frame could not be found.");
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
    if (selection.length === 1 && isDocumentableNode(selection[0])) {
      const node = selection[0] as FrameNode;
      node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 0.5 } })
        .then(bytes => {
          figma.ui.postMessage({ type: 'image-data', bytes: bytes, apiKey });
        })
        .catch(err => {
          console.error(err);
          figma.notify("Error exporting image");
          figma.ui.postMessage({ type: 'image-error', apiKey });
        });
    }
  }
  
  if (msg.type === 'collect-all-frames') {
    const frames = figma.currentPage.findAll(node => isDocumentableNode(node));
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

// Cache aus Storage laden (schnell!) und dann Screens an UI senden
loadScreenCache().then(() => {
  console.log('Screen cache loaded from storage');
  // Sende aktualisierte Screens an UI
  figma.ui.postMessage({
    type: 'screens-updated',
    screens: getScreenCache(),
    categories: SCREEN_CATEGORIES,
    apiKey
  });
});

// Main Knowledge Base laden
loadMainKnowledgeBase(apiKey);
