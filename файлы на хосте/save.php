<?php
// save.php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://azatara.xyz');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['key'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'invalid_input']);
    exit;
}

$key = $input['key'];
$validKeys = ['az_news', 'az_unique_features', 'az_features', 'az_donats', 'az_crafts', 'az_rules', 'az_about'];
if (!in_array($key, $validKeys)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'invalid_key']);
    exit;
}

$dataDir = __DIR__ . '/data/';
if (!is_dir($dataDir) && !mkdir($dataDir, 0755, true)) {
    error_log("Failed to create directory: $dataDir");
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'directory_creation_failed']);
    exit;
}

$extension = in_array($key, ['az_rules', 'az_about']) ? '.txt' : '.json';
$path = $dataDir . $key . $extension;

try {
    if (in_array($key, ['az_rules', 'az_about'])) {
        $data = trim($input['data'] ?? '');  // Trim для чистоты
        file_put_contents($path, $data);
    } else {
        $data = $input['data'] ?? [];
        if (!is_array($data)) {
            throw new Exception("Invalid data: not an array");
        }
        // Валидация: Ограничим размер массива (max 100 items)
        if (count($data) > 100) {
            throw new Exception("Data too large");
        }
        file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }
    echo json_encode(['status' => 'ok']);
} catch (Exception $e) {
    error_log("Error writing $path: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'server_error']);
}
?>