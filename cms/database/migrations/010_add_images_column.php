<?php
require_once __DIR__ . '/../../api/config.php';

$conn = getDBConnection();

// Check if images column exists
$checkColumn = $conn->query("SHOW COLUMNS FROM locations LIKE 'images'");
if ($checkColumn->num_rows == 0) {
    // Add images column
    $conn->query("ALTER TABLE locations ADD COLUMN images JSON DEFAULT NULL AFTER price_per_night");
    echo "Added 'images' column\n";
    
    // Migrate data from image to images
    $conn->query("UPDATE locations SET images = JSON_ARRAY(image) WHERE image IS NOT NULL AND image != ''");
    echo "Migrated data from 'image' to 'images'\n";
    
    // Drop old image column
    $conn->query("ALTER TABLE locations DROP COLUMN image");
    echo "Dropped old 'image' column\n";
} else {
    echo "Column 'images' already exists\n";
}

echo "Migration complete!\n";
