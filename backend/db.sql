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

insert into hotelbooking.hotels (hotel_name, location, rating) values
('Hotel Sunshine', 'New York', 5),
('Ocean View Resort', 'Miami', 4),
('Mountain Retreat', 'Denver', 3),
('City Center Inn', 'Los Angeles', 4),
('Desert Oasis', 'Phoenix', 5);

insert into hotelbooking.room_types (room_type) values
('Single'),
('Double'),
('Suite'),
('Deluxe'),
('Family');

insert into hotelbooking.rooms (room_number, hotel_id, room_type_id, price, availability) values
(101, 1, 1, 1500.00, 'available'),
(102, 1, 2, 2000.00, 'available'),
(201, 2, 3, 2500.00, 'booked'),
(202, 2, 4, 3000.00, 'available'),
(301, 3, 5, 3500.00, 'available');

insert into hotelbooking.amenities (amenity_name) values
('Free Wi-Fi'),
('Swimming Pool'),
('Gym'),
('Spa'),
('Restaurant');

insert into hotelbooking.room_type_amenities (room_type_id, amenity_id) values
(1, 1),
(1, 2),
(2, 3),
(2, 4),
(3, 5),
(4, 1),
(4, 2),
(5, 3);

insert into hotelbooking.users (name, email, role, password) values
('admin', 'admin@eg.com', 'admin', 'admin123'),
('user', 'user@example.com', 'user', 'user123');

insert into hotelbooking.booking (user_id, room_id, check_in_date, check_out_date, payment_status) values
(1, 1, '2023-10-01', '2023-10-05', 'paid'),
(2, 2, '2023-10-02', '2023-10-06', 'unpaid'),
(1, 3, '2023-10-03', '2023-10-07', 'paid');

insert into hotelbooking.payment (booking_id, amount, payment_date, payment_status) values
(1, 1500.00, '2023-10-01', 'paid'),
(2, 2000.00, '2023-10-02', 'unpaid'),
(3, 2500.00, '2023-10-03', 'paid');


