<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    if (!isset($data['student_id']) || !isset($data['unit_order_id'])) {
        throw new Exception("必須パラメータが不足しています");
    }

    $studentId = intval($data['student_id']);
    $unitOrderId = intval($data['unit_order_id']);
    $teacherId = isset($data['teacher_id']) ? intval($data['teacher_id']) : null;
    $updateData = $data['update_data'] ?? [];

    $conn->begin_transaction();

    // 既存レコードの確認
    $checkSql = "SELECT 1 FROM y_progress_records WHERE student_id = ? AND unit_order_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ii", $studentId, $unitOrderId);
    $checkStmt->execute();
    $exists = $checkStmt->get_result()->num_rows > 0;
    $checkStmt->close();

    if ($exists) {
        $updateParts = [];
        $updateParams = [];
        $types = "";

        // 完了処理の場合
        if (isset($updateData['completion_date'])) {
            $updateParts[] = "completion_date = ?";
            $updateParts[] = "teacher_id = ?";
            $updateParams[] = $updateData['completion_date'];
            $updateParams[] = $teacherId;
            $types .= "si"; // string, integer
        }

        // その他のフィールドの更新
        if (isset($updateData['is_school_completed'])) {
            $updateParts[] = "is_school_completed = ?";
            $updateParams[] = $updateData['is_school_completed'];
            $types .= "i";
        }

        if (isset($updateData['homework_assigned'])) {
            $updateParts[] = "homework_assigned = ?";
            $updateParams[] = $updateData['homework_assigned'];
            $types .= "i";
        }

        if (isset($updateData['ct_status'])) {
            $updateParts[] = "ct_status = ?";
            $updateParams[] = $updateData['ct_status'];
            $types .= "s";
        }

        if (isset($updateData['homework_status'])) {
            $updateParts[] = "homework_status = ?";
            $updateParams[] = $updateData['homework_status'];
            $types .= "s";
        }

        // WHERE句のパラメータを追加
        $updateParams[] = $studentId;
        $updateParams[] = $unitOrderId;
        $types .= "ii";

        $updateSql = "UPDATE y_progress_records SET " . 
                    implode(", ", $updateParts) . 
                    " WHERE student_id = ? AND unit_order_id = ?";

        $stmt = $conn->prepare($updateSql);
        if (!$stmt) {
            throw new Exception("UPDATE準備エラー: " . $conn->error);
        }

        $stmt->bind_param($types, ...$updateParams);
        
        if (!$stmt->execute()) {
            throw new Exception("UPDATE実行エラー: " . $stmt->error);
        }
    } else {
        // 新規レコードの作成
        $stmt = $conn->prepare("INSERT INTO y_progress_records 
            (student_id, unit_order_id, completion_date, teacher_id, 
             is_school_completed, homework_assigned, ct_status, homework_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("INSERT準備エラー: " . $conn->error);
        }

        $completionDate = $updateData['completion_date'] ?? null;
        $isSchoolCompleted = $updateData['is_school_completed'] ?? 0;
        $homeworkAssigned = $updateData['homework_assigned'] ?? 0;
        $ctStatus = $updateData['ct_status'] ?? '未実施';
        $homeworkStatus = $updateData['homework_status'] ?? '未チェック';

        $stmt->bind_param("iisiisss", 
            $studentId, 
            $unitOrderId,
            $completionDate,
            $teacherId,
            $isSchoolCompleted,
            $homeworkAssigned,
            $ctStatus,
            $homeworkStatus
        );
        
        if (!$stmt->execute()) {
            throw new Exception("INSERT実行エラー: " . $stmt->error);
        }
    }

    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "更新が完了しました",
        "debug" => [
            "action" => $exists ? "update" : "insert",
            "affected_rows" => $stmt->affected_rows
        ]
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }
    
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "debug" => [
            "received_data" => $data ?? null,
            "error_details" => $e->getMessage()
        ]
    ]);

} finally {
    if (isset($stmt) && $stmt !== false) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>