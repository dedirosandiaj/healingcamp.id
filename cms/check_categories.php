<?php
/**
 * Check and create categories table if not exists
 */
require_once __DIR__ . '/api/config.php';

header('Content-Type: text/plain');

echo "Checking categories table...\n\n";

// Check if table exists
$result = $conn->query("SHOW TABLES LIKE 'categories'");
if ($result->num_rows > 0) {
    echo "✓ Table 'categories' already exists\n";
    
    // Check if has data
    $count = $conn->query("SELECT COUNT(*) as total FROM categories")->fetch_assoc()['total'];
    echo "✓ Table has {$count} records\n";
} else {
    echo "Creating categories table...\n";
    
    $sql = "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL COMMENT 'Nama kategori',
        slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'Slug untuk URL',
        description TEXT COMMENT 'Deskripsi kategori',
        icon VARCHAR(50) DEFAULT 'fa-box' COMMENT 'Icon FontAwesome',
        status ENUM('active', 'inactive') DEFAULT 'active',
        sort_order INT DEFAULT 0 COMMENT 'Urutan tampilan',
        created_by INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($conn->query($sql)) {
        echo "✓ Table created successfully\n";
        
        // Insert defaults
        $defaults = [
            ['Tenda', 'tenda', 'Perlengkapan tenda camping', 'fa-campground', 1],
            ['Sleeping Bag', 'sleeping_bag', 'Kantong tidur dan selimut', 'fa-bed', 2],
            ['Kompor', 'kompor', 'Kompor portable dan alat masak', 'fa-fire', 3],
            ['Carrier', 'carrier', 'Tas gunung dan carrier', 'fa-hiking', 4],
            ['Lampu', 'lampu', 'Lampu dan senter camping', 'fa-lightbulb', 5],
            ['Matras', 'matras', 'Matras dan alas tidur', 'fa-layer-group', 6],
            ['Lainnya', 'lainnya', 'Peralatan camping lainnya', 'fa-box', 99],
        ];
        
        $stmt = $conn->prepare("INSERT INTO categories (name, slug, description, icon, sort_order, created_by) VALUES (?, ?, ?, ?, ?, 1)");
        foreach ($defaults as $cat) {
            $stmt->bind_param("ssssi", $cat[0], $cat[1], $cat[2], $cat[3], $cat[4]);
            $stmt->execute();
        }
        echo "✓ Inserted " . count($defaults) . " default categories\n";
    } else {
        echo "✗ Error: " . $conn->error . "\n";
    }
}

echo "\nDone!";
