import pinyin from 'pinyin';

/**
 * Detects if a string contains Chinese characters
 */
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/**
 * Converts Chinese characters to Hanyu Pinyin
 */
export function toPinyin(chineseText: string): string {
  try {
    // Convert to pinyin with tone marks removed and proper spacing
    const pinyinArray = pinyin(chineseText, {
      style: pinyin.STYLE_NORMAL, // No tone marks
      heteronym: false // Use most common pronunciation
    });
    
    // Join the pinyin syllables with spaces and capitalize first letter of each word
    return pinyinArray
      .map(syllable => syllable[0])
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } catch (error) {
    console.error('Error converting to pinyin:', error);
    return chineseText; // Fallback to original text
  }
}

/**
 * Enhances display name with pinyin for Chinese names
 * Format: "中文名 (Pinyin Name)"
 */
export function enhanceChineseName(displayName: string): string {
  if (!displayName || !containsChinese(displayName)) {
    return displayName;
  }
  
  const pinyinName = toPinyin(displayName);
  
  // Only add pinyin if it's different from the original (i.e., conversion was successful)
  if (pinyinName && pinyinName !== displayName) {
    return `${displayName} (${pinyinName})`;
  }
  
  return displayName;
}

/**
 * Creates searchable text including both Chinese and pinyin
 */
export function createSearchableText(displayName: string, username: string): string {
  const searchTerms = [displayName, username];
  
  if (containsChinese(displayName)) {
    const pinyinName = toPinyin(displayName);
    if (pinyinName && pinyinName !== displayName) {
      searchTerms.push(pinyinName);
    }
  }
  
  return searchTerms.join(' ').toLowerCase();
}

/**
 * Checks if search query matches Chinese name or its pinyin
 */
export function matchesChineseSearch(displayName: string, username: string, searchQuery: string): boolean {
  if (!searchQuery) return true;
  
  const query = searchQuery.toLowerCase();
  const searchableText = createSearchableText(displayName, username);
  
  return searchableText.includes(query);
}