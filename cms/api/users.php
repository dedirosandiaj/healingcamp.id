<?php
/**
 * Users API - CRUD
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
    $result = $conn->query("SELECT id, username, email, nama, role, status, avatar, last_login, created_at FROM users ORDER BY id DESC");
    $items = [];
    while ($row = $result->fetch_assoc()) { $items[] = $row; }
    jsonResponse(true, '', $items);
}

function getOne() {
    global $conn;
    $id = getId();
    $stmt = $conn->prepare("SELECT id, username, email, nama, role, status, avatar, last_login, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$item) jsonResponse(false, 'Data tidak ditemukan', null, 404);
    jsonResponse(true, '', $item);
}

function create() {
    global $conn;
    $username = postVal('username');
    $email = postVal('email');
    $password = postVal('password');
    $nama = postVal('nama');
    $role = postVal('role', 'editor');
    $status = postVal('status', 'active');

    if (empty($username)) jsonResponse(false, 'Username harus diisi!');
    if (empty($password)) jsonResponse(false, 'Password harus diisi!');
    if (strlen($password) < 6) jsonResponse(false, 'Password minimal 6 karakter!');

    // Check duplicate username
    $check = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $check->bind_param("s", $username);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        $check->close();
        jsonResponse(false, 'Username sudah digunakan!');
    }
    $check->close();

    // Check duplicate email
    if (!empty($email)) {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $check->bind_param("s", $email);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            $check->close();
            jsonResponse(false, 'Email sudah digunakan!');
        }
        $check->close();
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (username, email, password, nama, role, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $username, $email, $hashedPassword, $nama, $role, $status);

    if ($stmt->execute()) {
        jsonResponse(true, 'User berhasil ditambahkan', ['id' => $conn->insert_id]);
    }
    jsonResponse(false, 'Gagal menambahkan: ' . $stmt->error);
}

function update() {
    global $conn;
    $id = getId();
    $username = postVal('username');
    $email = postVal('email');
    $password = postVal('password');
    $nama = postVal('nama');
    $role = postVal('role', 'editor');
    $status = postVal('status', 'active');
    $avatar = postVal('avatar');

    if (empty($username)) jsonResponse(false, 'Username harus diisi!');

    // Check duplicate username (exclude self)
    $check = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $check->bind_param("si", $username, $id);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        $check->close();
        jsonResponse(false, 'Username sudah digunakan!');
    }
    $check->close();

    // Check duplicate email (exclude self)
    if (!empty($email)) {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $check->bind_param("si", $email, $id);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            $check->close();
            jsonResponse(false, 'Email sudah digunakan!');
        }
        $check->close();
    }

    // Get old avatar before update
    $oldAvatar = null;
    if (!empty($avatar)) {
        $oldAvatar = getOldImage($conn, 'users', $id, 'avatar');
    }

    if (!empty($password)) {
        if (strlen($password) < 6) jsonResponse(false, 'Password minimal 6 karakter!');
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        if (!empty($avatar)) {
            $stmt = $conn->prepare("UPDATE users SET username=?, email=?, password=?, nama=?, role=?, status=?, avatar=? WHERE id=?");
            $stmt->bind_param("sssssssi", $username, $email, $hashedPassword, $nama, $role, $status, $avatar, $id);
        } else {
            $stmt = $conn->prepare("UPDATE users SET username=?, email=?, password=?, nama=?, role=?, status=? WHERE id=?");
            $stmt->bind_param("ssssssi", $username, $email, $hashedPassword, $nama, $role, $status, $id);
        }
    } else {
        if (!empty($avatar)) {
            $stmt = $conn->prepare("UPDATE users SET username=?, email=?, nama=?, role=?, status=?, avatar=? WHERE id=?");
            $stmt->bind_param("ssssssi", $username, $email, $nama, $role, $status, $avatar, $id);
        } else {
            $stmt = $conn->prepare("UPDATE users SET username=?, email=?, nama=?, role=?, status=? WHERE id=?");
            $stmt->bind_param("sssssi", $username, $email, $nama, $role, $status, $id);
        }
    }

    if ($stmt->execute()) {
        // Delete old avatar after successful update
        if ($oldAvatar && $oldAvatar !== $avatar) {
            deleteImage($oldAvatar);
        }
        jsonResponse(true, 'User berhasil diupdate');
    }
    jsonResponse(false, 'Gagal mengupdate: ' . $stmt->error);
}

function deleteItem() {
    global $conn;
    $id = getId();

    // Prevent self-delete
    if ($id == $_SESSION['user_id']) {
        jsonResponse(false, 'Tidak bisa menghapus akun sendiri!');
    }

    $oldAvatar = getOldImage($conn, 'users', $id, 'avatar');

    if (!$oldAvatar && !getOldImage($conn, 'users', $id, 'id')) {
        jsonResponse(false, 'Data tidak ditemukan', null, 404);
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        deleteImage($oldAvatar);
        jsonResponse(true, 'User berhasil dihapus');
    }
    jsonResponse(false, 'Gagal menghapus');
}
