<?php
/**
 * Auth API - Login, Check Session, Logout
 */
require_once __DIR__ . '/config.php';

$action = getAction();

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'check':
        handleCheck();
        break;
    case 'logout':
        handleLogout();
        break;
    default:
        jsonResponse(false, 'Invalid action', null, 400);
}

function handleLogin() {
    global $conn;
    
    $username = postVal('username');
    $password = postVal('password');
    
    if (empty($username) || empty($password)) {
        jsonResponse(false, 'Username dan password harus diisi!');
    }
    
    $stmt = $conn->prepare("SELECT id, username, nama, password, role, status FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows !== 1) {
        jsonResponse(false, 'Username atau password salah!');
    }
    
    $user = $result->fetch_assoc();
    $stmt->close();
    
    if ($user['status'] !== 'active') {
        jsonResponse(false, 'Akun Anda tidak aktif. Hubungi administrator.');
    }
    
    if (!password_verify($password, $user['password'])) {
        jsonResponse(false, 'Username atau password salah!');
    }
    
    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['nama'] = $user['nama'];
    $_SESSION['role'] = $user['role'];
    
    // Update last login
    $update = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $update->bind_param("i", $user['id']);
    $update->execute();
    $update->close();
    
    jsonResponse(true, 'Login berhasil', [
        'id' => $user['id'],
        'username' => $user['username'],
        'nama' => $user['nama'],
        'role' => $user['role']
    ]);
}

function handleCheck() {
    if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
        jsonResponse(true, 'Authenticated', getCurrentUser());
    } else {
        jsonResponse(false, 'Not authenticated', null, 401);
    }
}

function handleLogout() {
    session_unset();
    session_destroy();
    jsonResponse(true, 'Logout berhasil');
}
