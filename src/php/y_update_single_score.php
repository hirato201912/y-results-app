<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

error_reporting(E_ALL);
ini_set('display_errors', 1);

// データベース接続情報
$db_host = 'mysql749.db.sakura.ne.jp';
$db_name = 'mikawayatsuhashi_db_yatsuhasi';
$db_user = 'mikawayatsuhashi';
$db_pass = 'yatsuhashi2019';

try {
    // 必要なパラメータのチェック
    if (!isset($_POST['student_id']) || !isset($_POST['test_definition_id'])) {
        throw new Exception('Required parameters are missing');
    }

    $student_id = intval($_POST['student_id']);
    $test_definition_id = intval($_POST['test_definition_id']);

    // データベース接続
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed: ' . $mysqli->connect_error);
    }

    $mysqli->set_charset('utf8');

    // 既存のレコードをチェック
    $check_query = "SELECT * FROM y_student_test_scores WHERE student_id = ? AND test_definition_id = ?";
    $check_stmt = $mysqli->prepare($check_query);
    if (!$check_stmt) {
        throw new Exception('Failed to prepare check statement');
    }

    $check_stmt->bind_param('ii', $student_id, $test_definition_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    $existing_record = $check_result->fetch_assoc();

    if (!$existing_record) {
        throw new Exception('Test record not found');
    }

    // 更新する項目を判定
    if (isset($_POST['subject'])) {
        // 科目スコアの更新
        $subject = $_POST['subject'];
        $allowed_subjects = ['japanese_score', 'math_score', 'english_score', 'science_score', 'social_score'];
        
        if (!in_array($subject, $allowed_subjects)) {
            throw new Exception('Invalid subject');
        }

        $score = isset($_POST['score']) ? intval($_POST['score']) : null;
        
        // スコアの範囲チェック
        if ($score !== null && ($score < 0 || $score > 100)) {
            throw new Exception('Score must be between 0 and 100');
        }

        // 科目スコアを更新
        $update_query = "UPDATE y_student_test_scores SET $subject = ?, updated_at = CURRENT_TIMESTAMP WHERE student_id = ? AND test_definition_id = ?";
        $update_stmt = $mysqli->prepare($update_query);
        if (!$update_stmt) {
            throw new Exception('Failed to prepare update statement');
        }

        $update_stmt->bind_param('iii', $score, $student_id, $test_definition_id);

        if (!$update_stmt->execute()) {
            throw new Exception('Failed to update score: ' . $update_stmt->error);
        }

        // 合計点を再計算
        $recalc_query = "SELECT japanese_score, math_score, english_score, science_score, social_score FROM y_student_test_scores WHERE student_id = ? AND test_definition_id = ?";
        $recalc_stmt = $mysqli->prepare($recalc_query);
        $recalc_stmt->bind_param('ii', $student_id, $test_definition_id);
        $recalc_stmt->execute();
        $recalc_result = $recalc_stmt->get_result();
        $scores = $recalc_result->fetch_assoc();

        $total_score = null;
        if ($scores) {
            $subject_scores = [
                $scores['japanese_score'],
                $scores['math_score'],
                $scores['english_score'],
                $scores['science_score'],
                $scores['social_score']
            ];

            // 全科目にスコアがある場合のみ合計を計算
            $valid_scores = array_filter($subject_scores, function($s) { return $s !== null && $s > 0; });
            if (count($valid_scores) === 5) {
                $total_score = array_sum($valid_scores);
            }
        }

        // 合計点を更新
        $total_update_query = "UPDATE y_student_test_scores SET total_score = ? WHERE student_id = ? AND test_definition_id = ?";
        $total_update_stmt = $mysqli->prepare($total_update_query);
        $total_update_stmt->bind_param('iii', $total_score, $student_id, $test_definition_id);
        $total_update_stmt->execute();

        $response = array(
            'success' => true,
            'message' => 'Score updated successfully',
            'updated_field' => $subject,
            'new_score' => $score,
            'new_total_score' => $total_score
        );

    } else if (isset($_POST['field']) && $_POST['field'] === 'class_rank') {
        // 順位の更新
        $rank = isset($_POST['value']) ? intval($_POST['value']) : null;
        
        // 順位の範囲チェック
        if ($rank !== null && ($rank < 1 || $rank > 999)) {
            throw new Exception('Rank must be between 1 and 999');
        }

        $update_query = "UPDATE y_student_test_scores SET class_rank = ?, updated_at = CURRENT_TIMESTAMP WHERE student_id = ? AND test_definition_id = ?";
        $update_stmt = $mysqli->prepare($update_query);
        if (!$update_stmt) {
            throw new Exception('Failed to prepare update statement');
        }

        $update_stmt->bind_param('iii', $rank, $student_id, $test_definition_id);

        if (!$update_stmt->execute()) {
            throw new Exception('Failed to update rank: ' . $update_stmt->error);
        }

        $response = array(
            'success' => true,
            'message' => 'Rank updated successfully',
            'updated_field' => 'class_rank',
            'new_rank' => $rank
        );

    } else {
        throw new Exception('Invalid update request');
    }

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