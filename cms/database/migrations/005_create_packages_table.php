<?php
/**
 * Migration: Create Packages Table
 * Tabel untuk paket camping (Paket Solo, Couple, Group)
 */

require_once __DIR__ . '/../../includes/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// SQL untuk membuat tabel packages
$sql = "CREATE TABLE IF NOT EXISTS packages (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT(11) UNSIGNED NOT NULL DEFAULT 0,
    icon VARCHAR(50) DEFAULT 'fa-box',
    person_count INT(11) UNSIGNED DEFAULT 1 COMMENT 'Jumlah orang',
    duration VARCHAR(50) DEFAULT '1 malam' COMMENT 'Durasi (contoh: 1 malam, 2 hari 1 malam)',
    includes JSON DEFAULT NULL COMMENT 'Item yang termasuk dalam paket (JSON)',
    is_popular TINYINT(1) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_by INT(11) UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_popular (is_popular),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Tabel 'packages' berhasil dibuat atau sudah ada.\n";
} else {
    echo "Error membuat tabel: " . $conn->error . "\n";
}

// Insert data paket default
$defaultPackages = [
    [
        'name' => 'Paket Solo',
        'description' => 'Paket lengkap untuk solo traveler yang ingin menikmati pengalaman camping sendiri.',
        'price' => 199000,
        'icon' => 'fa-user',
        'person_count' => 1,
        'duration' => '1 malam',
        'includes' => json_encode(['Tenda 2 orang', 'Sleeping bag', 'Lampu tenda', 'Matras']),
        'is_popular' => 0
    ],
    [
        'name' => 'Paket Couple',
        'description' => 'Paket romantis untuk 2 orang, cocok untuk pasangan yang ingin camping bersama.',
        'price' => 349000,
        'icon' => 'fa-users',
        'person_count' => 2,
        'duration' => '1 malam',
        'includes' => json_encode(['Tenda 4 orang', '2 Sleeping bag', 'Kompor + gas', '2 Matras', 'Lampu tenda']),
        'is_popular' => 1
    ],
    [
        'name' => 'Paket Group',
        'description' => 'Paket hemat untuk grup 4-8 orang, perfect untuk camping bersama teman atau keluarga.',
        'price' => 699000,
        'icon' => 'fa-user-friends',
        'person_count' => 8,
        'duration' => '1 malam',
        'includes' => json_encode(['Tenda 8 orang', '4-8 Sleeping bag', 'Kompor + gas', 'Meja lipat', 'Lampu & matras']),
        'is_popular' => 0
    ]
];

// Cek apakah sudah ada data
$checkResult = $conn->query("SELECT COUNT(*) as count FROM packages");
$row = $checkResult->fetch_assoc();

if ($row['count'] == 0) {
    $stmt = $conn->prepare("INSERT INTO packages (name, description, price, icon, person_count, duration, includes, is_popular, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($defaultPackages as $pkg) {
        $created_by = 1;
        $stmt->bind_param("ssisisisi", 
            $pkg['name'], 
            $pkg['description'], 
            $pkg['price'], 
            $pkg['icon'], 
            $pkg['person_count'], 
            $pkg['duration'], 
            $pkg['includes'], 
            $pkg['is_popular'],
            $created_by
        );
        $stmt->execute();
    }
    
    echo "Data paket default berhasil ditambahkan.\n";
    $stmt->close();
} else {
    echo "Data paket sudah ada.\n";
}

$conn->close();
