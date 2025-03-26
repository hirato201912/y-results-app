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
    $studentName = isset($_GET['student_name']) ? $_GET['student_name'] : null;
    $studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $onlyFixed = isset($_GET['only_fixed']) ? ($_GET['only_fixed'] === 'true') : false;
    $searchKeyword = isset($_GET['search']) ? trim($_GET['search']) : ''; // 検索キーワード追加

    // 少なくとも student_name か student_id のどちらかが必要
    if (empty($studentName) && empty($studentId)) {
        throw new Exception("student_name または student_id が必要です");
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

    // student_idから生徒名を取得する場合
    if (empty($studentName) && !empty($studentId)) {
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
    }

    // コメントの総数を取得するクエリの構築
    $countQuery = "SELECT COUNT(*) as total FROM message WHERE student = ?";
    $countParams = array($studentName);
    $countTypes = "s";
    
    if ($onlyFixed) {
        $countQuery .= " AND fixed = 1";
    }
    
    // 検索キーワードがある場合、総数クエリに検索条件を追加
    if (!empty($searchKeyword)) {
        $searchTerm = "%{$searchKeyword}%";
        $countQuery .= " AND (message LIKE ? OR username LIKE ?)";
        $countParams[] = $searchTerm;
        $countParams[] = $searchTerm;
        $countTypes .= "ss";
    }
    
    $countStmt = $conn->prepare($countQuery);
    
    if (!$countStmt) {
        throw new Exception("カウントクエリの準備に失敗しました: " . $conn->error);
    }
    
    // 動的にパラメータをバインド
    $countStmt->bind_param($countTypes, ...$countParams);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalComments = $countResult->fetch_assoc()['total'];
    $countStmt->close();

    // オフセットを計算
    $offset = ($page - 1) * $limit;

    // コメントを取得するクエリの構築
    $query = "SELECT id, message, post_date, username, fixed FROM message 
             WHERE student = ?";
    $params = array($studentName);
    $types = "s";
    
    if ($onlyFixed) {
        $query .= " AND fixed = 1";
    }
    
    // 検索キーワードがある場合、検索条件を追加
    if (!empty($searchKeyword)) {
        $searchTerm = "%{$searchKeyword}%";
        $query .= " AND (message LIKE ? OR username LIKE ?)";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "ss";
    }
    
    $query .= " ORDER BY post_date DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("クエリの準備に失敗しました: " . $conn->error);
    }
    
    // 動的にパラメータをバインド
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $comments = [];
    while ($row = $result->fetch_assoc()) {
        // 日付のフォーマットを変更
        $row['formatted_date'] = date('Y年m月d日 H:i', strtotime($row['post_date']));
        $comments[] = $row;
    }

    // ページネーション情報
    $totalPages = ceil($totalComments / $limit);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => [
            "student_name" => $studentName,
            "comments" => $comments,
            "pagination" => [
                "total" => $totalComments,
                "per_page" => $limit,
                "current_page" => $page,
                "total_pages" => $totalPages
            ],
            "search" => !empty($searchKeyword) ? $searchKeyword : null
        ]
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
    if (isset($countStmt) && $countStmt instanceof mysqli_stmt) {
        $countStmt->close();
    }
    if (isset($studentStmt) && $studentStmt instanceof mysqli_stmt) {
        $studentStmt->close();
    }
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>