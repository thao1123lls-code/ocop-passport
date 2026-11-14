// high-concurrency-form/src/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * CẤU HÌNH CONNECTION POOL CHO POSTGRESQL
 * Thay vì mở connection mới cho mỗi request (sẽ làm sập DB khi có nghìn request),
 * Connection Pool duy trì số lượng connection tối ưu cố định, tái sử dụng liên tục.
 */
export const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'high_concurrency_db',
  max: parseInt(process.env.DB_POOL_MAX || '25', 10), // Số connection tối đa mở tới DB
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: 5000, // Timeout nếu không lấy được connection sau 5s
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err.message);
});
