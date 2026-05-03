<?php
// api/manage_content.php
require_once 'auth_check.php';
require_once 'db.php';

$action = $_GET['action'] ?? '';

if ($action === 'add_category' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    
    $image_path = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../images/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
        
        $file_ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $file_name = 'cat_' . time() . '_' . uniqid() . '.' . $file_ext;
        $target_file = $upload_dir . $file_name;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            $image_path = 'images/' . $file_name;
        }
    }

    if ($name && $image_path) {
        $stmt = $pdo->prepare("INSERT INTO categories (name, image_path) VALUES (?, ?)");
        $stmt->execute([$name, $image_path]);
        header("Location: ../admin/categories.php?msg=Category added.");
        exit;
    }
}

if ($action === 'delete_category' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: ../admin/categories.php?msg=Category deleted.");
    exit;
}

if ($action === 'add_recipe' || $action === 'edit_recipe') {
    $name = trim($_POST['name']);
    $category_id = (int)$_POST['category_id'];
    $recipe_id = isset($_POST['recipe_id']) ? (int)$_POST['recipe_id'] : 0;
    
    // Process finishing steps into a single string (newline-separated)
    $instructions = '';
    if (isset($_POST['finishing_steps'])) {
        $steps = array_filter($_POST['finishing_steps'], function($s) { return trim($s) !== ''; });
        $instructions = implode("\n", $steps);
    }
    
    // Process ingredients table into JSON
    $ingredients_arr = [];
    if (isset($_POST['items'])) {
        foreach ($_POST['items'] as $index => $item) {
            if (trim($item) === '') continue;
            $ingredients_arr[] = [
                'item' => $item,
                'v25' => $_POST['v25'][$index] ?? '',
                'v50' => $_POST['v50'][$index] ?? '',
                'vreg' => $_POST['vreg'][$index] ?? '',
                'vxtra' => $_POST['vxtra'][$index] ?? ''
            ];
        }
    }
    $ingredients_data = json_encode($ingredients_arr);

    $image_path = $_POST['current_image'] ?? '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../images/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
        
        $file_ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $file_name = time() . '_' . uniqid() . '.' . $file_ext;
        $target_file = $upload_dir . $file_name;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            $image_path = 'images/' . $file_name;
        }
    }

    if ($name && $category_id) {
        if ($action === 'edit_recipe' && $recipe_id) {
            $stmt = $pdo->prepare("UPDATE recipes SET category_id = ?, name = ?, ingredients_data = ?, instructions = ?, image_path = ? WHERE id = ?");
            $stmt->execute([$category_id, $name, $ingredients_data, $instructions, $image_path, $recipe_id]);
            $msg = "Recipe updated.";
        } else {
            $stmt = $pdo->prepare("INSERT INTO recipes (category_id, name, ingredients_data, instructions, image_path, status) VALUES (?, ?, ?, ?, ?, 'active')");
            $stmt->execute([$category_id, $name, $ingredients_data, $instructions, $image_path]);
            $msg = "Recipe added.";
        }
        header("Location: ../admin/dashboard.php?msg=" . urlencode($msg));
        exit;
    }
}

if ($action === 'delete_recipe' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    // Optional: Delete image file from server too
    $stmt = $pdo->prepare("DELETE FROM recipes WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: ../admin/dashboard.php?msg=Recipe deleted.");
    exit;
}

header("Location: ../admin/dashboard.php");
exit;
?>
