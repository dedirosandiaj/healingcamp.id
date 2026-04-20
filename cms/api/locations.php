<?php
/**
 * Locations API - CRUD
 */
require_once __DIR__ . '/config.php';
requireAuth();

// Helper: pastikan facilities selalu JSON valid untuk kolom JSON
function sanitizeFacilities($val) {
    if (empty($val)) return null;
    // Jika sudah JSON valid (array), kembalikan langsung
    $decoded = json_decode($val, true);
    if (is_array($decoded)) return $val;
    // Jika plain text (comma-separated), konversi ke JSON array
    $items = array_map('trim', explode(',', $val));
    $items = array_filter($items, fn($v) => $v !== '');
    return json_encode(array_values($items), JSON_UNESCAPED_UNICODE);
}

$action = getAction();

switch ($action) {
    case 'list': listAll(); break;
    case 'get': getOne(); break;
    case 'create': create(); break;
    case 'update': update(); break;
    case 'delete': deleteItem(); break;
    default: jsonResponse(false, 'Invalid action', null, 400);
}

function listAll() {
    global $conn;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    if ($search) {
        $stmt = $conn->prepare("SELECT id, name, region, price_per_night, images, coordinates, status FROM locations WHERE name LIKE ? ORDER BY id DESC");
        $searchParam = "%{$search}%";
        $stmt->bind_param("s", $searchParam);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query("SELECT id, name, region, price_per_night, images, coordinates, status FROM locations ORDER BY id DESC");
    }
    
    $items = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) { 
            // Parse coordinates to lat/lng
            if ($row['coordinates']) {
                $coords = explode(',', $row['coordinates']);
                if (count($coords) === 2) {
                    $row['lat'] = trim($coords[0]);
                    $row['lng'] = trim($coords[1]);
                }
            }
            $items[] = $row; 
        }
    }
    jsonResponse(true, '', $items);
}

function getOne() {
    global $conn;
    $id = getId();
    $stmt = $conn->prepare("SELECT * FROM locations WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$item) jsonResponse(false, 'Data tidak ditemukan', null, 404);
    jsonResponse(true, '', $item);
}

function create() {
    global $conn;
    $name = postVal('name');
    $region = postVal('region');
    $description = postVal('description');
    $price = intval(postVal('price_per_night', 0));
    $newImages = postVal('new_images');
    $images = [];
    if ($newImages) {
        $images = json_decode($newImages, true) ?: [];
    }
    $image = !empty($images) ? json_encode($images) : null;
    $facilities = sanitizeFacilities(postVal('facilities'));
    $coordinates = postVal('coordinates');
    $status = postVal('status', 'active');
    $userId = $_SESSION['user_id'];

    if (empty($name)) jsonResponse(false, 'Nama lokasi harus diisi!');
    if ($price <= 0) jsonResponse(false, 'Harga harus lebih dari 0!');

    $stmt = $conn->prepare("INSERT INTO locations (name, region, description, price_per_night, images, facilities, coordinates, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssissssi", $name, $region, $description, $price, $image, $facilities, $coordinates, $status, $userId);

    if ($stmt->execute()) {
        jsonResponse(true, 'Lokasi berhasil ditambahkan', ['id' => $conn->insert_id]);
    }
    jsonResponse(false, 'Gagal menambahkan: ' . $stmt->error);
}

function update() {
    global $conn;
    $id = getId();
    $name = postVal('name');
    $region = postVal('region');
    $description = postVal('description');
    $price = intval(postVal('price_per_night', 0));
    $newImages = postVal('new_images');
    $removedImages = postVal('removed_images');
    $existingImages = isset($_POST['existing_images']) ? $_POST['existing_images'] : [];
    $facilities = sanitizeFacilities(postVal('facilities'));
    $coordinates = postVal('coordinates');
    $status = postVal('status', 'active');

    if (empty($name)) jsonResponse(false, 'Nama lokasi harus diisi!');

    // Merge existing and new images
    $images = $existingImages;
    if ($newImages) {
        $newImagesArray = json_decode($newImages, true) ?: [];
        $images = array_merge($images, $newImagesArray);
    }
    $image = !empty($images) ? json_encode($images) : null;

    // Get old images before update for deletion
    $stmt = $conn->prepare("SELECT images FROM locations WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $oldData = $result->fetch_assoc();
    $stmt->close();
    
    $oldImageData = $oldData['images'] ?? null;

    $stmt = $conn->prepare("UPDATE locations SET name=?, region=?, description=?, price_per_night=?, images=?, facilities=?, coordinates=?, status=? WHERE id=?");
    $stmt->bind_param("sssissssi", $name, $region, $description, $price, $image, $facilities, $coordinates, $status, $id);

    if ($stmt->execute()) {
        // Delete old images if new images were uploaded
        if ($newImages && $oldImageData) {
            $oldImagesArray = json_decode($oldImageData, true) ?: [];
            foreach ($oldImagesArray as $oldImg) {
                if ($oldImg) {
                    $filename = basename($oldImg);
                    $filePath = __DIR__ . '/../uploads/locations/' . $filename;
                    
                    if (file_exists($filePath)) {
                        unlink($filePath);
                    }
                }
            }
        }
        
        // Delete removed images
        if ($removedImages) {
            $removedArray = json_decode($removedImages, true) ?: [];
            foreach ($removedArray as $removedImg) {
                if ($removedImg) {
                    $filename = basename($removedImg);
                    $filePath = __DIR__ . '/../uploads/locations/' . $filename;
                    
                    if (file_exists($filePath)) {
                        unlink($filePath);
                    }
                }
            }
        }
        
        jsonResponse(true, 'Lokasi berhasil diupdate');
    }
    jsonResponse(false, 'Gagal mengupdate: ' . $stmt->error);
}

function deleteItem() {
    global $conn;
    $id = getId();

    $oldImage = getOldImage($conn, 'locations', $id);

    if (!$oldImage && !getOldImage($conn, 'locations', $id, 'id')) {
        jsonResponse(false, 'Data tidak ditemukan', null, 404);
    }

    $stmt = $conn->prepare("DELETE FROM locations WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        deleteImage($oldImage);
        jsonResponse(true, 'Lokasi berhasil dihapus');
    }
    jsonResponse(false, 'Gagal menghapus');
}
