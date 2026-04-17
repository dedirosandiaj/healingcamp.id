<?php
/**
 * Settings API - GET all + POST update
 */
require_once __DIR__ . '/config.php';
requireAuth();

$action = getAction();

switch ($action) {
    case 'list': listAll(); break;
    case 'get': getByKey(); break;
    case 'update': updateSetting(); break;
    case 'bulk_update': bulkUpdate(); break;
    default: jsonResponse(false, 'Invalid action', null, 400);
}

function listAll() {
    global $conn;
    $result = $conn->query("SELECT * FROM settings ORDER BY id ASC");
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[$row['setting_key']] = $row;
    }
    jsonResponse(true, '', $items);
}

function getByKey() {
    global $conn;
    $key = isset($_GET['key']) ? trim($_GET['key']) : '';
    if (empty($key)) jsonResponse(false, 'Key harus diisi!');

    $stmt = $conn->prepare("SELECT * FROM settings WHERE setting_key = ?");
    $stmt->bind_param("s", $key);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$item) jsonResponse(false, 'Setting tidak ditemukan', null, 404);
    jsonResponse(true, '', $item);
}

function updateSetting() {
    global $conn;
    $key = postVal('setting_key');
    $value = postVal('setting_value');

    if (empty($key)) jsonResponse(false, 'Key harus diisi!');

    // Upsert: update if exists, insert if not
    $stmt = $conn->prepare("SELECT id FROM settings WHERE setting_key = ?");
    $stmt->bind_param("s", $key);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($existing) {
        $stmt = $conn->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = ?");
        $stmt->bind_param("ss", $value, $key);
    } else {
        $type = postVal('setting_type', 'text');
        $desc = postVal('description', '');
        $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $key, $value, $type, $desc);
    }

    if ($stmt->execute()) {
        jsonResponse(true, 'Setting berhasil disimpan');
    }
    jsonResponse(false, 'Gagal menyimpan: ' . $stmt->error);
}

function bulkUpdate() {
    global $conn;
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !is_array($data)) {
        // Fallback to POST
        $data = $_POST;
    }

    if (empty($data)) jsonResponse(false, 'Tidak ada data!');

    // Check if hero_image is being updated
    $oldHeroImage = null;
    if (isset($data['hero_image']) && !empty($data['hero_image'])) {
        $oldHeroImage = getOldImage($conn, 'settings', 'hero_image', 'setting_key', 'setting_value');
        // Get old hero image from settings
        $stmt = $conn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'hero_image'");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        $oldHeroImage = $result['setting_value'] ?? null;
    }

    $conn->begin_transaction();
    try {
        foreach ($data as $key => $value) {
            if ($key === 'action') continue;
            $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            $val = is_array($value) ? json_encode($value) : strval($value);
            $stmt->bind_param("ss", $key, $val);
            $stmt->execute();
            $stmt->close();
        }
        $conn->commit();
        
        // Delete old hero image after successful update
        if ($oldHeroImage && isset($data['hero_image']) && $oldHeroImage !== $data['hero_image']) {
            deleteImage($oldHeroImage);
        }
        
        jsonResponse(true, 'Semua setting berhasil disimpan');
    } catch (Exception $e) {
        $conn->rollback();
        jsonResponse(false, 'Gagal menyimpan: ' . $e->getMessage());
    }
}
