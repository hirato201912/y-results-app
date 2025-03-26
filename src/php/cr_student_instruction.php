<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

    // アクションパラメータを取得
    $action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');
    
    // student_idパラメータを取得
    $studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : (isset($_POST['student_id']) ? intval($_POST['student_id']) : 0);
    
    if (empty($studentId)) {
        throw new Exception("student_id パラメータが必要です");
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

    // アクションに基づいて処理を分岐
    if ($action === 'get') {
        // 学習指示を取得
        $query = "SELECT comment2 FROM student WHERE student_id = ?";
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("クエリの準備に失敗しました: " . $conn->error);
        }

        $stmt->bind_param("i", $studentId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("指定された生徒IDが見つかりません: " . $studentId);
        }

        $data = $result->fetch_assoc();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "instruction" => $data['comment2']
        ], JSON_UNESCAPED_UNICODE);
        
    } elseif ($action === 'update') {
        // 学習指示を更新
        $instruction = isset($_POST['instruction']) ? $_POST['instruction'] : '';
        
        $query = "UPDATE student SET comment2 = ? WHERE student_id = ?";
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("クエリの準備に失敗しました: " . $conn->error);
        }

        $stmt->bind_param("si", $instruction, $studentId);
        $success = $stmt->execute();
        
        if (!$success) {
            throw new Exception("更新に失敗しました: " . $stmt->error);
        }
        
        if ($stmt->affected_rows === 0) {
            throw new Exception("生徒情報が見つからないか、変更がありませんでした");
        }
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "学習指示を更新しました"
        ], JSON_UNESCAPED_UNICODE);
        
    } else {
        throw new Exception("不明なアクション: " . $action);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

} finally {
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        $stmt->close();
    }
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>