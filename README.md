# hotel-booking
(collage project) a hotel booking website built with svelte and mysql

## Technologies Used
- Frontend: Svelte
- Backend: Node.js, Express.js
- Database: MySQL

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/jr4dh3y/hotel-booking/
   ```
2. Navigate to the project directory:
   ```bash
    cd hotel-booking
    ```
3. Install the dependencies for both the frontend and backend:
   ```bash
   npm install
   ```
4. Set up the database:
    - Create a MySQL database and import the `db.sql` file located in the `backend/mysql-query` directory.
    - Update the database connection details in the `db.js` file in the `backend` directory.

5. Start the application:
   ```bash
   npm start
   ```
    - This will start both the frontend and backend servers.

- Note: 
    1. The backend server will be running on `http://localhost:3000` by default.
    2. You can change the port in the `backend/server.js` file if needed.
    3. Make sure to have MySQL server running and the database created before starting the backend server.

## Screenshots

<table>
  <tr>
    <td><img src="ss/landing.png" alt="Landing Page" width="350"/></td>
    <td><img src="ss/profile.png" alt="User Profile" width="350"/></td>
  </tr>
  <tr>
    <td><img src="ss/hotels.png" alt="Hotels List" width="350"/></td>
    <td><img src="ss/hotel-rooms.png" alt="Hotel Rooms" width="350"/></td>
  </tr>
  <tr>
    <td><img src="ss/rooms.png" alt="Rooms List" width="350"/></td>
    <td><img src="ss/payment.png" alt="Payment Page" width="350"/></td>
  </tr>
  <tr>
    <td><img src="ss/adm_users.png" alt="Admin Users" width="350"/></td>
    <td><img src="ss/adm_dash.png" alt="Admin Dashboard" width="350"/></td>
  </tr>
  <tr>
    <td><img src="ss/adm_bookings.png" alt="Admin Bookings" width="350"/></td>
    <td><img src="ss/adm_rooms.png" alt="Admin Rooms" width="350"/></td>
  </tr>
  <tr>
    <td><img src="ss/lonin.png" alt="Login Page" width="350"/></td>
    <td><img src="ss/register.png" alt="Register Page" width="350"/></td>
  </tr>
</table>
