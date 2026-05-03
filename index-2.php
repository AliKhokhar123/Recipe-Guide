<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recipe Guide - Staff Training</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css?v=2.0">
</head>
<body>

    <header class="main-header">
        <div class="container-fluid d-flex justify-content-between align-items-center">
            <div>
                <h1 class="brand-title">☕ Recipe Guide</h1>
                <span class="staff-training-label">Staff Training</span>
            </div>
            <span class="in-store-badge">IN-STORE USE</span>
        </div>
    </header>

    <section class="filters-container">
        <div id="category-pills" class="d-flex">
            <!-- Dynamically populated categories -->
            <a href="#" class="filter-pill active" data-category="all">
                All <span class="count">0</span>
            </a>
        </div>
    </section>

    <section class="search-container">
        <div class="search-input-group">
            <i class="fa fa-search"></i>
            <input type="text" id="recipe-search" placeholder="Search drinks...">
        </div>
    </section>

    <main class="recipe-grid container-fluid">
        <div id="recipe-container" class="row">
            <!-- Dynamically populated recipes -->
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    </main>

    <!-- Recipe Detail Modal -->
    <div class="modal fade" id="recipeModal" tabindex="-1" aria-labelledby="recipeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="recipeModalLabel"></h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="modal-content-body">
                    <!-- Content populated by JS -->
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/app.js?v=2.0"></script>
</body>
</html>
