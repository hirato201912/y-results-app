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

// SQL クエリ実行（進捗情報を取得）
$sql = "
SELECT 
    t.test_name,
    p.week, 
    p.english, 
    p.math, 
    p.science, 
    p.social, 
    p.japanese
FROM 
    y_progress p
JOIN 
    tests t ON p.test_id = t.test_id
WHERE 
    p.progress_id IN (
        SELECT MAX(progress_id)
        FROM y_progress
        WHERE student_id = (SELECT student_id FROM student WHERE student = ?)
        GROUP BY test_id, week
    )
ORDER BY 
    t.test_name, 
    CASE 
        WHEN p.week = '3週間前' THEN 1
        WHEN p.week = '2週間前' THEN 2
        WHEN p.week = '1週間前' THEN 3
        ELSE 4
    END;
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $studentName);
$stmt->execute();
$result = $stmt->get_result();

// 結果を配列に格納
$progress = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($progress, $row);
    }
}

// JSON 形式で出力
echo json_encode(array("progress" => $progress));

// 接続を閉じる
$stmt->close();
$conn->close();
?>

