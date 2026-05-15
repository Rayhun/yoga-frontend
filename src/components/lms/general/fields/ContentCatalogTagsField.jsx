'use client';
import SchemaCatalogTagsField from './SchemaCatalogTagsField';

/** Program / module / session / quiz — one picker per namespace per ``CONTENT_TAG_SCHEMA``. */
const ContentCatalogTagsField = ({ context, ...props }) => (
  <SchemaCatalogTagsField context={context} surface="all" {...props} />
);

export default ContentCatalogTagsField;
