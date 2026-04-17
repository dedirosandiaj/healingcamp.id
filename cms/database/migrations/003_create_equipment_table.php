<?php
/**
 * Migration: Create Equipment Table
 * Tabel untuk peralatan camping (Tenda, Sleeping Bag, Kompor, Carrier, dll)
 */

require_once __DIR__ . '/../../includes/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// SQL untuk membuat tabel equipment
$sql = "CREATE TABLE IF NOT EXISTS equipment (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_day INT(11) UNSIGNED NOT NULL DEFAULT 0,
    image VARCHAR(500) DEFAULT NULL,
    category ENUM('tenda', 'sleeping_bag', 'kompor', 'carrier', 'lampu', 'matras', 'lainnya') DEFAULT 'lainnya',
    capacity VARCHAR(50) DEFAULT NULL COMMENT 'Kapasitas (contoh: 2-8 orang, 60L)',
    stock INT(11) UNSIGNED DEFAULT 1,
    status ENUM('available', 'rented', 'maintenance') DEFAULT 'available',
    features JSON DEFAULT NULL COMMENT 'Fitur-fitur dalam format JSON',
    created_by INT(11) UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_price (price_per_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Tabel 'equipment' berhasil dibuat atau sudah ada.\n";
} else {
    echo "Error membuat tabel: " . $conn->error . "\n";
}

// Insert data equipment default
$defaultEquipment = [
    [
        'name' => 'Tenda Camping',
        'description' => 'Tenda camping berkualitas tinggi, tahan air dan angin. Cocok untuk camping di berbagai kondisi cuaca.',
        'price_per_day' => 75000,
        'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop',
        'category' => 'tenda',
        'capacity' => '2-8 orang',
        'stock' => 10,
        'features' => json_encode(['Tahan air', 'Tahan angin', 'Mudah dipasang', 'Ventilasi baik'])
    ],
    [
        'name' => 'Sleeping Bag',
        'description' => 'Sleeping bag premium dengan bahan berkualitas, tahan dingin hingga -5°C.',
        'price_per_day' => 35000,
        'image' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop',
        'category' => 'sleeping_bag',
        'capacity' => '1 orang',
        'stock' => 20,
        'features' => json_encode(['Tahan dingin -5°C', 'Bahan waterproof', 'Ringan', 'Mudah dilipat'])
    ],
    [
        'name' => 'Kompor Portable',
        'description' => 'Kompor portable include gas cartridge, praktis untuk memasak saat camping.',
        'price_per_day' => 45000,
        'image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=300&fit=crop',
        'category' => 'kompor',
        'capacity' => '1-2 burner',
        'stock' => 15,
        'features' => json_encode(['Include gas cartridge', 'Api stabil', 'Ringan', 'Aman'])
    ],
    [
        'name' => 'Carrier Backpack',
        'description' => 'Carrier backpack dengan kapasitas 60L, nyaman untuk hiking dan camping.',
        'price_per_day' => 50000,
        'image' => 'https://images.unsplash.com/photo-1533233336213-996325094ece?w=400&h=300&fit=crop',
        'category' => 'carrier',
        'capacity' => '60L',
        'stock' => 12,
        'features' => json_encode(['Kapasitas 60L', 'Waterproof cover', 'Nyaman di punggung', 'Banyak kompartemen'])
    ]
];

// Cek apakah sudah ada data
$checkResult = $conn->query("SELECT COUNT(*) as count FROM equipment");
$row = $checkResult->fetch_assoc();

if ($row['count'] == 0) {
    $stmt = $conn->prepare("INSERT INTO equipment (name, description, price_per_day, image, category, capacity, stock, features, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
    
    foreach ($defaultEquipment as $item) {
        $stmt->bind_param("ssisssis", 
            $item['name'], 
            $item['description'], 
            $item['price_per_day'], 
            $item['image'], 
            $item['category'], 
            $item['capacity'], 
            $item['stock'], 
            $item['features']
        );
        $stmt->execute();
    }
    
    echo "Data equipment default berhasil ditambahkan.\n";
    $stmt->close();
} else {
    echo "Data equipment sudah ada.\n";
}

$conn->close();
