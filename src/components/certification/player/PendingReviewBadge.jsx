import { FiClock } from 'react-icons/fi';

const PendingReviewBadge = () => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 w-fit">
    <FiClock className="text-sm" /> Submitted — awaiting review
  </span>
);

export default PendingReviewBadge;
