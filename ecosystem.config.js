module.exports = {
  apps: [{
    name: 'studo-admin',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/jibreel-electrinic',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 5000
  }]
}