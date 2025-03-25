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
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }

    $studentId = isset($data['student_id']) ? intval($data['student_id']) : 0;
    if ($studentId <= 0) {
        throw new Exception('Invalid student ID');
    }

    // データベース接続
    $mysqli = new mysqli('mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');

    if ($mysqli->connect_errno) {
        throw new Exception('Database connection error: ' . $mysqli->connect_error);
    }

    $mysqli->set_charset('utf8');
    
    // トランザクション開始
    $mysqli->begin_transaction();

    try {
        // 現在のbomb countを取得
        $stmt = $mysqli->prepare("SELECT bomb, student, school_id, grade_id FROM student WHERE student_id = ?");
        if (!$stmt) {
            throw new Exception('Failed to prepare select statement');
        }

        $stmt->bind_param('i', $studentId);
        if (!$stmt->execute()) {
            throw new Exception('Failed to execute select query');
        }

        $result = $stmt->get_result();
        $studentInfo = $result->fetch_assoc();

        if (!$studentInfo) {
            throw new Exception('Student not found');
        }

        // 現在のbomb countを取得して1増やす
        $currentBomb = intval($studentInfo['bomb']);
        $newBombCount = $currentBomb + 1;
        $isReset = false;

        // bomb countが3に達した場合はリセット
        if ($newBombCount >= 3) {
            $newBombCount = 0;
            $isReset = true;
        }

        // bomb countを更新
        $updateStmt = $mysqli->prepare("UPDATE student SET bomb = ? WHERE student_id = ?");
        if (!$updateStmt) {
            throw new Exception('Failed to prepare update statement');
        }

        $updateStmt->bind_param('ii', $newBombCount, $studentId);
        if (!$updateStmt->execute()) {
            throw new Exception('Failed to update bomb count');
        }

        // トランザクションをコミット
        $mysqli->commit();

        echo json_encode([
            'success' => true,
            'bombCount' => $newBombCount,
            'previousBombCount' => $currentBomb,
            'resetted' => $isReset,
            'studentName' => $studentInfo['student'],
            'schoolId' => intval($studentInfo['school_id']),
            'gradeId' => intval($studentInfo['grade_id'])
        ]);

    } catch (Exception $e) {
        $mysqli->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($updateStmt)) {
        $updateStmt->close();
    }
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($mysqli)) {
        $mysqli->close();
    }
}
?>