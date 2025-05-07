# Hotel Booking System - Detailed Project Documentation

## Project Overview

This is a comprehensive hotel booking system that allows users to browse hotels, view room availability, make bookings, and manage their reservations. It's built as a full-stack web application with separate frontend and backend components, connected to a MySQL database.

## Technology Stack

### Frontend
- **Framework**: Svelte/SvelteKit 5.0
- **Language**: TypeScript
- **Styling**: CSS (custom styling with variables)
- **Build Tool**: Vite
- **API Communication**: Native fetch API
- **State Management**: Svelte stores
- **Routing**: SvelteKit file-based routing

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript
- **Database Driver**: mysql2 (promise-based)
- **Development Tools**: ts-node-dev

### Database
- **Database System**: MySQL
- **Schema**: Normalized relational database design
- **Stored Procedures**: For complex operations like booking creation and payment processing

## Project Structure

```
hotel-booking/
├── frontend/           # SvelteKit frontend application
│   ├── src/
│   │   ├── app.css     # Global styles
│   │   ├── lib/        # Shared libraries
│   │   │   ├── api.ts  # API client functions
│   │   │   └── stores/ # Svelte stores (auth)
│   │   └── routes/     # Application routes
│   │       ├── +layout.svelte   # App layout with nav/footer
│   │       ├── +page.svelte     # Homepage
│   │       ├── hotels/          # Hotel listing & details
│   │       ├── rooms/           # Room listing
│   │       ├── booking/         # Booking creation
│   │       ├── payment/         # Payment processing
│   │       ├── profile/         # User profile & bookings
│   │       └── login/           # Authentication
│   └── static/         # Static assets
├── backend/            # Express.js backend API
│   ├── src/
│   │   ├── index.ts    # Server entry point
│   │   ├── db.ts       # Database connection
│   │   └── routes/     # API routes
│   │       ├── auth.ts         # Authentication endpoints
│   │       ├── bookings.ts     # Booking operations
│   │       ├── hotels.ts       # Hotel listing & details
│   │       ├── payments.ts     # Payment processing
│   │       ├── rooms.ts        # Room operations
│   │       └── room-types.ts   # Room type information
│   └── mysql-query/    # SQL scripts
│       └── db.sql      # Database schema and seed data
└── package.json        # Root workspace configuration
```

## Database Schema

The database consists of interconnected tables:

- **hotels**: Contains hotel information (name, location, rating)
- **rooms**: Individual rooms with details (room number, price, availability)
- **room_types**: Categories of rooms (Single, Double, Suite, Deluxe)
- **amenities**: Available amenities (WiFi, Mini Bar, etc.)
- **room_type_amenities**: Junction table linking room types to amenities
- **users**: User accounts with authentication info
- **booking**: Reservation records linking users to rooms
- **payment**: Payment details for bookings

## Key Features

### User Authentication
- Registration with name, email, and password
- Login functionality with secure session management
- Role-based access (admin vs. regular users)

### Hotel & Room Management
- Browse hotels with filtering by location and rating
- View detailed hotel information with available rooms
- Filter rooms by hotel, room type, and amenities

### Booking System
- Create new bookings with check-in/check-out dates
- Real-time availability updates
- Booking summary and confirmation
- View upcoming and past bookings in user profile

### Payment Processing
- Integrated payment flow
- Payment status tracking (paid vs. unpaid)
- Booking status updates based on payment

### User Dashboard
- View and manage all bookings
- Booking statistics (total, upcoming, completed)
- Cancel existing bookings

## Frontend Routes

1. **Home (/)**: Landing page with featured content
2. **Hotels (/hotels)**: List all hotels with search and filtering
3. **Hotel Details (/hotels/[id])**: Detailed view of a specific hotel with its rooms
4. **Rooms (/rooms)**: Browse all available rooms across all hotels
5. **Booking (/booking/[id])**: Create a booking for a specific room
6. **Payment (/payment/[id])**: Process payment for a booking
7. **Login (/login)**: Authentication page with login and registration
8. **Profile (/profile)**: User dashboard showing bookings and account info

## API Endpoints

### Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration

### Hotels
- `GET /api/hotels`: Get all hotels
- `GET /api/hotels/:id`: Get specific hotel details
- `GET /api/hotels/:id/rooms`: Get rooms for a specific hotel

### Rooms
- `GET /api/rooms`: Get all rooms
- `GET /api/rooms/hotel/:id`: Get rooms by hotel ID

### Room Types
- `GET /api/room-types`: Get all room types
- `GET /api/room-types/:id`: Get room type with amenities

### Bookings
- `GET /api/bookings`: Get all bookings (admin)
- `GET /api/bookings/user/:id`: Get bookings for a specific user
- `POST /api/bookings`: Create a new booking
- `DELETE /api/bookings/:id`: Cancel a booking

### Payments
- `POST /api/payments`: Process a payment
- `GET /api/payments/booking/:id`: Get payment status for a booking

## Database Operations

### Stored Procedures
1. **CreateBooking**: Creates a new booking and updates room availability
2. **CancelBooking**: Removes a booking and restores room availability
3. **ProcessPayment**: Records a payment and updates booking status
4. **SyncPaymentStatus**: Updates booking payment status based on payment records

## Data Flow

1. User browses hotels and rooms through the frontend
2. When making a booking, frontend calls the booking API
3. Backend validates the request and calls the CreateBooking stored procedure
4. Database creates the booking record and updates room availability
5. Frontend redirects to payment page
6. On payment submission, frontend calls payment API
7. Backend processes payment and updates booking status
8. User can view and manage bookings in their profile

## State Management

The application uses Svelte stores to manage:
- User authentication state
- Cross-component shared data
- Persistent local storage for user sessions

## Responsive Design

The UI is fully responsive with:
- Flexible grid layouts
- Mobile-friendly navigation
- Responsive typography and spacing
- CSS variables for consistent theming

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd hotel-booking
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database setup**:
   - Create a MySQL database named "hotelbooking"
   - Import the schema from [`backend/mysql-query/db.sql`](backend/mysql-query/db.sql )
   - Update database connection details in [`backend/src/db.ts`](backend/src/db.ts ) if needed

4. **Start the development servers**:
   ```bash
   npm start
   ```
   This will start both the frontend (port 5173) and backend (port 3000) servers concurrently.

## Development Workflow

- Frontend development server runs on http://localhost:5173
- Backend API runs on http://localhost:3000
- Changes to frontend files automatically reload in the browser
- Backend uses ts-node-dev to auto-restart on file changes

## Testing

The application includes end-to-end user flows:
1. User registration and login
2. Browsing hotels and rooms
3. Creating a booking
4. Processing payment
5. Viewing and canceling bookings

## Deployment Considerations

- Frontend can be built with `cd frontend && npm run build`
- Backend can be compiled with TypeScript and run with Node.js
- Database should be set up with the provided schema
- Environment variables should be used for sensitive information

## Future Enhancements

1. **Admin Dashboard**: For managing hotels, rooms, and bookings
2. **Advanced Search**: With date range availability filtering
3. **User Reviews**: Allow users to review hotels and rooms
4. **Email Notifications**: For booking confirmations and reminders
5. **Advanced Payment Methods**: Integration with payment gateways
6. **Multi-language Support**: Internationalization for global users

## Security Features

1. Password protection for user accounts
2. Session-based authentication
3. Input validation and error handling
4. Database transaction integrity
5. API security measures

This hotel booking application demonstrates a complete full-stack architecture with modern web technologies and follows best practices for separation of concerns, data management, and user experience.