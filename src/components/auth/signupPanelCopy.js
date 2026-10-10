// Left-panel copy for the signup pages when the visitor arrives from the QTE link (?type=qte) —
// the same parameter SignupForm reads to send signup_type='qte', so the panel and the account
// type always agree whichever signup route renders them.
export const QTE_PANEL_COPY = {
  headlineAccent: 'Bring Your Programs to the World.',
  headlineRest: 'Certify Wellness Leaders.',
  subheadline:
    'Offer your health, coaching, and wellness programs online to empower new audiences and scale your revenue effortlessly.',
  pills: ['Global Brand Reach', 'Automated Certificate Issuance', 'Turn Expertise Into ROI'],
  footer: 'Seamless & Dedicated Platform',
};

// Server pages receive `searchParams` as a plain object; a repeated key is an array, and
// URLSearchParams.get() (used by SignupForm) returns the first value, so do the same here.
export const isQteSignup = searchParams => {
  const type = searchParams?.type;
  return (Array.isArray(type) ? type[0] : type) === 'qte';
};
