<?php
/**
 * Testimonials API - CRUD
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
    default: jsonResponse(false, 'Invalid action', null, 400);
}

function listAll() {
    global $conn;
    $result = $conn->query("SELECT * FROM testimonials ORDER BY id DESC");
    $items = [];
    while ($row = $result->fetch_assoc()) { $items[] = $row; }
    jsonResponse(true, '', $items);
}

function getOne() {
    global $conn;
    $id = getId();
    $stmt = $conn->prepare("SELECT * FROM testimonials WHERE id = ?");
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
    $location = postVal('location');
    $text = postVal('text');
    $image = postVal('image');
    $rating = intval(postVal('rating', 5));
    $status = postVal('status', 'active');
    $userId = $_SESSION['user_id'];

    if (empty($name)) jsonResponse(false, 'Nama harus diisi!');
    if (empty($text)) jsonResponse(false, 'Teks testimonial harus diisi!');
    if ($rating < 1 || $rating > 5) jsonResponse(false, 'Rating harus 1-5!');

    $stmt = $conn->prepare("INSERT INTO testimonials (name, location, text, image, rating, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssisi", $name, $location, $text, $image, $rating, $status, $userId);

    if ($stmt->execute()) {
        jsonResponse(true, 'Testimonial berhasil ditambahkan', ['id' => $conn->insert_id]);
    }
    jsonResponse(false, 'Gagal menambahkan: ' . $stmt->error);
}

function update() {
    global $conn;
    $id = getId();
    $name = postVal('name');
    $location = postVal('location');
    $text = postVal('text');
    $image = postVal('image');
    $rating = intval(postVal('rating', 5));
    $status = postVal('status', 'active');

    if (empty($name)) jsonResponse(false, 'Nama harus diisi!');
    if (empty($text)) jsonResponse(false, 'Teks testimonial harus diisi!');

    // Get old image before update
    $oldImage = null;
    if (!empty($image)) {
        $oldImage = getOldImage($conn, 'testimonials', $id);
    }

    if (!empty($image)) {
        $stmt = $conn->prepare("UPDATE testimonials SET name=?, location=?, text=?, image=?, rating=?, status=? WHERE id=?");
        $stmt->bind_param("ssssisi", $name, $location, $text, $image, $rating, $status, $id);
    } else {
        $stmt = $conn->prepare("UPDATE testimonials SET name=?, location=?, text=?, rating=?, status=? WHERE id=?");
        $stmt->bind_param("sssisi", $name, $location, $text, $rating, $status, $id);
    }

    if ($stmt->execute()) {
        // Delete old image after successful update
        if ($oldImage && $oldImage !== $image) {
            deleteImage($oldImage);
        }
        jsonResponse(true, 'Testimonial berhasil diupdate');
    }
    jsonResponse(false, 'Gagal mengupdate: ' . $stmt->error);
}

function deleteItem() {
    global $conn;
    $id = getId();

    $oldImage = getOldImage($conn, 'testimonials', $id);

    if (!$oldImage && !getOldImage($conn, 'testimonials', $id, 'id')) {
        jsonResponse(false, 'Data tidak ditemukan', null, 404);
    }

    $stmt = $conn->prepare("DELETE FROM testimonials WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        deleteImage($oldImage);
        jsonResponse(true, 'Testimonial berhasil dihapus');
    }
    jsonResponse(false, 'Gagal menghapus');
}
