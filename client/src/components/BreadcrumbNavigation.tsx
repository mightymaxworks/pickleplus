/**
 * Breadcrumb Navigation Component
 * Provides contextual navigation breadcrumbs throughout the app
 */

import React from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
}

export function BreadcrumbNavigation() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  // Define route mappings
  const routeMap: Record<string, string> = {
    '/': language === 'zh-CN' ? '首页' : 'Home',
    '/dashboard': language === 'zh-CN' ? '仪表板' : 'Dashboard',
    '/features': language === 'zh-CN' ? '功能' : 'Features',
    '/profile': language === 'zh-CN' ? '个人档案' : 'Profile',
    '/matches': language === 'zh-CN' ? '比赛' : 'Matches',
    '/communities': language === 'zh-CN' ? '社区' : 'Communities',
    '/pcp-certification': language === 'zh-CN' ? 'PCP认证' : 'PCP Certification',
    '/player-development-hub': language === 'zh-CN' ? '发展中心' : 'Development Hub',
    '/settings': language === 'zh-CN' ? '设置' : 'Settings',
    '/admin': language === 'zh-CN' ? '管理' : 'Admin'
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home for non-root paths
    if (location !== '/') {
      breadcrumbs.push({
        label: routeMap['/'],
        path: '/',
        isActive: false
      });
    }

    // Build path progressively
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += '/' + segment;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: routeMap[currentPath] || segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        path: currentPath,
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs for home page
  if (location === '/' || breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <button
            onClick={() => navigate(item.path)}
            className={`hover:text-orange-600 transition-colors ${
              item.isActive ? 'text-orange-600 font-medium' : 'text-gray-600'
            }`}
            disabled={item.isActive}
          >
            {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}