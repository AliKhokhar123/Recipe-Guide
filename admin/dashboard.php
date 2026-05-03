<?php
require_once 'admin_layout.php';

// Fetch data for the dashboard
$categories = $pdo->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
$recipes = $pdo->query("SELECT r.*, c.name as category_name FROM recipes r LEFT JOIN categories c ON r.category_id = c.id ORDER BY r.name ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Recipe Guide</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-creamy: #fcf5eb;
            --accent-gold: #a67c52;
            --text-dark: #1a1a1a;
            --border-color: #e0d5c5;
        }
        body { background-color: #f4f7f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .card { border: none; box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); margin-bottom: 20px; }
        .btn-primary { background-color: var(--accent-gold); border-color: var(--accent-gold); color: #fff; font-weight: bold; border-radius: 10px; padding: 0.6rem 1.2rem; }
        .btn-primary:hover { background-color: #8d6641; border-color: #8d6641; color: #fff; }
        .btn-outline-primary { color: var(--accent-gold); border-color: var(--accent-gold); border-radius: 8px; }
        .btn-outline-primary:hover { background-color: var(--accent-gold); border-color: var(--accent-gold); color: #fff; }
        
        /* Modal Theming */
        .modal-content {
            background-color: var(--bg-creamy);
            border: none;
            border-radius: 25px;
            overflow: hidden;
        }
        .modal-header {
            border-bottom: 1px solid var(--border-color);
            padding: 1.5rem 2rem;
        }
        .modal-title {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            color: var(--text-dark);
            font-size: 1.5rem;
        }
        .form-label {
            color: var(--accent-gold);
            font-weight: 700;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.5rem;
        }
        .form-control, .form-select {
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            background-color: #fff;
        }
        .form-control:focus, .form-select:focus {
            border-color: var(--accent-gold);
            box-shadow: 0 0 0 0.25rem rgba(166, 124, 82, 0.1);
        }

        /* Image Preview Circle */
        .image-upload-wrapper {
            text-align: center;
            margin-bottom: 2rem;
        }
        .image-preview-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 2px dashed var(--border-color);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: #fff;
            cursor: pointer;
            overflow: hidden;
            position: relative;
            transition: all 0.2s;
        }
        .image-preview-circle:hover {
            border-color: var(--accent-gold);
            background-color: #fafafa;
        }
        .image-preview-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: none;
        }
        .image-preview-circle i {
            font-size: 2rem;
            color: var(--border-color);
        }
        .image-preview-circle:hover i {
            color: var(--accent-gold);
        }

        /* Table Styling in Modal */
        #ingredientsTable {
            border-collapse: separate;
            border-spacing: 0 8px;
        }
        #ingredientsTable thead th {
            border: none;
            color: var(--accent-gold);
            font-size: 0.7rem;
            text-transform: uppercase;
        }
        #ingredientsTable tbody tr {
            background: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        #ingredientsTable td {
            border: none;
            padding: 10px;
        }
        #ingredientsTable tr td:first-child { border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
        #ingredientsTable tr td:last-child { border-top-right-radius: 10px; border-bottom-right-radius: 10px; }

        .finishing-step-item {
            background: #fff;
            border-radius: 12px;
            padding: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
    </style>
</head>
<body>

<?php renderAdminNav('dashboard'); ?>

<main class="main-content">
    <div class="container-fluid">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Manage Recipes</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <button type="button" class="btn btn-primary" onclick="openAddModal()">
                    <i class="fa fa-plus me-1"></i> Add New Recipe
                </button>
            </div>
        </div>

        <?php if (isset($_GET['msg'])): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <?= htmlspecialchars($_GET['msg']) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        <?php endif; ?>

        <!-- Recipes Table -->
        <div class="card">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recipes as $r): ?>
                            <tr>
                                <td><img src="../<?= $r['image_path'] ?: 'images/placeholder.png' ?>" width="45" height="45" class="rounded shadow-sm"></td>
                                <td><strong><?= htmlspecialchars($r['name']) ?></strong></td>
                                <td><span class="badge bg-light text-dark border"><?= htmlspecialchars($r['category_name']) ?></span></td>
                                <td><span class="badge bg-<?= $r['status'] === 'active' ? 'success' : 'secondary' ?>"><?= $r['status'] ?></span></td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(<?= $r['id'] ?>)"><i class="fa fa-edit"></i></button>
                                    <a href="../api/manage_content.php?action=delete_recipe&id=<?= $r['id'] ?>" class="btn btn-sm btn-outline-danger" onclick="return confirm('Are you sure?')"><i class="fa fa-trash"></i></a>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php if (empty($recipes)): ?>
                            <tr>
                                <td colspan="5" class="text-center py-4 text-muted">No recipes found. Add your first one!</td>
                            </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Recipe Modal (Used for both Add and Edit) -->
<div class="modal fade" id="recipeModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <form action="../api/manage_content.php?action=add_recipe" method="POST" enctype="multipart/form-data" class="modal-content" id="recipeForm">
            <input type="hidden" name="recipe_id" id="recipeIdInput">
            <input type="hidden" name="current_image" id="currentImageInput">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">New Recipe Specification</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                
                <!-- Image Upload Top -->
                <div class="image-upload-wrapper">
                    <div class="image-preview-circle" onclick="document.getElementById('recipeImageInput').click()">
                        <i class="fa fa-camera" id="cameraIcon"></i>
                        <img id="imagePreview" src="#" alt="Preview">
                    </div>
                    <input type="file" name="image" id="recipeImageInput" class="d-none" accept="image/*" onchange="previewImage(this)">
                    <div class="form-label mt-2">Tap to add drink photo</div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-4">
                        <label class="form-label">Recipe Name</label>
                        <input type="text" name="name" id="recipeNameInput" class="form-control" required placeholder="e.g. Matcha Latte">
                    </div>
                    <div class="col-md-6 mb-4">
                        <label class="form-label">Category</label>
                        <select name="category_id" id="recipeCategoryInput" class="form-select" required>
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?= $cat['id'] ?>"><?= $cat['name'] ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="form-label d-flex justify-content-between align-items-center">
                        Ingredients Levels
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addIngredientRow()">
                            <i class="fa fa-plus"></i> Add Row
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table" id="ingredientsTable">
                            <thead>
                                <tr class="text-center">
                                    <th class="text-start">ITEM</th>
                                    <th style="width: 12%;">25%</th>
                                    <th style="width: 12%;">50%</th>
                                    <th style="width: 12%;">REG</th>
                                    <th style="width: 12%;">XTRA</th>
                                    <th style="width: 40px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Rows added by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="form-label d-flex justify-content-between align-items-center">
                        Finishing Steps
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addFinishingStep()">
                            <i class="fa fa-plus"></i> Add Step
                        </button>
                    </div>
                    <div id="finishingStepsContainer">
                        <!-- Steps added by JS -->
                    </div>
                </div>

            </div>
            <div class="modal-footer border-0 p-4 pt-0">
                <button type="button" class="btn btn-link text-muted text-decoration-none" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary px-5" id="saveButton">Save Specification</button>
            </div>
        </form>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));

function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('cameraIcon').style.display = 'none';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function resetModal() {
    document.getElementById('recipeForm').reset();
    document.getElementById('recipeIdInput').value = '';
    document.getElementById('currentImageInput').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('cameraIcon').style.display = 'block';
    document.querySelector('#ingredientsTable tbody').innerHTML = '';
    document.getElementById('finishingStepsContainer').innerHTML = '';
    document.getElementById('modalTitle').innerText = 'New Recipe Specification';
    document.getElementById('recipeForm').action = '../api/manage_content.php?action=add_recipe';
    document.getElementById('saveButton').innerText = 'Save Specification';
}

function openAddModal() {
    resetModal();
    addIngredientRow();
    addFinishingStep();
    recipeModal.show();
}

function openEditModal(id) {
    resetModal();
    document.getElementById('modalTitle').innerText = 'Edit Recipe Specification';
    document.getElementById('recipeForm').action = '../api/manage_content.php?action=edit_recipe';
    document.getElementById('saveButton').innerText = 'Update Specification';
    document.getElementById('recipeIdInput').value = id;

    // Fetch recipe data
    fetch(`../api/get_recipe.php?id=${id}`)
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                const recipe = res.data;
                document.getElementById('recipeNameInput').value = recipe.name;
                document.getElementById('recipeCategoryInput').value = recipe.category_id;
                document.getElementById('currentImageInput').value = recipe.image_path;
                
                if (recipe.image_path) {
                    document.getElementById('imagePreview').src = '../' + recipe.image_path;
                    document.getElementById('imagePreview').style.display = 'block';
                    document.getElementById('cameraIcon').style.display = 'none';
                }

                // Populate ingredients
                const ingredients = JSON.parse(recipe.ingredients_data || '[]');
                if (ingredients.length > 0) {
                    ingredients.forEach(ing => addIngredientRow(ing));
                } else {
                    addIngredientRow();
                }

                // Populate finishing steps
                const steps = (recipe.instructions || '').split('\n').filter(s => s.trim() !== '');
                if (steps.length > 0) {
                    steps.forEach(step => addFinishingStep(step));
                } else {
                    addFinishingStep();
                }

                recipeModal.show();
            } else {
                alert('Error fetching recipe data');
            }
        });
}

function addIngredientRow(data = null) {
    const tbody = document.querySelector('#ingredientsTable tbody');
    const row = document.createElement('tr');
    row.className = 'ingredient-row-item';
    row.innerHTML = `
        <td><input type="text" name="items[]" class="form-control" required placeholder="Item name" value="${data ? data.item : ''}"></td>
        <td><input type="text" name="v25[]" class="form-control text-center" value="${data ? data.v25 : ''}"></td>
        <td><input type="text" name="v50[]" class="form-control text-center" value="${data ? data.v50 : ''}"></td>
        <td><input type="text" name="vreg[]" class="form-control text-center" value="${data ? data.vreg : ''}"></td>
        <td><input type="text" name="vxtra[]" class="form-control text-center" value="${data ? data.vxtra : ''}"></td>
        <td class="text-center" style="vertical-align: middle; width: 40px; padding: 10px;"><button type="button" class="btn btn-sm text-danger p-0 border-0 shadow-none" onclick="this.closest('tr').remove()"><i class="fa fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
}

function addFinishingStep(val = '') {
    const container = document.getElementById('finishingStepsContainer');
    const div = document.createElement('div');
    div.className = 'd-flex align-items-center mb-2 finishing-step-item';
    div.style.paddingRight = '10px'; // Match table cell padding
    div.innerHTML = `
        <div class="flex-grow-1">
            <input type="text" name="finishing_steps[]" class="form-control" placeholder="Describe a finishing step (e.g. Add whipped cream)..." required value="${val}">
        </div>
        <div style="width: 40px;" class="text-center">
            <button class="btn btn-sm text-danger p-0 border-0 shadow-none" type="button" onclick="this.closest('.finishing-step-item').remove()">
                <i class="fa fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Initial rows handled by openAddModal if needed, 
    // but dashboard load doesn't open modal.
});
</script>
</body>
</html>
</body>
</html>
