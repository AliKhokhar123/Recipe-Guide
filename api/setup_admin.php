<?php
// api/setup_admin.php - Run this once to create the first admin user
require_once 'db.php';

$username = 'admin';
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo "Admin user already exists.";
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
        $stmt->execute([$username, $hash]);
        echo "Admin user created successfully!<br>";
        echo "Username: admin<br>";
        echo "Password: admin123<br>";
        echo "<b>Please delete this file after use for security!</b>";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
