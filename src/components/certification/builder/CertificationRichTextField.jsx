'use client';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import {
  CERTIFICATION_RICH_TEXT_FORMATS,
  CERTIFICATION_RICH_TEXT_MODULES,
  editorHtmlToValue,
  plainTextToHtml,
} from './richText';

/**
 * The shared Quill editor (the one the LMS program / module / session descriptions use), configured for
 * Certification: a toolbar limited to formats whose HTML the backend sanitizer keeps (see ``richText.js``),
 * legacy plain text loaded as paragraphs, and an empty editor stored as ''. It is a Formik field, so edits
 * only update the form; saving stays with the pane's single blur handler (one save per blur, never per keystroke).
 */
const CertificationRichTextField = ({ name, label, disabled = false, rows = 6, placeholder = '' }) => (
  <FormikRichTextEditor
    name={name}
    label={label}
    rows={rows}
    placeholder={placeholder}
    readOnly={disabled}
    modules={CERTIFICATION_RICH_TEXT_MODULES}
    formats={CERTIFICATION_RICH_TEXT_FORMATS}
    toEditorValue={plainTextToHtml}
    fromEditorValue={editorHtmlToValue}
  />
);

export default CertificationRichTextField;
