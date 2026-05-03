<?php
require_once '../api/auth_check.php';
require_once '../api/db.php';

// Common sidebar/navigation for admin
function renderAdminNav($activePage) {
    ?>
    <!-- Mobile Navbar -->
    <nav class="navbar navbar-dark bg-dark d-md-none fixed-top">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminSidebar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <span class="navbar-brand mb-0 h1">Recipe Admin</span>
        </div>
    </nav>

    <!-- Sidebar / Offcanvas -->
    <div class="offcanvas-md offcanvas-start bg-dark text-white sidebar" tabindex="-1" id="adminSidebar">
        <div class="offcanvas-header d-md-none">
            <h5 class="offcanvas-title">Menu</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" data-bs-target="#adminSidebar"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column p-0">
            <div class="p-3 d-none d-md-block text-center border-bottom border-secondary mb-3">
                <h4 class="brand-text m-0">Recipe Guide</h4>
            </div>
            <ul class="nav nav-pills flex-column mb-auto p-2">
                <li class="nav-item">
                    <a href="dashboard.php" class="nav-link text-white <?= $activePage == 'dashboard' ? 'active' : '' ?>">
                        <i class="fa fa-book me-2"></i> Recipes
                    </a>
                </li>
                <li class="nav-item">
                    <a href="categories.php" class="nav-link text-white <?= $activePage == 'categories' ? 'active' : '' ?>">
                        <i class="fa fa-tags me-2"></i> Categories
                    </a>
                </li>
            </ul>
            <hr class="mx-2">
            <ul class="nav nav-pills flex-column p-2 mb-3">
                <li class="nav-item">
                    <a href="../index.php" target="_blank" class="nav-link text-white">
                        <i class="fa fa-eye me-2"></i> View Site
                    </a>
                </li>
                <li class="nav-item">
                    <a href="../api/logout.php" class="nav-link text-danger">
                        <i class="fa fa-sign-out-alt me-2"></i> Logout
                    </a>
                </li>
            </ul>
        </div>
    </div>
    <style>
        .sidebar {
            width: 250px;
            min-height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1000;
        }
        .main-content {
            margin-left: 250px;
            padding: 20px;
            transition: margin-left 0.3s;
        }
        .nav-link { border-radius: 8px; margin-bottom: 5px; }
        .nav-link.active { background-color: #d4a373 !important; color: #1a1a1a !important; font-weight: bold; }
        .nav-link:hover:not(.active) { background-color: #34495e; }
        .brand-text { color: #d4a373; font-family: 'Playfair Display', serif; }

        @media (max-width: 767.98px) {
            .sidebar { width: 100%; height: auto; position: relative; }
            .main-content { margin-left: 0; padding-top: 70px; }
        }
    </style>
    <?php
}
?>
