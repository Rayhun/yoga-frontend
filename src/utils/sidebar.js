import {
  MdOutlineHome,
  MdViewModule,
  MdCategory,
  MdHome,
  MdSubscriptions,
  MdPages,
  MdOutlineEventNote,
  MdOutlinePayments,
  MdTrackChanges,
  MdGroupAdd
} from 'react-icons/md';
import {
  FaInbox,
  FaUsers,
  FaUserFriends,
  FaFileInvoice,
  FaNewspaper,
  FaTv,
  FaTags,
  FaUser,
  FaChalkboardTeacher,
  FaQuestion,
  FaBuilding
} from 'react-icons/fa';
import { TbPrompt } from "react-icons/tb";

import { GiPapers } from 'react-icons/gi';
import { GrUserExpert } from 'react-icons/gr';
import { USER_SUB_ROLE } from './authorization';
import { GiTeacher, GiNightSleep } from 'react-icons/gi';
import { PiFilmScriptBold, PiUserSquareFill, PiChartLine } from 'react-icons/pi';
import { LuClipboardCheck } from 'react-icons/lu';
import { FiTarget, FiActivity } from 'react-icons/fi';
import { LiaBookSolid } from 'react-icons/lia';
// import { FiDroplet } from "react-icons/fi";
// import { TbGenderTransgender } from "react-icons/tb";
import { RiRepeatOneFill } from 'react-icons/ri';
import { GoGoal } from 'react-icons/go';
import { FiShield } from 'react-icons/fi';


const isDevelopmentEnvironment = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';

const GOALS_SUBMENU_ROUTES = [
  '/portal/customer/checkin/monthly_goal',
  '/portal/customer/checkin/journal',
  '/portal/customer/checkin/sleep_tracker',
  '/portal/customer/checkin/daily_insights',
  '/portal/customer/checkin/tracker',
  '/portal/customer/checkin/daily-tracker',
  '/portal/customer/checkin/cycle_insights',
];

const SESSIONS_SUBMENU_ROUTES = [
  '/portal/admin/lms/session/video',
  '/portal/admin/lms/session/image',
  '/portal/admin/lms/session/audio',
];

const AFFILIATES_USERS_ROUTES = [
  '/portal/admin/affiliates/dashobaord',
  '/portal/admin/affiliates/users',
  '/portal/admin/affiliates/comission_type',
  '/portal/admin/affiliates/payout_list'
];

const EXPERTS_ROUTES = [
  '/portal/admin/lms/expert',
  '/portal/admin/lms/expert/add',
  '/portal/admin/lms/expert/details',
  '/portal/admin/lms/expert/edit',
  '/portal/admin/lms/expert/dashboard',
  '/portal/admin/lms/expert/commission',
  '/portal/admin/lms/expert/payment'
];


const ADMIN = [
  {
    Icon: MdOutlineHome,
    label: 'Home',
    href: '/portal',
    isActive: pathname => pathname === '/portal',
    disabled: false,
  },
  {
    Icon: FaInbox,
    label: 'Inbox',
    href: '/portal/inbox',
    isActive: pathname => pathname.includes('/portal/inbox'),
    disabled: false,
  },
  {
    Icon: FaUsers,
    label: 'Customers',
    href: '/portal/admin/entities/users',
    isActive: pathname => pathname.includes('/portal/admin/entities/users'),
    disabled: false,
  },
  {
    Icon: FaUserFriends,
    label: 'Staff Users',
    href: '/portal/admin/staff',
    isActive: pathname => pathname.includes('/portal/admin/staff'),
    disabled: false,
  },
  {
    Icon: FiShield,
    label: 'Permissions',
    href: '/portal/admin/permissions',
    isActive: pathname => pathname.includes('/portal/admin/permissions'),
    disabled: false,
  },
  {
    Icon: GrUserExpert,
    label: 'Experts',
    href: '/portal/admin/lms/expert', // Default to experts list
    disabled: false,
    hasActiveSubMenu: pathname => EXPERTS_ROUTES.some(route => pathname.includes(route)),
    sub_menu: [
      {
        label: 'Dashboard',
        href: '/portal/admin/lms/expert/dashboard',
        isActive: pathname => pathname.includes('/portal/admin/lms/expert/dashboard'),
      },
      {
        label: 'Experts',
        href: '/portal/admin/lms/expert',
        isActive: pathname => pathname.includes('/portal/admin/lms/expert') && !pathname.includes('/add') && !pathname.includes('/details') && !pathname.includes('/edit') && !pathname.includes('/commission') && !pathname.includes('/payment') && !pathname.includes('/dashboard'),
      },
      {
        label: 'Commission',
        href: '/portal/admin/lms/expert/commission',
        isActive: pathname => pathname.includes('/portal/admin/lms/expert/commission'),
      },
      {
        label: 'Payments',
        href: '/portal/admin/lms/expert/payment',
        isActive: pathname => pathname.includes('/portal/admin/lms/expert/payment'),
      }
    ],
  },
  {
    Icon: FaTv,
    label: 'Affiliates',
    href: '/portal/admin/affiliates/dashboard', // Default to affiliates dashboard
    disabled: false,
    hasActiveSubMenu: pathname => AFFILIATES_USERS_ROUTES.some(route => pathname.includes(route)),
    sub_menu: [
      {
        label: 'Dashboard',
        href: '/portal/admin/affiliates/dashboard',
        isActive: pathname => pathname.includes('/portal/admin/affiliates/dashboard'),
      },
      {
        label: 'Affiliates',
        href: '/portal/admin/affiliates/users',
        isActive: pathname => pathname.includes('/portal/admin/affiliates/users'),
      },
      {
        label: 'Commision Types',
        href: '/portal/admin/affiliates/commission_type',
        isActive: pathname => pathname.includes('/portal/admin/affiliates/commission_type'),
      },
      {
        label: 'Payout List',
        href: '/portal/admin/affiliates/payout_list',
        isActive: pathname => pathname.includes('/portal/admin/affiliates/payout_list'),
      },
    ],
  },
  {
    Icon: FaUserFriends,
    label: 'Groups',
    href: '/portal/admin/chat/group',
    isActive: pathname => pathname.includes('/portal/admin/chat/group'),
    disabled: false,
  },
  {
    Icon: TbPrompt,
    label: 'AI Chat Prompts',
    href: '/portal/admin/ai-prompts',
    isActive: pathname => pathname.includes('/portal/admin/ai-prompts'),
    disabled: false,
  },
  {
    Icon: FaFileInvoice,
    label: 'Onboarding Quiz',
    href: '/portal/admin/onboarding/quiz',
    isActive: pathname => pathname.includes('/portal/admin/onboarding/quiz'),
    disabled: false,
  },
  {
    Icon: FaNewspaper,
    label: 'Programs',
    href: '/portal/admin/lms/program',
    isActive: pathname => pathname.includes('/portal/admin/lms/program'),
    disabled: false,
  },
  {
    Icon: MdViewModule,
    label: 'Modules',
    href: '/portal/admin/lms/module',
    isActive: pathname => pathname.includes('/portal/admin/lms/module'),
    disabled: false,
  },
  {
    Icon: FaTv,
    label: 'Sessions',
    href: '/portal/admin/lms/session/video', // Default to video sessions
    disabled: false,
    hasActiveSubMenu: pathname => SESSIONS_SUBMENU_ROUTES.some(route => pathname.includes(route)),
    sub_menu: [
      {
        label: 'Video Sessions',
        href: '/portal/admin/lms/session/video',
        isActive: pathname => pathname.includes('/portal/admin/lms/session/video'),
      },
      {
        label: 'Image Sessions',
        href: '/portal/admin/lms/session/image',
        isActive: pathname => pathname.includes('/portal/admin/lms/session/image'),
      },
      {
        label: 'Audio Sessions',
        href: '/portal/admin/lms/session/audio',
        isActive: pathname => pathname.includes('/portal/admin/lms/session/audio'),
      },
    ],
  },
  {
    Icon: GiPapers,
    label: 'Quiz',
    href: '/portal/admin/lms/quiz',
    isActive: pathname => pathname.includes('/portal/admin/lms/quiz'),
    disabled: false,
  },
  {
    Icon: MdCategory,
    label: 'Categories',
    href: '/portal/admin/lms/category',
    isActive: pathname => pathname.includes('/portal/admin/lms/category'),
    disabled: false,
  },
  {
    Icon: FaTags,
    label: 'Tags',
    href: '/portal/admin/lms/tag',
    isActive: pathname => pathname.includes('/portal/admin/lms/tag'),
    disabled: false,
  },
  {
    Icon: MdSubscriptions,
    label: 'Subscription Plans',
    href: '/portal/admin/subscription/plan',
    isActive: pathname => pathname.includes('/portal/admin/subscription/plan'),
    disabled: false,
  },
  {
    Icon: MdPages,
    label: 'Subscription Pages',
    href: '/portal/admin/subscription/page',
    isActive: pathname => pathname.includes('/portal/admin/subscription/page'),
    disabled: false,
  },
  {
    Icon: GoGoal,
    label: 'Insights Goal',
    href: '/portal/admin/insights_goal',
    isActive: pathname => pathname.includes('/portal/admin/insights_goal'),
    disabled: false,
  },
  {
    Icon: MdTrackChanges,
    label: 'Tracker',
    href: '/portal/admin/tracker',
    isActive: pathname => pathname.includes('/portal/admin/tracker'),
    disabled: false,
  },
  {
    Icon: FaQuestion,
    label: 'FAQs',
    href: '/portal/admin/faq',
    isActive: pathname => pathname.includes('/portal/admin/faq'),
    disabled: false,
  }
];

const CUSTOMER = [
  {
    Icon: FaBuilding,
    label: 'Dashboard',
    href: '/portal/business/dashboard',
    isActive: pathname => pathname.includes('/portal/business/dashboard'),
    permitted_sub_roles: [USER_SUB_ROLE.BUSINESS],
    isBusinessOwnerOnly: true,
    disabled: false,
  },
  {
    Icon: MdHome,
    label: 'Home',
    href: '/portal',
    isActive: pathname => pathname === '/portal',
    disabled: false,
  },
  {
    Icon: FaInbox,
    label: 'Inbox',
    href: '/portal/inbox',
    isActive: pathname => pathname === '/portal/inbox',
    disabled: false,
  },
  // {
  //   Icon: FaUsers,
  //   label: 'Users',
  //   href: '/portal/customer/entities/users',
  //   isActive: pathname => pathname.includes('/portal/customer/entities/users'),
  //   permitted_sub_roles: [USER_SUB_ROLE.BUSINESS],
  //   disabled: false,
  // },
  {
    Icon: FaNewspaper,
    label: 'Programs',
    href: '/portal/customer/lms/program',
    isActive: pathname => pathname.includes('/portal/customer/lms/program'),
    disabled: false,
  },
  {
    Icon: GiTeacher,
    label: 'Group Coachings',
    href: '/portal/customer/lms/group_coaching',
    isActive: pathname =>
      pathname.includes('/portal/customer/lms/group_coaching') ||
      pathname.includes('/portal/customer/group_coaching'),
    disabled: false,
  },
  {
    Icon: FaChalkboardTeacher,
    label: 'Consultations',
    href: '/portal/customer/lms/consultation',
    isActive: pathname => pathname.includes('/portal/customer/lms/consultation'),
    disabled: false,
  },
  {
    Icon: GrUserExpert,
    label: 'Experts',
    href: '/portal/customer/lms/expert',
    isActive: pathname => pathname.includes('/portal/customer/lms/expert'),
    disabled: false,
  },
  {
    Icon: LuClipboardCheck,
    label: 'Lifestyle',
    href: '/portal/customer/goal-tracking/goals', // Default to goals
    disabled: false,
    hasActiveSubMenu: pathname => GOALS_SUBMENU_ROUTES.some(route => pathname.includes(route)),
    sub_menu: [
      {
        Icon: FiTarget,
        label: 'Monthly Goal',
        href: '/portal/customer/checkin/monthly_goal',
        isActive: pathname => pathname.includes('/portal/customer/checkin/monthly_goal'),
      },
      {
        Icon: MdTrackChanges,
        label: 'Your Habits',
        href: '/portal/customer/checkin/sleep_tracker',
        isActive: pathname => pathname.includes('/portal/customer/checkin/sleep_tracker'),
      },
      {
        Icon: LiaBookSolid,
        label: 'Journal',
        href: '/portal/customer/checkin/journal',
        isActive: pathname => pathname.includes('/portal/customer/checkin/journal'),
      },
      {
        Icon: RiRepeatOneFill,
        label: 'Habit Insights',
        href: '/portal/customer/checkin/daily_insights',
        isActive: pathname => pathname.includes('/portal/customer/checkin/daily_insights'),
      },
    ],
  },
  {
    Icon: LuClipboardCheck,
    label: 'Cycle Tracking',
    href: '/portal/customer/goal-tracking/goals', // Default to goals
    disabled: false,
    hasActiveSubMenu: pathname => GOALS_SUBMENU_ROUTES.some(route => pathname.includes(route)),
    sub_menu: [
      {
        Icon: MdTrackChanges,
        label: 'Cycle Dates',
        href: '/portal/customer/checkin/tracker',
        isActive: pathname => pathname.includes('/portal/customer/checkin/tracker'),
      },
      {
        Icon: FiActivity,
        label: 'Symptoms Tracker',
        href: '/portal/customer/checkin/daily-tracker',
        isActive: pathname => pathname.includes('/portal/customer/checkin/daily-tracker'),
      },
      {
        Icon: PiChartLine,
        label: 'Cycle Insights',
        href: '/portal/customer/checkin/cycle_insights',
        isActive: pathname => pathname.includes('/portal/customer/checkin/cycle_insights'),
      },
    ]
  },
];

const STAFF = [
  {
    Icon: FaNewspaper,
    label: 'Programs',
    href: '/portal/admin/lms/program',
    isActive: pathname => pathname.includes('/portal/admin/lms/program'),
    disabled: false,
  },
  {
    Icon: MdViewModule,
    label: 'Modules',
    href: '/portal/admin/lms/module',
    isActive: pathname => pathname.includes('/portal/admin/lms/module'),
    disabled: false,
  },
  {
    Icon: FaTv,
    label: 'Sessions',
    href: '/portal/admin/lms/session/video', // Default to video sessions
    disabled: false,
    hasActiveSubMenu: pathname => SESSIONS_SUBMENU_ROUTES.some(route => pathname.includes(route)),
    sub_menu: [
      {
        label: 'Video Sessions',
        href: '/portal/admin/lms/session/video',
        isActive: pathname => pathname.includes('/portal/admin/lms/session/video'),
      },
      {
        label: 'Image Sessions',
        href: '/portal/admin/lms/session/image',
        isActive: pathname => pathname.includes('/portal/admin/lms/session/image'),
      },
      {
        label: 'Audio Sessions',
        href: '/portal/admin/lms/session/audio',
        isActive: pathname => pathname.includes('/portal/admin/lms/session/audio'),
      },
    ],
  },
];

const getTeacherSidebarMenuItems = (is_profile_complete, has_event_or_consult, stripe_onboarded) => {
  
  return [
    {
      Icon: FiTarget,
      label: 'Dashboard',
      href: '/portal/teacher/dashboard',
      isActive: pathname => pathname.includes('/portal/teacher/dashboard'),
      disabled: !is_profile_complete || !has_event_or_consult || !stripe_onboarded,
    },
    {
      Icon: FaInbox,
      label: 'Inbox',
      href: '/portal/inbox',
      isActive: pathname => pathname === '/portal/inbox',
      disabled: !isDevelopmentEnvironment || !is_profile_complete || !has_event_or_consult,
    },
    {
      Icon: FaUser,
      label: 'Profile',
      href: '/portal/teacher/profile?active_tab=about',
      isActive: (pathname, tab) =>
        `${pathname}?active_tab=${tab}`.includes('/portal/teacher/profile?active_tab=about') ||
        pathname.includes('/portal/teacher/editProfile'),
      disabled: false,
    },
    // {
    //   Icon: PiFilmScriptBold,
    //   label: 'Programs',
    //   href: '/portal/teacher/profile?active_tab=programs',
    //   isActive: (pathname, tab) =>
    //     `${pathname}?active_tab=${tab}`.includes('/portal/teacher/profile?active_tab=programs') ||
    //     pathname.includes('/portal/teacher/program'),
    //   disabled: false,
    // },
    {
      Icon: MdOutlineEventNote,
      label: 'Events',
      href: '/portal/teacher/profile?active_tab=group_coaching',
      isActive: (pathname, tab) =>
        `${pathname}?active_tab=${tab}`.includes('/portal/teacher/profile?active_tab=group_coaching') ||
        pathname.includes('/portal/teacher/group_coaching'),
      disabled: !is_profile_complete,
    },
    {
      Icon: PiUserSquareFill,
      label: 'Consult',
      href: '/portal/teacher/profile?active_tab=consult',
      isActive: (pathname, tab) =>
        `${pathname}?active_tab=${tab}`.includes('/portal/teacher/profile?active_tab=consult') ||
        pathname.includes('/portal/teacher/consultation/'),
      disabled: !is_profile_complete,
    },
    // {
    //   Icon: FaChalkboardTeacher,
    //   label: 'Personal Consultations',
    //   href: '/portal/teacher/consultation/list',
    //   isActive: pathname => pathname.includes('/portal/teacher/consultation/list'),
    //   disabled: false,
    // },
    {
      Icon: MdOutlinePayments,
      label: 'Payments',
      href: '/portal/teacher/payments',
      isActive: pathname => pathname.includes('/portal/teacher/payments'),
      disabled: !is_profile_complete || !has_event_or_consult,
    },
  ];
}

const AFFILIATE = [
  {
    Icon: MdHome,
    label: 'Dashboard',
    href: '/portal/affiliate/dashboard',
    isActive: pathname => pathname === '/portal/affiliate/dashboard',
    disabled: false,
  },
  {
    Icon: MdGroupAdd,
    label: 'Referrals',
    href: '/portal/affiliate/referrals',
    isActive: pathname => pathname === '/portal/affiliate/referrals',
    disabled: false,
  },
  
];

const SIDEBAR = { ADMIN, STAFF, CUSTOMER, getTeacherSidebarMenuItems, AFFILIATE };

export default SIDEBAR;
