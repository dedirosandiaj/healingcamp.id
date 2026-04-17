<?php
/**
 * Migration: Create Settings Table
 * Tabel untuk pengaturan website (hero section, dll)
 */

require_once __DIR__ . '/../../includes/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// SQL untuk membuat tabel settings
$sql = "CREATE TABLE IF NOT EXISTS settings (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('text', 'image', 'number', 'boolean') DEFAULT 'text',
    description VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Tabel 'settings' berhasil dibuat atau sudah ada.\n";
} else {
    echo "Error membuat tabel: " . $conn->error . "\n";
}

// Insert data settings default untuk Hero Section
$defaultSettings = [
    [
        'setting_key' => 'hero_badge_text',
        'setting_value' => '#1 Camping Rental di Indonesia',
        'setting_type' => 'text',
        'description' => 'Teks badge di hero section'
    ],
    [
        'setting_key' => 'hero_title',
        'setting_value' => 'Sewa Alat Camping & Tempat Camping Terbaik',
        'setting_type' => 'text',
        'description' => 'Judul utama hero section'
    ],
    [
        'setting_key' => 'hero_subtitle',
        'setting_value' => 'Nikmati pengalaman camping tanpa ribet! Kami menyediakan peralatan camping berkualitas dan lokasi camping yang indah dengan harga terjangkau.',
        'setting_type' => 'text',
        'description' => 'Subtitle/deskripsi hero section'
    ],
    [
        'setting_key' => 'hero_button_primary_text',
        'setting_value' => 'Lihat Peralatan',
        'setting_type' => 'text',
        'description' => 'Teks tombol primary'
    ],
    [
        'setting_key' => 'hero_button_secondary_text',
        'setting_value' => 'Jelajahi Lokasi',
        'setting_type' => 'text',
        'description' => 'Teks tombol secondary'
    ],
    [
        'setting_key' => 'hero_image',
        'setting_value' => 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=600&fit=crop',
        'setting_type' => 'image',
        'description' => 'Gambar hero section (URL atau path lokal)'
    ],
    [
        'setting_key' => 'hero_quality_badge_title',
        'setting_value' => 'Kualitas Terjamin',
        'setting_type' => 'text',
        'description' => 'Judul badge kualitas'
    ],
    [
        'setting_key' => 'hero_quality_badge_subtitle',
        'setting_value' => 'Peralatan Premium',
        'setting_type' => 'text',
        'description' => 'Subtitle badge kualitas'
    ],
    [
        'setting_key' => 'hero_rating_badge_title',
        'setting_value' => 'Rating 4.9',
        'setting_type' => 'text',
        'description' => 'Judul badge rating'
    ],
    [
        'setting_key' => 'hero_rating_badge_subtitle',
        'setting_value' => 'Dari 2000+ Review',
        'setting_type' => 'text',
        'description' => 'Subtitle badge rating'
    ]
];

// Cek apakah sudah ada data
$checkResult = $conn->query("SELECT COUNT(*) as count FROM settings");
$row = $checkResult->fetch_assoc();

if ($row['count'] == 0) {
    $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)");
    
    foreach ($defaultSettings as $setting) {
        $stmt->bind_param("ssss", 
            $setting['setting_key'], 
            $setting['setting_value'], 
            $setting['setting_type'],
            $setting['description']
        );
        $stmt->execute();
    }
    
    echo "Data settings default berhasil ditambahkan.\n";
    $stmt->close();
} else {
    echo "Data settings sudah ada.\n";
}

$conn->close();
