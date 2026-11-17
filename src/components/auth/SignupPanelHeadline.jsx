// Headline for the signup left panel (shared by /auth/signup and /auth/expert/signup).
//
// `stacked` (QTE copy): two separate block lines — the orange accent line, then the dark
// line which must stay on ONE line at desktop widths. The panel only renders from `lg` (1024px)
// up, where its text column is ~416px wide, so the font is stepped down (28px, then 32px from
// xl) with tight tracking instead of letting the second phrase wrap. Below `lg` the panel is
// hidden, but wrapping is still allowed there so nothing can ever overflow.
// Default / expert copy keep the original inline layout.
const STACKED_H1 = 'font-bold leading-tight tracking-tight text-[1.75rem] xl:text-[2rem] lg:-mx-4';
const INLINE_H1 = 'text-4xl font-bold text-gray-800 leading-tight';

const SignupPanelHeadline = ({ accent, rest, stacked = false }) => {
  if (!stacked) {
    return (
      <h1 className={INLINE_H1}>
        <span className="text-orange-600">{accent}</span>{' '}
        {rest}
      </h1>
    );
  }

  return (
    <h1 className={STACKED_H1}>
      <span data-headline-line="accent" className="block text-orange-600">{accent}</span>
      <span data-headline-line="rest" className="block text-gray-800 lg:whitespace-nowrap">{rest}</span>
    </h1>
  );
};

export default SignupPanelHeadline;
