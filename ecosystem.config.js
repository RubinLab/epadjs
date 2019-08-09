module.exports = {
  apps: [
    {
      name: 'ePADjs',
      script: 'app/node_modules/react-scripts/scripts/start.js',

      //Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      //args: 'one two',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '16G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ]
};

