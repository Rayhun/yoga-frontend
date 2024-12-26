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
        href: '/portal/lms/programs',
        isActive: pathname => pathname.includes('/portal/lms/programs'),
      },
      {
        Icon: MdViewModule,
        label: 'Modules',
        href: '/portal/lms/modules',
        isActive: pathname => pathname.includes('/portal/lms/modules'),
      },
      {
        Icon: FaTv,
        label: 'Sessions',
        sub_menu: [
          {
            label: 'Video Sessions',
            href: '/portal/lms/sessions/video',
            isActive: pathname => pathname.includes('/portal/lms/sessions/video'),
          },
          {
            label: 'Image Sessions',
            href: '/portal/lms/sessions/image',
            isActive: pathname => pathname.includes('/portal/lms/sessions/image'),
          },
          {
            label: 'Audio Sessions',
            href: '/portal/lms/sessions/audio',
            isActive: pathname => pathname.includes('/portal/lms/sessions/audio'),
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
        href: '/portal/lms/experts',
        isActive: pathname => pathname.includes('/portal/lms/experts'),
      },
    ],
  },
];

export default SIDEBAR;
