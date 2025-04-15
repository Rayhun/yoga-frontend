import { MdOutlineHome, MdViewModule, MdCategory, MdHome, MdSubscriptions, MdPages } from 'react-icons/md';
import {
  FaInbox,
  FaUsers,
  FaUserFriends,
  FaFileInvoice,
  FaNewspaper,
  FaTv,
  FaTags,
  FaUser,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { GiPapers } from 'react-icons/gi';
import { GrUserExpert } from 'react-icons/gr';
import { USER_SUB_ROLE } from './authorization';
import { GiTeacher } from "react-icons/gi";

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
    label: 'Users',
    href: '/portal/admin/entities/users',
    isActive: pathname => pathname.includes('/portal/admin/entities/users'),
    disabled: false,
  },
  {
    Icon: FaUserFriends,
    label: 'Groups',
    href: '/portal/admin/chat/group',
    isActive: pathname => pathname.includes('/portal/admin/chat/group'),
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
    disabled: false,
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
    Icon: GrUserExpert,
    label: 'Experts',
    href: '/portal/admin/lms/expert',
    isActive: pathname => pathname.includes('/portal/admin/lms/expert'),
    disabled: false
  },
  {
    Icon: MdCategory,
    label: 'Categories',
    href: '/portal/admin/lms/category',
    isActive: pathname => pathname.includes('/portal/admin/lms/category'),
    disabled: false
  },
  {
    Icon: FaTags,
    label: 'Tags',
    href: '/portal/admin/lms/tag',
    isActive: pathname => pathname.includes('/portal/admin/lms/tag'),
    disabled: false
  },
  {
    Icon: MdSubscriptions,
    label: 'Subscription Plans',
    href: '/portal/admin/subscription/plan',
    isActive: pathname => pathname.includes('/portal/admin/subscription/plan'),
    disabled: false
  },
  {
    Icon: MdPages,
    label: 'Subscription Pages',
    href: '/portal/admin/subscription/page',
    isActive: pathname => pathname.includes('/portal/admin/subscription/page'),
    disabled: false
  },
];

const CUSTOMER = [
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
  {
    Icon: FaUsers,
    label: 'Users',
    href: '/portal/customer/entities/users',
    isActive: pathname => pathname.includes('/portal/customer/entities/users'),
    permitted_sub_roles: [USER_SUB_ROLE.BUSINESS],
    disabled: false,
  },
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
    isActive: pathname => pathname.includes('/portal/customer/lms/group_coaching') || pathname.includes('/portal/customer/group_coaching'),
    disabled: false,
  },
  {
    Icon: FaChalkboardTeacher,
    label: 'Consultations',
    href: '/portal/customer/lms/consultation',
    isActive: pathname => pathname.includes('/portal/customer/lms/consultation'),
    disabled: false,
  },
];

const TEACHER = [
  {
    Icon: MdHome,
    label: 'Home',
    href: '/portal',
    isActive: pathname => pathname === '/portal',
    disabled: true,
  },
  {
    Icon: FaInbox,
    label: 'Inbox',
    href: '/portal/inbox',
    isActive: pathname => pathname === '/portal/inbox',
    disabled: true,
  },
  {
    Icon: FaUser,
    label: 'Profile',
    href: '/portal/teacher/profile',
    isActive: pathname => pathname.includes('/portal/teacher/profile') || pathname.includes('/portal/teacher/editProfile'),
    disabled: false,
  },
  {
    Icon: FaChalkboardTeacher,
    label: 'Personal Consultations',
    href: '/portal/teacher/consultation/list',
    isActive: pathname => pathname.includes('/portal/teacher/consultation/list'),
    disabled: false,
  },
];

const SIDEBAR = { ADMIN, CUSTOMER, TEACHER };

export default SIDEBAR;
