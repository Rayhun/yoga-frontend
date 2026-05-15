'use client';
import SchemaCatalogTagsField from './SchemaCatalogTagsField';

/** Expert / coach profile — namespaces from ``CONTENT_TAG_SCHEMA`` (expert_type, coaching_style, …). */
const ExpertCatalogTagsField = props => (
  <SchemaCatalogTagsField context="expert_profile" surface="all" {...props} />
);

export default ExpertCatalogTagsField;
