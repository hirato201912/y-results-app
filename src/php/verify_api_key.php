<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// 今日の日付を取得
$date = date('Ymd');

// 日付をハッシュ化
$generatedApiKey = hash('sha256', $date);

// クエリパラメータからAPIキーを取得
$apiKey = isset($_GET['api_key']) ? $_GET['api_key'] : '';

$response = [
    'provided_api_key' => $apiKey,
    'expected_api_key' => $generatedApiKey,
    'valid' => $apiKey === $generatedApiKey
];

echo json_encode($response);
?>
