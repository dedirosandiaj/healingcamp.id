<?php
/**
 * Database Migration Runner
 * Jalankan file ini untuk menjalankan semua migration
 */

echo "========================================\n";
echo "  DATABASE MIGRATION HEALING CAMP CMS  \n";
echo "========================================\n\n";

// List migration files dalam urutan
$migrations = [
    '001_create_database.php',
    '002_create_users_table.php',
    '003_create_equipment_table.php',
    '004_create_locations_table.php',
    '005_create_packages_table.php',
    '006_create_testimonials_table.php',
    '007_create_bookings_table.php',
    '008_create_settings_table.php',
    '009_add_contact_settings.php',
    '010_create_categories_table.php'
];

$migrationsDir = __DIR__ . '/migrations/';

foreach ($migrations as $migration) {
    $filePath = $migrationsDir . $migration;
    
    echo "Running: $migration\n";
    echo str_repeat("-", 40) . "\n";
    
    if (file_exists($filePath)) {
        include $filePath;
    } else {
        echo "ERROR: File $migration tidak ditemukan!\n";
    }
    
    echo "\n";
}

echo "========================================\n";
echo "  MIGRATION SELESAI!                  \n";
echo "========================================\n";
