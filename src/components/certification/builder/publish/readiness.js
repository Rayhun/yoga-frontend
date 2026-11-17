import { isBlankHtml } from '@/components/certification/builder/richText';
import { lessonContentKind, validateLessonUrl } from '@/components/certification/builder/curriculum/lessonMedia';

// Publish readiness, computed from the saved program detail. `blockers` mirror the backend's
// `_publish_completeness_errors` (Certification/api/v1/creator_portal/program/api.py) one-for-one —
// the server stays the authority; this only lets the creator see the gaps before clicking Publish.
// `recommendations` are client-only checks the server deliberately doesn't enforce.

const ONE_TIME = 'one_time';
const URL_LESSON_TYPES = ['pdf', 'link'];
const MEDIA_LESSON_TYPES = ['video', 'audio', 'image'];

// `target` is the builder position ({ step, fold, item } — the shape builderUrlState reads and writes) that
// fixes the check, so the Publish step's "Fix" links and the resume point use one source of truth:
// Basics parts live at step 'basics' + a fold id; Content tabs are the steps 'curriculum' | 'pricing' |
// 'certificate'; a lesson/module to open is `item: { type, id }`.
const position = (step, { fold = null, item = null } = {}) => ({ step, fold, item });
const check = (id, label, message, target) => ({ id, label, ok: !message, message, target });

const getCurriculumMessage = modules => {
  if (!modules.length) return 'At least one module is required.';
  if (modules.some(module => !(module.lessons || []).length)) return 'Every module must have at least one lesson.';
  return null;
};

const getPricingMessage = program => {
  if (program.payment_type !== ONE_TIME) return null;
  if (!(Number(program.price) > 0)) return 'A one-time-payment program needs a price greater than 0.';
  if (!program.stripe_product_id) return 'Stripe product setup is incomplete. Please re-save the Pricing step to retry.';
  return null;
};

const getCertificateMessage = setting =>
  setting?.certificate_title && setting?.primary_issuer_name ? null : 'Certificate title and issuer name are required.';

export const getPublishBlockers = (program = {}) => {
  const modules = program.modules || [];
  const emptyModule = modules.find(module => !(module.lessons || []).length);
  return [
    check('basics', 'Basics', program.title ? null : 'Program title is required.', position('basics', { fold: 'about' })),
    check('delivery', 'Delivery format', program.delivery_format ? null : 'Delivery format is required.', position('basics', { fold: 'format' })),
    check(
      'curriculum',
      'Curriculum',
      getCurriculumMessage(modules),
      position('curriculum', { item: emptyModule ? { type: 'module', id: emptyModule.id } : null })
    ),
    check('pricing', 'Pricing', getPricingMessage(program), position('pricing')),
    check('certificate_setup', 'Certificate', getCertificateMessage(program.certificate_setting), position('certificate')),
  ];
};

// Video / audio / image: ready with a valid https link or a file uploaded earlier (a legacy lesson); a blank or
// invalid link is a gap. (The server rejects an invalid link on save, so this mostly catches blank content.)
const getMediaLessonGap = contentUrl => {
  const kind = lessonContentKind(contentUrl);
  if (kind === 'empty') return 'has no link';
  if (kind === 'link' && validateLessonUrl(contentUrl)) return 'has an invalid link (it must be a full https:// link)';
  return null;
};

const getLessonGap = lesson => {
  if (lesson.lesson_type === 'quiz' && !(lesson.questions || []).length) return 'has no questions';
  if (lesson.lesson_type === 'assignment' && isBlankHtml(lesson.text_content)) return 'has no instructions';
  if (lesson.lesson_type === 'text' && isBlankHtml(lesson.text_content)) return 'has no text';
  if (MEDIA_LESSON_TYPES.includes(lesson.lesson_type)) return getMediaLessonGap(lesson.content_url);
  if (URL_LESSON_TYPES.includes(lesson.lesson_type) && !lesson.content_url?.trim()) return 'has no link';
  return null;
};

export const getPublishRecommendations = (program = {}) =>
  (program.modules || []).flatMap((module, mi) =>
    (module.lessons || []).flatMap((lesson, li) => {
      const gap = getLessonGap(lesson);
      if (!gap) return [];
      return [
        {
          id: `lesson-${lesson.id}`,
          message: `Lesson ${mi + 1}.${li + 1} “${lesson.title}” ${gap}.`,
          target: position('curriculum', { item: { type: 'lesson', id: lesson.id } }),
        },
      ];
    })
  );
