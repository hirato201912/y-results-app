<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// 事前に定義されたAPIキー
$definedApiKey = '0401_predefined_api_key';

$apiKey = isset($_GET['apiKey']) ? $_GET['apiKey'] : '';
$studentName = isset($_GET['studentName']) ? $_GET['studentName'] : '';

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

// SQL クエリ実行（テスト情報を取得）
$sql = "
SELECT 
    t.test_id, 
    t.test_name, 
    t.start_date
FROM 
    tests t
JOIN 
    student s ON t.school_id = s.school_id
WHERE 
    s.student = ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $studentName);
$stmt->execute();
$result = $stmt->get_result();

// 結果を配列に格納
$tests = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($tests, $row);
    }
}

// JSON 形式で出力
echo json_encode(array("tests" => $tests));

// 接続を閉じる
$stmt->close();
$conn->close();
?>
