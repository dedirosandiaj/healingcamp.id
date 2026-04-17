<?php
/**
 * Migration: Create Categories Table
 * Run: php migrate.php
 */

require_once __DIR__ . '/../../api/config.php';

echo "Creating categories table...\n";

$sql = "CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Nama kategori',
    slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'Slug untuk URL',
    description TEXT COMMENT 'Deskripsi kategori',
    icon VARCHAR(50) DEFAULT 'fa-box' COMMENT 'Icon FontAwesome',
    status ENUM('active', 'inactive') DEFAULT 'active',
    sort_order INT DEFAULT 0 COMMENT 'Urutan tampilan',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql)) {
    echo "✓ Categories table created\n";
} else {
    echo "✗ Error: " . $conn->error . "\n";
    exit(1);
}

// Insert default categories
$defaultCategories = [
    ['Tenda', 'tenda', 'Perlengkapan tenda camping', 'fa-campground', 1],
    ['Sleeping Bag', 'sleeping_bag', 'Kantong tidur dan selimut', 'fa-bed', 2],
    ['Kompor', 'kompor', 'Kompor portable dan alat masak', 'fa-fire', 3],
    ['Carrier', 'carrier', 'Tas gunung dan carrier', 'fa-hiking', 4],
    ['Lampu', 'lampu', 'Lampu dan senter camping', 'fa-lightbulb', 5],
    ['Matras', 'matras', 'Matras dan alas tidur', 'fa-layer-group', 6],
    ['Lainnya', 'lainnya', 'Peralatan camping lainnya', 'fa-box', 99],
];

$stmt = $conn->prepare("INSERT INTO categories (name, slug, description, icon, sort_order, created_by) VALUES (?, ?, ?, ?, ?, 1)");

foreach ($defaultCategories as $cat) {
    $stmt->bind_param("ssssi", $cat[0], $cat[1], $cat[2], $cat[3], $cat[4]);
    if ($stmt->execute()) {
        echo "✓ Added category: {$cat[0]}\n";
    } else {
        echo "✗ Error adding {$cat[0]}: " . $stmt->error . "\n";
    }
}

$stmt->close();

echo "\nMigration completed!\n";
