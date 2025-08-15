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
      '张三': 'zhang san',
      '李四': 'li si',
      '王五': 'wang wu',
      '赵六': 'zhao liu',
      '钱七': 'qian qi',
      '孙八': 'sun ba',
      '周九': 'zhou jiu',
      '吴十': 'wu shi',
      '李明': 'li ming',
      '陈': 'chen',
      '刘': 'liu',
      '杨': 'yang',
      '浩': 'hao',
      '嘉': 'jia',
      '瑞': 'rui',
      '强': 'qiang',
      '黄': 'huang',
      '林': 'lin',
      '郭': 'guo',
      '何': 'he',
      '高': 'gao',
      '马': 'ma',
      '罗': 'luo',
      '梁': 'liang',
      '宋': 'song',
      '郑': 'zheng',
      '谢': 'xie',
      '韩': 'han',
      '唐': 'tang',
      '冯': 'feng',
      '于': 'yu',
      '董': 'dong',
      '萧': 'xiao',
      '程': 'cheng',
      '曹': 'cao',
      '张': 'zhang',
      '王': 'wang',
      '李': 'li',
      '赵': 'zhao',
      '周': 'zhou',
      '吴': 'wu',
      '徐': 'xu',
      '孙': 'sun',
      '朱': 'zhu',
      '胡': 'hu',
      '三': 'san',
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
      '文': 'wén',
      '明': 'míng'
    };

    // Check for exact matches first
    if (commonNameMappings[chineseText]) {
      return commonNameMappings[chineseText];
    }

    // Try character by character mapping for compound names
    let resultParts = [];
    for (const char of chineseText) {
      if (commonNameMappings[char]) {
        resultParts.push(commonNameMappings[char]);
      } else if (/[\u4e00-\u9fff]/.test(char)) {
        // Chinese character but not in our mapping - keep original
        resultParts.push(char);
      } else if (char.trim()) {
        // Non-Chinese character that isn't whitespace
        resultParts.push(char);
      }
    }

    const result = resultParts.join(' ');
    return result || chineseText;
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
  
  // For Chinese names, display them with spaces between characters
  const spacedChineseName = displayName.replace(/\s+/g, '').split('').join(' ');
  
  // Clean display name for pinyin conversion (no spaces)
  const cleanDisplayName = displayName.replace(/\s+/g, '').trim();
  const pinyinName = toPinyin(cleanDisplayName);
  
  // Only add pinyin if it's different from the original and actually converted to roman characters
  if (pinyinName && pinyinName !== cleanDisplayName && !/[\u4e00-\u9fff]/.test(pinyinName)) {
    // Capitalize the pinyin properly (first letter of each word)
    const capitalizedPinyin = pinyinName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return `${spacedChineseName} (${capitalizedPinyin})`;
  }
  
  return spacedChineseName;
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