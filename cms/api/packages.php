<?php
/**
 * Packages API - CRUD
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
    $result = $conn->query("SELECT * FROM packages ORDER BY id DESC");
    $items = [];
    while ($row = $result->fetch_assoc()) { $items[] = $row; }
    jsonResponse(true, '', $items);
}

function getOne() {
    global $conn;
    $id = getId();
    $stmt = $conn->prepare("SELECT * FROM packages WHERE id = ?");
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
    $description = postVal('description');
    $price = intval(postVal('price', 0));
    $icon = postVal('icon');
    $person_count = postVal('person_count');
    $duration = postVal('duration');
    $includes = sanitizeJson(postVal('includes'));
    $is_popular = intval(postVal('is_popular', 0));
    $status = postVal('status', 'active');
    $userId = $_SESSION['user_id'];

    if (empty($name)) jsonResponse(false, 'Nama paket harus diisi!');
    if ($price <= 0) jsonResponse(false, 'Harga harus lebih dari 0!');

    $stmt = $conn->prepare("INSERT INTO packages (name, description, price, icon, person_count, duration, includes, is_popular, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssissssisi", $name, $description, $price, $icon, $person_count, $duration, $includes, $is_popular, $status, $userId);

    if ($stmt->execute()) {
        jsonResponse(true, 'Paket berhasil ditambahkan', ['id' => $conn->insert_id]);
    }
    jsonResponse(false, 'Gagal menambahkan: ' . $stmt->error);
}

function update() {
    global $conn;
    $id = getId();
    $name = postVal('name');
    $description = postVal('description');
    $price = intval(postVal('price', 0));
    $icon = postVal('icon');
    $person_count = postVal('person_count');
    $duration = postVal('duration');
    $includes = sanitizeJson(postVal('includes'));
    $is_popular = intval(postVal('is_popular', 0));
    $status = postVal('status', 'active');

    if (empty($name)) jsonResponse(false, 'Nama paket harus diisi!');

    $stmt = $conn->prepare("UPDATE packages SET name=?, description=?, price=?, icon=?, person_count=?, duration=?, includes=?, is_popular=?, status=? WHERE id=?");
    $stmt->bind_param("ssissssisi", $name, $description, $price, $icon, $person_count, $duration, $includes, $is_popular, $status, $id);

    if ($stmt->execute()) {
        jsonResponse(true, 'Paket berhasil diupdate');
    }
    jsonResponse(false, 'Gagal mengupdate: ' . $stmt->error);
}

function deleteItem() {
    global $conn;
    $id = getId();

    // Check if exists
    $exists = getOldImage($conn, 'packages', $id, 'id');
    if (!$exists) {
        jsonResponse(false, 'Data tidak ditemukan', null, 404);
    }

    $stmt = $conn->prepare("DELETE FROM packages WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        jsonResponse(true, 'Paket berhasil dihapus');
    }
    jsonResponse(false, 'Gagal menghapus');
}
