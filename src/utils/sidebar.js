import { MdOutlineSpaceDashboard, MdViewModule, MdCategory } from 'react-icons/md';
import { FaUsers, FaFileInvoice, FaNewspaper, FaTv, FaTags } from 'react-icons/fa';
import { GiPapers } from 'react-icons/gi';
import { GrUserExpert } from 'react-icons/gr';
import { USER_SUB_ROLE } from './authorization';

const ADMIN = [
  {
    label: 'General',
    sub_menu: [
      {
        Icon: MdOutlineSpaceDashboard,
        label: 'Dashboard',
        href: '/portal',
        isActive: pathname => pathname === '/portal',
      },
    ],
  },
  {
    label: 'Entities',
    sub_menu: [
      {
        Icon: FaUsers,
        label: 'Users',
        href: '/portal/admin/entities/users',
        isActive: pathname => pathname.includes('/portal/admin/entities/users'),
      },
    ],
  },
  {
    label: 'Onboarding',
    sub_menu: [
      {
        Icon: FaFileInvoice,
        label: 'Quiz',
        href: '/portal/admin/onboarding/quiz',
        isActive: pathname => pathname.includes('/portal/admin/onboarding/quiz'),
      },
    ],
  },
  {
    label: 'LMS',
    sub_menu: [
      {
        Icon: FaNewspaper,
        label: 'Programs',
        href: '/portal/admin/lms/program',
        isActive: pathname => pathname.includes('/portal/admin/lms/program'),
      },
      {
        Icon: MdViewModule,
        label: 'Modules',
        href: '/portal/admin/lms/module',
        isActive: pathname => pathname.includes('/portal/admin/lms/module'),
      },
      {
        Icon: FaTv,
        label: 'Sessions',
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
      },
      {
        Icon: GrUserExpert,
        label: 'Experts',
        href: '/portal/admin/lms/expert',
        isActive: pathname => pathname.includes('/portal/admin/lms/expert'),
      },
      {
        Icon: MdCategory,
        label: 'Categories',
        href: '/portal/admin/lms/category',
        isActive: pathname => pathname.includes('/portal/admin/lms/category'),
      },
      {
        Icon: FaTags,
        label: 'Tags',
        href: '/portal/admin/lms/tag',
        isActive: pathname => pathname.includes('/portal/admin/lms/tag'),
      },
    ],
  },
];

const CUSTOMER = [
  {
    label: 'General',
    sub_menu: [
      {
        Icon: MdOutlineSpaceDashboard,
        label: 'Dashboard',
        href: '/portal',
        isActive: pathname => pathname === '/portal',
      },
    ],
  },
  {
    label: 'Entities',
    sub_menu: [
      {
        Icon: FaUsers,
        label: 'Users',
        href: '/portal/customer/entities/users',
        isActive: pathname => pathname.includes('/portal/customer/entities/users'),
      },
    ],
    permitted_sub_roles: [USER_SUB_ROLE.BUSINESS],
  },
  {
    label: 'LMS',
    sub_menu: [
      {
        Icon: FaNewspaper,
        label: 'Programs',
        href: '/portal/customer/lms/program',
        isActive: pathname => pathname.includes('/portal/customer/lms/program'),
      },
    ],
  },
];

const SIDEBAR = { ADMIN, CUSTOMER };

export default SIDEBAR;
