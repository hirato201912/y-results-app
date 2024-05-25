<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

$definedApiKey = '0401_predefined_api_key';

$apiKey = isset($_GET['apiKey']) ? $_GET['apiKey'] : '';
$data = json_decode(file_get_contents("php://input"), true);

// APIキーの検証
if ($apiKey !== $definedApiKey) {
    die(json_encode(array("error" => "Invalid API Key")));
}

// データベース接続の作成
$conn = mysqli_connect("mysql749.db.sakura.ne.jp", "mikawayatsuhashi", "yatsuhashi2019", "mikawayatsuhashi_db_yatsuhasi");

// 接続確認
if ($conn->connect_error) {
    die(json_encode(array("error" => $conn->connect_error)));
}

// 進捗データを保存
$sql = "
INSERT INTO west_progress (student_id, test_id, week, english, math, science, social, japanese) 
VALUES ((SELECT west_student_id FROM west_student WHERE student = ?), ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssssss",
    $data['studentName'],
    $data['testId'],
    $data['week'],
    $data['progress']['english'],
    $data['progress']['math'],
    $data['progress']['science'],
    $data['progress']['social'],
    $data['progress']['japanese']
);
$stmt->execute();

// 結果をJSON形式で出力
echo json_encode(array("status" => "success"));

$stmt->close();
$conn->close();
?>
