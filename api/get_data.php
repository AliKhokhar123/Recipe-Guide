<?php
// api/get_data.php
header('Content-Type: application/json');
require_once 'db.php';

try {
    // Fetch categories
    $catStmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
    $categories = $catStmt->fetchAll();

    // Fetch recipes with category names
    $recipeStmt = $pdo->query("
        SELECT r.*, c.name as category_name 
        FROM recipes r 
        LEFT JOIN categories c ON r.category_id = c.id 
        WHERE r.status = 'active'
        ORDER BY r.name ASC
    ");
    $recipes = $recipeStmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'categories' => $categories,
        'recipes' => $recipes
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
