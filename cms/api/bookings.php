<?php
/**
 * Bookings API - CRUD
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
    $result = $conn->query("SELECT * FROM bookings ORDER BY id DESC");
    $items = [];
    while ($row = $result->fetch_assoc()) { $items[] = $row; }
    jsonResponse(true, '', $items);
}

function getOne() {
    global $conn;
    $id = getId();
    $stmt = $conn->prepare("SELECT * FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$item) jsonResponse(false, 'Data tidak ditemukan', null, 404);
    jsonResponse(true, '', $item);
}

function create() {
    global $conn;
    $booking_code = 'BK-' . strtoupper(substr(uniqid(), -8)) . '-' . date('Ymd');
    $customer_name = postVal('customer_name');
    $customer_email = postVal('customer_email');
    $customer_phone = postVal('customer_phone');
    $booking_type = postVal('booking_type');
    $item_id = intval(postVal('item_id', 0));
    $quantity = intval(postVal('quantity', 1));
    $check_in = postVal('check_in');
    $check_out = postVal('check_out');
    $total_price = intval(postVal('total_price', 0));
    $status = postVal('status', 'pending');
    $notes = postVal('notes');

    if (empty($customer_name)) jsonResponse(false, 'Nama customer harus diisi!');
    if (empty($booking_type)) jsonResponse(false, 'Tipe booking harus diisi!');

    $stmt = $conn->prepare("INSERT INTO bookings (booking_code, customer_name, customer_email, customer_phone, booking_type, item_id, quantity, check_in, check_out, total_price, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssiississ", $booking_code, $customer_name, $customer_email, $customer_phone, $booking_type, $item_id, $quantity, $check_in, $check_out, $total_price, $status, $notes);

    if ($stmt->execute()) {
        jsonResponse(true, 'Booking berhasil ditambahkan', ['id' => $conn->insert_id, 'booking_code' => $booking_code]);
    }
    jsonResponse(false, 'Gagal menambahkan: ' . $stmt->error);
}

function update() {
    global $conn;
    $id = getId();
    $customer_name = postVal('customer_name');
    $customer_email = postVal('customer_email');
    $customer_phone = postVal('customer_phone');
    $booking_type = postVal('booking_type');
    $item_id = intval(postVal('item_id', 0));
    $quantity = intval(postVal('quantity', 1));
    $check_in = postVal('check_in');
    $check_out = postVal('check_out');
    $total_price = intval(postVal('total_price', 0));
    $status = postVal('status', 'pending');
    $notes = postVal('notes');

    if (empty($customer_name)) jsonResponse(false, 'Nama customer harus diisi!');

    $stmt = $conn->prepare("UPDATE bookings SET customer_name=?, customer_email=?, customer_phone=?, booking_type=?, item_id=?, quantity=?, check_in=?, check_out=?, total_price=?, status=?, notes=? WHERE id=?");
    $stmt->bind_param("ssssiississi", $customer_name, $customer_email, $customer_phone, $booking_type, $item_id, $quantity, $check_in, $check_out, $total_price, $status, $notes, $id);

    if ($stmt->execute()) {
        jsonResponse(true, 'Booking berhasil diupdate');
    }
    jsonResponse(false, 'Gagal mengupdate: ' . $stmt->error);
}

function deleteItem() {
    global $conn;
    $id = getId();

    $stmt = $conn->prepare("SELECT id FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$item) jsonResponse(false, 'Data tidak ditemukan', null, 404);

    $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        jsonResponse(true, 'Booking berhasil dihapus');
    }
    jsonResponse(false, 'Gagal menghapus');
}
