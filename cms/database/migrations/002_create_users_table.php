<?php
/**
 * Migration: Create Users Table
 */

require_once __DIR__ . '/../../includes/config.php';

// Koneksi dengan database
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// SQL untuk membuat tabel users
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role ENUM('admin', 'editor', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    avatar VARCHAR(255) DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Tabel 'users' berhasil dibuat atau sudah ada.\n";
} else {
    echo "Error membuat tabel: " . $conn->error . "\n";
}

// Insert user admin default (password: admin123)
$username = 'admin';
$email = 'admin@healingcamp.id';
$password = password_hash('admin123', PASSWORD_BCRYPT);
$nama = 'Administrator';
$role = 'admin';

$check_sql = "SELECT id FROM users WHERE username = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("s", $username);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    $insert_sql = "INSERT INTO users (username, email, password, nama, role, status) VALUES (?, ?, ?, ?, ?, 'active')";
    $insert_stmt = $conn->prepare($insert_sql);
    $insert_stmt->bind_param("sssss", $username, $email, $password, $nama, $role);
    
    if ($insert_stmt->execute()) {
        echo "User admin default berhasil dibuat.\n";
        echo "Username: admin\n";
        echo "Password: admin123\n";
    } else {
        echo "Error membuat user admin: " . $insert_stmt->error . "\n";
    }
    $insert_stmt->close();
} else {
    echo "User admin sudah ada.\n";
}

$check_stmt->close();
$conn->close();
