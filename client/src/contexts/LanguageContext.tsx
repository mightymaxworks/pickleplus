import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'zh-CN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  'en': {
    // Navigation & Common
    'nav.dashboard': 'Dashboard',
    'nav.matches': 'Matches',
    'nav.tournaments': 'Tournaments',
    'nav.profile': 'Profile',
    'nav.findCoaches': 'Find Coaches',
    'nav.findPlayers': 'Find Players',
    'nav.trainingFacilities': 'Training Facilities',
    'nav.logout': 'Logout',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.close': 'Close',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.playerPassport': 'Player Passport',
    'dashboard.passportCode': 'Passport Code',
    'dashboard.skillLevel': 'Skill Level',
    'dashboard.totalMatches': 'Total Matches',
    'dashboard.winRate': 'Win Rate',
    'dashboard.currentStreak': 'Current Streak',
    'dashboard.picklePoints': 'Pickle Points',
    'dashboard.recordMatch': 'Record Match',
    'dashboard.findCoaches': 'Find Coaches',
    'dashboard.findPlayers': 'Find Players',
    'dashboard.joinTournament': 'Join Tournament',
    'dashboard.becomeCoach': 'Become a Coach',
    'dashboard.manageCoachProfile': 'Manage Coach Profile',
    'dashboard.findTrainingFacilities': 'Find Training Facilities',
    
    // PCP Assessment
    'pcp.technicalSkills': 'Technical Skills',
    'pcp.tacticalSkills': 'Tactical Skills',
    'pcp.physicalFitness': 'Physical Fitness',
    'pcp.mentalSkills': 'Mental Skills',
    'pcp.overallRating': 'Overall PCP Rating',
    'pcp.assessment': 'PCP Assessment',
    'pcp.coachingCertification': 'PCP Coaching Certification Programme',
    
    // Coaching
    'coach.findYourPerfectCoach': 'Find Your Perfect Coach',
    'coach.connectWithExperts': 'Connect with expert coaches who will transform your skills and elevate your performance on the court',
    'coach.filterBySpecialty': 'Filter by Specialty',
    'coach.allCoaches': 'All Coaches',
    'coach.experienceYears': 'years experience',
    'coach.hourlyRate': 'per hour',
    'coach.bookSession': 'Book Session',
    'coach.verified': 'Verified',
    'coach.specialties': 'Specialties',
    'coach.certifications': 'Certifications',
    'coach.rating': 'Rating',
    'coach.reviews': 'reviews',
    
    // Coming Soon
    'comingSoon.feature': 'Feature Coming Soon',
    'comingSoon.tournamentRegistration': 'Tournament Registration',
    'comingSoon.tournamentDescription': 'Our tournament discovery and registration system is launching soon! You\'ll be able to browse upcoming tournaments, register with one click, and track your tournament history.',
    'comingSoon.playerDiscovery': 'Player Discovery',
    'comingSoon.playerDescription': 'The player finder feature is coming soon! Connect with players in your area, find practice partners, and organize friendly matches based on skill level and availability.',
    'comingSoon.trainingFacilities': 'Training Facilities',
    'comingSoon.facilitiesDescription': 'Our training facility discovery system is launching soon! You\'ll be able to find nearby training centers, view their amenities, and book courts and classes directly through the platform.',
    
    // Dashboard QR & Photo
    'dashboard.qr.codeHidden': 'Code Hidden',
    'dashboard.qr.codeRevealed': 'Code Revealed',
    'dashboard.qr.codeHiddenDesc': 'Your passport code is now hidden',
    'dashboard.qr.yourCode': 'Your passport code',
    'dashboard.tournaments.title': 'Tournament Registration',
    'dashboard.tournaments.comingSoon': 'Our tournament discovery and registration system is launching soon! You\'ll be able to browse upcoming tournaments, register with one click, and track your tournament history.',
    'dashboard.players.title': 'Player Discovery',
    'dashboard.players.comingSoon': 'The player finder feature is coming soon! Connect with players in your area, find practice partners, and organize friendly matches based on skill level and availability.',
    'dashboard.training.title': 'Training Facilities',
    'dashboard.training.comingSoon': 'Our training facility discovery system is launching soon! You\'ll be able to find nearby training centers, view their amenities, and book courts and classes directly through the platform.',
    'dashboard.photo.updated': 'Profile Photo Updated',
    'dashboard.photo.uploadedSuccess': 'Your new profile photo has been uploaded successfully.',
    'dashboard.photo.update': 'Update Photo',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.username': 'Username',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.dontHaveAccount': 'Don\'t have an account?',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signUp': 'Sign Up',
    'auth.signIn': 'Sign In',
    
    // Profile & Player Info
    'profile.personalInfo': 'Personal Information',
    'profile.statistics': 'Statistics',
    'profile.equipment': 'Equipment',
    'profile.preferences': 'Preferences',
    'profile.achievements': 'Achievements',
    'profile.updatePhoto': 'Update Photo',
    'profile.height': 'Height',
    'profile.weight': 'Weight',
    'profile.dominantHand': 'Dominant Hand',
    'profile.playingStyle': 'Playing Style',
    
    // Dashboard Stats
    'stats.duprRating': 'DUPR Rating',
    'stats.rankingPoints': 'Ranking Points',
    'stats.winRate': 'Win Rate',
    'stats.matches': 'Matches',
    'stats.streak': 'Streak',
    'stats.passportCode': 'Passport Code',
    'stats.tapToCopy': 'Tap to Copy',
    'stats.loading': 'Loading...',
    
    // Tournament & Competition
    'tournament.upcoming': 'Upcoming Tournaments',
    'tournament.results': 'Tournament Results',
    'tournament.registration': 'Registration',
    'tournament.bracket': 'Bracket',
    'tournament.leaderboard': 'Leaderboard',
    'tournament.format': 'Format',
    'tournament.division': 'Division',
    'tournament.date': 'Date',
    'tournament.location': 'Location',
    
    // Training & Facilities
    'training.centers': 'Training Centers',
    'training.schedule': 'Class Schedule',
    'training.bookClass': 'Book Class',
    'training.history': 'Training History',
    'training.instructor': 'Instructor',
    'training.duration': 'Duration',
    'training.capacity': 'Capacity',
    'training.available': 'Available',
    'training.full': 'Full',
    
    // Match Recording
    'match.record': 'Record Match',
    'match.opponent': 'Opponent',
    'match.score': 'Score',
    'match.result': 'Result',
    'match.win': 'Win',
    'match.loss': 'Loss',
    'match.date': 'Date',
    'match.format': 'Format',
    'match.singles': 'Singles',
    'match.doubles': 'Doubles',
    'match.mixed': 'Mixed Doubles',
    
    // Time & Status
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.thisWeek': 'This Week',
    'time.thisMonth': 'This Month',
    'time.allTime': 'All Time',
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.available': 'Available',
    'status.busy': 'Busy',
    
    // Equipment & Gear
    'equipment.paddle': 'Paddle',
    'equipment.shoes': 'Shoes',
    'equipment.apparel': 'Apparel',
    'equipment.accessories': 'Accessories',
    'equipment.brand': 'Brand',
    'equipment.model': 'Model',
    'equipment.primary': 'Primary',
    'equipment.backup': 'Backup',
    
    // Notifications & Messages
    'notification.success': 'Success',
    'notification.error': 'Error',
    'notification.warning': 'Warning',
    'notification.info': 'Info',
    'notification.copied': 'Copied',
    'notification.saved': 'Saved',
    'notification.updated': 'Updated',
    'notification.deleted': 'Deleted',
    
    // Actions & Buttons
    'action.view': 'View',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.add': 'Add',
    'action.remove': 'Remove',
    'action.update': 'Update',
    'action.refresh': 'Refresh',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.sort': 'Sort',
    'action.export': 'Export',
    'action.import': 'Import',
    
    // Settings & Configuration
    'settings.general': 'General',
    'settings.privacy': 'Privacy',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.account': 'Account',
    'settings.security': 'Security',
    'settings.preferences': 'Preferences'
  },
  'zh-CN': {
    // Navigation & Common
    'nav.dashboard': '控制台',
    'nav.matches': '比赛',
    'nav.tournaments': '锦标赛',
    'nav.profile': '个人资料',
    'nav.findCoaches': '寻找教练',
    'nav.findPlayers': '寻找球员',
    'nav.trainingFacilities': '训练设施',
    'nav.logout': '登出',
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.confirm': '确认',
    'common.back': '返回',
    'common.next': '下一步',
    'common.submit': '提交',
    'common.close': '关闭',
    
    // Dashboard
    'dashboard.welcome': '欢迎回来',
    'dashboard.playerPassport': '球员护照',
    'dashboard.passportCode': '护照代码',
    'dashboard.skillLevel': '技能等级',
    'dashboard.totalMatches': '总比赛数',
    'dashboard.winRate': '胜率',
    'dashboard.currentStreak': '当前连胜',
    'dashboard.picklePoints': '泡菜积分',
    'dashboard.recordMatch': '记录比赛',
    'dashboard.findCoaches': '寻找教练',
    'dashboard.findPlayers': '寻找球员',
    'dashboard.joinTournament': '参加锦标赛',
    'dashboard.becomeCoach': '成为教练',
    'dashboard.manageCoachProfile': '管理教练资料',
    'dashboard.findTrainingFacilities': '寻找训练设施',
    
    // PCP Assessment
    'pcp.technicalSkills': '技术技能',
    'pcp.tacticalSkills': '战术技能',
    'pcp.physicalFitness': '体能',
    'pcp.mentalSkills': '心理技能',
    'pcp.overallRating': '总体PCP评级',
    'pcp.assessment': 'PCP评估',
    'pcp.coachingCertification': 'PCP教练认证计划',
    
    // Coaching
    'coach.findYourPerfectCoach': '寻找您的完美教练',
    'coach.connectWithExperts': '与专业教练联系，他们将改变您的技能并提升您在球场上的表现',
    'coach.filterBySpecialty': '按专业筛选',
    'coach.allCoaches': '所有教练',
    'coach.experienceYears': '年经验',
    'coach.hourlyRate': '每小时',
    'coach.bookSession': '预约课程',
    'coach.verified': '已验证',
    'coach.specialties': '专业',
    'coach.certifications': '认证',
    'coach.rating': '评级',
    'coach.reviews': '评论',
    
    // Coming Soon
    'comingSoon.feature': '功能即将推出',
    'comingSoon.tournamentRegistration': '锦标赛报名',
    'comingSoon.tournamentDescription': '我们的锦标赛发现和报名系统即将推出！您将能够浏览即将到来的锦标赛，一键报名，并跟踪您的锦标赛历史。',
    'comingSoon.playerDiscovery': '球员发现',
    'comingSoon.playerDescription': '球员查找功能即将推出！与您所在地区的球员联系，寻找练习伙伴，并根据技能水平和可用性组织友谊赛。',
    'comingSoon.trainingFacilities': '训练设施',
    'comingSoon.facilitiesDescription': '我们的训练设施发现系统即将推出！您将能够找到附近的训练中心，查看其设施，并直接通过平台预订球场和课程。',
    
    // Authentication
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.email': '电子邮件',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.firstName': '名字',
    'auth.lastName': '姓氏',
    'auth.username': '用户名',
    'auth.forgotPassword': '忘记密码？',
    'auth.dontHaveAccount': '没有账户？',
    'auth.alreadyHaveAccount': '已有账户？',
    'auth.signUp': '注册',
    'auth.signIn': '登录',
    
    // Profile & Player Info
    'profile.personalInfo': '个人信息',
    'profile.statistics': '统计数据',
    'profile.equipment': '装备',
    'profile.preferences': '偏好设置',
    'profile.achievements': '成就',
    'profile.updatePhoto': '更新照片',
    'profile.height': '身高',
    'profile.weight': '体重',
    'profile.dominantHand': '惯用手',
    'profile.playingStyle': '比赛风格',
    
    // Dashboard Stats
    'stats.duprRating': 'DUPR评级',
    'stats.rankingPoints': '排名积分',
    'stats.winRate': '胜率',
    'stats.matches': '比赛',
    'stats.streak': '连胜',
    'stats.passportCode': '护照代码',
    'stats.tapToCopy': '点击复制',
    'stats.loading': '加载中...',
    
    // Tournament & Competition
    'tournament.upcoming': '即将举行的锦标赛',
    'tournament.results': '锦标赛结果',
    'tournament.registration': '报名',
    'tournament.bracket': '对战表',
    'tournament.leaderboard': '排行榜',
    'tournament.format': '比赛形式',
    'tournament.division': '组别',
    'tournament.date': '日期',
    'tournament.location': '地点',
    
    // Training & Facilities
    'training.centers': '训练中心',
    'training.schedule': '课程安排',
    'training.bookClass': '预订课程',
    'training.history': '训练历史',
    'training.instructor': '教练',
    'training.duration': '时长',
    'training.capacity': '容量',
    'training.available': '可用',
    'training.full': '已满',
    
    // Match Recording
    'match.record': '记录比赛',
    'match.opponent': '对手',
    'match.score': '比分',
    'match.result': '结果',
    'match.win': '胜利',
    'match.loss': '失败',
    'match.date': '日期',
    'match.format': '比赛形式',
    'match.singles': '单打',
    'match.doubles': '双打',
    'match.mixed': '混双',
    
    // Time & Status
    'time.today': '今天',
    'time.yesterday': '昨天',
    'time.thisWeek': '本周',
    'time.thisMonth': '本月',
    'time.allTime': '全部时间',
    'status.online': '在线',
    'status.offline': '离线',
    'status.active': '活跃',
    'status.inactive': '不活跃',
    'status.available': '可用',
    'status.busy': '忙碌',
    
    // Equipment & Gear
    'equipment.paddle': '球拍',
    'equipment.shoes': '球鞋',
    'equipment.apparel': '服装',
    'equipment.accessories': '配件',
    'equipment.brand': '品牌',
    'equipment.model': '型号',
    'equipment.primary': '主要',
    'equipment.backup': '备用',
    
    // Notifications & Messages
    'notification.success': '成功',
    'notification.error': '错误',
    'notification.warning': '警告',
    'notification.info': '信息',
    'notification.copied': '已复制',
    'notification.saved': '已保存',
    'notification.updated': '已更新',
    'notification.deleted': '已删除',
    
    // Actions & Buttons
    'action.view': '查看',
    'action.edit': '编辑',
    'action.delete': '删除',
    'action.add': '添加',
    'action.remove': '移除',
    'action.update': '更新',
    'action.refresh': '刷新',
    'action.search': '搜索',
    'action.filter': '筛选',
    'action.sort': '排序',
    'action.export': '导出',
    'action.import': '导入',
    
    // Settings & Configuration
    'settings.general': '常规设置',
    'settings.privacy': '隐私设置',
    'settings.notifications': '通知设置',
    'settings.language': '语言设置',
    'settings.theme': '主题设置',
    'settings.account': '账户设置',
    'settings.security': '安全设置',
    'settings.preferences': '偏好设置'
  }
};

// Detect browser language
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language || navigator.languages[0];
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
};

// Get stored language or detect from browser
const getInitialLanguage = (): Language => {
  const stored = localStorage.getItem('pickle-plus-language') as Language;
  if (stored && (stored === 'en' || stored === 'zh-CN')) {
    return stored;
  }
  return detectBrowserLanguage();
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pickle-plus-language', lang);
  };

  // Translation function with fallback
  const t = (key: string, fallback?: string): string => {
    const currentTranslations = translations[language];
    const translation = currentTranslations[key];
    if (translation) return translation;
    
    // Fallback to English if key doesn't exist in current language
    const englishTranslations = translations['en'];
    const englishTranslation = englishTranslations[key];
    if (englishTranslation) return englishTranslation;
    
    // Return fallback or key if no translation found
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}