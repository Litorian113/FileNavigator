import { SearchResult } from '../../shared/types';
import { getMainKnowledgeBase } from './knowledgeBaseHandler';
import { getScreenCache } from './screenCacheHandler';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';

/**
 * Durchsucht die Knowledge Base nach einem Suchbegriff
 */
export function searchKnowledgeBase(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  const mainKB = getMainKnowledgeBase();
  
  // Durchsuche Main Knowledge Base (aus Onboarding)
  if (mainKB) {
    const kbFields = [
      { id: 'vision', title: 'Projekt & Vision', content: mainKB.vision || '' },
      { id: 'audience', title: 'Zielgruppe', content: mainKB.audience || '' },
      { id: 'features', title: 'Kernfeatures', content: mainKB.features || '' },
      { id: 'design', title: 'Designsprache', content: mainKB.design || '' },
      { id: 'terminology', title: 'Terminologie', content: mainKB.terminology || '' }
    ];
    
    for (const field of kbFields) {
      if (field.content && field.content.toLowerCase().includes(lowerQuery)) {
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
          title: mainKB.projectName + ': ' + field.title,
          snippet: snippet,
          tags: [mainKB.projectName]
        });
      }
    }
  }
  
  // Durchsuche statische Knowledge Base (foundations, components, patterns)
  const allKnowledge = KNOWLEDGE_BASE.knowledge.foundations
    .concat(KNOWLEDGE_BASE.knowledge.components)
    .concat(KNOWLEDGE_BASE.knowledge.patterns);
  
  for (const item of allKnowledge) {
    const matchInTitle = item.title.toLowerCase().includes(lowerQuery);
    const matchInTags = item.tags.some(function(tag) { 
      return tag.toLowerCase().includes(lowerQuery); 
    });
    const matchInContent = JSON.stringify(item.content).toLowerCase().includes(lowerQuery);
    
    if (matchInTitle || matchInTags || matchInContent) {
      results.push({
        type: 'knowledge',
        id: item.id,
        title: item.title,
        snippet: item.tags.join(', '),
        tags: item.tags,
        category: item.category
      });
    }
  }
  
  // Durchsuche Glossar
  if (KNOWLEDGE_BASE.glossary) {
    for (const term of KNOWLEDGE_BASE.glossary) {
      const matchInTerm = term.term.toLowerCase().includes(lowerQuery);
      const matchInDef = term.definition.toLowerCase().includes(lowerQuery);
      
      if (matchInTerm || matchInDef) {
        results.push({
          type: 'glossary',
          id: 'glossary-' + term.term,
          title: term.term,
          snippet: term.definition,
          tags: []
        });
      }
    }
  }
  
  // Durchsuche Screen-Cache
  const screenCache = getScreenCache();
  for (const screen of screenCache) {
    const matchInName = screen.name.toLowerCase().includes(lowerQuery);
    const matchInDesc = screen.description.toLowerCase().includes(lowerQuery);
    const matchInFeatures = screen.features.toLowerCase().includes(lowerQuery);
    
    if (matchInName || matchInDesc || matchInFeatures) {
      results.push({
        type: 'screen',
        id: screen.sid,
        sid: screen.sid,
        title: screen.name,
        snippet: screen.description.substring(0, 100) + (screen.description.length > 100 ? '...' : ''),
        tags: screen.features ? screen.features.split(',').map(function(f) { return f.trim(); }) : []
      });
    }
  }
  
  return results;
}

/**
 * Holt einen Knowledge-Eintrag anhand der ID
 */
export function getKnowledgeById(id: string) {
  const allKnowledge = KNOWLEDGE_BASE.knowledge.foundations
    .concat(KNOWLEDGE_BASE.knowledge.components)
    .concat(KNOWLEDGE_BASE.knowledge.patterns);
  return allKnowledge.find(item => item.id === id);
}
