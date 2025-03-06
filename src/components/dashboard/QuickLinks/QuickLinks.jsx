import Chip from '@mui/material/Chip';

const ITEMS = [
  { label: 'Yoga', key: 'yoga', isActive: true },
  { label: 'Sleep', key: 'sleep' },
  { label: 'Anxiety', key: 'anxiety' },
  { label: 'Yoga', key: 'yoga' },
  { label: 'Sleep', key: 'sleep' },
  { label: 'Anxiety', key: 'anxiety' },
  { label: 'Yoga', key: 'yoga' },
  { label: 'Sleep', key: 'sleep' },
  { label: 'Anxiety', key: 'anxiety' },
  { label: 'Yoga', key: 'yoga' },
  { label: 'Sleep', key: 'sleep' },
  { label: 'Anxiety', key: 'anxiety' },
  { label: 'Yoga', key: 'yoga' },
  { label: 'Sleep', key: 'sleep' },
  { label: 'Anxiety', key: 'anxiety' },
  { label: 'Yoga', key: 'yoga' },
  { label: 'Sleep', key: 'sleep' },
  { label: 'Anxiety', key: 'anxiety' },
  { label: 'Yoga', key: 'yoga' },
  { label: 'Sleep', key: 'sleep' },
  { label: 'Anxiety', key: 'anxiety' },
];

const QuickLinks = () => {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{'Quick Links'}</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {ITEMS.map(item => (
          <Chip
            key={item.key}
            variant={item.isActive ? "filled" : "outlined"}
            color='primary'
            onClick={() => console.log(item.label)}
            label={item?.label}
            className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-gray-300"
          />
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
