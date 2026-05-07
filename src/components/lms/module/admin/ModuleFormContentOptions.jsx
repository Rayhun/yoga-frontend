'use client';
import Button from '@/components/common/Button';
import ModuleFormContentOption from './ModuleFormContentOption';

const ModuleFormContentOptions = ({ form, name, push, remove }) => {
  const error = form.errors?.[name];

  return (
    <div className="flex flex-col gap-3">
      {form.values?.[name]?.map((_, i) => (
        <ModuleFormContentOption
          key={`${name}-${i}`}
          name={`${name}[${i}]`}
          values={form.values?.[name]?.[i]}
          onRemove={() => remove(i)}
          allValues={form.values}
          setFieldError={form.setFieldError}
        />
      ))}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="self-start"
        onClick={() => push({ content_id: '', content_type: '', order_by: '' })}
      >
        Add Option
      </Button>

      {typeof error === 'string' ? <small className="text-xs text-red-500">{error}</small> : null}
    </div>
  );
};

export default ModuleFormContentOptions;
