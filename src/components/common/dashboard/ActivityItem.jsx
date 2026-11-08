/**
 * One row of a "Recent activity" list: a coloured dot, the sentence, and a relative time.
 *
 * The Expert dashboard's API sends the sentence as HTML (`item.text`), which is rendered as such. Callers
 * that build the sentence themselves (the creator dashboard) pass it as `children` instead, so nothing
 * from the API is ever injected as markup.
 */
const ActivityItem = ({ item, children }) => (
  <div className="flex items-start gap-3 border-b border-gray-100 py-3.5 last:border-0">
    <span
      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: item.dot_color || '#9CA3AF' }}
    />
    {children ? (
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-gray-700 [&_strong]:font-semibold [&_strong]:text-gray-900">
        {children}
      </p>
    ) : (
      <p
        className="min-w-0 flex-1 text-sm leading-relaxed text-gray-700 [&_strong]:font-semibold [&_strong]:text-gray-900"
        dangerouslySetInnerHTML={{ __html: item.text || item.plain_text }}
      />
    )}
    <span className="shrink-0 text-xs text-gray-400" title={item.time_title}>
      {item.time_ago}
    </span>
  </div>
);

export default ActivityItem;
