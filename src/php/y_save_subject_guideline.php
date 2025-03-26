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

// POSTリクエスト以外は拒否
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "許可されていないメソッドです"
    ]);
    exit();
}

try {
    // タイムゾーンを設定
    date_default_timezone_set('Asia/Tokyo');

    // POSTデータの取得
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // データの検証
    if (
        !isset($data['subject_id']) || 
        !isset($data['teacher_id'])
    ) {
        throw new Exception("必要なパラメータが不足しています");
    }

    $subjectId = intval($data['subject_id']);
    $teacherId = intval($data['teacher_id']);
    
    // アクション（削除または保存）を取得
    $action = isset($data['action']) ? $data['action'] : 'save';

    // 削除アクションの場合
    if ($action === 'delete') {
        // 削除処理
        return handleDelete($subjectId, $teacherId);
    }
    
    // 保存アクションの場合
    if (!isset($data['content'])) {
        throw new Exception("内容が指定されていません");
    }
    
    $content = trim($data['content']);

    if (empty($content)) {
        throw new Exception("学習ポイントの内容が空です");
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

    // トランザクション開始
    $conn->begin_transaction();

    try {
        // 既存のレコードを探す
        $checkQuery = "SELECT guideline_id FROM y_subject_guidelines 
                      WHERE subject_id = ?";
        $checkStmt = $conn->prepare($checkQuery);
        
        if (!$checkStmt) {
            throw new Exception("クエリの準備に失敗しました: " . $conn->error);
        }
        
        $checkStmt->bind_param("i", $subjectId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            // 既存のレコードを更新
            $row = $checkResult->fetch_assoc();
            $guidelineId = $row['guideline_id'];
            
            $updateQuery = "UPDATE y_subject_guidelines 
                          SET content = ?, updated_by = ?, updated_at = NOW() 
                          WHERE guideline_id = ?";
            $updateStmt = $conn->prepare($updateQuery);
            
            if (!$updateStmt) {
                throw new Exception("更新クエリの準備に失敗しました: " . $conn->error);
            }
            
            $updateStmt->bind_param("sii", $content, $teacherId, $guidelineId);
            $updateStmt->execute();
            
            if ($updateStmt->affected_rows === 0) {
                throw new Exception("学習ポイントの更新に失敗しました");
            }
            
            $updateStmt->close();
        } else {
            // 新しいレコードを挿入
            $insertQuery = "INSERT INTO y_subject_guidelines 
                          (subject_id, content, updated_by, updated_at) 
                          VALUES (?, ?, ?, NOW())";
            $insertStmt = $conn->prepare($insertQuery);
            
            if (!$insertStmt) {
                throw new Exception("挿入クエリの準備に失敗しました: " . $conn->error);
            }
            
            $insertStmt->bind_param("isi", $subjectId, $content, $teacherId);
            $insertStmt->execute();
            
            if ($insertStmt->affected_rows === 0) {
                throw new Exception("学習ポイントの追加に失敗しました");
            }
            
            $guidelineId = $insertStmt->insert_id;
            $insertStmt->close();
        }
        
        $checkStmt->close();
        
        // トランザクションをコミット
        $conn->commit();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "guideline_id" => $guidelineId,
            "message" => "学習ポイントが正常に保存されました"
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        // エラーが発生した場合はロールバック
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
} finally {
    if (isset($checkStmt) && $checkStmt instanceof mysqli_stmt) {
        $checkStmt->close();
    }
    if (isset($updateStmt) && $updateStmt instanceof mysqli_stmt) {
        $updateStmt->close();
    }
    if (isset($insertStmt) && $insertStmt instanceof mysqli_stmt) {
        $insertStmt->close();
    }
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}

// 削除機能を処理する関数
function handleDelete($subjectId, $teacherId) {
    try {
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

        // トランザクション開始
        $conn->begin_transaction();

        try {
            // 削除クエリ
            $deleteQuery = "DELETE FROM y_subject_guidelines WHERE subject_id = ?";
            $deleteStmt = $conn->prepare($deleteQuery);
            
            if (!$deleteStmt) {
                throw new Exception("削除クエリの準備に失敗しました: " . $conn->error);
            }
            
            $deleteStmt->bind_param("i", $subjectId);
            $deleteStmt->execute();
            
            // 削除対象がなくてもエラーとはしない
            // if ($deleteStmt->affected_rows === 0) {
            //     throw new Exception("削除するガイドラインが見つかりませんでした");
            // }
            
            $deleteStmt->close();
            
            // トランザクションをコミット
            $conn->commit();
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "学習ポイントが正常に削除されました"
            ], JSON_UNESCAPED_UNICODE);
            exit;
            
        } catch (Exception $e) {
            // エラーが発生した場合はロールバック
            $conn->rollback();
            throw $e;
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } finally {
        if (isset($deleteStmt) && $deleteStmt instanceof mysqli_stmt) {
            $deleteStmt->close();
        }
        if (isset($conn) && $conn instanceof mysqli) {
            $conn->close();
        }
    }
}
?>