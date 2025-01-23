'use client';
import Button from '@/components/common/Button';
import ProgramFormContentOption from './ProgramFormContentOption';

const ProgramFormContentOptions = ({ form, name, push, remove }) => {
  const error = form.errors?.[name];

  return (
    <div className="flex flex-col gap-3">
      {form.values?.[name]?.map((_, i) => (
        <ProgramFormContentOption key={i} name={`${name}[${i}]`} onRemove={() => remove(i)} />
      ))}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="self-start"
        onClick={() => push({ content_id: '', content_type: '' })}
      >
        Add Option
      </Button>

      {typeof error === 'string' ? <small className="text-xs text-red-500">{error}</small> : null}
    </div>
  );
};

export default ProgramFormContentOptions;
