import Grid from '@mui/material/Grid2';
import Avatar from '@mui/material/Avatar';

const LMSExpertsList = ({ experts = [] }) => {
  return (
    <Grid container spacing={2} justifyContent="center">
      {experts.map(expert => (
        <Grid key={expert.email} size={{ xs: 12, md: 4 }}>
          <div className="flex items-center gap-4 p-4 border rounded-lg dark:border-gray-700 hover:shadow-md transition-shadow">
            <Avatar src={expert.image} alt={expert.name} />
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{expert.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{expert.title}</p>
            </div>
          </div>
        </Grid>
      ))}
    </Grid>
  );
};

export default LMSExpertsList;
