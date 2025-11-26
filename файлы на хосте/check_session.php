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
echo json_encode(['loggedIn' => isset($_SESSION['logged_in']) && $_SESSION['logged_in']]);
?>
