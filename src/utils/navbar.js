const NAVBAR = [
  {
    label: 'Home',
    href: '/app',
    isActive: pathname => pathname === '/app',
  },
  {
    label: 'Programs',
    href: '/app/programs',
    isActive: pathname => pathname.includes('/app/programs'),
  },
  {
    label: 'Modules',
    href: '/app/modules',
    isActive: pathname => pathname.includes('/app/modules'),
  },
];

export default NAVBAR;
