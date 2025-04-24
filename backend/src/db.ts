import mysql from 'mysql2/promise';

// Create a properly typed database connection pool using promise-based API
export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0410',
  database: 'hotelbooking',
  // Enable automatic conversion of MySQL date/time types to JS Date objects
  dateStrings: false,
  // Properly type query results
  typeCast: true
});

// Log connection status
db.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
  });
