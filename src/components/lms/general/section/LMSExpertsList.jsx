'use client'
import Grid from '@mui/material/Grid2';
import Avatar from '@mui/material/Avatar';

const LMSExpertsList = ({ experts = [], handleExpertClick }) => {
  return (
    <Grid container spacing={2} justifyContent="center">
      {experts.map(expert => (
        <Grid key={expert.email} size={{ xs: 12, md: 4 }}>
          <div onClick={() => handleExpertClick(expert)} className="cursor-pointer hover:bg-gray-100 flex items-center gap-4 p-4 border rounded-lg dark:border-gray-700 hover:shadow-md transition-shadow">
            <Avatar src={expert.image} alt={expert.name} />
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{expert.name}</h3>
            </div>
          </div>
        </Grid>
      ))}
    </Grid>
  );
};

export default LMSExpertsList;
