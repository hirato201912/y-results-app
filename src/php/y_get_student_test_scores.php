<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// エラーレポート設定
error_reporting(E_ALL);
ini_set('display_errors', 1);

// データベース接続情報
$db_host = 'mysql749.db.sakura.ne.jp';
$db_name = 'mikawayatsuhashi_db_yatsuhasi';
$db_user = 'mikawayatsuhashi';
$db_pass = 'yatsuhashi2019';

try {
    // 必要なパラメータのチェック
    if (!isset($_GET['student_id'])) {
        throw new Exception('Required parameters are missing');
    }

    $student_id = intval($_GET['student_id']);

    // データベース接続
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed: ' . $mysqli->connect_error);
    }

    // 文字コード設定
    $mysqli->set_charset('utf8');

    // テストスコアの取得
    $query = "SELECT 
                ysts.id,
                ysts.student_id,
                ysts.test_definition_id,
                ysts.japanese_score,
                ysts.math_score,
                ysts.english_score,
                ysts.science_score,
                ysts.social_score,
                ysts.total_score,
                ysts.class_rank,
                ysts.created_at,
                td.test_name,
                td.scheduled_date
            FROM 
                y_student_test_scores ysts
            JOIN 
                test_definitions td ON ysts.test_definition_id = td.id
            WHERE 
                ysts.student_id = ?
            ORDER BY 
                td.scheduled_date DESC";

    $stmt = $mysqli->prepare($query);
    if (!$stmt) {
        throw new Exception('Failed to prepare statement');
    }

    $stmt->bind_param('i', $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $scores = array();
    while ($row = $result->fetch_assoc()) {
        $scores[] = array(
            'id' => intval($row['id']),
            'student_id' => intval($row['student_id']),
            'test_definition_id' => intval($row['test_definition_id']),
            'japanese_score' => intval($row['japanese_score']),
            'math_score' => intval($row['math_score']),
            'english_score' => intval($row['english_score']),
            'science_score' => intval($row['science_score']),
            'social_score' => intval($row['social_score']),
            'total_score' => intval($row['total_score']),
            'class_rank' => intval($row['class_rank']),
            'created_at' => $row['created_at'],
            'test_name' => $row['test_name'],
            'scheduled_date' => $row['scheduled_date']
        );
    }

    // レスポンスの作成
    $response = array(
        'success' => true,
        'scores' => $scores
    );

    $stmt->close();
    $mysqli->close();

} catch (Exception $e) {
    $response = array(
        'success' => false,
        'error' => $e->getMessage()
    );
    http_response_code(400);
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>