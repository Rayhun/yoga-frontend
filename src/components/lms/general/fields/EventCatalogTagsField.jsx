'use client';
import CatalogTagsField from './CatalogTagsField';

/** Catalog tag picker for guided experiences (events). */
const EventCatalogTagsField = props => (
  <CatalogTagsField context="guided_experience" surface="all" {...props} />
);

export default EventCatalogTagsField;
