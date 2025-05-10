import { Pool } from 'pg'

require('dotenv').config();

const db_config = {
    host: process.env['POSTGRES_HOST'],
    user: process.env['POSTGRES_USER'],
    password: process.env['POSTGRES_PASSWORD'],
    database: process.env['POSTGRES_DATABASE'],
    port: parseInt(process.env['POSTGRES_PORT'] || '5432'),
    max : 20,
    connectionTimeoutMillis : 5000,
    idleTimeoutMillis : 30000
  };
  

const pool = new Pool(db_config);

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

export { pool }