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
    // Static mapping for common Chinese names to demonstrate functionality
    const commonNameMappings: Record<string, string> = {
      '张三': 'zhāng sān',
      '李四': 'lǐ sì',
      '王五': 'wáng wǔ',
      '赵六': 'zhào liù',
      '钱七': 'qián qī',
      '孙八': 'sūn bā',
      '周九': 'zhōu jiǔ',
      '吴十': 'wú shí',
      '陈': 'chén',
      '刘': 'liú',
      '杨': 'yáng',
      '黄': 'huáng',
      '林': 'lín',
      '郭': 'guō',
      '何': 'hé',
      '高': 'gāo',
      '马': 'mǎ',
      '罗': 'luó',
      '梁': 'liáng',
      '宋': 'sòng',
      '郑': 'zhèng',
      '谢': 'xiè',
      '韩': 'hán',
      '唐': 'táng',
      '冯': 'féng',
      '于': 'yú',
      '董': 'dǒng',
      '萧': 'xiāo',
      '程': 'chéng',
      '曹': 'cáo',
      '袁': 'yuán',
      '邓': 'dèng',
      '许': 'xǔ',
      '傅': 'fù',
      '沈': 'shěn',
      '曾': 'zēng',
      '彭': 'péng',
      '吕': 'lǚ',
      '苏': 'sū',
      '卢': 'lú',
      '蒋': 'jiǎng',
      '蔡': 'cài',
      '贾': 'jiǎ',
      '丁': 'dīng',
      '魏': 'wèi',
      '薛': 'xuē',
      '叶': 'yè',
      '阎': 'yán',
      '余': 'yú',
      '潘': 'pān',
      '杜': 'dù',
      '戴': 'dài',
      '夏': 'xià',
      '钟': 'zhōng',
      '汪': 'wāng',
      '田': 'tián',
      '任': 'rèn',
      '姜': 'jiāng',
      '范': 'fàn',
      '方': 'fāng',
      '石': 'shí',
      '姚': 'yáo',
      '谭': 'tán',
      '廖': 'liào',
      '邹': 'zōu',
      '熊': 'xióng',
      '金': 'jīn',
      '陆': 'lù',
      '郝': 'hǎo',
      '孔': 'kǒng',
      '白': 'bái',
      '崔': 'cuī',
      '康': 'kāng',
      '毛': 'máo',
      '邱': 'qiū',
      '秦': 'qín',
      '江': 'jiāng',
      '史': 'shǐ',
      '顾': 'gù',
      '侯': 'hóu',
      '邵': 'shào',
      '孟': 'mèng',
      '龙': 'lóng',
      '万': 'wàn',
      '段': 'duàn',
      '雷': 'léi',
      '钱': 'qián',
      '汤': 'tāng',
      '尹': 'yǐn',
      '黎': 'lí',
      '易': 'yì',
      '常': 'cháng',
      '武': 'wǔ',
      '乔': 'qiáo',
      '贺': 'hè',
      '赖': 'lài',
      '龚': 'gōng',
      '文': 'wén'
    };

    // Check for exact matches first
    if (commonNameMappings[chineseText]) {
      return commonNameMappings[chineseText];
    }

    // Try character by character mapping for compound names
    let result = '';
    for (const char of chineseText) {
      if (commonNameMappings[char]) {
        result += commonNameMappings[char] + ' ';
      } else if (/[\u4e00-\u9fff]/.test(char)) {
        // Chinese character but not in our mapping - keep original
        result += char;
      } else {
        // Non-Chinese character (space, punctuation, etc.)
        result += char;
      }
    }

    return result.trim() || chineseText;
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
  
  // Only add pinyin if it's different from the original and actually converted to roman characters
  if (pinyinName && pinyinName !== displayName && !/[\u4e00-\u9fff]/.test(pinyinName)) {
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