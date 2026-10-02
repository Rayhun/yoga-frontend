'use client';
import { useState } from 'react';
import Button from '@/components/common/Button';
import { reorderList } from '@/utils/reorderList';
import ModuleFormContentOption from './ModuleFormContentOption';

const ModuleFormContentOptions = ({ form, name, push, remove }) => {
  const error = form.errors?.[name];
  const items = form.values?.[name] || [];
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleReorder = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    form.setFieldValue(name, reorderList(items, fromIndex, toIndex));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const fromIndex = draggedIndex ?? Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(fromIndex)) {
      handleReorder(fromIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <ModuleFormContentOption
          key={`${name}-${i}-${item.content_id || 'new'}`}
          name={`${name}[${i}]`}
          index={i}
          total={items.length}
          values={item}
          onRemove={() => remove(i)}
          onMoveUp={() => handleReorder(i, i - 1)}
          onMoveDown={() => handleReorder(i, i + 1)}
          onDragStart={e => handleDragStart(e, i)}
          onDragOver={e => handleDragOver(e, i)}
          onDrop={e => handleDrop(e, i)}
          onDragEnd={handleDragEnd}
          isDragging={draggedIndex === i}
          isDragOver={dragOverIndex === i && draggedIndex !== i}
        />
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

export default ModuleFormContentOptions;
