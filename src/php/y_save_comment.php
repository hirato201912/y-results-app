<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

    // POSTデータの取得と検証
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }

    if (!isset($data['message']) || !isset($data['student_id']) || !isset($data['teacher_name'])) {
        throw new Exception("必須パラメータが不足しています");
    }

    // パラメータの取得
    $message = $data['message'];
    $studentId = intval($data['student_id']);
    $teacherName = $data['teacher_name'];
    $now = date("Y-m-d H:i:s");

    // 生徒情報を取得
    $studentQuery = "SELECT student FROM student WHERE student_id = ?";
    $studentStmt = $conn->prepare($studentQuery);
    
    if (!$studentStmt) {
        throw new Exception("生徒情報クエリの準備に失敗しました: " . $conn->error);
    }

    $studentStmt->bind_param("i", $studentId);
    $studentStmt->execute();
    $studentResult = $studentStmt->get_result();
    
    if ($studentResult->num_rows === 0) {
        throw new Exception("指定された生徒IDが見つかりません: " . $studentId);
    }

    $studentData = $studentResult->fetch_assoc();
    $studentName = $studentData['student'];
    $studentStmt->close();

    // コメントを保存
    $stmt = $conn->prepare(
        "INSERT INTO message (message, post_date, student, username, fixed) 
         VALUES (?, ?, ?, ?, 0)"
    );

    if (!$stmt) {
        throw new Exception("コメント保存クエリの準備に失敗しました: " . $conn->error);
    }

    $stmt->bind_param("ssss", $message, $now, $studentName, $teacherName);

    if (!$stmt->execute()) {
        throw new Exception("コメントの保存に失敗しました: " . $stmt->error);
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "コメントを保存しました",
        "debug" => [
            "insert_id" => $stmt->insert_id,
            "affected_rows" => $stmt->affected_rows,
            "student_name" => $studentName,
            "post_date" => $now
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "debug" => [
            "received_data" => $data ?? null,
            "error_details" => $e->getMessage()
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;

} finally {
    if (isset($studentStmt) && $studentStmt instanceof mysqli_stmt) {
        $studentStmt->close();
    }
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        $stmt->close();
    }
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>