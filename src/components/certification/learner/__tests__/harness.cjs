// Test harness for the catalog page flow tests. The repo has no jsdom / test runner, so these tests run
// on Node's built-in runner + sucrase + react-dom/server:
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/learner/__tests__/
//
// It maps the "@/" alias to src/, and replaces the framework pieces (router, react-query, services,
// auth, heavy widgets) with recorders, so a page can be server-rendered for a given URL / user /
// API response and asserted on. NOTHING here is visual: no CSS, layout or browser behaviour is checked.
const Module = require('module');
const path = require('path');
const React = require('react');

global.React = React; // sucrase uses the classic JSX runtime; Next uses the automatic one

const SRC = path.resolve(__dirname, '../../../../');
const harness = {
  url: new URLSearchParams(),
  user: { email: 'learner@example.com' },
  sets: [], // [key, value] from searchParamUtils.set
  removes: [],
  pushes: [],
  catalogCalls: [], // params of every getCertificationCatalog request
  enrolledCalls: [],
  catalog: () => ({ data: { results: { data: { 'all-programs': [], tags: [], categories: [] } } } }),
  enrolled: () => ({ data: { results: { data: { 'all-programs': [] } } } }),
  pills: null, // props the page passed to TrackFilterPills
  reset() {
    this.url = new URLSearchParams();
    this.user = { email: 'learner@example.com' };
    this.sets = [];
    this.removes = [];
    this.pushes = [];
    this.catalogCalls = [];
    this.enrolledCalls = [];
    this.pills = null;
    this.catalog = () => ({ data: { results: { data: { 'all-programs': [], tags: [], categories: [] } } } });
    this.enrolled = () => ({ data: { results: { data: { 'all-programs': [] } } } });
  },
};
global.__catalogHarness = harness;

const nothing = () => null;
const stubs = {
  'next/image': props => React.createElement('img', { alt: props.alt, src: props.src }),
  'next/navigation': {
    useRouter: () => ({ push: p => harness.pushes.push(p), replace: p => harness.pushes.push(p) }),
    useSearchParams: () => harness.url,
    usePathname: () => '/portal/customer/certification',
  },
  '@tanstack/react-query': {
    useQuery: opts => {
      if (opts.enabled === false) return { data: undefined, isFetching: false };
      const pending = opts.queryFn();
      return { data: pending.__result, isFetching: false };
    },
  },
  '@/services/private/certification/catalog': {
    getCertificationCatalog: params => {
      harness.catalogCalls.push(params);
      return Object.assign(Promise.resolve(), { __result: harness.catalog(params) });
    },
    getEnrolledCertifications: params => {
      harness.enrolledCalls.push(params);
      return Object.assign(Promise.resolve(), { __result: harness.enrolled(params) });
    },
  },
  '@/hooks/useAuthContext': { __esModule: true, default: () => ({ user: harness.user }) },
  '@/hooks/useSearchParamUtils': {
    __esModule: true,
    default: () => ({
      get: key => harness.url.get(key),
      set: (key, value) => harness.sets.push([key, value]),
      remove: key => harness.removes.push(key),
    }),
  },
  '@/hooks/useToggle': { __esModule: true, default: () => ({ isOpen: false, toggle: () => {} }) },
  '@/utils/query-keys': { __esModule: true, default: { certificationCatalog: 'c', certificationEnrolledCertifications: 'e' } },
  '@/components/common/popup': { __esModule: true, default: nothing },
  '@/components/lms/category/FeaturedCategories': { __esModule: true, default: nothing },
  '@/components/common/loader/Spinner': { __esModule: true, default: () => React.createElement('span', null, 'loading') },
  './CertificationLibraryFilter': { __esModule: true, default: nothing },
  './TrackFilterPills': {
    __esModule: true,
    default: props => {
      harness.pills = props;
      return React.createElement('div', null, 'pills');
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  // "./TrackFilterPills" is only stubbed when the page (DiscoverPanel) asks for it, so the pills have
  // their own real tests.
  if (request === './TrackFilterPills' && !(parent?.filename || '').endsWith('DiscoverPanel.jsx')) {
    return originalLoad.apply(this, arguments);
  }
  if (request === './CertificationLibraryFilter' && !(parent?.filename || '').endsWith('DiscoverPanel.jsx')) {
    return originalLoad.apply(this, arguments);
  }
  if (Object.prototype.hasOwnProperty.call(stubs, request)) return stubs[request];
  if (request.startsWith('@/')) return originalLoad.call(this, path.join(SRC, request.slice(2)), parent, isMain);
  return originalLoad.apply(this, arguments);
};

module.exports = harness;
