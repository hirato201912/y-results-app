<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// プリフライトリクエストの処理
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // タイムゾーンを設定
    date_default_timezone_set('Asia/Tokyo');

    // パラメータの取得
    $subjectId = isset($_GET['subject_id']) ? intval($_GET['subject_id']) : null;

    // パラメータのバリデーション
    if (empty($subjectId)) {
        throw new Exception("subject_id が必要です");
    }

    // データベース接続
    $conn = mysqli_connect(
        "mysql749.db.sakura.ne.jp", 
        "mikawayatsuhashi", 
        "yatsuhashi2019", 
        "mikawayatsuhashi_db_yatsuhasi"
    );

    if ($conn->connect_error) {
        throw new Exception("データベース接続エラー: " . $conn->connect_error);
    }

    // 文字コード設定
    $conn->set_charset('utf8');

    // ガイドラインを取得するクエリ（teachersテーブル参照を削除）
    $query = "SELECT guideline_id, subject_id, content, updated_by, updated_at 
              FROM y_subject_guidelines
              WHERE subject_id = ?";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("クエリの準備に失敗しました: " . $conn->error);
    }
    
    $stmt->bind_param("i", $subjectId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // データが見つからない場合も正常応答として返す
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => null
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $guideline = $result->fetch_assoc();
    
    // 更新者名は一時的に塾長に設定
    $guideline['updater_name'] = '塾長';

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $guideline
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
} finally {
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        $stmt->close();
    }
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>