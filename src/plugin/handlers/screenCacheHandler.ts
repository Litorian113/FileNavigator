import { ScreenData } from '../../shared/types';

// Screen cache for fast search
let screenCache: ScreenData[] = [];

const CACHE_KEY = 'documentedScreens';

/**
 * Loads the screen cache from clientStorage (fast!)
 */
export async function loadScreenCache(): Promise<ScreenData[]> {
  try {
    const stored = await figma.clientStorage.getAsync(CACHE_KEY);
    screenCache = stored || [];
    console.log(`Screen cache loaded: ${screenCache.length} documented components`);
    return screenCache;
  } catch (e) {
    console.error('Error loading screen cache:', e);
    screenCache = [];
    return screenCache;
  }
}

/**
 * Saves the screen cache to clientStorage
 */
async function saveScreenCache(): Promise<void> {
  try {
    await figma.clientStorage.setAsync(CACHE_KEY, screenCache);
  } catch (e) {
    console.error('Error saving screen cache:', e);
  }
}

/**
 * Rebuilds the screen cache (searches all pages) - only call when needed
 */
export async function rebuildScreenCache(): Promise<ScreenData[]> {
  // Just load from storage - don't scan
  return loadScreenCache();
}

/**
 * Updates a single screen in the cache (fast)
 */
export function updateScreenInCache(sid: string, screenData: ScreenData): void {
  const existingIndex = screenCache.findIndex(s => s.sid === sid);
  if (existingIndex >= 0) {
    screenCache[existingIndex] = screenData;
  } else {
    screenCache.push(screenData);
  }
  // Persist to storage
  saveScreenCache();
}

/**
 * Removes a screen from the cache by SID
 */
export function removeScreenFromCache(sid: string): void {
  const index = screenCache.findIndex(s => s.sid === sid);
  if (index >= 0) {
    screenCache.splice(index, 1);
  }
  // Persist to storage
  saveScreenCache();
}

/**
 * Returns the current screen cache
 */
export function getScreenCache(): ScreenData[] {
  return screenCache;
}

/**
 * Finds a screen in the cache by SID
 */
export function findScreenBySid(sid: string): ScreenData | undefined {
  return screenCache.find(s => s.sid === sid);
}
