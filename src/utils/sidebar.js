import { MdOutlineSpaceDashboard, MdViewModule } from 'react-icons/md';
import { FaUsers, FaFileInvoice, FaNewspaper, FaTv } from 'react-icons/fa';
import { GiPapers } from 'react-icons/gi';
import { GrUserExpert } from 'react-icons/gr';

const SIDEBAR = [
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
        href: '/portal/entities/users',
        isActive: pathname => pathname.includes('/portal/entities/users'),
      },
    ],
  },
  {
    label: 'Onboarding',
    sub_menu: [
      {
        Icon: FaFileInvoice,
        label: 'Quiz',
        href: '/portal/onboarding/quiz',
        isActive: pathname => pathname.includes('/portal/onboarding/quiz'),
      },
    ],
  },
  {
    label: 'LMS',
    sub_menu: [
      {
        Icon: FaNewspaper,
        label: 'Programs',
        href: '/portal/lms/program',
        isActive: pathname => pathname.includes('/portal/lms/program'),
      },
      {
        Icon: MdViewModule,
        label: 'Modules',
        href: '/portal/lms/module',
        isActive: pathname => pathname.includes('/portal/lms/module'),
      },
      {
        Icon: FaTv,
        label: 'Sessions',
        sub_menu: [
          {
            label: 'Video Sessions',
            href: '/portal/lms/session/video',
            isActive: pathname => pathname.includes('/portal/lms/session/video'),
          },
          {
            label: 'Image Sessions',
            href: '/portal/lms/session/image',
            isActive: pathname => pathname.includes('/portal/lms/session/image'),
          },
          {
            label: 'Audio Sessions',
            href: '/portal/lms/session/audio',
            isActive: pathname => pathname.includes('/portal/lms/session/audio'),
          },
        ],
      },
      {
        Icon: GiPapers,
        label: 'Quiz',
        href: '/portal/lms/quiz',
        isActive: pathname => pathname.includes('/portal/lms/quiz'),
      },
      {
        Icon: GrUserExpert,
        label: 'Experts',
        href: '/portal/lms/expert',
        isActive: pathname => pathname.includes('/portal/lms/expert'),
      },
    ],
  },
];

export default SIDEBAR;
