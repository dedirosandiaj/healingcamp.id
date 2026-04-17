<?php
/**
 * Upload API - Image upload with WebP compression
 */
require_once __DIR__ . '/config.php';
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(false, 'Tidak ada file yang diupload!');
}

$folder = postVal('folder', 'general');
$allowedFolders = ['equipment', 'locations', 'packages', 'testimonials', 'hero'];
if (!in_array($folder, $allowedFolders)) {
    $folder = 'general';
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

if (!in_array($file['type'], $allowedTypes)) {
    jsonResponse(false, 'Format gambar tidak valid! (JPEG, PNG, GIF, WEBP)');
}

$uploadDir = dirname(__DIR__) . '/uploads/' . $folder . '/';

// Create directory if not exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = $folder . '_' . time() . '_' . uniqid();
$destPath = $uploadDir . $filename;

// Check GD extension
if (!extension_loaded('gd')) {
    // Fallback: just move the file
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $outputPath = $destPath . '.' . $ext;
    if (move_uploaded_file($file['tmp_name'], $outputPath)) {
        $relativePath = 'uploads/' . $folder . '/' . basename($outputPath);
        jsonResponse(true, 'Upload berhasil', ['path' => $relativePath]);
    }
    jsonResponse(false, 'Gagal mengupload gambar!');
}

// Compress and convert to WebP
$imageInfo = getimagesize($file['tmp_name']);
if (!$imageInfo) {
    jsonResponse(false, 'File bukan gambar yang valid!');
}

$mimeType = $imageInfo['mime'];
$sourceImage = null;

switch ($mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
        $sourceImage = imagecreatefromjpeg($file['tmp_name']);
        break;
    case 'image/png':
        $sourceImage = imagecreatefrompng($file['tmp_name']);
        imagepalettetotruecolor($sourceImage);
        imagealphablending($sourceImage, true);
        imagesavealpha($sourceImage, true);
        break;
    case 'image/gif':
        $sourceImage = imagecreatefromgif($file['tmp_name']);
        break;
    case 'image/webp':
        if (function_exists('imagecreatefromwebp')) {
            $sourceImage = imagecreatefromwebp($file['tmp_name']);
        }
        break;
}

if (!$sourceImage) {
    jsonResponse(false, 'Gagal memproses gambar!');
}

$origWidth = imagesx($sourceImage);
$origHeight = imagesy($sourceImage);
$maxWidth = 1920;
$maxHeight = 1080;
$newWidth = $origWidth;
$newHeight = $origHeight;

if ($origWidth > $maxWidth || $origHeight > $maxHeight) {
    $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
    $newWidth = intval($origWidth * $ratio);
    $newHeight = intval($origHeight * $ratio);
}

$resizedImage = imagecreatetruecolor($newWidth, $newHeight);

if ($mimeType === 'image/png') {
    imagealphablending($resizedImage, false);
    imagesavealpha($resizedImage, true);
    $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
    imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
}

imagecopyresampled($resizedImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

if (function_exists('imagewebp')) {
    $outputPath = $destPath . '.webp';
    $result = imagewebp($resizedImage, $outputPath, 80);
} else {
    $outputPath = $destPath . '.jpg';
    $result = imagejpeg($resizedImage, $outputPath, 80);
}

imagedestroy($sourceImage);
imagedestroy($resizedImage);

if ($result) {
    $relativePath = 'uploads/' . $folder . '/' . basename($outputPath);
    jsonResponse(true, 'Upload berhasil', ['path' => $relativePath]);
}

jsonResponse(false, 'Gagal mengkompres gambar!');
