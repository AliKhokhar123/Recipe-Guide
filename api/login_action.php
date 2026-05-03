<?php
// api/login_action.php
session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    if (empty($username) || empty($password)) {
        header("Location: ../admin/login.php?error=1");
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Success
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['admin_user'] = $user['username'];
            header("Location: ../admin/dashboard.php");
            exit;
        } else {
            // Failure
            header("Location: ../admin/login.php?error=1");
            exit;
        }
    } catch (PDOException $e) {
        die("Database error: " . $e->getMessage());
    }
} else {
    header("Location: ../admin/login.php");
    exit;
}
?>
