<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// 事前に定義されたAPIキー
$definedApiKey = '0401_predefined_api_key';

$apiKey = isset($_GET['apiKey']) ? $_GET['apiKey'] : '';
$studentName = isset($_GET['studentName']) ? $_GET['studentName'] : '';
$testId = isset($_GET['testId']) ? $_GET['testId'] : '';
$week = isset($_GET['week']) ? $_GET['week'] : '';

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

// 生徒IDの取得
$stmt = $conn->prepare("SELECT west_student_id FROM west_student WHERE student = ?");
$stmt->bind_param("s", $studentName);
$stmt->execute();
$result = $stmt->get_result();
$student = $result->fetch_assoc();
$studentId = $student['west_student_id'];

// SQL クエリ実行（進捗情報を取得）
$sql = "
SELECT 
    english, math, science, social, japanese
FROM 
    west_progress
WHERE 
    student_id = ? AND test_id = ? AND week = ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iis", $studentId, $testId, $week);
$stmt->execute();
$result = $stmt->get_result();

$progress = $result->fetch_assoc();

// JSON 形式で出力
echo json_encode(array("progress" => $progress));

$stmt->close();
$conn->close();
?>


