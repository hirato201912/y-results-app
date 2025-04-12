<?php
// デバッグモード設定
ini_set('display_errors', 0);
error_reporting(E_ALL);

// HTTPヘッダー設定
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// データベース接続情報
$db_host = 'mysql749.db.sakura.ne.jp';
$db_name = 'mikawayatsuhashi_db_yatsuhasi';
$db_user = 'mikawayatsuhashi';
$db_pass = 'yatsuhashi2019';

// APIキーの検証を行う関数
function verifyApiKey($apiKey) {
    $verify_url = "https://mikawayatsuhashi.sakura.ne.jp/verify_api_key.php?api_key=" . urlencode($apiKey);
    $context = stream_context_create([
        'http' => [
            'ignore_errors' => true,
            'timeout' => 3  // タイムアウト3秒
        ]
    ]);

    $response = @file_get_contents($verify_url, false, $context);
    if ($response === false) {
        error_log('API key verification request failed');
        return false;
    }

    $result = json_decode($response, true);
    return isset($result['valid']) && $result['valid'] === true;
}

// 科目スコアのバリデーション関数（0～100点を想定）
function validateScore($score) {
    // デバッグ用のログ
    error_log("Validating score: " . var_export($score, true));

    if ($score === null || $score === '') {
        error_log("Score is null or empty - returning null");
        return null;
    }

    if (!is_numeric($score)) {
        error_log("Score is not numeric - returning false");
        return false;
    }

    $score = intval($score);
    // 科目スコアは 0～100 の範囲でチェック
    $isValid = ($score >= 0 && $score <= 100);
    error_log("Score after validation: " . ($isValid ? $score : "invalid"));

    return $isValid ? $score : false;
}

// 合計点のバリデーション関数（例: 最大500点を想定）
function validateTotalScore($score) {
    error_log("Validating total_score: " . var_export($score, true));

    if ($score === null || $score === '') {
        error_log("total_score is null or empty - returning null");
        return null;
    }

    if (!is_numeric($score)) {
        error_log("total_score is not numeric - returning false");
        return false;
    }

    $score = intval($score);
    // 合計点は 0～500 の範囲でチェック
    $isValid = ($score >= 0 && $score <= 500);
    error_log("total_score after validation: " . ($isValid ? $score : "invalid"));

    return $isValid ? $score : false;
}

// 順位のバリデーション関数（0～999を想定）
function validateRank($rank) {
    error_log("Validating rank: " . var_export($rank, true));

    if ($rank === null || $rank === '') {
        error_log("Rank is null or empty - returning null");
        return null;
    }

    if (!is_numeric($rank)) {
        error_log("Rank is not numeric - returning false");
        return false;
    }

    $rank = intval($rank);
    // 順位は 0～999 の範囲でチェック
    $isValid = ($rank >= 0 && $rank <= 999);
    error_log("Rank after validation: " . ($isValid ? $rank : "invalid"));

    return $isValid ? $rank : false;
}

try {
    // POSTデータのログ
    error_log('Received POST data: ' . print_r($_POST, true));

    // POSTメソッドチェック
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method is allowed');
    }

    // APIキーのチェック
    if (!isset($_POST['api_key'])) {
        error_log('API key missing from request');
        throw new Exception('API key is required');
    }

    $api_key = $_POST['api_key'];
    error_log('Verifying API key: ' . $api_key);

    // APIキーの検証
    if (!verifyApiKey($api_key)) {
        error_log('Invalid API key: ' . $api_key);
        throw new Exception('Invalid API Key');
    }

    // 必須パラメータのチェック
    if (!isset($_POST['student_id']) || !isset($_POST['test_definition_id'])) {
        throw new Exception('Required parameters are missing');
    }

    // パラメータの取得
    $student_id = intval($_POST['student_id']);
    $test_definition_id = intval($_POST['test_definition_id']);

    // スコアの検証
    $japanese_score = isset($_POST['japanese_score']) ? validateScore($_POST['japanese_score']) : null;
    $math_score     = isset($_POST['math_score'])     ? validateScore($_POST['math_score'])     : null;
    $english_score  = isset($_POST['english_score'])  ? validateScore($_POST['english_score'])  : null;
    $science_score  = isset($_POST['science_score'])  ? validateScore($_POST['science_score'])  : null;
    $social_score   = isset($_POST['social_score'])   ? validateScore($_POST['social_score'])   : null;
    
    // 合計点は別のバリデーションでチェック
    $total_score = isset($_POST['total_score']) ? validateTotalScore($_POST['total_score']) : null;

    // 順位の検証
    $class_rank  = isset($_POST['class_rank'])  ? validateRank($_POST['class_rank'])         : null;

    // バリデーション結果のログ
    error_log("Validation results:");
    error_log("japanese_score: " . var_export($japanese_score, true));
    error_log("math_score: "     . var_export($math_score, true));
    error_log("english_score: "  . var_export($english_score, true));
    error_log("science_score: "  . var_export($science_score, true));
    error_log("social_score: "   . var_export($social_score, true));
    error_log("total_score: "    . var_export($total_score, true));
    error_log("class_rank: "     . var_export($class_rank, true));

    // バリデーションエラーチェック
    $validation_errors = [];
    if ($japanese_score === false) $validation_errors[] = "Invalid japanese_score";
    if ($math_score     === false) $validation_errors[] = "Invalid math_score";
    if ($english_score  === false) $validation_errors[] = "Invalid english_score";
    if ($science_score  === false) $validation_errors[] = "Invalid science_score";
    if ($social_score   === false) $validation_errors[] = "Invalid social_score";
    if ($total_score    === false) $validation_errors[] = "Invalid total_score";
    if ($class_rank     === false) $validation_errors[] = "Invalid class_rank";

    if (!empty($validation_errors)) {
        error_log('Validation errors: ' . implode(', ', $validation_errors));
        throw new Exception('Invalid score or rank value');
    }

    // データベース接続
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed: ' . $mysqli->connect_error);
    }

    // 文字コード設定
    $mysqli->set_charset("utf8");

    // トランザクション開始
    $mysqli->begin_transaction();

    try {
        // 八橋校のテーブルを使用
        // 既存のレコードチェック
        $check_query = "SELECT id FROM y_student_test_scores 
                       WHERE student_id = ? AND test_definition_id = ?";
        $check_stmt = $mysqli->prepare($check_query);
        if (!$check_stmt) {
            throw new Exception('Failed to prepare check statement');
        }

        $check_stmt->bind_param('ii', $student_id, $test_definition_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $existing_record = $check_result->fetch_assoc();
        $check_stmt->close();

        if ($existing_record) {
            // 更新クエリ - 八橋校テーブルに対して
            $query = "UPDATE y_student_test_scores SET 
                     japanese_score = ?, math_score = ?, english_score = ?,
                     science_score = ?, social_score = ?, total_score = ?,
                     class_rank = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?";

            $stmt = $mysqli->prepare($query);
            if (!$stmt) {
                throw new Exception('Failed to prepare update statement');
            }

            $stmt->bind_param(
                'iiiiiiii',
                $japanese_score,
                $math_score,
                $english_score,
                $science_score,
                $social_score,
                $total_score,
                $class_rank,
                $existing_record['id']
            );
        } else {
            // 新規挿入クエリ - 八橋校テーブルに対して
            $query = "INSERT INTO y_student_test_scores 
                     (student_id, test_definition_id, japanese_score, math_score,
                      english_score, science_score, social_score, total_score,
                      class_rank, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 
                            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

            $stmt = $mysqli->prepare($query);
            if (!$stmt) {
                throw new Exception('Failed to prepare insert statement');
            }

            $stmt->bind_param(
                'iiiiiiiii',
                $student_id,
                $test_definition_id,
                $japanese_score,
                $math_score,
                $english_score,
                $science_score,
                $social_score,
                $total_score,
                $class_rank
            );
        }

        // クエリ実行
        if (!$stmt->execute()) {
            throw new Exception('Failed to execute query: ' . $stmt->error);
        }

        // トランザクションのコミット
        $mysqli->commit();

        // 成功レスポンス
        $response = array(
            'success' => true,
            'message' => $existing_record ? 'Score updated successfully' : 'Score saved successfully',
            'record_id' => $existing_record ? $existing_record['id'] : $mysqli->insert_id
        );

        // ステートメントのクローズ
        $stmt->close();

    } catch (Exception $e) {
        // エラー発生時はロールバック
        $mysqli->rollback();
        throw $e;
    }

    // データベース接続のクローズ
    $mysqli->close();

    // 正常終了時のレスポンス
    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log('Error in y_save_test_scores.php: ' . $e->getMessage());
    // エラーレスポンスをJSON形式で返す
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>