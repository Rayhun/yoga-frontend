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
Module._extensions['.css'] = () => {}; // stylesheet imports (e.g. Quill's) are irrelevant to these tests

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
  axiosCalls: [], // every call made through the shared axios client
  detail: null, // catalog-detail response body for the program detail page
  learner: null, // learner-detail response body (enrolled)
  detailCalls: [],
  learnerCalls: [],
  reset() {
    this.axiosCalls = [];
    this.detail = null;
    this.learner = null;
    this.detailCalls = [];
    this.learnerCalls = [];
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
    usePathname: () => harness.pathname || '/portal/customer/certification',
  },
  '@tanstack/react-query': {
    useQuery: opts => {
      if (opts.enabled === false) return { data: undefined, isFetching: false };
      const pending = opts.queryFn();
      return { data: pending.__result, isFetching: false };
    },
    useMutation: () => ({ mutateAsync: async () => ({}), isPending: false }),
    useQueryClient: () => ({ invalidateQueries() {} }),
  },
  // --- rich text editor (builder/__tests__): react-quill is loaded through next/dynamic; capture its props ---
  'next/dynamic': () => props => {
    harness.quillProps = props;
    return React.createElement('div', { 'data-quill': 'editor' });
  },
  // --- admin applications CSV (admin/csv/__tests__) ---
  '@/lib/axios': {
    __esModule: true,
    default: {
      get: async (url, config) => {
        harness.axiosCalls.push({ method: 'get', url, config });
        return { data: 'csv', headers: {} };
      },
      post: async (url, body, config) => {
        harness.axiosCalls.push({ method: 'post', url, body, config });
        return { data: {} };
      },
    },
  },
  '@/hooks/useTable': { __esModule: true, default: () => ({ isLoading: false, columns: [], data: [] }) },
  '@/hooks/useConfirm': { __esModule: true, default: () => async () => null },
  '@/components/common/table': { BasicTable: () => React.createElement('div', null, 'table'), TableActions: () => null },
  './RejectApplicationModal': { __esModule: true, default: nothing },
  './ApplicationReviewDrawer': { __esModule: true, default: nothing },
  // --- program detail page (details/__tests__) ---
  'next/link': props => React.createElement('a', { href: props.href, className: props.className }, props.children),
  'react-toastify': { toast: { success() {}, error() {}, info() {} } },
  '@mui/material/LinearProgress': { __esModule: true, default: () => React.createElement('div', { role: 'progressbar' }) },
  '@/components/common/loader/PageLoader': { __esModule: true, default: () => React.createElement('span', null, 'page-loading') },
  '@/hooks/useHandleApiResponse': { __esModule: true, default: () => {} },
  '@/services/private/certification/catalog': {
    getProgramCatalogDetail: params => {
      harness.detailCalls.push(params);
      return Object.assign(Promise.resolve(), { __result: { data: harness.detail } });
    },
    getLearnerProgramDetail: params => {
      harness.learnerCalls.push(params);
      return Object.assign(Promise.resolve(), { __result: { data: harness.learner } });
    },
    checkoutCertificationProgram: async () => ({}),
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
  // The detail page's tab bar is the real BuilderTabs, wrapped only to capture the props the page gives it.
  if (request === '@/components/certification/builder/BuilderTabs' && (parent?.filename || '').endsWith('ProgramDetailsView.jsx')) {
    const real = originalLoad.call(this, path.join(SRC, 'components/certification/builder/BuilderTabs'), parent, isMain);
    return {
      __esModule: true,
      default: props => {
        harness.tabsProps = props;
        return React.createElement(real.default, props);
      },
    };
  }
  if (Object.prototype.hasOwnProperty.call(stubs, request)) return stubs[request];
  if (request.startsWith('@/')) return originalLoad.call(this, path.join(SRC, request.slice(2)), parent, isMain);
  return originalLoad.apply(this, arguments);
};

module.exports = harness;
