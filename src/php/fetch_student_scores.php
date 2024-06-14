<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

session_start();
include_once 'dbconnect.php';

// エラーレポートを有効にする
error_reporting(E_ALL);
ini_set('display_errors', 1);

// // セッションの確認
// if (!isset($_SESSION['user'])) {
//     header("Location: west.shows.php");
//     exit();
// }

// クエリパラメータの取得
$studentName = isset($_GET['name']) ? $_GET['name'] : '';

// データベース接続
$mysqli = new mysqli('mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');

// 接続エラーの確認
if ($mysqli->connect_errno) {
    $response = [
        'error' => 'データの読み込みに失敗しました。 エラー番号 ' . $mysqli->connect_errno . ' : ' . $mysqli->connect_error
    ];
    echo json_encode($response);
    exit();
}

// SQLクエリの実行
$sql = "SELECT id, test_name, result, post_date, student, score1, score2, score3, score4, score5, score6, score7 FROM west_result WHERE student = ? ORDER BY id ASC";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param('s', $studentName);
$stmt->execute();
$result = $stmt->get_result();

$message_array = [];
if ($result) {
    $message_array = $result->fetch_all(MYSQLI_ASSOC);
}

// データベースの接続を閉じる
$mysqli->close();

// JSON形式でレスポンスを返す
header('Content-Type: application/json');
echo json_encode($message_array);
