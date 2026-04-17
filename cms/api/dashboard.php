<?php
/**
 * Dashboard API - Get stats
 */
require_once __DIR__ . '/config.php';
requireAuth();

$stats = [];
$tables = ['equipment', 'locations', 'packages', 'bookings', 'testimonials', 'users'];

foreach ($tables as $table) {
    $result = @$conn->query("SELECT COUNT(*) as c FROM $table");
    $stats[$table] = $result ? (int)$result->fetch_assoc()['c'] : 0;
}

// Recent bookings
$recent = [];
$result = @$conn->query("SELECT booking_code, customer_name, status, created_at FROM bookings ORDER BY id DESC LIMIT 5");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $recent[] = $row;
    }
}

jsonResponse(true, '', ['stats' => $stats, 'recent_bookings' => $recent]);
