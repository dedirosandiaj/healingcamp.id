<?php
/**
 * Categories API - CRUD
 */
require_once __DIR__ . '/config.php';
requireAuth();

$action = getAction();

switch ($action) {
    case 'list': listAll(); break;
    case 'get': getOne(); break;
    case 'create': create(); break;
    case 'update': update(); break;
    case 'delete': deleteItem(); break;
    case 'active': listActive(); break;
    default: jsonResponse(false, 'Invalid action', null, 400);
}

function listAll() {
    global $conn;
    $result = $conn->query("SELECT * FROM categories ORDER BY sort_order ASC, id ASC");
    $items = [];
    while ($row = $result->fetch_assoc()) { $items[] = $row; }
    jsonResponse(true, '', $items);
}

function listActive() {
    global $conn;
    $result = $conn->query("SELECT id, name, slug, icon FROM categories WHERE status = 'active' ORDER BY sort_order ASC, id ASC");
    $items = [];
    while ($row = $result->fetch_assoc()) { $items[] = $row; }
    jsonResponse(true, '', $items);
}

function getOne() {
    global $conn;
    $id = getId();
    $stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
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
    $slug = postVal('slug');
    $description = postVal('description');
    $icon = postVal('icon', 'fa-box');
    $status = postVal('status', 'active');
    $sort_order = intval(postVal('sort_order', 0));
    $userId = $_SESSION['user_id'];

    if (empty($name)) jsonResponse(false, 'Nama kategori harus diisi!');
    if (empty($slug)) $slug = createSlug($name);

    // Check duplicate slug
    $check = $conn->prepare("SELECT id FROM categories WHERE slug = ?");
    $check->bind_param("s", $slug);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        $check->close();
        jsonResponse(false, 'Slug sudah digunakan!');
    }
    $check->close();

    $stmt = $conn->prepare("INSERT INTO categories (name, slug, description, icon, status, sort_order, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssii", $name, $slug, $description, $icon, $status, $sort_order, $userId);

    if ($stmt->execute()) {
        jsonResponse(true, 'Kategori berhasil ditambahkan', ['id' => $conn->insert_id]);
    }
    jsonResponse(false, 'Gagal menambahkan: ' . $stmt->error);
}

function update() {
    global $conn;
    $id = getId();
    $name = postVal('name');
    $slug = postVal('slug');
    $description = postVal('description');
    $icon = postVal('icon', 'fa-box');
    $status = postVal('status', 'active');
    $sort_order = intval(postVal('sort_order', 0));

    if (empty($name)) jsonResponse(false, 'Nama kategori harus diisi!');
    if (empty($slug)) $slug = createSlug($name);

    // Check duplicate slug (exclude self)
    $check = $conn->prepare("SELECT id FROM categories WHERE slug = ? AND id != ?");
    $check->bind_param("si", $slug, $id);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        $check->close();
        jsonResponse(false, 'Slug sudah digunakan!');
    }
    $check->close();

    $stmt = $conn->prepare("UPDATE categories SET name=?, slug=?, description=?, icon=?, status=?, sort_order=? WHERE id=?");
    $stmt->bind_param("sssssii", $name, $slug, $description, $icon, $status, $sort_order, $id);

    if ($stmt->execute()) {
        jsonResponse(true, 'Kategori berhasil diupdate');
    }
    jsonResponse(false, 'Gagal mengupdate: ' . $stmt->error);
}

function deleteItem() {
    global $conn;
    $id = getId();

    // Check if category is used by equipment
    $check = $conn->prepare("SELECT COUNT(*) as count FROM equipment WHERE category = (SELECT slug FROM categories WHERE id = ?)");
    $check->bind_param("i", $id);
    $check->execute();
    $result = $check->get_result()->fetch_assoc();
    $check->close();

    if ($result['count'] > 0) {
        jsonResponse(false, 'Kategori tidak bisa dihapus karena masih digunakan oleh ' . $result['count'] . ' peralatan!');
    }

    $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        jsonResponse(true, 'Kategori berhasil dihapus');
    }
    jsonResponse(false, 'Gagal menghapus');
}

function createSlug($string) {
    $slug = strtolower(trim($string));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
}
