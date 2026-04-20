<?php
// API Endpoint untuk menyediakan data website
// Mengembalikan JSON dengan data settings, equipment, locations, packages, testimonials

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Koneksi Database - use new API config
require_once __DIR__ . '/config.php';

$response = [
    'success' => true,
    'settings' => [],
    'equipment' => [],
    'locations' => [],
    'packages' => [],
    'testimonials' => []
];

try {
    // Ambil settings
    $settings = [];
    $result = $conn->query("SELECT setting_key, setting_value FROM settings");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    }
    $response['settings'] = $settings;

    // Ambil equipment (status = available, limit 4)
    $equipment = [];
    $result = $conn->query("SELECT name, description, price_per_day, image FROM equipment WHERE status = 'available' ORDER BY id DESC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $image = $row['image'];
            if ($image && !str_starts_with($image, 'https')) {
                $image = 'cms/' . $image;
            }
            if (!$image) {
                $image = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop';
            }
            $equipment[] = [
                'name' => $row['name'],
                'desc' => $row['description'],
                'price' => (int)$row['price_per_day'],
                'image' => $image
            ];
        }
    }
    $response['equipment'] = $equipment;

    // Ambil locations (status = active)
    $locations = [];
    $result = $conn->query("SELECT name, region, description, price_per_night, images, facilities FROM locations WHERE status = 'active' ORDER BY id DESC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Parse images JSON
            $images = [];
            try {
                $images = json_decode($row['images'], true) ?: [];
            } catch (e) {}
            
            // Get first image or fallback
            $image = !empty($images) ? $images[0] : '';
            if ($image && !str_starts_with($image, 'https')) {
                $image = 'cms/' . $image;
            }
            if (!$image) {
                $image = 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&h=400&fit=crop';
            }
            $locations[] = [
                'name' => $row['name'],
                'region' => $row['region'],
                'description' => $row['description'],
                'price' => (int)$row['price_per_night'],
                'image' => $image,
                'images' => $images,
                'facilities' => $row['facilities']
            ];
        }
    }
    $response['locations'] = $locations;

    // Ambil packages (status = active, limit 3)
    $packages = [];
    $result = $conn->query("SELECT name, description, price, icon, includes, is_popular, duration, person_count FROM packages WHERE status = 'active' ORDER BY id DESC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $includes = json_decode($row['includes'], true) ?: ['Tenda', 'Sleeping bag', 'Matras'];
            $packages[] = [
                'name' => $row['name'],
                'desc' => $row['description'],
                'price' => (int)$row['price'],
                'icon' => $row['icon'] ?: 'fa-campground',
                'features' => array_slice($includes, 0, 5),
                'popular' => $row['is_popular'] == 1,
                'duration' => $row['duration'] ?: 'malam',
                'personCount' => $row['person_count']
            ];
        }
    }
    $response['packages'] = $packages;

    // Ambil testimonials (status = active, limit 3)
    $testimonials = [];
    $result = $conn->query("SELECT name, location, text, image, rating FROM testimonials WHERE status = 'active' ORDER BY id DESC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $image = $row['image'];
            if ($image && !str_starts_with($image, 'https')) {
                $image = 'cms/' . $image;
            }
            if (!$image) {
                $image = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';
            }
            $testimonials[] = [
                'name' => $row['name'],
                'location' => $row['location'] ?: 'Indonesia',
                'text' => $row['text'],
                'rating' => (int)$row['rating'],
                'image' => $image
            ];
        }
    }
    $response['testimonials'] = $testimonials;

} catch (Exception $e) {
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
