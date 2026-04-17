<?php
/**
 * Equipment API - CRUD
 */
require_once __DIR__ . '/config.php';
requireAuth();

function sanitizeJson($val) {
    if (empty($val)) return null;
    $decoded = json_decode($val, true);
    if (is_array($decoded)) return $val;
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
    $result = $conn->query("SELECT * FROM equipment ORDER BY id DESC");
    $items = [];
    while ($row = $result->fetch_assoc()) { $items[] = $row; }
    jsonResponse(true, '', $items);
}

function getOne() {
    global $conn;
    $id = getId();
    $stmt = $conn->prepare("SELECT * FROM equipment WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $item = $result->fetch_assoc();
    $stmt->close();
    if (!$item) jsonResponse(false, 'Data tidak ditemukan', null, 404);
    jsonResponse(true, '', $item);
}

function create() {
    global $conn;
    $name = postVal('name');
    $description = postVal('description');
    $price = intval(postVal('price_per_day', 0));
    $image = postVal('image');
    $category = postVal('category', 'lainnya');
    $capacity = postVal('capacity');
    $stock = intval(postVal('stock', 1));
    $status = postVal('status', 'available');
    $features = sanitizeJson(postVal('features'));
    $userId = $_SESSION['user_id'];

    if (empty($name)) jsonResponse(false, 'Nama harus diisi!');
    if ($price <= 0) jsonResponse(false, 'Harga harus lebih dari 0!');

    $stmt = $conn->prepare("INSERT INTO equipment (name, description, price_per_day, image, category, capacity, stock, status, features, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssisssissi", $name, $description, $price, $image, $category, $capacity, $stock, $status, $features, $userId);

    if ($stmt->execute()) {
        jsonResponse(true, 'Peralatan berhasil ditambahkan', ['id' => $conn->insert_id]);
    }
    jsonResponse(false, 'Gagal menambahkan: ' . $stmt->error);
}

function update() {
    global $conn;
    $id = getId();
    $name = postVal('name');
    $description = postVal('description');
    $price = intval(postVal('price_per_day', 0));
    $image = postVal('image');
    $category = postVal('category', 'lainnya');
    $capacity = postVal('capacity');
    $stock = intval(postVal('stock', 1));
    $status = postVal('status', 'available');
    $features = sanitizeJson(postVal('features'));

    if (empty($name)) jsonResponse(false, 'Nama harus diisi!');

    // Get old image before update
    $oldImage = null;
    if (!empty($image)) {
        $oldImage = getOldImage($conn, 'equipment', $id);
    }

    if (!empty($image)) {
        $stmt = $conn->prepare("UPDATE equipment SET name=?, description=?, price_per_day=?, image=?, category=?, capacity=?, stock=?, status=?, features=? WHERE id=?");
        $stmt->bind_param("ssisssissi", $name, $description, $price, $image, $category, $capacity, $stock, $status, $features, $id);
    } else {
        $stmt = $conn->prepare("UPDATE equipment SET name=?, description=?, price_per_day=?, category=?, capacity=?, stock=?, status=?, features=? WHERE id=?");
        $stmt->bind_param("ssississi", $name, $description, $price, $category, $capacity, $stock, $status, $features, $id);
    }

    if ($stmt->execute()) {
        // Delete old image after successful update
        if ($oldImage && $oldImage !== $image) {
            deleteImage($oldImage);
        }
        jsonResponse(true, 'Peralatan berhasil diupdate');
    }
    jsonResponse(false, 'Gagal mengupdate: ' . $stmt->error);
}

function deleteItem() {
    global $conn;
    $id = getId();
    
    // Get image path first
    $oldImage = getOldImage($conn, 'equipment', $id);

    if (!$oldImage && !getOldImage($conn, 'equipment', $id, 'id')) {
        jsonResponse(false, 'Data tidak ditemukan', null, 404);
    }

    $stmt = $conn->prepare("DELETE FROM equipment WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        // Delete image file after successful delete
        deleteImage($oldImage);
        jsonResponse(true, 'Peralatan berhasil dihapus');
    }
    jsonResponse(false, 'Gagal menghapus');
}
