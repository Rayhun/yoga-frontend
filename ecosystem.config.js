module.exports = {
  apps: [
    {
      name: 'bali-wellness',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
