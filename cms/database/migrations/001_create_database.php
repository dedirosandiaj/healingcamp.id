<?php
/**
 * Migration: Create Database healingcamp_cms
 * Run this file first to create the database
 */

require_once __DIR__ . '/../../includes/config.php';

// Koneksi tanpa database (untuk membuat database)
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Database '" . DB_NAME . "' berhasil dibuat atau sudah ada.\n";
} else {
    echo "Error membuat database: " . $conn->error . "\n";
}

$conn->close();
