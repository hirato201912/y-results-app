<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // student_idパラメータの検証
    if (!isset($_GET['student_id'])) {
        throw new Exception('Student ID is required');
    }

    $studentId = filter_var($_GET['student_id'], FILTER_VALIDATE_INT);
    if ($studentId === false || $studentId <= 0) {
        throw new Exception('Invalid student ID');
    }

    // データベース接続
    $mysqli = new mysqli(
        'mysql749.db.sakura.ne.jp',
        'mikawayatsuhashi',
        'yatsuhashi2019',
        'mikawayatsuhashi_db_yatsuhasi'
    );

    if ($mysqli->connect_errno) {
        throw new Exception('Database connection error: ' . $mysqli->connect_error);
    }

    // 文字セットをUTF-8に設定
    $mysqli->set_charset('utf8');

    // プリペアドステートメントの作成
    $sql = "SELECT student_id, bomb, student FROM student WHERE student_id = ?";
    $stmt = $mysqli->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement');
    }

    // パラメータのバインドと実行
    $stmt->bind_param('i', $studentId);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute query');
    }

    $result = $stmt->get_result();
    
    if (!$result) {
        throw new Exception('Failed to get result');
    }

    $row = $result->fetch_assoc();

    if (!$row) {
        // 生徒が見つからない場合
        echo json_encode([
            'success' => false,
            'error' => 'Student not found',
            'bombCount' => 0
        ]);
    } else {
        // 成功時のレスポンス
        echo json_encode([
            'success' => true,
            'bombCount' => intval($row['bomb']),
            'studentId' => intval($row['student_id']), 
            'studentName' => $row['student']
        ]);
    }

} catch (Exception $e) {
    // エラー時のレスポンス
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'bombCount' => 0
    ]);
} finally {
    // データベース接続のクリーンアップ
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($mysqli)) {
        $mysqli->close();
    }
}