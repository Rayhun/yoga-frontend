import { redirect } from 'next/navigation';
import { getLessonHref } from '@/components/certification/session/lessonTypes';

// Legacy URL (every lesson used to open here) — kept as a redirect so old links/bookmarks land on
// the per-type lesson page.
const Page = ({ params, searchParams }) => redirect(getLessonHref(params.id, searchParams?.program ?? ''));

export default Page;
