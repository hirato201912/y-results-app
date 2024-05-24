<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// 事前に定義されたAPIキー
$definedApiKey = '0401_predefined_api_key';

$apiKey = isset($_GET['apiKey']) ? $_GET['apiKey'] : '';

// APIキーの検証
if ($apiKey !== $definedApiKey) {
    die(json_encode(array("error" => "Invalid API Key")));
}

// POSTデータの取得
$data = json_decode(file_get_contents("php://input"), true);
$studentName = $data['studentName'];
$testId = $data['testId'];
$week = $data['week'];
$progress = $data['progress'];

// データベース接続の作成
$conn = mysqli_connect("mysql749.db.sakura.ne.jp", "mikawayatsuhashi", "yatsuhashi2019", "mikawayatsuhashi_db_yatsuhasi");

// 接続確認
if ($conn->connect_error) {
    die(json_encode(array("error" => $conn->connect_error)));
}

// 生徒IDの取得
$sql = "SELECT west_student_id FROM west_student WHERE student = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $studentName);
$stmt->execute();
$result = $stmt->get_result();
$student = $result->fetch_assoc();
$studentId = $student['west_student_id'];
$stmt->close();

// 進捗情報の保存
$sql = "
INSERT INTO west_progress (student_id, test_id, week, english, math, science, social, japanese)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
english = VALUES(english),
math = VALUES(math),
science = VALUES(science),
social = VALUES(social),
japanese = VALUES(japanese)
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iissssss", $studentId, $testId, $week, $progress['english'], $progress['math'], $progress['science'], $progress['social'], $progress['japanese']);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(array("success" => true));
} else {
    echo json_encode(array("success" => false, "error" => "Failed to save progress"));
}

$stmt->close();
$conn->close();
?>
