<?php
header("Access-Control-Allow-Origin: https://azatara.xyz");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

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
    if (file_exists($path)) {
        $content = file_get_contents($path);
        $data[$key] = in_array($key, ['az_rules', 'az_about']) ? $content : json_decode($content ?: '[]', true);
    } else {
        $data[$key] = in_array($key, ['az_rules', 'az_about']) ? '' : [];
    }
}

echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
?>
