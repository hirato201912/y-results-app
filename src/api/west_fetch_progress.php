<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

$apiKey = '0401_predefined_api_key';
$receivedApiKey = isset($_GET['apiKey']) ? $_GET['apiKey'] : '';

if ($receivedApiKey !== $apiKey) {
    die(json_encode(array("error" => "Invalid API Key")));
}

$studentName = isset($_GET['studentName']) ? $_GET['studentName'] : '';

$conn = mysqli_connect("mysql749.db.sakura.ne.jp", "mikawayatsuhashi", "yatsuhashi2019", "mikawayatsuhashi_db_yatsuhasi");

if ($conn->connect_error) {
    die(json_encode(array("error" => $conn->connect_error)));
}

$sql = "
SELECT 
    p.week, 
    p.english, 
    p.math, 
    p.science, 
    p.social, 
    p.japanese, 
    t.test_name,
    s.student,
    s.belonging,
    s.grade
FROM 
    west_progress p
JOIN 
    west_student s ON p.student_id = s.west_student_id
JOIN 
    tests t ON p.test_id = t.test_id
WHERE 
    s.student = ?
ORDER BY 
    t.test_name, p.week
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die(json_encode(array("error" => "Failed to prepare statement: " . $conn->error)));
}
$stmt->bind_param("s", $studentName);
$stmt->execute();
$result = $stmt->get_result();

$progressData = array();
while($row = $result->fetch_assoc()) {
    array_push($progressData, $row);
}

echo json_encode(array("students" => $progressData));

$stmt->close();
$conn->close();
?>

