import {
  FaBuilding,
  FaInbox,
  FaNewspaper,
} from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';
import { GrUserExpert } from 'react-icons/gr';
import {
  FiActivity,
  FiTarget,
} from 'react-icons/fi';
import { FaQuestion } from 'react-icons/fa';
import { LuWrench } from 'react-icons/lu';
import {
  LiaBookSolid,
} from 'react-icons/lia';
import {
  LuClipboardCheck,
} from 'react-icons/lu';
import {
  MdHome,
  MdLogout,
  MdOutlineContactSupport,
  MdTrackChanges,
} from 'react-icons/md';
import {
  RiRepeatOneFill,
} from 'react-icons/ri';
import { USER_SUB_ROLE } from '@/utils/authorization';

const NAV_PATH_TO_HREF = {
  '/home': '/portal',
  '/circles': '/portal/inbox',
  '/programs': '/portal/customer/lms/program',
  '/guided-experiences': '/portal/customer/lms/group_coaching',
  '/coaches': '/portal/customer/lms/expert',
  '/habits/monthly-goal': '/portal/customer/checkin/monthly_goal',
  '/habits/tracker': '/portal/customer/checkin/sleep_tracker',
  '/habits/journal': '/portal/customer/checkin/journal',
  '/habits/insights': '/portal/customer/checkin/daily_insights',
  '/cycle/dates': '/portal/customer/checkin/tracker',
  '/cycle/tracker': '/portal/customer/checkin/daily-tracker',
  '/cycle/insights': '/portal/customer/checkin/cycle_insights',
  '/help-support': '/portal/help-support',
  '/relief': '/portal/customer/relief',
  '/relief/track': '/portal/customer/relief/track',
  '/relief/saved': '/portal/customer/relief/saved',
};

const ICON_MAP = {
  home: MdHome,
  circles: FaInbox,
  programs: FaNewspaper,
  guided_experiences: GiTeacher,
  coaches: GrUserExpert,
  habits: LuClipboardCheck,
  cycles_calendar: LuClipboardCheck,
  target: FiTarget,
  tracker: MdTrackChanges,
  journal: LiaBookSolid,
  insights: RiRepeatOneFill,
  help_circle: MdOutlineContactSupport,
  logout: MdLogout,
  relief: FiActivity,
  'quick-tools': LuWrench,
  faq: FaQuestion,
};

const BUSINESS_DASHBOARD_ITEM = {
  Icon: FaBuilding,
  label: 'Dashboard',
  href: '/portal/business/dashboard',
  isActive: pathname => pathname.includes('/portal/business/dashboard'),
  permitted_sub_roles: [USER_SUB_ROLE.BUSINESS],
  isBusinessOwnerOnly: true,
  disabled: false,
};

const resolveHref = item => {
  if (item.action_id === 'trigger_user_logout') return null;
  return NAV_PATH_TO_HREF[item.path] || item.path || '#';
};

const createIsActive = href => (pathname, activeTab) => {
  if (!href || href === '#') return false;
  if (href === '/portal') return pathname === '/portal';
  if (href.includes('?')) {
    return `${pathname}?active_tab=${activeTab || ''}`.includes(href);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

const mapChildItem = child => {
  const href = resolveHref(child);
  const Icon = ICON_MAP[child.icon] || FiTarget;

  return {
    id: child.id,
    Icon,
    label: child.label,
    href,
    action_id: child.action_id,
    isActive: createIsActive(href),
  };
};

const mapNavItem = item => {
  const href = resolveHref(item);
  const Icon = ICON_MAP[item.icon] || MdHome;
  const children = (item.children || []).filter(child => child.is_visible !== false);

  if (children.length > 0) {
    const childHrefs = children.map(child => resolveHref(child)).filter(Boolean);
    return {
      id: item.id,
      Icon,
      label: item.label,
      href: href || '#',
      action_id: item.action_id,
      disabled: false,
      hasActiveSubMenu: pathname =>
        childHrefs.some(childHref => createIsActive(childHref)(pathname)),
      sub_menu: children.map(mapChildItem),
    };
  }

  return {
    id: item.id,
    Icon,
    label: item.label,
    href: href || '#',
    action_id: item.action_id,
    disabled: false,
    isActive: createIsActive(href),
  };
};

const FOOTER_NAV_IDS = new Set(['nav_help_support', 'nav_logout']);

const isFooterNavItem = item =>
  item.action_id === 'trigger_user_logout' ||
  FOOTER_NAV_IDS.has(item.id) ||
  item.path === '/help-support';

export const buildCustomerV2SidebarMenu = (navigationData, { isBusinessOwner = false } = {}) => {
  const mainApiItems = (
    navigationData?.main_navigation_items
    ?? (navigationData?.navigation_items || []).filter(item => !isFooterNavItem(item))
  ).filter(item => item.is_visible !== false);

  const footerApiItems = (
    navigationData?.footer_navigation_items
    ?? (navigationData?.navigation_items || []).filter(isFooterNavItem)
  ).filter(item => item.is_visible !== false);

  const mainItems = mainApiItems.map(mapNavItem);
  const footerItems = footerApiItems.map(mapNavItem);

  if (isBusinessOwner) {
    return {
      mainItems: [BUSINESS_DASHBOARD_ITEM, ...mainItems],
      footerItems,
    };
  }

  return { mainItems, footerItems };
};

export const customerV2MenuHasFooterActions = navigationData =>
  (navigationData?.footer_navigation_items?.length > 0)
  || (navigationData?.navigation_items || []).some(isFooterNavItem);
