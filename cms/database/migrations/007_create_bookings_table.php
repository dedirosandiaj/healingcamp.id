<?php
/**
 * Migration: Create Bookings Table
 * Tabel untuk booking/pemesanan
 */

require_once __DIR__ . '/../../includes/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// SQL untuk membuat tabel bookings
$sql = "CREATE TABLE IF NOT EXISTS bookings (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Kode booking unik',
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) DEFAULT NULL,
    booking_type ENUM('equipment', 'location', 'package') NOT NULL,
    item_id INT(11) UNSIGNED NOT NULL COMMENT 'ID dari equipment/locations/packages',
    quantity INT(11) UNSIGNED DEFAULT 1,
    check_in DATE NOT NULL,
    check_out DATE DEFAULT NULL,
    total_price INT(11) UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_booking_code (booking_code),
    INDEX idx_status (status),
    INDEX idx_booking_type (booking_type),
    INDEX idx_check_in (check_in)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Tabel 'bookings' berhasil dibuat atau sudah ada.\n";
} else {
    echo "Error membuat tabel: " . $conn->error . "\n";
}

// Insert data booking contoh
$sampleBookings = [
    [
        'booking_code' => 'HC' . date('Ymd') . '001',
        'customer_name' => 'Ahmad Fauzi',
        'customer_email' => 'ahmad@example.com',
        'customer_phone' => '081234567890',
        'booking_type' => 'equipment',
        'item_id' => 1,
        'quantity' => 2,
        'check_in' => date('Y-m-d', strtotime('+3 days')),
        'check_out' => date('Y-m-d', strtotime('+5 days')),
        'total_price' => 150000,
        'status' => 'confirmed',
        'notes' => 'Booking untuk camping keluarga'
    ],
    [
        'booking_code' => 'HC' . date('Ymd') . '002',
        'customer_name' => 'Rina Wulandari',
        'customer_email' => 'rina@example.com',
        'customer_phone' => '082345678901',
        'booking_type' => 'location',
        'item_id' => 3,
        'quantity' => 1,
        'check_in' => date('Y-m-d', strtotime('+7 days')),
        'check_out' => date('Y-m-d', strtotime('+8 days')),
        'total_price' => 100000,
        'status' => 'pending',
        'notes' => 'Mau lihat rusa'
    ]
];

// Cek apakah sudah ada data
$checkResult = $conn->query("SELECT COUNT(*) as count FROM bookings");
$row = $checkResult->fetch_assoc();

if ($row['count'] == 0) {
    $stmt = $conn->prepare("INSERT INTO bookings (booking_code, customer_name, customer_email, customer_phone, booking_type, item_id, quantity, check_in, check_out, total_price, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($sampleBookings as $booking) {
        $stmt->bind_param("sssssiississ", 
            $booking['booking_code'], 
            $booking['customer_name'], 
            $booking['customer_email'], 
            $booking['customer_phone'], 
            $booking['booking_type'], 
            $booking['item_id'], 
            $booking['quantity'], 
            $booking['check_in'], 
            $booking['check_out'], 
            $booking['total_price'], 
            $booking['status'],
            $booking['notes']
        );
        $stmt->execute();
    }
    
    echo "Data booking contoh berhasil ditambahkan.\n";
    $stmt->close();
} else {
    echo "Data booking sudah ada.\n";
}

$conn->close();
