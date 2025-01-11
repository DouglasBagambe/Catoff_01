module.exports = {
  apps: [
    {
      name: "gaming-integration",
      script: "dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 80,
      },
      watch: false,
      max_memory_restart: "1G",
      error_file: "logs/error.log",
      out_file: "logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
