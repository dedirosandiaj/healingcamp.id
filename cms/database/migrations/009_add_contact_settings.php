<?php
/**
 * Migration: Add Contact Settings
 */

require_once __DIR__ . '/../includes/config.php';

// Insert contact settings
$contactSettings = [
    ['contact_title', 'Hubungi Kami', 'text', 'Label section contact'],
    ['contact_heading', 'Siap untuk <span class="gradient-text">Berpetualang</span>?', 'text', 'Heading utama contact section'],
    ['contact_description', 'Hubungi kami untuk booking peralatan camping atau tempat camping. Tim kami siap membantu Anda merencanakan petualangan outdoor yang sempurna.', 'text', 'Deskripsi contact section'],
    ['contact_address_label', 'Alamat', 'text', 'Label untuk alamat'],
    ['contact_address', 'Jl. Raya Adventure No. 123, Bandung, Jawa Barat', 'text', 'Alamat lengkap'],
    ['contact_phone_label', 'Telepon', 'text', 'Label untuk telepon'],
    ['contact_phone', '+62 812-3456-7890', 'text', 'Nomor telepon'],
    ['contact_email_label', 'Email', 'text', 'Label untuk email'],
    ['contact_email', 'hello@healingcamp.id', 'text', 'Alamat email'],
    ['contact_social_label', 'Ikuti Kami', 'text', 'Label social media'],
    ['contact_instagram', '#', 'text', 'URL Instagram'],
    ['contact_facebook', '#', 'text', 'URL Facebook'],
    ['contact_youtube', '#', 'text', 'URL YouTube'],
    ['contact_tiktok', '#', 'text', 'URL TikTok'],
];

$success = 0;
$error = 0;

foreach ($contactSettings as $setting) {
    list($key, $value, $type, $description) = $setting;
    
    // Check if exists
    $check = $conn->query("SELECT id FROM settings WHERE setting_key='$key'");
    
    if ($check->num_rows > 0) {
        // Update existing
        $sql = "UPDATE settings SET setting_value='$value', setting_type='$type', description='$description' WHERE setting_key='$key'";
    } else {
        // Insert new
        $sql = "INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES ('$key', '$value', '$type', '$description')";
    }
    
    if ($conn->query($sql)) {
        $success++;
        echo "✓ $key updated/inserted\n";
    } else {
        $error++;
        echo "✗ $key failed: " . $conn->error . "\n";
    }
}

echo "\n";
echo "=========================================\n";
echo "Success: $success | Error: $error\n";
echo "=========================================\n";

$conn->close();
