<?php
// Access: http://localhost/healingcamp.id/cms/database/migrate_images.php

$host = 'localhost';
$db = 'healingcamp_cms';
$user = 'root';
$pass = '';

try {
    $conn = new mysqli($host, $user, $pass, $db);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    echo "Starting migration...<br><br>";

    // Check if images column exists
    $checkColumn = $conn->query("SHOW COLUMNS FROM locations LIKE 'images'");
    if ($checkColumn->num_rows == 0) {
        // Add images column
        if ($conn->query("ALTER TABLE locations ADD COLUMN images JSON DEFAULT NULL AFTER price_per_night")) {
            echo "✓ Added 'images' column<br>";
        } else {
            echo "✗ Failed to add 'images' column: " . $conn->error . "<br>";
        }
        
        // Migrate data from image to images
        if ($conn->query("UPDATE locations SET images = JSON_ARRAY(image) WHERE image IS NOT NULL AND image != ''")) {
            echo "✓ Migrated data from 'image' to 'images'<br>";
        } else {
            echo "✗ Failed to migrate data: " . $conn->error . "<br>";
        }
        
        // Drop old image column
        if ($conn->query("ALTER TABLE locations DROP COLUMN image")) {
            echo "✓ Dropped old 'image' column<br>";
        } else {
            echo "✗ Failed to drop 'image' column: " . $conn->error . "<br>";
        }
    } else {
        echo "✓ Column 'images' already exists<br>";
    }

    echo "<br>✓ Migration complete!<br>";
    echo "<br><a href='javascript:history.back()'>Go Back</a>";
    
    $conn->close();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
