'use client';

import Link from 'next/link';

const EXPERT_STEPS = [
  {
    heading: 'Write your welcome post',
    subheading: 'Introduce yourself and set the tone',
  },
  {
    heading: 'Invite your members',
    subheading: 'Send invites to your first clients',
    href: '/portal/teacher/community',
  },
  {
    heading: 'Share your first wellness tip',
    subheading: 'Give members something to try today',
  },
  {
    heading: 'Pin community guidelines',
    subheading: 'Set expectations up front',
  },
  {
    heading: 'Schedule your first live Q&A',
    subheading: 'Give members a date to look forward to',
  },
];

const focusMessageInput = () => {
  const input = document.getElementById('circle-message-input');
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

export const CircleExpertGettingStarted = () => (
  <div className="flex h-full min-h-[280px] items-center justify-center px-4 py-8">
    <div className="w-full max-w-md rounded-2xl bg-white px-6 py-7 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Getting started</p>
      <h3 className="mt-2 font-serif text-xl font-bold text-gray-900 md:text-2xl">
        Your Circle is live — let&apos;s fill it in
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        A few quick steps help your first members feel welcome.
      </p>

      <ul className="mt-6 space-y-4">
        {EXPERT_STEPS.map(step => {
          const content = (
            <>
              <p className="text-sm font-semibold text-gray-900">{step.heading}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{step.subheading}</p>
            </>
          );

          if (step.href) {
            return (
              <li key={step.heading}>
                <Link
                  href={step.href}
                  className="block rounded-xl border border-transparent px-1 py-0.5 transition-colors hover:border-green-100 hover:bg-green-50/60"
                >
                  {content}
                </Link>
              </li>
            );
          }

          return <li key={step.heading}>{content}</li>;
        })}
      </ul>
    </div>
  </div>
);

export const CircleMemberWelcome = ({ groupName = 'this Circle' }) => {
  const handleSayHello = () => {
    focusMessageInput();
  };

  return (
    <div className="flex h-full min-h-[280px] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white px-6 py-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl">
          🌿
        </div>
        <h3 className="font-serif text-xl font-bold text-gray-900 md:text-2xl">
          You&apos;re in {groupName} 🌿
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          This is a calm space to check in, ask questions, and connect with others on the same
          journey. Say hi whenever you&apos;re ready — <span className="font-semibold">no rush.</span>
        </p>
        <button
          type="button"
          onClick={handleSayHello}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1E4D35] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#163a28]"
        >
          Say hello 👋
        </button>
      </div>
    </div>
  );
};

const CircleChatEmptyState = ({ variant, groupName }) => {
  if (variant === 'expert') {
    return <CircleExpertGettingStarted />;
  }

  return <CircleMemberWelcome groupName={groupName} />;
};

export default CircleChatEmptyState;
