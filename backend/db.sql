CREATE DATABASE IF NOT EXISTS hotelbooking;
USE hotelbooking;

CREATE TABLE hotels (
    hotel_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    hotel_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    rating INT NOT NULL
);

CREATE TABLE room_types (
    room_type_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    room_type VARCHAR(50) NOT NULL
);

CREATE TABLE rooms (
    room_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    room_number INT NOT NULL,
    hotel_id INT NOT NULL,
    room_type_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability ENUM('available', 'booked') NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id),
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id)
);

CREATE TABLE amenities (
    amenity_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    amenity_name VARCHAR(50) NOT NULL
);

CREATE TABLE room_type_amenities (
    room_type_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (room_type_id, amenity_id),
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id),
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id)
);

CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE booking (
    booking_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    payment_status ENUM('paid', 'unpaid') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

CREATE TABLE payment (
    payment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_status ENUM('paid', 'unpaid') NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
);


-- Insert sample data into hotels table
INSERT INTO hotels (hotel_name, location, rating) VALUES
('Grand Palace', 'New York, NY', 5),
('Ocean Breeze', 'Miami, FL', 4),
('Mountain Retreat', 'Denver, CO', 3),
('City Lights', 'Chicago, IL', 4);

-- Insert sample data into room_types table
INSERT INTO room_types (room_type) VALUES
('Single'),
('Double'),
('Suite'),
('Deluxe');

-- Insert sample data into rooms table
INSERT INTO rooms (room_number, hotel_id, room_type_id, price, availability) VALUES
-- Grand Palace (8 rooms)
(101, 1, 1, 100.00, 'available'),
(102, 1, 1, 100.00, 'available'),
(201, 1, 2, 150.00, 'booked'),
(202, 1, 2, 150.00, 'available'),
(301, 1, 3, 250.00, 'available'),
(302, 1, 3, 250.00, 'booked'),
(401, 1, 4, 350.00, 'available'),
(402, 1, 4, 350.00, 'available'),
-- Ocean Breeze (8 rooms)
(101, 2, 1, 90.00, 'available'),
(102, 2, 1, 90.00, 'booked'),
(201, 2, 2, 140.00, 'available'),
(202, 2, 2, 140.00, 'available'),
(301, 2, 3, 220.00, 'available'),
(302, 2, 3, 220.00, 'available'),
(401, 2, 4, 320.00, 'booked'),
(402, 2, 4, 320.00, 'available'),
-- Mountain Retreat (7 rooms)
(101, 3, 1, 80.00, 'available'),
(102, 3, 1, 80.00, 'available'),
(201, 3, 2, 120.00, 'booked'),
(202, 3, 2, 120.00, 'available'),
(301, 3, 3, 200.00, 'available'),
(302, 3, 3, 200.00, 'available'),
(401, 3, 4, 280.00, 'available'),
-- City Lights (7 rooms)
(101, 4, 1, 95.00, 'available'),
(102, 4, 1, 95.00, 'booked'),
(201, 4, 2, 145.00, 'available'),
(202, 4, 2, 145.00, 'available'),
(301, 4, 3, 230.00, 'available'),
(302, 4, 3, 230.00, 'booked'),
(401, 4, 4, 330.00, 'available');

-- Insert sample data into amenities table
INSERT INTO amenities (amenity_name) VALUES
('WiFi'),
('Mini Bar'),
('Room Service'),
('Gym Access'),
('Spa');

-- Insert sample data into room_type_amenities table
INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES
(1, 1), -- Single: WiFi
(2, 1), -- Double: WiFi
(2, 2), -- Double: Mini Bar
(3, 1), -- Suite: WiFi
(3, 2), -- Suite: Mini Bar
(3, 3), -- Suite: Room Service
(4, 1), -- Deluxe: WiFi
(4, 2), -- Deluxe: Mini Bar
(4, 3), -- Deluxe: Room Service
(4, 4), -- Deluxe: Gym Access
(4, 5); -- Deluxe: Spa

-- Insert sample data into users table
INSERT INTO users (name, email, role, password) VALUES
('John Doe', 'john@example.com', 'user', 'password123'),
('Jane Smith', 'jane@example.com', 'user', 'password456'),
('Admin User', 'admin@example.com', 'admin', 'adminpass'),
('Alice Brown', 'alice@example.com', 'user', 'password789');

-- Insert sample data into booking table
INSERT INTO booking (user_id, room_id, check_in_date, check_out_date, payment_status) VALUES
(1, 3, '2025-05-01', '2025-05-03', 'paid'),
(2, 6, '2025-05-10', '2025-05-12', 'unpaid'),
(1, 10, '2025-05-15', '2025-05-17', 'paid'),
(4, 15, '2025-05-20', '2025-05-22', 'unpaid');

-- Insert sample data into payment table
INSERT INTO payment (booking_id, amount, payment_date, payment_status) VALUES
(1, 300.00, '2025-04-30', 'paid'),
(3, 180.00, '2025-05-14', 'paid');