export const HABIT_STATISTICS_HELP_DEFAULT = {
  title: 'Habits Statistics',
  empty_message: 'Track 5 days to see your insights ✨',
  metrics: [
    {
      label: 'Wellness Score',
      description:
        'A 5-day score of your habit consistency and engagement via our tailored algorithm.',
    },
    {
      label: 'Average',
      description:
        'Your typical completion rate over the last 5 days to show your current baseline.',
    },
    {
      label: 'Latest Trend',
      description:
        'Compares your last 5 days to previous activity to show your current momentum.',
    },
  ],
};

export const CYCLE_STATISTICS_HELP_DEFAULT = {
  title: 'Cycle Statistics',
  empty_message: 'Log 3 cycles to unlock your insights 💫',
  metrics: [
    {
      label: 'Wellness Score',
      description:
        'A 5-day snapshot of your well-being relative to your phase using our unique formula.',
    },
    {
      label: 'Average',
      description:
        'Your mean wellness level over the last 5 days to track your phase stability.',
    },
    {
      label: 'Latest Trend',
      description:
        'Shows if your reported wellness markers are shifting or steady over the last 5 days.',
    },
  ],
};

export const INSIGHT_STATISTICS_DEFAULTS = {
  habit: HABIT_STATISTICS_HELP_DEFAULT,
  cycle: CYCLE_STATISTICS_HELP_DEFAULT,
};
