<?php
// Простой auth.php без dotenv и composer

// !!! ОБЯЗАТЕЛЬНО: укажи РЕАЛЬНЫЙ домен, по которому заходишь на сайт.
// Если у тебя просто http://azatara.xyz без https, то напиши именно его.
header("Access-Control-Allow-Origin: https://azatara.xyz");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

header('Content-Type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Пароль админа — тот же, что в Admin.jsx
$ADMIN_PASSWORD = 'azadmin123';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'invalid_input']);
    exit;
}

$password = $input['password'];

if ($password !== $ADMIN_PASSWORD) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'invalid_password']);
    exit;
}

// успешный логин
$_SESSION['logged_in'] = true;
$_SESSION['username'] = 'admin';

echo json_encode(['status' => 'ok']);
