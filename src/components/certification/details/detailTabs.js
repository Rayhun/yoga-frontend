// Pure model behind the learner program-detail tabs (Overview / Curriculum / Credentials). No React,
// no I/O, so it is testable without a browser. Every block is built only from fields the existing
// catalog-detail / learner-detail responses already carry; a block with no data is simply absent.
import { LESSON_TYPES } from '@/components/certification/session/lessonTypes';

export const TAB_PARAM = 'tab';

export const DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'credentials', label: 'Credentials' },
];
export const DEFAULT_TAB = DETAIL_TABS[0].id;

// Unknown / missing ?tab= values fall back to Overview.
export const parseTab = raw => (DETAIL_TABS.some(tab => tab.id === raw) ? raw : DEFAULT_TAB);

export const tabPanelId = id => `program-panel-${id}`;

const present = value => (typeof value === 'string' ? value.trim() !== '' : value !== null && value !== undefined && value !== '');

// --- lesson chips ------------------------------------------------------------------------------

const FALLBACK_CHIP_LABEL = 'Lesson';

// Chip for a lesson type; a type the UI doesn't know yet gets a neutral "Lesson" chip, never a crash
// or an empty label.
export const lessonChip = lessonType => {
  const known = LESSON_TYPES[lessonType];
  return known
    ? { type: lessonType, label: known.label, icon: known.icon, className: known.tileClassName, known: true }
    : { type: 'unknown', label: FALLBACK_CHIP_LABEL, icon: LESSON_TYPES.text.icon, className: 'bg-gray-100 text-gray-600', known: false };
};

// --- Overview -----------------------------------------------------------------------------------

export const AUDIENCE_LABELS = { career: 'Career', professional: 'Professional', both: 'Career & Professional' };

export const overviewModel = program => {
  const description = [program?.full_description, program?.short_description].find(present) || null;
  const objectives = present(program?.outcomes)
    ? program.outcomes.split('\n').map(line => line.trim()).filter(Boolean)
    : [];
  const facts = [
    ['Target audience', AUDIENCE_LABELS[program?.target_audience]],
    ['Level', program?.level],
    ['Duration', program?.duration_estimate],
    ['Language', program?.language],
  ]
    .filter(([, value]) => present(value))
    .map(([label, value]) => ({ label, value: String(value) }));
  return { description, objectives, facts };
};

// --- Curriculum ---------------------------------------------------------------------------------

// Titles, types and durations only: nothing here reads lesson content, text or URLs, so they cannot
// leak into the outline even if a response carries them.
export const curriculumModel = (program, isEnrolled) => {
  const modules = (program?.modules || []).map(module => {
    const lessons = (module.lessons || []).map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      duration: present(lesson.duration) ? String(lesson.duration).trim() : null,
      chip: lessonChip(lesson.lesson_type),
    }));
    return {
      id: module.id,
      title: module.title,
      description: present(module.description) ? module.description : null,
      locked: !isEnrolled || Boolean(module.is_locked),
      lessons,
    };
  });
  const lessonTotal = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  return {
    modules,
    moduleCount: program?.module_count ?? modules.length,
    lessonCount: program?.lesson_count ?? lessonTotal,
    // Lesson durations are free text ("12 min"), so they are not summed; the creator's own estimate is shown.
    totalDuration: present(program?.duration_estimate) ? String(program.duration_estimate) : null,
  };
};

// --- Credentials ----------------------------------------------------------------------------------

// Blocks for the Credentials tab, in display order. A block exists only when its data does, so new
// fields can be appended here later without touching the component. Deliberately absent today because
// the API does not provide them: CE hours, accreditation body logo, digital badge, a certificate
// verification ID, quiz pass mark, required-lesson flags.
export const credentialBlocks = program => {
  const setting = program?.certificate_setting;
  if (!setting) return [];
  const blocks = [];
  const add = (key, label, value, kind = 'text') => present(value) && blocks.push({ key, label, value: String(value).trim(), kind });

  add('title', 'Certificate', setting.certificate_title);
  add('issuer', 'Issued by', setting.primary_issuer_name);
  add('co_issuer', 'Co-issued by', setting.co_issuer_name);
  add('requirements', 'How to earn it', setting.completion_rules, 'paragraph');
  add('deadline', 'Completion deadline', program?.completion_deadline_days && `${program.completion_deadline_days} days after enrollment`);
  add('validity', 'Validity', setting.expiry_period_days && `Valid for ${setting.expiry_period_days} days after issuance`);
  return blocks;
};
