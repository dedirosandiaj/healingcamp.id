<?php
/**
 * Migration: Create Locations Table
 * Tabel untuk lokasi camping (Gunung Bromo, Danau Toba, Ranca Upas, dll)
 */

require_once __DIR__ . '/../../includes/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// SQL untuk membuat tabel locations
$sql = "CREATE TABLE IF NOT EXISTS locations (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL COMMENT 'Wilayah (contoh: Jawa Timur, Bandung)',
    description TEXT,
    price_per_night INT(11) UNSIGNED NOT NULL DEFAULT 0,
    image VARCHAR(500) DEFAULT NULL,
    rating DECIMAL(2,1) DEFAULT 5.0,
    reviews_count INT(11) UNSIGNED DEFAULT 0,
    facilities JSON DEFAULT NULL COMMENT 'Fasilitas dalam format JSON',
    coordinates VARCHAR(100) DEFAULT NULL COMMENT 'Koordinat GPS',
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_by INT(11) UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_region (region),
    INDEX idx_status (status),
    INDEX idx_rating (rating),
    INDEX idx_price (price_per_night)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Tabel 'locations' berhasil dibuat atau sudah ada.\n";
} else {
    echo "Error membuat tabel: " . $conn->error . "\n";
}

// Insert data lokasi default
$defaultLocations = [
    [
        'name' => 'Gunung Bromo',
        'region' => 'Jawa Timur',
        'description' => 'Nikmati keindahan sunrise di Gunung Bromo dengan pemandangan lautan pasir yang spektakuler. Lokasi camping dengan fasilitas lengkap.',
        'price_per_night' => 150000,
        'image' => 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&h=400&fit=crop',
        'rating' => 4.9,
        'reviews_count' => 320,
        'facilities' => json_encode(['Toilet umum', 'Area parkir', 'Tempat api unggun', 'Mushola', 'Warung makan']),
        'coordinates' => '-7.9425, 112.9530'
    ],
    [
        'name' => 'Danau Toba',
        'region' => 'Sumatera Utara',
        'description' => 'Camping di tepi Danau Toba terbesar di Asia Tenggara. Pemandangan danau yang indah dan udara sejuk.',
        'price_per_night' => 120000,
        'image' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop',
        'rating' => 4.8,
        'reviews_count' => 280,
        'facilities' => json_encode(['Toilet umum', 'Area parkir', 'Pemandian air panas', 'Restoran', 'Penyewaan perahu']),
        'coordinates' => '2.6847, 98.6381'
    ],
    [
        'name' => 'Ranca Upas',
        'region' => 'Bandung, Jawa Barat',
        'description' => 'Camping ground dengan view pegunungan yang hijau dan kesempatan melihat rusa liar. Cocok untuk keluarga.',
        'price_per_night' => 100000,
        'image' => 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&h=400&fit=crop',
        'rating' => 4.9,
        'reviews_count' => 450,
        'facilities' => json_encode(['Toilet bersih', 'Area parkir luas', 'Penangkaran rusa', 'Playground', 'Warung makan']),
        'coordinates' => '-7.1389, 107.4494'
    ]
];

// Cek apakah sudah ada data
$checkResult = $conn->query("SELECT COUNT(*) as count FROM locations");
$row = $checkResult->fetch_assoc();

if ($row['count'] == 0) {
    $stmt = $conn->prepare("INSERT INTO locations (name, region, description, price_per_night, image, rating, reviews_count, facilities, coordinates, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
    
    foreach ($defaultLocations as $loc) {
        $stmt->bind_param("sssisdiss", 
            $loc['name'], 
            $loc['region'], 
            $loc['description'], 
            $loc['price_per_night'], 
            $loc['image'], 
            $loc['rating'], 
            $loc['reviews_count'], 
            $loc['facilities'],
            $loc['coordinates']
        );
        $stmt->execute();
    }
    
    echo "Data lokasi default berhasil ditambahkan.\n";
    $stmt->close();
} else {
    echo "Data lokasi sudah ada.\n";
}

$conn->close();
