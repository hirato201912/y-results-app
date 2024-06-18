<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// 今日の日付を取得
$date = date('Ymd');

// 日付とランダムな文字列を組み合わせてハッシュ化
$generatedApiKey = hash('sha256', $date);

// クエリパラメータからAPIキーを取得
$apiKey = isset($_GET['api_key']) ? $_GET['api_key'] : '';

if ($apiKey === $generatedApiKey) {
    echo '<script>alert("Provided API Key: ' . $apiKey . '\nExpected API Key: ' . $generatedApiKey . '");</script>';
    echo json_encode(['valid' => true]);
} else {
    echo '<script>alert("Provided API Key: ' . $apiKey . '\nExpected API Key: ' . $generatedApiKey . '");</script>';
    echo json_encode(['valid' => false]);
}
?>
