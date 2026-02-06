import { SearchResult } from '../../shared/types';
import { getMainKnowledgeBase } from './knowledgeBaseHandler';
import { getScreenCache } from './screenCacheHandler';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';

/**
 * Helper function to check if string contains substring (indexOf based for Figma compatibility)
 */
function containsString(str: string, search: string): boolean {
  return str.indexOf(search) >= 0;
}

/**
 * Searches the Knowledge Base for a search term
 */
export function searchKnowledgeBase(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  const mainKB = getMainKnowledgeBase();
  
  // Search Main Knowledge Base (from Onboarding)
  if (mainKB) {
    const projectName = String(mainKB.projectName || 'Project');
    const kbFields = [
      { id: 'vision', title: 'Project & Vision', content: String(mainKB.vision || '') },
      { id: 'audience', title: 'Target Audience', content: String(mainKB.audience || '') },
      { id: 'features', title: 'Core Features', content: String(mainKB.features || '') },
      { id: 'design', title: 'Design Language', content: String(mainKB.design || '') },
      { id: 'terminology', title: 'Terminology', content: String(mainKB.terminology || '') }
    ];
    
    for (const field of kbFields) {
      const contentStr = String(field.content || '');
      const lowerContent = contentStr.toLowerCase();
      if (lowerContent && containsString(lowerContent, lowerQuery)) {
        const matchIndex = lowerContent.indexOf(lowerQuery);
        const start = Math.max(0, matchIndex - 30);
        const end = Math.min(contentStr.length, matchIndex + lowerQuery.length + 70);
        let snippet = contentStr.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < contentStr.length) snippet = snippet + '...';
        
        results.push({
          type: 'project',
          id: field.id,
          title: projectName + ': ' + field.title,
          snippet: snippet,
          tags: [projectName]
        });
      }
    }
  }
  
  // Search static Knowledge Base (foundations, components, patterns)
  const foundations = KNOWLEDGE_BASE.knowledge?.foundations || [];
  const components = KNOWLEDGE_BASE.knowledge?.components || [];
  const patterns = KNOWLEDGE_BASE.knowledge?.patterns || [];
  const allKnowledge = foundations.concat(components).concat(patterns);
  
  for (const item of allKnowledge) {
    const itemTitle = String(item.title || '');
    const itemTags = item.tags || [];
    
    const matchInTitle = containsString(itemTitle.toLowerCase(), lowerQuery);
    let matchInTags = false;
    if (Array.isArray(itemTags)) {
      for (let i = 0; i < itemTags.length; i++) {
        const tag = String(itemTags[i] || '');
        if (containsString(tag.toLowerCase(), lowerQuery)) {
          matchInTags = true;
          break;
        }
      }
    }
    const matchInContent = containsString(String(JSON.stringify(item.content || {})).toLowerCase(), lowerQuery);
    
    if (matchInTitle || matchInTags || matchInContent) {
      results.push({
        type: 'knowledge',
        id: item.id,
        title: itemTitle,
        snippet: itemTags.join(', '),
        tags: itemTags,
        category: item.category
      });
    }
  }
  
  // Search Glossary
  const glossary = KNOWLEDGE_BASE.glossary || [];
  for (const term of glossary) {
    const termName = String(term.term || '');
    const termDef = String(term.definition || '');
    
    const matchInTerm = containsString(termName.toLowerCase(), lowerQuery);
    const matchInDef = containsString(termDef.toLowerCase(), lowerQuery);
    
    if (matchInTerm || matchInDef) {
      results.push({
        type: 'glossary',
        id: 'glossary-' + termName,
        title: termName,
        snippet: termDef,
        tags: []
      });
    }
  }
  
  // Search Component Cache
  const screenCache = getScreenCache();
  for (const screen of screenCache) {
    const screenName = String(screen.name || '');
    const screenDesc = String(screen.description || '');
    const screenFeatures = String(screen.features || '');
    
    const matchInName = containsString(screenName.toLowerCase(), lowerQuery);
    const matchInDesc = containsString(screenDesc.toLowerCase(), lowerQuery);
    const matchInFeatures = containsString(screenFeatures.toLowerCase(), lowerQuery);
    
    if (matchInName || matchInDesc || matchInFeatures) {
      const featureTags: string[] = [];
      if (screenFeatures) {
        const parts = screenFeatures.split(',');
        for (let i = 0; i < parts.length; i++) {
          featureTags.push(parts[i].trim());
        }
      }
      
      results.push({
        type: 'component',
        id: screen.sid,
        sid: screen.sid,
        title: screenName,
        snippet: screenDesc.substring(0, 100) + (screenDesc.length > 100 ? '...' : ''),
        content: screenDesc,
        tags: featureTags,
        category: screen.category || 'Component',
        pageName: screen.pageName
      });
    }
  }
  
  return results;
}

/**
 * Gets a Knowledge entry by ID
 */
export function getKnowledgeById(id: string) {
  const foundations = KNOWLEDGE_BASE.knowledge?.foundations || [];
  const components = KNOWLEDGE_BASE.knowledge?.components || [];
  const patterns = KNOWLEDGE_BASE.knowledge?.patterns || [];
  const allKnowledge = foundations.concat(components).concat(patterns);
  
  for (let i = 0; i < allKnowledge.length; i++) {
    if (allKnowledge[i].id === id) {
      return allKnowledge[i];
    }
  }
  return undefined;
}
