<?php
/**
 * API Configuration - Database + Auth + Helpers
 * Self-contained, no external dependencies
 */

// ============================================
// AUTO-DETECT ENVIRONMENT (Local vs Hosting)
// ============================================
if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1' || stripos($_SERVER['HTTP_HOST'], 'local') !== false) {
    // Local Development (XAMPP)
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'healingcamp_cms');
} else {
    // Production Hosting
    define('DB_HOST', 'localhost');
    define('DB_USER', 'u151373400_healingcamp');
    define('DB_PASS', '5Ot^Xp&gd#o=');
    define('DB_NAME', 'u151373400_healingcamp');
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    jsonResponse(false, 'Database connection failed: ' . $conn->connect_error, null, 500);
}
$conn->set_charset('utf8mb4');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Send JSON response and exit
 */
function jsonResponse($success, $message = '', $data = null, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Check if user is logged in, return 401 if not
 */
function requireAuth() {
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }
}

/**
 * Get current user info from session
 */
function getCurrentUser() {
    return [
        'id' => $_SESSION['user_id'] ?? null,
        'username' => $_SESSION['username'] ?? null,
        'nama' => $_SESSION['nama'] ?? null,
        'role' => $_SESSION['role'] ?? null,
    ];
}

/**
 * Get action parameter
 */
function getAction() {
    return $_GET['action'] ?? $_POST['action'] ?? '';
}

/**
 * Get ID parameter
 */
function getId() {
    return intval($_GET['id'] ?? $_POST['id'] ?? 0);
}

/**
 * Sanitize string input
 */
function sanitize($value) {
    return trim(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
}

/**
 * Get POST value with default
 */
function postVal($key, $default = '') {
    return isset($_POST[$key]) ? trim($_POST[$key]) : $default;
}

/**
 * Delete image file from uploads folder
 * @param string $imagePath Relative path from cms folder (e.g., 'uploads/equipment/image.jpg')
 */
function deleteImage($imagePath) {
    if (empty($imagePath)) return;
    $fullPath = dirname(__DIR__) . '/' . $imagePath;
    if (file_exists($fullPath)) {
        unlink($fullPath);
    }
}

/**
 * Get old image path before update/delete
 * @param mysqli $conn Database connection
 * @param string $table Table name
 * @param int $id Record ID
 * @param string $column Image column name (default: 'image')
 * @return string|null Image path or null
 */
function getOldImage($conn, $table, $id, $column = 'image') {
    $stmt = $conn->prepare("SELECT {$column} FROM {$table} WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    return $row[$column] ?? null;
}
