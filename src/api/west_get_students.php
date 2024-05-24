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

// データベース接続の作成
$conn = mysqli_connect("mysql749.db.sakura.ne.jp", "mikawayatsuhashi", "yatsuhashi2019", "mikawayatsuhashi_db_yatsuhasi");

// 接続確認
if ($conn->connect_error) {
    die(json_encode(array("error" => $conn->connect_error)));
}

// SQL クエリ実行（生徒情報を取得）
$sql = "
SELECT 
    s.west_student_id as student_id, 
    s.student, 
    ms.school_name as belonging, 
    g.grade_name as grade
FROM 
    west_student s
JOIN 
    middle_schools ms ON s.school_id = ms.school_id
JOIN 
    grades g ON s.grade = g.grade_id
";
$result = $conn->query($sql);

// 結果を配列に格納
$students = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($students, $row);
    }
}

// JSON 形式で出力
echo json_encode(array("students" => $students));

// 接続を閉じる
$conn->close();
?>



