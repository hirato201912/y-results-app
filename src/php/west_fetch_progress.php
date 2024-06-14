<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

$definedApiKey = '0401_predefined_api_key';

$apiKey = isset($_GET['apiKey']) ? $_GET['apiKey'] : '';
$studentName = isset($_GET['studentName']) ? $_GET['studentName'] : '';
$testName = isset($_GET['testName']) ? $_GET['testName'] : ''; // 変数名を修正
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

// SQL クエリ実行（進捗情報を取得）
$sql = "
SELECT 
    english, math, science, social, japanese
FROM 
    west_progress
WHERE 
    student_id = (SELECT west_student_id FROM west_student WHERE student = ?) 
    AND test_id = (SELECT test_id FROM tests WHERE test_name = ?) 
    AND week = ?
ORDER BY progress_id DESC
LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $studentName, $testName, $week); // 変数名を修正
$stmt->execute();
$result = $stmt->get_result();

// 結果を配列に格納
$progress = array();
if ($row = $result->fetch_assoc()) {
    $progress = $row;
}

// JSON 形式で出力
echo json_encode(array("progress" => $progress));

$stmt->close();
$conn->close();
?>




