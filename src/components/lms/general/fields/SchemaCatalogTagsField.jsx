'use client';
import { useCallback, useMemo } from 'react';
import { useField } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import useCatalogTagSchema from '@/hooks/useCatalogTagSchema';
import useExpertCatalogTagOptions from '@/hooks/useExpertCatalogTagOptions';

const REQUIREMENT_HINT = {
  required: '',
  optional: '(optional)',
  soft: '(optional — context)',
};

function NamespaceTagPicker({
  context,
  namespaceSlug,
  namespaceLabel,
  requirement,
  allTagIds,
  onNamespaceChange,
  surface,
}) {
  const { options, isLoading } = useExpertCatalogTagOptions({
    context,
    namespace: namespaceSlug,
    surface,
    limit: 500,
  });

  const optionIdSet = useMemo(() => new Set(options.map(o => o.value)), [options]);

  const selectedOptions = useMemo(() => {
    const ids = (allTagIds || []).filter(id => optionIdSet.has(id));
    return ids.map(id => options.find(o => o.value === id) || { label: String(id), value: id });
  }, [allTagIds, optionIdSet, options]);

  const handleChange = useCallback(
    (_, value) => {
      const newIds = (value || []).map(v => (typeof v === 'object' ? v.value : v)).filter(Boolean);
      const kept = (allTagIds || []).filter(id => !optionIdSet.has(id));
      onNamespaceChange([...kept, ...newIds]);
    },
    [allTagIds, onNamespaceChange, optionIdSet]
  );

  const hint = REQUIREMENT_HINT[requirement] || '';
  const label = hint ? `${namespaceLabel} ${hint}` : namespaceLabel;

  return (
    <div className="flex flex-col gap-1">
      <label
        className={`mb-1 block font-medium text-black dark:text-white ${requirement === 'required' ? 'required' : ''}`}
      >
        {label}
      </label>
      <Autocomplete
        multiple
        options={options}
        value={selectedOptions}
        loading={isLoading}
        filterSelectedOptions
        getOptionLabel={option => (typeof option === 'string' ? option : option.label)}
        isOptionEqualToValue={(option, value) => String(option.value) === String(value.value)}
        onChange={handleChange}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option.value} label={option.label} size="small" />
          ))
        }
        renderInput={params => (
          <TextField {...params} placeholder={`Select ${namespaceLabel.toLowerCase()}`} size="small" />
        )}
      />
    </div>
  );
}

/**
 * One catalog tag picker per namespace, driven by ``CONTENT_TAG_SCHEMA`` on the API.
 * Formik field ``tags`` remains a flat array of TagAlias IDs.
 */
const SchemaCatalogTagsField = ({
  context,
  name = 'tags',
  surface = 'all',
  className = '',
}) => {
  const [field, , helpers] = useField(name);
  const { namespaces, isLoading: schemaLoading } = useCatalogTagSchema(context);

  const tagIds = useMemo(() => {
    if (!field.value) return [];
    if (Array.isArray(field.value)) return field.value.map(Number).filter(Boolean);
    return [];
  }, [field.value]);

  const onNamespaceChange = useCallback(
    nextIds => {
      helpers.setValue(nextIds);
    },
    [helpers]
  );

  if (schemaLoading) {
    return <p className="text-sm text-gray-500">Loading tag fields…</p>;
  }

  if (!namespaces.length) {
    return <p className="text-sm text-amber-600">No tag namespaces configured for this form.</p>;
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {namespaces.map(ns => (
        <NamespaceTagPicker
          key={ns.slug}
          context={context}
          namespaceSlug={ns.slug}
          namespaceLabel={ns.label}
          requirement={ns.requirement}
          allTagIds={tagIds}
          onNamespaceChange={onNamespaceChange}
          surface={surface}
        />
      ))}
    </div>
  );
};

export default SchemaCatalogTagsField;
