'use client';
import {
  MdDragIndicator,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from 'react-icons/md';

const SortableRowControls = ({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
}) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div
      className={`flex shrink-0 flex-col items-center gap-0.5 self-center rounded-md border px-1 py-1 ${
        isDragging ? 'border-primary bg-primary/5 opacity-60' : 'border-stroke dark:border-strokedark'
      } ${isDragOver ? 'ring-2 ring-primary ring-offset-1' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <button
        type="button"
        className="cursor-grab p-0.5 text-body hover:text-primary active:cursor-grabbing"
        title="Drag to reorder"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <MdDragIndicator size={20} />
      </button>
      <span className="text-xs font-medium text-body">#{index + 1}</span>
      <button
        type="button"
        onClick={onMoveUp}
        disabled={isFirst}
        className="p-0.5 text-body hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        title="Move up"
      >
        <MdKeyboardArrowUp size={18} />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={isLast}
        className="p-0.5 text-body hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        title="Move down"
      >
        <MdKeyboardArrowDown size={18} />
      </button>
    </div>
  );
};

export default SortableRowControls;
