/**
 * js/app.js - Recipe Guide Frontend Logic
 */

let allRecipes = [];
let allCategories = [];
let currentCategory = 'all';
let searchQuery = '';

$(document).ready(function() {
    fetchData();

    // Category Pill Click
    $(document).on('click', '.filter-pill', function(e) {
        e.preventDefault();
        $('.filter-pill').removeClass('active');
        $(this).addClass('active');
        currentCategory = $(this).data('category');
        renderRecipes();
    });

    // Search Input
    $('#recipe-search').on('input', function() {
        searchQuery = $(this).val().toLowerCase();
        renderRecipes();
    });

    // Recipe Card Click
    $(document).on('click', '.recipe-card', function() {
        const recipeId = $(this).data('id');
        showRecipeDetail(recipeId);
    });
});

function fetchData() {
    $.ajax({
        url: 'api/get_data.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                allRecipes = response.recipes;
                allCategories = response.categories;
                renderCategories();
                renderRecipes();
            } else {
                $('#recipe-container').html('<div class="col-12 text-center text-danger">Error loading data.</div>');
            }
        },
        error: function() {
            $('#recipe-container').html('<div class="col-12 text-center text-danger">Connection error.</div>');
        }
    });
}

function renderCategories() {
    const $pillContainer = $('#category-pills');
    $pillContainer.empty();

    // Add "All" pill
    const allCount = allRecipes.length;
    $pillContainer.append(`
        <a href="#" class="filter-pill ${currentCategory === 'all' ? 'active' : ''}" data-category="all">
            All <span class="count">${allCount}</span>
        </a>
    `);

    // Add specific category pills
    allCategories.forEach(cat => {
        const count = allRecipes.filter(r => r.category_id == cat.id).length;
        const imgSrc = cat.image_path ? cat.image_path : 'images/placeholder.png';
        $pillContainer.append(`
            <a href="#" class="filter-pill ${currentCategory == cat.id ? 'active' : ''}" data-category="${cat.id}">
                <img src="${imgSrc}" class="category-img-pill" alt="${cat.name}"> ${cat.name} <span class="count">${count}</span>
            </a>
        `);
    });
}

function renderRecipes() {
    const $container = $('#recipe-container');
    $container.empty();

    let filtered = allRecipes;

    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(r => r.category_id == currentCategory);
    }

    // Filter by search
    if (searchQuery) {
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(searchQuery) || 
            (r.category_name && r.category_name.toLowerCase().includes(searchQuery))
        );
    }

    if (filtered.length === 0) {
        $container.append('<div class="col-12 text-center py-5"><p class="text-muted">No recipes found.</p></div>');
        return;
    }

    filtered.forEach(recipe => {
        const img = recipe.image_path ? recipe.image_path : 'https://via.placeholder.com/80?text=' + recipe.name.charAt(0);
        
        $container.append(`
            <div class="recipe-card-wrapper">
                <div class="recipe-card" data-id="${recipe.id}">
                    <div class="status-dot"></div>
                    <div class="card-img-container">
                        <img src="${img}" alt="${recipe.name}" class="img-fluid">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${recipe.name}</h5>
                        <span class="category-tag">${recipe.category_name || 'Misc'}</span>
                    </div>
                </div>
            </div>
        `);
    });
}

function showRecipeDetail(id) {
    const recipe = allRecipes.find(r => r.id == id);
    if (!recipe) return;

    // Parse ingredients data
    let ingredients = [];
    try {
        ingredients = JSON.parse(recipe.ingredients_data || '[]');
    } catch(e) {
        console.error("Error parsing ingredients data", e);
    }

    const drinkImg = recipe.image_path ? recipe.image_path : 'https://via.placeholder.com/80?text=' + recipe.name.charAt(0);
    const categoryName = recipe.category_name || 'MISC';

    // Build Ingredients HTML
    let ingredientsHtml = '';
    if (ingredients.length > 0) {
        ingredientsHtml = `
            <div class="section-label">INGREDIENTS</div>
            <div class="ingredient-table-container">
                <table class="elegant-table">
                    <thead>
                        <tr>
                            <th class="item-col">ITEM</th>
                            <th>25%</th>
                            <th>50%</th>
                            <th>REG</th>
                            <th>XTRA</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ingredients.map(ing => {
                            // Try to split item name and note
                            let name = ing.item;
                            let note = '';
                            
                            if (name.includes(',')) {
                                const parts = name.split(',');
                                name = parts[0].trim();
                                note = parts.slice(1).join(',').trim();
                            } else if (name.includes('(')) {
                                const parts = name.split('(');
                                name = parts[0].trim();
                                note = parts[1].replace(')', '').trim();
                            }

                            return `
                                <tr class="ingredient-row">
                                    <td class="item-col">
                                        <span class="ingredient-name">${name}</span>
                                        ${note ? `<span class="ingredient-note">${note}</span>` : ''}
                                    </td>
                                    <td><span class="val-text">${ing.v25 || '-'}</span></td>
                                    <td><span class="val-text">${ing.v50 || '-'}</span></td>
                                    <td><span class="val-text reg">${ing.vreg || '-'}</span></td>
                                    <td><span class="val-text">${ing.vxtra || '-'}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Build Steps HTML
    let stepsHtml = '';
    if (recipe.instructions) {
        const steps = recipe.instructions.split('\n').filter(s => s.trim() !== '');
        stepsHtml = `
            <div class="steps-container">
                <div class="section-label">FINISHING STEPS</div>
                <div class="steps-list">
                    ${steps.map((step, index) => `
                        <div class="step-item">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-text">${step}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    let html = `
        <div class="popup-container">
            <div class="popup-header">
                <div class="popup-header-left">
                    <img src="${drinkImg}" alt="${recipe.name}" class="popup-drink-img">
                    <div>
                        <h2 class="popup-title">${recipe.name}</h2>
                        <span class="popup-category-tag">${categoryName}</span>
                    </div>
                </div>
                <button type="button" class="popup-close-btn" data-bs-dismiss="modal" aria-label="Close">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <hr class="popup-divider">

            ${ingredientsHtml}
            ${stepsHtml}
        </div>
    `;

    $('#modal-content-body').html(html);
    
    // Remove default Bootstrap modal header since we have a custom one
    $('#recipeModal .modal-header').hide();
    
    const myModal = new bootstrap.Modal(document.getElementById('recipeModal'));
    myModal.show();
}
