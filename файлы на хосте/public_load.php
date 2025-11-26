<?php
// public_load.php (переименовать в load.php если нужно, но оставляем)
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://azatara.xyz');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'unauthorized']);
    exit;
}

$dataDir = __DIR__ . '/data/';
$files = [
    'az_news' => 'az_news.json',
    'az_unique_features' => 'az_unique_features.json',
    'az_features' => 'az_features.json',
    'az_donats' => 'az_donats.json',
    'az_crafts' => 'az_crafts.json',
    'az_rules' => 'az_rules.txt',
    'az_about' => 'az_about.txt'
];

$data = [];
foreach ($files as $key => $file) {
    $path = $dataDir . $file;
    try {
        if (file_exists($path)) {
            $content = file_get_contents($path);
            error_log("Successfully loaded $path");  // Добавлено логирование
            $data[$key] = in_array($key, ['az_rules', 'az_about']) ? $content : json_decode($content ?: '[]', true);
        } else {
            $data[$key] = in_array($key, ['az_rules', 'az_about']) ? '' : [];
        }
    } catch (Exception $e) {
        error_log("Error reading $path: " . $e->getMessage());
        $data[$key] = in_array($key, ['az_rules', 'az_about']) ? '' : [];
    }
}

echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
error_log("Response sent successfully");
?>