<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header('Content-Type: application/json');

try {
    $conn = mysqli_connect(
        "mysql749.db.sakura.ne.jp", 
        "mikawayatsuhashi", 
        "yatsuhashi2019", 
        "mikawayatsuhashi_db_yatsuhasi"
    );

    if ($conn->connect_error) {
        throw new Exception("データベース接続エラー: " . $conn->connect_error);
    }

    // パラメータの取得と検証
    $studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : null;
    $schoolId = isset($_GET['school_id']) ? intval($_GET['school_id']) : null;
    $gradeId = isset($_GET['grade_id']) ? intval($_GET['grade_id']) : null;
    $subject = isset($_GET['subject']) ? $_GET['subject'] : null;

    // 必須パラメータの検証
    if (!$studentId || !$schoolId || !$gradeId || !$subject) {
        throw new Exception("必須パラメータが不足しています");
    }

    // 科目IDの変換
    $subjectMap = [
        "英語" => 1,
        "数学" => 2,
        "理科" => 3,
        "社会" => 4,
        "国語" => 5
    ];

    $subjectId = $subjectMap[$subject] ?? null;
    if ($subjectId === null) {
        throw new Exception("無効な科目名です: $subject");
    }

    // 生徒の科目別レベルを取得
    $levelSql = "
        SELECT COALESCE(level_id, 2) as level_id 
        FROM y_student_subject_levels 
        WHERE student_id = ? 
        AND subject_id = ?
    ";
    
    $levelStmt = $conn->prepare($levelSql);
    if (!$levelStmt) {
        throw new Exception("レベル取得クエリの準備エラー: " . $conn->error);
    }
    
    $levelStmt->bind_param("ii", $studentId, $subjectId);
    $levelStmt->execute();
    $levelResult = $levelStmt->get_result();
    $studentLevel = $levelResult->fetch_assoc()['level_id'] ?? 2;
    $levelStmt->close();

    // メインクエリ
    $sql = "
    SELECT 
        u.unit_id,
        u.unit_name,
        u.number,
        uo.order_id as unit_order_id,
        uo.order_index,
        uo.isTestRange,
        uo.level_id,
        uo.duplicate_number,
        COALESCE(
            (SELECT completion_date 
             FROM y_progress_records cpr2 
             JOIN unit_orders uo2 ON cpr2.unit_order_id = uo2.order_id 
             WHERE cpr2.student_id = ? 
             AND uo2.unit_id = u.unit_id 
             AND uo2.duplicate_number = uo.duplicate_number
             LIMIT 1)
        ) as completion_date,
        COALESCE(
            (SELECT teacher_id 
             FROM y_progress_records cpr2 
             JOIN unit_orders uo2 ON cpr2.unit_order_id = uo2.order_id 
             WHERE cpr2.student_id = ? 
             AND uo2.unit_id = u.unit_id 
             AND uo2.duplicate_number = uo.duplicate_number
             LIMIT 1)
        ) as teacher_id,
        COALESCE(
            (SELECT usr.username 
             FROM y_progress_records cpr2 
             JOIN unit_orders uo2 ON cpr2.unit_order_id = uo2.order_id 
             JOIN users usr ON cpr2.teacher_id = usr.user_id
             WHERE cpr2.student_id = ? 
             AND uo2.unit_id = u.unit_id 
             AND uo2.duplicate_number = uo.duplicate_number
             LIMIT 1)
        ) as teacher_name,
        COALESCE(
            (SELECT is_school_completed 
             FROM y_progress_records cpr2 
             JOIN unit_orders uo2 ON cpr2.unit_order_id = uo2.order_id 
             WHERE cpr2.student_id = ? 
             AND uo2.unit_id = u.unit_id 
             AND uo2.duplicate_number = uo.duplicate_number
             LIMIT 1),
            0
        ) as is_school_completed,
        COALESCE(
            (SELECT homework_assigned 
             FROM y_progress_records cpr2 
             JOIN unit_orders uo2 ON cpr2.unit_order_id = uo2.order_id 
             WHERE cpr2.student_id = ? 
             AND uo2.unit_id = u.unit_id 
             AND uo2.duplicate_number = uo.duplicate_number
             LIMIT 1),
            0
        ) as homework_assigned,
        COALESCE(
            (SELECT ct_status 
             FROM y_progress_records cpr2 
             JOIN unit_orders uo2 ON cpr2.unit_order_id = uo2.order_id 
             WHERE cpr2.student_id = ? 
             AND uo2.unit_id = u.unit_id 
             AND uo2.duplicate_number = uo.duplicate_number
             LIMIT 1),
            '未実施'
        ) as ct_status,
        COALESCE(
            (SELECT homework_status 
             FROM y_progress_records cpr2 
             JOIN unit_orders uo2 ON cpr2.unit_order_id = uo2.order_id 
              WHERE cpr2.student_id = ? 
             AND uo2.unit_id = u.unit_id 
             AND uo2.duplicate_number = uo.duplicate_number
             LIMIT 1),
            '未チェック'
        ) as homework_status
    FROM 
        unit_orders uo
        JOIN units u ON uo.unit_id = u.unit_id
    WHERE 
        uo.school_id = ?
        AND uo.grade_id = ?
        AND uo.subject_id = ?
        AND uo.level_id = ?
        AND (uo.isHidden = 0 OR uo.isHidden IS NULL)
    ORDER BY 
        uo.order_index ASC,
        uo.duplicate_number ASC
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("クエリ準備エラー: " . $conn->error);
    }

    $stmt->bind_param("iiiiiiiiiii", 
        $studentId,   // completion_date
        $studentId,   // teacher_id
        $studentId,   // teacher_name
        $studentId,   // is_school_completed
        $studentId,   // homework_assigned
        $studentId,   // ct_status
        $studentId,   // homework_status
        $schoolId,    // WHERE clause
        $gradeId,
        $subjectId,
        $studentLevel
    );
    
    if (!$stmt->execute()) {
        throw new Exception("クエリ実行エラー: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $data = [];

    while ($row = $result->fetch_assoc()) {
        // ブール値の変換
        $row['isTestRange'] = (bool)$row['isTestRange'];
        $row['is_school_completed'] = (bool)$row['is_school_completed'];
        $row['homework_assigned'] = (bool)$row['homework_assigned'];
        
        // データ型の調整
        $row['number'] = $row['number'] ?? '';
        $row['completion_date'] = $row['completion_date'] ?? null;
        $row['teacher_id'] = $row['teacher_id'] ? intval($row['teacher_id']) : null;
        $row['teacher_name'] = $row['teacher_name'] ?: null;
        $row['level_id'] = intval($row['level_id']);
        $row['duplicate_number'] = intval($row['duplicate_number']);
        
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);

} catch (Exception $e) {
    error_log("Error in statement_get_y_student_progress.php: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>