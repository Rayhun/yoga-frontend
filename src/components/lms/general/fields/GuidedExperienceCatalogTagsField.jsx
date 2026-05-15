'use client';
import SchemaCatalogTagsField from './SchemaCatalogTagsField';

/** Guided experience / group coaching events — format, goal, modality, … per schema. */
const GuidedExperienceCatalogTagsField = props => (
  <SchemaCatalogTagsField context="guided_experience" surface="all" {...props} />
);

export default GuidedExperienceCatalogTagsField;
