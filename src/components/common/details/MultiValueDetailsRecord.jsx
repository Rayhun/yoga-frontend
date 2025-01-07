import Chip from '@mui/material/Chip';
import DetailsRecord from './DetailsRecord';

const MultiValueDetailsRecord = ({ label, data = [], getChipLabel = () => null }) => (
  <DetailsRecord label={label}>
    <div className="flex gap-2">
      {data.map((item, i) => (
        <Chip
          key={i}
          label={getChipLabel(item)}
          className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
        />
      ))}
    </div>
  </DetailsRecord>
);

export default MultiValueDetailsRecord;
