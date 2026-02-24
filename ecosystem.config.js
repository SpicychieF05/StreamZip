module.exports = {
    apps: [
        {
            name: 'streamzip-backend',
            cwd: './backend',
            script: 'src/server.js',
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true
        },
        {
            name: 'streamzip-frontend',
            cwd: './frontend',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3001',
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },
            error_file: './logs/frontend-error.log',
            out_file: './logs/frontend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true
        }
    ]
};
