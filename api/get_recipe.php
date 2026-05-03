<?php
// api/get_recipe.php
header('Content-Type: application/json');
require_once 'auth_check.php';
require_once 'db.php';

$id = $_GET['id'] ?? 0;

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM recipes WHERE id = ?");
    $stmt->execute([$id]);
    $recipe = $stmt->fetch();

    if ($recipe) {
        echo json_encode(['status' => 'success', 'data' => $recipe]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Recipe not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
