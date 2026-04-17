<?php
/**
 * Migration: Create Testimonials Table
 * Tabel untuk testimoni pelanggan
 */

require_once __DIR__ . '/../../includes/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// SQL untuk membuat tabel testimonials
$sql = "CREATE TABLE IF NOT EXISTS testimonials (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    text TEXT NOT NULL,
    image VARCHAR(500) DEFAULT NULL,
    rating INT(1) DEFAULT 5,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_by INT(11) UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Tabel 'testimonials' berhasil dibuat atau sudah ada.\n";
} else {
    echo "Error membuat tabel: " . $conn->error . "\n";
}

// Insert data testimoni default
$defaultTestimonials = [
    [
        'name' => 'Sarah Amalia',
        'location' => 'Jakarta',
        'text' => 'Peralatannya lengkap dan bersih! Tenda yang saya sewa sangat kuat meskipun hujan deras. Recommended banget!',
        'image' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        'rating' => 5
    ],
    [
        'name' => 'Budi Santoso',
        'location' => 'Bandung',
        'text' => 'Lokasi camping di Ranca Upas sangat indah. Proses booking mudah dan staff sangat helpful. Pasti akan balik lagi!',
        'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        'rating' => 5
    ],
    [
        'name' => 'Dewi Lestari',
        'location' => 'Surabaya',
        'text' => 'Paket group-nya sangat worth it! Dapat semua perlengkapan lengkap dengan harga terjangkau. Teman-teman saya juga puas!',
        'image' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        'rating' => 5
    ]
];

// Cek apakah sudah ada data
$checkResult = $conn->query("SELECT COUNT(*) as count FROM testimonials");
$row = $checkResult->fetch_assoc();

if ($row['count'] == 0) {
    $stmt = $conn->prepare("INSERT INTO testimonials (name, location, text, image, rating, created_by) VALUES (?, ?, ?, ?, ?, 1)");
    
    foreach ($defaultTestimonials as $testi) {
        $stmt->bind_param("ssssi", 
            $testi['name'], 
            $testi['location'], 
            $testi['text'], 
            $testi['image'], 
            $testi['rating']
        );
        $stmt->execute();
    }
    
    echo "Data testimoni default berhasil ditambahkan.\n";
    $stmt->close();
} else {
    echo "Data testimoni sudah ada.\n";
}

$conn->close();
