'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  MdOutlineCampaign,
  MdOutlineDevices,
  MdOutlineAnalytics,
  MdOutlineListAlt,
  MdOutlineNotificationsActive,
  MdOutlineHourglassTop,
  MdOutlineSend,
  MdOutlinePhonelinkRing,
  MdOutlineBolt,
  MdOutlineStackedBarChart,
} from 'react-icons/md';
import { BasicTable } from '@/components/common/table';
import Popup from '@/components/common/popup';
import Button from '@/components/common/Button';
import PortalSelect from '@/components/common/form/PortalSelect';
import PortalMultiSearchSelect from '@/components/common/form/PortalMultiSearchSelect';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';
import {
  bulkSendNotifications,
  createNotification,
  getDeviceTokensBrowse,
  getNotificationLogs,
  getNotificationsList,
  getNotificationStats,
  sendNotification,
  testFirebaseConnection,
} from '@/services/private/notifications';
import { searchUsersForNotifications } from '@/services/private/user';

const TABS = {
  DASHBOARD: 'dashboard',
  CAMPAIGNS: 'campaigns',
  TOKENS: 'tokens',
  LOGS: 'logs',
};

/** Matches `AdminAffiliatedDashboard` hero + stat icon gradients */
const AFFILIATE_HERO_GRADIENT =
  'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl relative overflow-hidden';

const TAB_DEFS = [
  {
    id: TABS.DASHBOARD,
    label: 'Dashboard',
    subtitle: 'Health & Firebase',
    Icon: MdOutlineAnalytics,
    accent: 'from-blue-500 to-blue-600',
  },
  {
    id: TABS.CAMPAIGNS,
    label: 'Campaigns',
    subtitle: 'Compose & send',
    Icon: MdOutlineCampaign,
    accent: 'from-emerald-500 to-emerald-600',
  },
  {
    id: TABS.TOKENS,
    label: 'Device tokens',
    subtitle: 'FCM registrations',
    Icon: MdOutlineDevices,
    accent: 'from-cyan-500 to-cyan-600',
  },
  {
    id: TABS.LOGS,
    label: 'Delivery logs',
    subtitle: 'Per-device results',
    Icon: MdOutlineListAlt,
    accent: 'from-purple-500 to-purple-600',
  },
];

const OVERVIEW_STAT_CARD_THEMES = [
  {
    label: 'Total campaigns',
    statKey: 'total_notifications',
    Icon: MdOutlineStackedBarChart,
    cardBg:
      'bg-gradient-to-br from-white to-blue-50/50 dark:from-boxdark dark:to-blue-900/20',
    orbClass: 'bg-blue-200/20',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    label: 'Sent',
    statKey: 'sent_notifications',
    Icon: MdOutlineSend,
    cardBg:
      'bg-gradient-to-br from-white to-emerald-50/50 dark:from-boxdark dark:to-emerald-900/20',
    orbClass: 'bg-emerald-200/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  },
  {
    label: 'Pending',
    statKey: 'pending_notifications',
    Icon: MdOutlineHourglassTop,
    cardBg:
      'bg-gradient-to-br from-white to-amber-50/50 dark:from-boxdark dark:to-amber-900/20',
    orbClass: 'bg-amber-200/20',
    iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
  },
  {
    label: 'Active tokens',
    statKey: 'active_device_tokens',
    Icon: MdOutlinePhonelinkRing,
    cardBg:
      'bg-gradient-to-br from-white to-cyan-50/50 dark:from-boxdark dark:to-cyan-900/20',
    orbClass: 'bg-cyan-200/20',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
  },
];

/** Shared chrome; single-line height matches `PortalSelect` (42px min-height, ~10px vertical padding). */
const fieldInputBaseClass =
  'w-full rounded-xl border border-stroke bg-white px-4 text-sm leading-snug text-black shadow-sm outline-none transition placeholder:text-bodydark2 focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:ring-primary/25 box-border';

const fieldInputClass = `${fieldInputBaseClass} min-h-[52px] py-[10px]`;

const fieldTextareaClass = `${fieldInputBaseClass} min-h-[120px] resize-y py-3`;

const fieldLabelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bodydark2 dark:text-bodydark';

function formatNotificationTimestamp(value) {
  if (value == null || value === '') return '—';
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  } catch {
    return String(value);
  }
}

function formatTargetIdList(ids, maxShown = 60) {
  if (!Array.isArray(ids) || ids.length === 0) return null;
  const slice = ids.slice(0, maxShown);
  const rest = ids.length > maxShown ? `\n… and ${ids.length - maxShown} more` : '';
  return `${slice.join(', ')}${rest}`;
}

/** Dedupe autocomplete rows when the API returns the same id twice. */
function dedupeOptionsByValue(options) {
  const map = new Map();
  for (const o of options) {
    if (o == null || o.value == null) continue;
    if (!map.has(o.value)) map.set(o.value, o);
  }
  return [...map.values()];
}

const detailMonoPreClass =
  'max-h-36 overflow-auto whitespace-pre-wrap rounded-xl border border-emerald-900/10 bg-emerald-50/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-black shadow-inner dark:border-emerald-500/20 dark:bg-black/30 dark:text-gray-100';

function DetailModalSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-stroke/90 bg-gradient-to-br from-slate-50/95 via-white to-emerald-50/30 p-4 shadow-sm ring-1 ring-black/[0.03] dark:border-strokedark dark:from-meta-4/35 dark:via-boxdark dark:to-emerald-950/20 dark:ring-white/[0.04] sm:p-5">
      {title ? (
        <h3 className="mb-4 flex items-center gap-2 border-b border-stroke/70 pb-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800 dark:border-strokedark dark:text-emerald-400">
          <span className="h-4 w-1 shrink-0 rounded-full bg-gradient-to-b from-green-600 to-emerald-500" />
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}

function DetailGridRow({ label, children }) {
  return (
    <div className="grid gap-1 py-2.5 text-left sm:grid-cols-[minmax(132px,10rem)_1fr] sm:items-start sm:gap-x-5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-bodydark2">{label}</dt>
      <dd className="min-w-0 text-sm leading-relaxed text-black dark:text-white">{children}</dd>
    </div>
  );
}

function Pill({ children, variant = 'neutral' }) {
  const styles = {
    neutral: 'bg-gray-100 text-gray-700 dark:bg-meta-4 dark:text-gray-300',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-800 dark:text-amber-400',
    danger: 'bg-red-500/15 text-red-700 dark:text-red-400',
    info: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-400',
    brand: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[variant] || styles.neutral}`}
    >
      {children}
    </span>
  );
}

const NOTIFICATION_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'chat', label: 'Chat' },
  { value: 'system', label: 'System' },
];

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'low', label: 'Low' },
];

const SCHEDULE_TYPES = [
  { value: 'immediate', label: 'Immediate (manual send)' },
  { value: 'utc', label: 'UTC datetime' },
  { value: 'local_time', label: 'Personalized (each user’s local time)' },
];

function isScheduledCampaign(row) {
  return row?.schedule_type === 'local_time' || row?.schedule_type === 'utc';
}

const DEVICE_FILTER_OPTIONS = [
  { label: 'All devices', value: '' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
  { label: 'Web', value: 'web' },
];

function unwrapData(axiosResponse) {
  return axiosResponse?.data?.data;
}

const AdminNotifications = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);

  const [notificationsPagination, setNotificationsPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [logsPagination, setLogsPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [tokensPagination, setTokensPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const [selectedCampaignIds, setSelectedCampaignIds] = useState(() => new Set());
  const [tokenDetailRow, setTokenDetailRow] = useState(null);
  const [logDetailRow, setLogDetailRow] = useState(null);
  const [campaignDetailRow, setCampaignDetailRow] = useState(null);

  const [tokenFilters, setTokenFilters] = useState({
    device_type: '',
    user_id: '',
    include_anonymous: true,
    active_only: true,
  });

  const [compose, setCompose] = useState({
    title: '',
    body: '',
    notification_type: 'general',
    priority: 'normal',
    schedule_type: 'immediate',
    scheduled_at: '',
    trigger_time: '19:00',
    trigger_date: '',
    is_recurring: true,
    target_users_selected: [],
    target_tokens_selected: [],
    action_url: '',
  });

  const loadUserTargetOptions = useCallback(async search => {
    const res = await searchUsersForNotifications({ search });
    const rows = unwrapData(res) ?? [];
    const opts = rows.map(u => {
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
      const label = name ? `${name} · ${u.email}` : u.email;
      return { value: u.id, label: `${label} (#${u.id})` };
    });
    return dedupeOptionsByValue(opts);
  }, []);

  const loadTokenTargetOptions = useCallback(async search => {
    const res = await getDeviceTokensBrowse({
      search,
      page: 1,
      page_size: 40,
      active_only: true,
      include_anonymous: true,
    });
    const payload = unwrapData(res);
    const rows = payload?.device_tokens ?? [];
    const opts = rows.map(t => {
      const ui = t.user_info;
      const who = ui ? ui.email : 'Anonymous';
      return { value: t.id, label: `${who} · ${t.token_display} · ${t.device_type}` };
    });
    return dedupeOptionsByValue(opts);
  }, []);

  const notificationsQuery = useQuery({
    queryKey: [
      queryKeys.adminNotifications,
      notificationsPagination.pageIndex,
      notificationsPagination.pageSize,
    ],
    queryFn: () =>
      getNotificationsList({
        page: notificationsPagination.pageIndex + 1,
        page_size: notificationsPagination.pageSize,
      }),
    enabled: activeTab === TABS.CAMPAIGNS,
  });

  const statsQuery = useQuery({
    queryKey: [queryKeys.adminNotificationStats],
    queryFn: getNotificationStats,
    enabled: activeTab === TABS.DASHBOARD,
  });

  const logsQuery = useQuery({
    queryKey: [queryKeys.adminNotificationLogs, logsPagination.pageIndex, logsPagination.pageSize],
    queryFn: () =>
      getNotificationLogs({
        page: logsPagination.pageIndex + 1,
        page_size: logsPagination.pageSize,
      }),
    enabled: activeTab === TABS.LOGS,
  });

  const tokensQuery = useQuery({
    queryKey: [
      queryKeys.adminDeviceTokensBrowse,
      tokensPagination.pageIndex,
      tokensPagination.pageSize,
      tokenFilters.device_type,
      tokenFilters.user_id,
      tokenFilters.include_anonymous,
      tokenFilters.active_only,
    ],
    queryFn: () =>
      getDeviceTokensBrowse({
        page: tokensPagination.pageIndex + 1,
        page_size: tokensPagination.pageSize,
        device_type: tokenFilters.device_type || undefined,
        user_id: tokenFilters.user_id || undefined,
        include_anonymous: tokenFilters.include_anonymous,
        active_only: tokenFilters.active_only,
      }),
    enabled: activeTab === TABS.TOKENS,
  });

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: res => {
      toast.success(res?.data?.message || 'Notification created');
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminNotifications] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminNotificationStats] });
      setCompose(c => ({
        ...c,
        title: '',
        body: '',
        target_users_selected: [],
        target_tokens_selected: [],
        action_url: '',
      }));
    },
    onError: toastApiError,
  });

  const sendMutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: res => {
      toast.success(res?.data?.message || 'Sent');
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminNotifications] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminNotificationLogs] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminNotificationStats] });
    },
    onError: toastApiError,
  });

  const bulkMutation = useMutation({
    mutationFn: bulkSendNotifications,
    onSuccess: res => {
      const results = res?.data?.data?.results || [];
      const failed = results.filter(r => !r.success);
      toast.success(
        failed.length
          ? `${res?.data?.message || 'Bulk send finished'} (${failed.length} failed)`
          : res?.data?.message || 'Bulk send completed'
      );
      setSelectedCampaignIds(() => new Set());
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminNotifications] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminNotificationLogs] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminNotificationStats] });
    },
    onError: toastApiError,
  });

  const firebaseMutation = useMutation({
    mutationFn: testFirebaseConnection,
    onSuccess: res => {
      const ok = res?.data?.status === 'success';
      toast[ok ? 'success' : 'error'](res?.data?.message || (ok ? 'Firebase OK' : 'Firebase check failed'));
    },
    onError: toastApiError,
  });

  const notificationsPayload = unwrapData(notificationsQuery.data);
  const notificationRows = notificationsPayload?.notifications ?? [];
  const notificationsMeta = notificationsPayload?.pagination;

  const statsPayload = unwrapData(statsQuery.data);

  const logsPayload = unwrapData(logsQuery.data);
  const logRows = logsPayload?.logs ?? [];
  const logsMeta = logsPayload?.pagination;

  const tokensPayload = unwrapData(tokensQuery.data);
  const tokenRows = tokensPayload?.device_tokens ?? [];
  const tokensMeta = tokensPayload?.pagination;

  const toggleCampaignSelect = (id, checked) => {
    setSelectedCampaignIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    setTokensPagination(p => ({ ...p, pageIndex: 0 }));
  }, [
    tokenFilters.device_type,
    tokenFilters.user_id,
    tokenFilters.include_anonymous,
    tokenFilters.active_only,
  ]);

  const toggleSelectAllPendingOnPage = () => {
    const pendingIds = notificationRows
      .filter(r => !r.is_sent && !isScheduledCampaign(r))
      .map(r => r.id);
    const allOn = pendingIds.length > 0 && pendingIds.every(id => selectedCampaignIds.has(id));
    setSelectedCampaignIds(prev => {
      const next = new Set(prev);
      if (allOn) pendingIds.forEach(id => next.delete(id));
      else pendingIds.forEach(id => next.add(id));
      return next;
    });
  };

  const submitCompose = async () => {
    if (!compose.title.trim() || !compose.body.trim()) {
      toast.error('Title and body are required.');
      return;
    }

    const payload = {
      title: compose.title.trim(),
      body: compose.body.trim(),
      notification_type: compose.notification_type,
      priority: compose.priority,
    };

    const userIds = compose.target_users_selected.map(o => o.value).filter(id => Number.isFinite(Number(id)));
    const tokenIds = compose.target_tokens_selected.map(o => o.value).filter(id => Number.isFinite(Number(id)));
    if (userIds.length) payload.target_user_ids = userIds;
    if (tokenIds.length) payload.target_token_ids = tokenIds;

    if (compose.action_url.trim()) payload.action_url = compose.action_url.trim();

    payload.schedule_type = compose.schedule_type;
    if (compose.schedule_type === 'utc') {
      if (!compose.scheduled_at) {
        toast.error('Scheduled UTC date/time is required.');
        return;
      }
      payload.scheduled_at = new Date(compose.scheduled_at).toISOString();
    }
    if (compose.schedule_type === 'local_time') {
      if (!compose.trigger_time) {
        toast.error('Trigger time is required (e.g. 19:00 for 7 PM local).');
        return;
      }
      payload.trigger_time = compose.trigger_time.length === 5 ? `${compose.trigger_time}:00` : compose.trigger_time;
      payload.is_recurring = compose.is_recurring;
      if (compose.trigger_date) payload.trigger_date = compose.trigger_date;
    }

    await createMutation.mutateAsync({ payload });
  };

  const notificationColumns = useMemo(
    () => [
      {
        id: 'select',
        enableSorting: false,
        meta: { stopRowClick: true },
        header: () => (
          <input
            type="checkbox"
            aria-label="Select pending campaigns on this page"
            className="h-4 w-4 shrink-0 rounded border-stroke text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-0"
            checked={
              notificationRows.filter(r => !r.is_sent).length > 0 &&
              notificationRows.filter(r => !r.is_sent).every(r => selectedCampaignIds.has(r.id))
            }
            onChange={toggleSelectAllPendingOnPage}
          />
        ),
        cell: ({ row }) => {
          const r = row.original;
          if (r.is_sent) return <span className="text-bodydark2">—</span>;
          return (
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border-stroke text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-0"
              checked={selectedCampaignIds.has(r.id)}
              onChange={e => toggleCampaignSelect(r.id, e.target.checked)}
            />
          );
        },
      },
      {
        header: 'Title',
        accessorKey: 'title',
        cell: ({ getValue }) => (
          <span className="font-medium text-black dark:text-white">{getValue()}</span>
        ),
      },
      {
        header: 'Type',
        accessorKey: 'notification_type',
        cell: ({ getValue }) => <Pill variant="brand">{getValue()}</Pill>,
      },
      {
        header: 'Priority',
        accessorKey: 'priority',
        cell: ({ getValue }) => {
          const p = getValue();
          const v = p === 'high' ? 'danger' : p === 'low' ? 'neutral' : 'brand';
          return <Pill variant={v}>{p}</Pill>;
        },
      },
      {
        header: 'Schedule',
        accessorKey: 'schedule_type',
        cell: ({ row }) => {
          const r = row.original;
          if (r.schedule_type === 'local_time') {
            return (
              <span className="text-xs text-bodydark2">
                <Pill variant="brand">Local {r.trigger_time || '—'}</Pill>
                {r.is_recurring ? ' · daily' : ' · once'}
              </span>
            );
          }
          if (r.schedule_type === 'utc') {
            return <Pill variant="neutral">UTC</Pill>;
          }
          return <Pill variant="neutral">Manual</Pill>;
        },
      },
      {
        header: 'Status',
        accessorKey: 'is_sent',
        cell: ({ row }) => {
          const r = row.original;
          if (r.schedule_type === 'local_time' && r.is_active) {
            return <Pill variant="success">Active</Pill>;
          }
          if (r.schedule_type === 'utc' && !r.is_sent && r.is_active) {
            return <Pill variant="warning">Scheduled</Pill>;
          }
          return r.is_sent ? <Pill variant="success">Sent</Pill> : <Pill variant="warning">Draft</Pill>;
        },
      },
      {
        header: 'Targets',
        cell: ({ row }) => (
          <span className="text-sm text-bodydark2">
            <span className="font-medium text-black dark:text-white">{row.original.target_users_count ?? 0}</span>{' '}
            users ·{' '}
            <span className="font-medium text-black dark:text-white">{row.original.target_tokens_count ?? 0}</span>{' '}
            tokens
          </span>
        ),
      },
      {
        header: 'Delivery',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <span className="text-sm">
              <span className="text-emerald-600 dark:text-emerald-400">✓ {r.success_count ?? 0}</span>
              <span className="mx-1 text-bodydark2">/</span>
              <span className="text-red-600 dark:text-red-400">✕ {r.failure_count ?? 0}</span>
            </span>
          );
        },
      },
      {
        header: 'Actions',
        meta: {
          tableCellClassName: 'whitespace-nowrap align-middle min-w-[9.5rem]',
          stopRowClick: true,
        },
        cell: ({ row }) => {
          const r = row.original;
          if (isScheduledCampaign(r)) {
            return (
              <span className="text-xs text-bodydark2" title="Sent automatically by the scheduler">
                Auto
              </span>
            );
          }
          return (
            <div className="inline-flex flex-row flex-nowrap items-center gap-1">
              <button
                type="button"
                title="Send using saved device-token targets"
                className="shrink-0 rounded-lg border border-stroke bg-white px-2 py-1 text-xs font-semibold text-black shadow-sm transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-meta-4/80"
                disabled={sendMutation.isPending || r.is_sent}
                onClick={() => sendMutation.mutateAsync({ id: r.id, useTargetUsers: false })}
              >
                Tokens
              </button>
              <button
                type="button"
                title="Send using each targeted user’s active tokens"
                className="shrink-0 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={sendMutation.isPending || r.is_sent}
                onClick={() => sendMutation.mutateAsync({ id: r.id, useTargetUsers: true })}
              >
                Users
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync selection + rows for header checkbox
    [notificationRows, selectedCampaignIds, sendMutation.isPending]
  );

  const tokenColumns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-bodydark2">#{getValue()}</span>
        ),
      },
      {
        header: 'Preview',
        accessorKey: 'token_display',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-black dark:text-white">{getValue()}</span>
        ),
      },
      {
        header: 'Device',
        accessorKey: 'device_type',
        cell: ({ getValue }) => <Pill variant="info">{getValue()}</Pill>,
      },
      {
        header: 'User',
        cell: ({ row }) => {
          const u = row.original.user_info;
          if (!u)
            return (
              <Pill variant="neutral">
                Anonymous
              </Pill>
            );
          return (
            <span className="text-sm">
              <span className="font-medium text-black dark:text-white">{u.email}</span>
              <span className="mt-0.5 block text-xs text-bodydark2">User #{u.id}</span>
            </span>
          );
        },
      },
      {
        header: 'Active',
        accessorKey: 'is_active',
        cell: ({ getValue }) =>
          getValue() ? <Pill variant="success">Live</Pill> : <Pill variant="neutral">Inactive</Pill>,
      },
      {
        header: 'Registered',
        accessorKey: 'created_at',
        cell: ({ getValue }) => (
          <span className="text-xs text-bodydark2">{getValue() ? new Date(getValue()).toLocaleString() : '—'}</span>
        ),
      },
    ],
    []
  );

  const logColumns = useMemo(
    () => [
      {
        header: 'When',
        accessorKey: 'created_at',
        cell: ({ getValue }) => (
          <span className="text-xs text-bodydark2">{new Date(getValue()).toLocaleString()}</span>
        ),
      },
      {
        header: 'Campaign',
        accessorKey: 'notification_title',
        cell: ({ getValue }) => (
          <span className="font-medium text-black dark:text-white">{getValue()}</span>
        ),
      },
      { header: 'User', accessorKey: 'user_email', cell: ({ getValue }) => getValue() || '—' },
      {
        header: 'Device',
        accessorKey: 'device_type',
        cell: ({ getValue }) => (getValue() ? <Pill variant="info">{getValue()}</Pill> : '—'),
      },
      {
        header: 'Result',
        accessorKey: 'is_success',
        cell: ({ getValue }) =>
          getValue() ? <Pill variant="success">Delivered</Pill> : <Pill variant="danger">Failed</Pill>,
      },
      {
        header: 'Detail',
        accessorKey: 'error_message',
        cell: ({ getValue }) => (
          <span className="block max-w-xs truncate text-xs text-bodydark2">{getValue() || '—'}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Hero — same gradient treatment as Affiliate Admin Dashboard */}
      <div className={`${AFFILIATE_HERO_GRADIENT} px-6 py-8 md:px-8 md:py-10`}>
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white bg-opacity-20 backdrop-blur-sm sm:h-14 sm:w-14">
              <MdOutlineNotificationsActive className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Push notifications</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-green-100 md:text-base">
                Design campaigns, deliver through Firebase Cloud Messaging, inspect registrations, and audit every send.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-green-50 backdrop-blur-sm ring-1 ring-white/25">
              <MdOutlineBolt className="h-4 w-4 text-green-100" />
              Admin · Staff tools
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl border border-stroke/80 bg-white p-2 shadow-xl shadow-black/5 dark:border-strokedark dark:bg-boxdark">
        <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Notification sections">
          {TAB_DEFS.map(tab => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex flex-col items-start gap-2 rounded-2xl px-4 py-4 text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-gray-50 to-white shadow-lg shadow-black/10 ring-2 ring-green-500 dark:from-meta-4 dark:to-boxdark dark:ring-emerald-500'
                    : 'hover:bg-gray-50/90 dark:hover:bg-meta-4/50'
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-200 ${tab.accent} ${
                    isActive ? 'scale-105' : 'opacity-90 group-hover:scale-105'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span
                    className={`block text-sm font-bold ${isActive ? 'text-black dark:text-white' : 'text-bodydark2 dark:text-bodydark'}`}
                  >
                    {tab.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-bodydark2 dark:text-bodydark">{tab.subtitle}</span>
                </div>
                {isActive ? (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)] ring-2 ring-white/50" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab panels */}
      <div className="rounded-3xl border border-stroke/80 bg-white/95 p-6 shadow-lg shadow-black/[0.03] backdrop-blur-sm dark:border-strokedark dark:bg-boxdark md:p-8">
        {activeTab === TABS.DASHBOARD && (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 border-b border-stroke pb-6 dark:border-strokedark lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                  <span className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
                  Overview
                </h2>
                <p className="mt-2 text-sm text-bodydark2">
                  Snapshot of campaigns and registered devices. Run a live Firebase check anytime.
                </p>
              </div>
              {/* <Button
                type="button"
                variant="secondary"
                className="!rounded-xl !border-green-200 !shadow-md hover:!border-emerald-300 dark:!border-emerald-900/50"
                onClick={() => firebaseMutation.mutate()}
                isLoading={firebaseMutation.isPending}
              >
                Test Firebase connection
              </Button> */}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
              {OVERVIEW_STAT_CARD_THEMES.map(card => {
                const CardIcon = card.Icon;
                const raw = statsPayload?.[card.statKey];
                const display = raw !== undefined && raw !== null ? raw : '—';
                return (
                  <div
                    key={card.statKey}
                    className={`group relative overflow-hidden rounded-xl border border-stroke px-6 py-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:border-strokedark ${card.cardBg}`}
                  >
                    <div
                      className={`absolute -right-16 -top-16 h-32 w-32 rounded-full blur-2xl ${card.orbClass}`}
                    />
                    <div className="relative z-10">
                      <div
                        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg ${card.iconBg}`}
                      >
                        <CardIcon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="mb-1 text-2xl font-bold tabular-nums text-black dark:text-white">{display}</h4>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {statsPayload?.success_rate != null ? (
              <div className="rounded-xl border border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 px-5 py-4 dark:border-emerald-900/40 dark:from-boxdark dark:to-emerald-900/15">
                <p className="text-sm text-bodydark2">
                  Aggregate delivery success rate across logged sends:{' '}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {statsPayload.success_rate}%
                  </span>
                </p>
              </div>
            ) : null}

            {statsQuery.isLoading ? (
              <p className="text-center text-sm font-medium text-bodydark2">Loading statistics…</p>
            ) : null}
          </div>
        )}

        {activeTab === TABS.CAMPAIGNS && (
          <div className="space-y-10">
            <section className="relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-emerald-50/50 p-6 shadow-lg dark:border-strokedark dark:from-boxdark dark:to-emerald-900/20 md:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-600/10" />
              <div className="relative">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                      <span className="h-6 w-1 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
                      New campaign
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-bodydark2">
                      Search and pick users or device tokens below (multi-select). Leave both empty to target all active
                      users. After saving, use{' '}
                      <strong className="font-semibold text-emerald-700 dark:text-emerald-400">Users</strong> sends for
                      audience-wide drafts and{' '}
                      <strong className="font-semibold text-emerald-700 dark:text-emerald-400">Tokens</strong> when only
                      explicit device rows should fire.
                    </p>
                  </div>
                  <Pill variant="brand">
                    {compose.schedule_type === 'immediate' ? 'Draft → Send when ready' : 'Scheduler handles delivery'}
                  </Pill>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block md:col-span-1">
                    <span className={fieldLabelClass}>Title</span>
                    <input
                      className={fieldInputClass}
                      placeholder="Summer wellness reminder"
                      value={compose.title}
                      onChange={e => setCompose(c => ({ ...c, title: e.target.value }))}
                    />
                  </label>
                  <label className="block md:col-span-1">
                    <span className={fieldLabelClass}>Type</span>
                    <PortalSelect
                      id="compose-notification-type"
                      value={compose.notification_type}
                      onChange={v => setCompose(c => ({ ...c, notification_type: v }))}
                      options={NOTIFICATION_TYPES}
                      placeholder="Select type"
                      disableClearable
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className={fieldLabelClass}>Body</span>
                    <textarea
                      rows={4}
                      className={fieldTextareaClass}
                      placeholder="Short message users see on device…"
                      value={compose.body}
                      onChange={e => setCompose(c => ({ ...c, body: e.target.value }))}
                    />
                  </label>
                  <label className="block md:col-span-1">
                    <span className={fieldLabelClass}>Priority</span>
                    <PortalSelect
                      id="compose-notification-priority"
                      value={compose.priority}
                      onChange={v => setCompose(c => ({ ...c, priority: v }))}
                      options={PRIORITIES}
                      placeholder="Select priority"
                      disableClearable
                    />
                  </label>
                  <label className="block md:col-span-1">
                    <span className={fieldLabelClass}>Schedule</span>
                    <PortalSelect
                      id="compose-schedule-type"
                      value={compose.schedule_type}
                      onChange={v => setCompose(c => ({ ...c, schedule_type: v }))}
                      options={SCHEDULE_TYPES}
                      placeholder="How to deliver"
                      disableClearable
                    />
                  </label>
                  {compose.schedule_type === 'utc' ? (
                    <label className="block md:col-span-1">
                      <span className={fieldLabelClass}>UTC date & time</span>
                      <input
                        type="datetime-local"
                        className={fieldInputClass}
                        value={compose.scheduled_at}
                        onChange={e => setCompose(c => ({ ...c, scheduled_at: e.target.value }))}
                      />
                    </label>
                  ) : null}
                  {compose.schedule_type === 'local_time' ? (
                    <>
                      <label className="block md:col-span-1">
                        <span className={fieldLabelClass}>Trigger time (user local)</span>
                        <input
                          type="time"
                          className={fieldInputClass}
                          value={compose.trigger_time}
                          onChange={e => setCompose(c => ({ ...c, trigger_time: e.target.value }))}
                        />
                        <p className="mt-1 text-xs text-bodydark2">
                          Each user receives the push at this time in their timezone (saved on login).
                        </p>
                      </label>
                      <label className="block md:col-span-1">
                        <span className={fieldLabelClass}>One-shot date (optional)</span>
                        <input
                          type="date"
                          className={fieldInputClass}
                          value={compose.trigger_date}
                          onChange={e => setCompose(c => ({ ...c, trigger_date: e.target.value }))}
                        />
                      </label>
                      <label className="flex items-center gap-2 md:col-span-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-stroke text-primary"
                          checked={compose.is_recurring}
                          onChange={e => setCompose(c => ({ ...c, is_recurring: e.target.checked }))}
                        />
                        <span className="text-sm text-bodydark2">Repeat daily at trigger time</span>
                      </label>
                    </>
                  ) : null}
                  <label className="block md:col-span-1">
                    <span className={fieldLabelClass}>Action URL</span>
                    <input
                      className={fieldInputClass}
                      placeholder="Deep link or web URL"
                      value={compose.action_url}
                      onChange={e => setCompose(c => ({ ...c, action_url: e.target.value }))}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className={fieldLabelClass}>Target users</span>
                    <PortalMultiSearchSelect
                      id="compose-target-users"
                      placeholder="Search by name, email, or user id…"
                      noOptionsText="Type at least one character"
                      value={compose.target_users_selected}
                      onChange={next => setCompose(c => ({ ...c, target_users_selected: next }))}
                      loadOptions={loadUserTargetOptions}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className={fieldLabelClass}>Target device tokens</span>
                    <PortalMultiSearchSelect
                      id="compose-target-tokens"
                      placeholder="Search token, device id, email, or token id…"
                      noOptionsText="Type at least one character"
                      value={compose.target_tokens_selected}
                      onChange={next => setCompose(c => ({ ...c, target_tokens_selected: next }))}
                      loadOptions={loadTokenTargetOptions}
                    />
                  </label>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="!rounded-xl !px-6"
                    onClick={submitCompose}
                    isLoading={createMutation.isPending}
                  >
                    Save draft
                  </Button>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex flex-col gap-4 border-b border-stroke pb-6 dark:border-strokedark lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                    <span className="h-6 w-1 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
                    Campaign queue
                  </h2>
                  <p className="mt-2 text-sm text-bodydark2">
                    Click any row for full campaign detail (body, targets, URLs). Select drafts to bulk-send. Same rules
                    apply:{' '}
                    <strong className="text-emerald-700 dark:text-emerald-400">Tokens</strong> vs{' '}
                    <strong className="text-emerald-700 dark:text-emerald-400">Users</strong> targeting.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="!rounded-xl"
                    disabled={bulkMutation.isPending || selectedCampaignIds.size === 0}
                    onClick={() =>
                      bulkMutation.mutate({
                        notification_ids: [...selectedCampaignIds],
                        useTargetUsers: false,
                      })
                    }
                  >
                    Bulk · Tokens
                  </Button>
                  <button
                    type="button"
                    className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={bulkMutation.isPending || selectedCampaignIds.size === 0}
                    onClick={() =>
                      bulkMutation.mutate({
                        notification_ids: [...selectedCampaignIds],
                        useTargetUsers: true,
                      })
                    }
                  >
                    Bulk · Users
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-stroke shadow-sm dark:border-strokedark">
                <BasicTable
                  isLoading={notificationsQuery.isLoading}
                  columns={notificationColumns}
                  data={notificationRows}
                  showSearch={false}
                  onRowClick={row => setCampaignDetailRow(row)}
                  serverPagination={{
                    enabled: true,
                    pageIndex: notificationsPagination.pageIndex,
                    pageSize: notificationsPagination.pageSize,
                    pageCount: notificationsMeta?.total_pages ?? 0,
                    onPaginationChange: setNotificationsPagination,
                  }}
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === TABS.TOKENS && (
          <div className="space-y-6">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                <span className="h-6 w-1 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
                Device registrations
              </h2>
              <p className="mt-2 text-sm text-bodydark2">
                Filter FCM tokens registered with your apps. Repeated installs for the same user and device show once
                (newest registration). Click any row for full details.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-4 rounded-xl border border-stroke bg-gradient-to-br from-white to-green-50/50 p-5 shadow-lg dark:border-strokedark dark:from-boxdark dark:to-green-900/20">
              <label className="flex min-w-[200px] flex-col gap-1.5">
                <span className={fieldLabelClass}>Platform</span>
                <PortalSelect
                  id="device-token-platform-filter"
                  value={tokenFilters.device_type}
                  onChange={v => setTokenFilters(f => ({ ...f, device_type: v }))}
                  options={DEVICE_FILTER_OPTIONS}
                  placeholder="Filter platform"
                  disableClearable
                />
              </label>
              <label className="flex min-w-[160px] flex-1 flex-col gap-1.5">
                <span className={fieldLabelClass}>User ID</span>
                <input
                  className={fieldInputClass}
                  placeholder="Numeric user id"
                  value={tokenFilters.user_id}
                  onChange={e => setTokenFilters(f => ({ ...f, user_id: e.target.value }))}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stroke bg-white px-4 py-3 text-sm font-medium shadow-sm dark:border-strokedark dark:bg-meta-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
                  checked={tokenFilters.include_anonymous}
                  onChange={e =>
                    setTokenFilters(f => ({ ...f, include_anonymous: e.target.checked }))
                  }
                />
                Anonymous
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stroke bg-white px-4 py-3 text-sm font-medium shadow-sm dark:border-strokedark dark:bg-meta-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
                  checked={tokenFilters.active_only}
                  onChange={e =>
                    setTokenFilters(f => ({ ...f, active_only: e.target.checked }))
                  }
                />
                Active only
              </label>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stroke shadow-sm dark:border-strokedark">
              <BasicTable
                isLoading={tokensQuery.isLoading}
                columns={tokenColumns}
                data={tokenRows}
                showSearch={false}
                onRowClick={row => setTokenDetailRow(row)}
                serverPagination={{
                  enabled: true,
                  pageIndex: tokensPagination.pageIndex,
                  pageSize: tokensPagination.pageSize,
                  pageCount: tokensMeta?.total_pages ?? 0,
                  onPaginationChange: setTokensPagination,
                }}
              />
            </div>
          </div>
        )}

        {activeTab === TABS.LOGS && (
          <div className="space-y-6">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                <span className="h-6 w-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                Delivery trail
              </h2>
              <p className="mt-2 text-sm text-bodydark2">
                Per-device outcomes from Firebase. Click any row to see full delivery detail including errors and FCM
                IDs.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-stroke shadow-sm dark:border-strokedark">
              <BasicTable
                isLoading={logsQuery.isLoading}
                columns={logColumns}
                data={logRows}
                showSearch={false}
                onRowClick={row => setLogDetailRow(row)}
                serverPagination={{
                  enabled: true,
                  pageIndex: logsPagination.pageIndex,
                  pageSize: logsPagination.pageSize,
                  pageCount: logsMeta?.total_pages ?? 0,
                  onPaginationChange: setLogsPagination,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <Popup
        open={Boolean(campaignDetailRow)}
        onClose={() => setCampaignDetailRow(null)}
        heading="Campaign details"
        size="lg"
      >
        {campaignDetailRow ? (
          <div className="space-y-5">
            <DetailModalSection title="Overview">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Campaign ID">
                  <span className="font-mono text-xs text-bodydark2">#{campaignDetailRow.id}</span>
                </DetailGridRow>
                <DetailGridRow label="Title">
                  <span className="font-semibold text-black dark:text-white">{campaignDetailRow.title}</span>
                </DetailGridRow>
                <DetailGridRow label="Body">
                  <p className="max-h-44 overflow-y-auto whitespace-pre-wrap rounded-xl border border-stroke/50 bg-white/80 px-3 py-2 text-sm leading-relaxed text-black shadow-inner dark:border-strokedark dark:bg-black/20 dark:text-gray-100">
                    {campaignDetailRow.body || '—'}
                  </p>
                </DetailGridRow>
                <DetailGridRow label="Type">
                  <Pill variant="brand">{campaignDetailRow.notification_type}</Pill>
                </DetailGridRow>
                <DetailGridRow label="Priority">
                  {(() => {
                    const p = campaignDetailRow.priority;
                    const v = p === 'high' ? 'danger' : p === 'low' ? 'neutral' : 'brand';
                    return <Pill variant={v}>{p}</Pill>;
                  })()}
                </DetailGridRow>
                <DetailGridRow label="Status">
                  {campaignDetailRow.is_sent ? (
                    <Pill variant="success">Sent</Pill>
                  ) : (
                    <Pill variant="warning">Draft</Pill>
                  )}
                </DetailGridRow>
              </dl>
            </DetailModalSection>

            <DetailModalSection title="Schedule & delivery">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Created">{formatNotificationTimestamp(campaignDetailRow.created_at)}</DetailGridRow>
                <DetailGridRow label="Sent at">{formatNotificationTimestamp(campaignDetailRow.sent_at)}</DetailGridRow>
                <DetailGridRow label="Schedule type">
                  {campaignDetailRow.schedule_type || 'immediate'}
                </DetailGridRow>
                <DetailGridRow label="Scheduled at (UTC)">
                  {formatNotificationTimestamp(campaignDetailRow.scheduled_at)}
                </DetailGridRow>
                {campaignDetailRow.schedule_type === 'local_time' ? (
                  <>
                    <DetailGridRow label="Trigger time (local)">
                      {campaignDetailRow.trigger_time || '—'}
                    </DetailGridRow>
                    <DetailGridRow label="Trigger date">
                      {campaignDetailRow.trigger_date || '— (daily if recurring)'}
                    </DetailGridRow>
                    <DetailGridRow label="Recurring">
                      {campaignDetailRow.is_recurring ? 'Yes' : 'No'}
                    </DetailGridRow>
                    <DetailGridRow label="Scheduler active">
                      {campaignDetailRow.is_active ? 'Yes' : 'No'}
                    </DetailGridRow>
                  </>
                ) : null}
                <DetailGridRow label="Delivery stats">
                  <span className="inline-flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                      ✓ {campaignDetailRow.success_count ?? 0} ok
                    </span>
                    <span className="rounded-lg bg-red-500/10 px-2 py-0.5 font-medium text-red-700 dark:text-red-400">
                      ✕ {campaignDetailRow.failure_count ?? 0} failed
                    </span>
                    {campaignDetailRow.success_rate != null ? (
                      <span className="text-bodydark2">({campaignDetailRow.success_rate}% success)</span>
                    ) : null}
                  </span>
                </DetailGridRow>
              </dl>
            </DetailModalSection>

            <DetailModalSection title="Targets">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Summary">
                  <span className="text-sm">
                    <span className="font-semibold text-black dark:text-white">
                      {campaignDetailRow.target_users_count ?? 0}
                    </span>{' '}
                    users ·{' '}
                    <span className="font-semibold text-black dark:text-white">
                      {campaignDetailRow.target_tokens_count ?? 0}
                    </span>{' '}
                    tokens
                  </span>
                </DetailGridRow>
                <DetailGridRow label="Target user emails">
                  {formatTargetIdList(campaignDetailRow.target_user_emails, 40) ? (
                    <pre className={detailMonoPreClass}>{formatTargetIdList(campaignDetailRow.target_user_emails, 40)}</pre>
                  ) : (
                    <span className="text-bodydark2">
                      None stored — send actions may target all users unless token targets are set.
                    </span>
                  )}
                </DetailGridRow>
                <DetailGridRow label="Target device token IDs">
                  {formatTargetIdList(campaignDetailRow.target_tokens) ? (
                    <pre className={detailMonoPreClass}>{formatTargetIdList(campaignDetailRow.target_tokens)}</pre>
                  ) : (
                    <span className="text-bodydark2">None stored.</span>
                  )}
                </DetailGridRow>
              </dl>
            </DetailModalSection>

            <DetailModalSection title="Links">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Action URL">
                  {campaignDetailRow.action_url ? (
                    <a
                      href={campaignDetailRow.action_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {campaignDetailRow.action_url}
                    </a>
                  ) : (
                    <span className="text-bodydark2">—</span>
                  )}
                </DetailGridRow>
              </dl>
            </DetailModalSection>
          </div>
        ) : null}
      </Popup>

      <Popup
        open={Boolean(tokenDetailRow)}
        onClose={() => setTokenDetailRow(null)}
        heading="Device token details"
        size="md"
      >
        {tokenDetailRow ? (
          <div className="space-y-5">
            <DetailModalSection title="Registration">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Token ID">
                  <span className="font-mono text-xs text-bodydark2">#{tokenDetailRow.id}</span>
                </DetailGridRow>
                <DetailGridRow label="FCM preview">
                  <pre className={`${detailMonoPreClass} max-h-28`}>{tokenDetailRow.token_display || '—'}</pre>
                </DetailGridRow>
                <DetailGridRow label="Platform">
                  {tokenDetailRow.device_type ? <Pill variant="info">{tokenDetailRow.device_type}</Pill> : '—'}
                </DetailGridRow>
                <DetailGridRow label="Status">
                  {tokenDetailRow.is_active ? (
                    <Pill variant="success">Active</Pill>
                  ) : (
                    <Pill variant="neutral">Inactive</Pill>
                  )}
                </DetailGridRow>
              </dl>
            </DetailModalSection>
            <DetailModalSection title="Device">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Device ID">
                  <span className="font-mono text-xs">{tokenDetailRow.device_id || '—'}</span>
                </DetailGridRow>
                <DetailGridRow label="App version">{tokenDetailRow.app_version || '—'}</DetailGridRow>
                <DetailGridRow label="Anonymous">{tokenDetailRow.is_anonymous ? 'Yes' : 'No'}</DetailGridRow>
                <DetailGridRow label="Registered">{formatNotificationTimestamp(tokenDetailRow.created_at)}</DetailGridRow>
              </dl>
            </DetailModalSection>
            <DetailModalSection title="Account">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Linked user">
                  {tokenDetailRow.user_info ? (
                    <div className="rounded-xl border border-stroke/60 bg-white/80 px-3 py-2 dark:border-strokedark dark:bg-black/20">
                      <div className="font-medium text-black dark:text-white">{tokenDetailRow.user_info.email}</div>
                      <div className="mt-1 text-xs text-bodydark2">
                        User #{tokenDetailRow.user_info.id}
                        {tokenDetailRow.user_info.first_name || tokenDetailRow.user_info.last_name
                          ? ` · ${[tokenDetailRow.user_info.first_name, tokenDetailRow.user_info.last_name].filter(Boolean).join(' ')}`
                          : ''}
                      </div>
                    </div>
                  ) : (
                    <span className="text-bodydark2">None (anonymous token)</span>
                  )}
                </DetailGridRow>
              </dl>
            </DetailModalSection>
          </div>
        ) : null}
      </Popup>

      <Popup open={Boolean(logDetailRow)} onClose={() => setLogDetailRow(null)} heading="Delivery log details" size="md">
        {logDetailRow ? (
          <div className="space-y-5">
            <DetailModalSection title="Summary">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Log ID">
                  <span className="font-mono text-xs text-bodydark2">#{logDetailRow.id}</span>
                </DetailGridRow>
                <DetailGridRow label="Time">{formatNotificationTimestamp(logDetailRow.created_at)}</DetailGridRow>
                <DetailGridRow label="Campaign">
                  <div>
                    <span className="font-semibold text-black dark:text-white">
                      {logDetailRow.notification_title || '—'}
                    </span>
                    {logDetailRow.notification != null ? (
                      <span className="mt-1 block font-mono text-xs text-bodydark2">
                        Notification #{logDetailRow.notification}
                      </span>
                    ) : null}
                  </div>
                </DetailGridRow>
                <DetailGridRow label="Result">
                  {logDetailRow.is_success ? (
                    <Pill variant="success">Delivered</Pill>
                  ) : (
                    <Pill variant="danger">Failed</Pill>
                  )}
                </DetailGridRow>
              </dl>
            </DetailModalSection>
            <DetailModalSection title="Recipient">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Email">{logDetailRow.user_email || '—'}</DetailGridRow>
                <DetailGridRow label="User ID">{logDetailRow.user != null ? `#${logDetailRow.user}` : '—'}</DetailGridRow>
              </dl>
            </DetailModalSection>
            <DetailModalSection title="Device">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="Device token ID">
                  {logDetailRow.device_token != null ? (
                    <span className="font-mono text-xs">#{logDetailRow.device_token}</span>
                  ) : (
                    '—'
                  )}
                </DetailGridRow>
                <DetailGridRow label="Device type">{logDetailRow.device_type || '—'}</DetailGridRow>
              </dl>
            </DetailModalSection>
            <DetailModalSection title="Diagnostics">
              <dl className="divide-y divide-stroke/55 dark:divide-strokedark">
                <DetailGridRow label="FCM message ID">
                  <span className="break-all font-mono text-[11px] leading-snug">{logDetailRow.fcm_message_id || '—'}</span>
                </DetailGridRow>
                <DetailGridRow label="Error / detail">
                  {logDetailRow.error_message ? (
                    <pre className={`${detailMonoPreClass} max-h-52`}>{logDetailRow.error_message}</pre>
                  ) : (
                    <span className="text-bodydark2">—</span>
                  )}
                </DetailGridRow>
              </dl>
            </DetailModalSection>
          </div>
        ) : null}
      </Popup>
    </div>
  );
};

export default AdminNotifications;
