<?php
session_start();

// 今日の日付を取得
$date = date('Ymd');

// 日付とランダムな文字列を組み合わせてハッシュ化
$generatedApiKey = hash('sha256', $date);

// クエリパラメータからAPIキーを取得
$apiKey = isset($_GET['api_key']) ? $_GET['api_key'] : '';

if ($apiKey === $generatedApiKey) {
    echo json_encode(['valid' => true]);
} else {
    echo json_encode(['valid' => false]);
}
?>
