'use client';

import { FieldArray, useFormikContext } from 'formik';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikSelect from '@/components/common/form/formik/FormikSelect';

const CARD_TYPE_OPTIONS = [
  { label: 'Educational Insight', value: 'educational_insight' },
  { label: 'Ordered List', value: 'ordered_list' },
  { label: 'Metric Blocks', value: 'metric_blocks' },
  { label: 'Interactive Map Cards', value: 'interactive_map_cards' },
  { label: 'Contextual Alert', value: 'contextual_alert' },
];

function EducationalFields({ prefix }) {
  return (
    <div className="flex flex-col gap-3">
      <FormikField name={`${prefix}.content.icon`} label="Icon" placeholder="e.g. 💡" />
      <FormikRichTextEditor
        name={`${prefix}.content.body_html`}
        label="Body"
        rows={4}
        placeholder="Write content here..."
      />
    </div>
  );
}

function OrderedListFields({ prefix }) {
  const { values } = useFormikContext();
  const steps = values.sections?.[Number(prefix.match(/\[(\d+)\]/)?.[1])]?.content?.steps || [];

  return (
    <FieldArray name={`${prefix}.content.steps`}>
      {({ push, remove }) => (
        <div className="space-y-3">
          {steps.map((_, index) => (
            <div key={index} className="rounded-xl border border-stone-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Step {index + 1}</p>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FormikField
                  name={`${prefix}.content.steps[${index}].step_number`}
                  label="Step Number"
                  type="number"
                  min={1}
                />
                <FormikField
                  name={`${prefix}.content.steps[${index}].duration_text`}
                  label="Duration Text"
                  placeholder="e.g. 2 minutes"
                />
              </div>
              <div className="mt-3 grid gap-3">
                <FormikField
                  name={`${prefix}.content.steps[${index}].title`}
                  label="Title"
                  placeholder="Step title"
                />
                <FormikField
                  name={`${prefix}.content.steps[${index}].description`}
                  label="Description"
                  placeholder="Step description"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              push({
                step_number: steps.length + 1,
                title: '',
                description: '',
                duration_text: '',
              })
            }
          >
            Add Step
          </Button>
        </div>
      )}
    </FieldArray>
  );
}

function MetricBlocksFields({ prefix }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {['inhale', 'hold', 'exhale'].map(key => (
        <div key={key} className="rounded-xl border border-stone-200 p-4">
          <p className="mb-3 text-sm font-semibold uppercase text-gray-600">{key}</p>
          <FormikField
            name={`${prefix}.content.pattern.${key}.value`}
            label="Value"
            type="number"
            min={1}
          />
          <div className="mt-2">
            <FormikField
              name={`${prefix}.content.pattern.${key}.label`}
              label="Label"
              placeholder={key.toUpperCase()}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MapCardsFields({ prefix }) {
  const { values } = useFormikContext();
  const sectionIndex = Number(prefix.match(/\[(\d+)\]/)?.[1]);
  const points = values.sections?.[sectionIndex]?.content?.points || [];

  return (
    <FieldArray name={`${prefix}.content.points`}>
      {({ push, remove }) => (
        <div className="space-y-3">
          {points.map((_, index) => (
            <div key={index} className="rounded-xl border border-stone-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Point {index + 1}</p>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FormikField
                  name={`${prefix}.content.points[${index}].id`}
                  label="ID"
                  placeholder="li4_point"
                />
                <FormikField
                  name={`${prefix}.content.points[${index}].code`}
                  label="Code"
                  placeholder="LI4"
                />
                <FormikField
                  name={`${prefix}.content.points[${index}].name`}
                  label="Name"
                  placeholder="Hand Valley Point"
                />
                <FormikField
                  name={`${prefix}.content.points[${index}].icon`}
                  label="Icon"
                  placeholder="👆"
                />
              </div>
              <div className="mt-3">
                <FormikField
                  name={`${prefix}.content.points[${index}].description`}
                  label="Description"
                  placeholder="Point description"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              push({
                id: '',
                code: '',
                name: '',
                icon: '',
                description: '',
              })
            }
          >
            Add Point
          </Button>
        </div>
      )}
    </FieldArray>
  );
}

function ContextualAlertFields({ prefix }) {
  return (
    <div className="flex flex-col gap-3">
      <FormikField name={`${prefix}.content.icon`} label="Icon" placeholder="e.g. 🌿" />
      <FormikField
        name={`${prefix}.content.title_label`}
        label="Title Label"
        placeholder="e.g. Best used"
      />
      <FormikField
        name={`${prefix}.content.body_text`}
        label="Body Text"
        placeholder="Alert message"
      />
    </div>
  );
}

function SectionContentFields({ prefix, cardType }) {
  switch (cardType) {
    case 'educational_insight':
      return <EducationalFields prefix={prefix} />;
    case 'ordered_list':
      return <OrderedListFields prefix={prefix} />;
    case 'metric_blocks':
      return <MetricBlocksFields prefix={prefix} />;
    case 'interactive_map_cards':
      return <MapCardsFields prefix={prefix} />;
    case 'contextual_alert':
      return <ContextualAlertFields prefix={prefix} />;
    default:
      return null;
  }
}

export default function ReliefQuickToolSectionBuilder() {
  const { values } = useFormikContext();

  return (
    <FieldArray name="sections">
      {({ push, remove }) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Content Sections</h3>
              <p className="text-sm text-gray-500">
                Add dynamic cards shown on the quick tool detail page.
              </p>
            </div>
            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                push({
                  section_id: `section_${(values.sections?.length || 0) + 1}`,
                  title: '',
                  card_type: 'educational_insight',
                  content: { icon: '💡', body_html: '' },
                  sort_order: values.sections?.length || 0,
                })
              }
            >
              Add Section
            </Button>
          </div>

          {(values.sections || []).map((section, index) => (
            <div key={index} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-gray-800">Section {index + 1}</p>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove Section
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <FormikField
                  name={`sections[${index}].section_id`}
                  label="Section ID"
                  placeholder="whats_happening"
                  required
                />
                <FormikField
                  name={`sections[${index}].sort_order`}
                  label="Sort Order"
                  type="number"
                  min={0}
                />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <FormikField
                  name={`sections[${index}].title`}
                  label="Section Title"
                  placeholder="WHAT'S HAPPENING"
                />
                <FormikSelect
                  name={`sections[${index}].card_type`}
                  label="Card Type"
                  options={CARD_TYPE_OPTIONS}
                  required
                />
              </div>

              <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
                <SectionContentFields
                  prefix={`sections[${index}]`}
                  cardType={section.card_type}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </FieldArray>
  );
}
