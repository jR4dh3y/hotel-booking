import mysql from 'mysql2';

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0410',
  database: 'hotelbooking'
});
