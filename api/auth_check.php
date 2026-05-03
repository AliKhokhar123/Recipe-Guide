<?php
// api/auth_check.php - Include this at the start of any admin page
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}
?>
