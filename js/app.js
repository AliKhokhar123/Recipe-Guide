/**
 * js/app.js - Recipe Guide Frontend Logic
 */

let allRecipes = [];
let allCategories = [];
let currentCategory = 'all';
let searchQuery = '';
let isSelectionMode = false;
let selectedRecipes = new Set();

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

    // Selection Mode Toggle
    $('#selection-mode-toggle').on('change', function() {
        isSelectionMode = $(this).is(':checked');
        if (isSelectionMode) {
            $('body').addClass('selection-mode');
        } else {
            $('body').removeClass('selection-mode');
            clearSelection();
        }
        updateSelectionBar();
    });

    // Recipe Card Click
    $(document).on('click', '.recipe-card', function() {
        const recipeId = $(this).data('id');
        
        if (isSelectionMode) {
            toggleRecipeSelection(recipeId, $(this));
        } else {
            showRecipeDetail(recipeId);
        }
    });

    // Clear Selection
    $('#clear-selection').on('click', function() {
        clearSelection();
    });

    // View Selected
    $('#view-selected').on('click', function() {
        showMultipleRecipesDetail(Array.from(selectedRecipes));
    });

    // Column Highlighting
    $(document).on('click', '.clickable-header', function() {
        const colType = $(this).data('col');
        const $table = $(this).closest('.elegant-table');
        const isAlreadyActive = $(this).hasClass('highlighted');
        
        // Clear highlights ONLY in this specific table
        $table.find('.clickable-header').removeClass('highlighted');
        $table.find('td').removeClass('highlight-cell');
        
        if (!isAlreadyActive) {
            // Highlight this column ONLY in this table
            $(this).addClass('highlighted');
            $table.find(`.col-${colType}`).addClass('highlight-cell');
        }
    });
});

function toggleRecipeSelection(id, $card) {
    if (selectedRecipes.has(id)) {
        selectedRecipes.delete(id);
        $card.removeClass('selected');
    } else {
        selectedRecipes.add(id);
        $card.addClass('selected');
    }
    updateSelectionBar();
}

function clearSelection() {
    selectedRecipes.clear();
    $('.recipe-card').removeClass('selected');
    updateSelectionBar();
}

function updateSelectionBar() {
    const $bar = $('#selection-action-bar');
    const count = selectedRecipes.size;
    
    if (isSelectionMode && count > 0) {
        $bar.removeClass('d-none');
        $('#selected-count').text(count);
    } else {
        $bar.addClass('d-none');
    }
}

function fetchData() {
    const mockData = {
        status: "success",
        categories: [
            { id: 1, name: "Coffee", icon: "fa-coffee", image_path: "test-images/coffee.png" },
            { id: 2, name: "Tea", icon: "fa-leaf", image_path: "test-images/chai.png" },
            { id: 3, name: "Bakery", icon: "fa-bread-slice", image_path: "test-images/crossian.png" }
        ],
        recipes: [
            {
                id: 1,
                category_id: 1,
                category_name: "Coffee",
                name: "Coconut Cloud",
                image_path: "test-images/coconut.png",
                ingredients_data: JSON.stringify([
                    { item: "Coconut Milk", v0: "", v25: "", v50: "", vreg: "50 GR", vxtra: "" },
                    { item: "Coconut Syrup", v0: "", v25: "", v50: "", vreg: "30 GR", vxtra: "" },
                    { item: "Whole Milk", v0: "115", v25: "105", v50: "95", vreg: "85 GR", vxtra: "" },
                    { item: "Condensed Milk", v0: "5", v25: "10", v50: "20", vreg: "30 GR", vxtra: "40" }
                ]),
                instructions: "Phin Espresso 3 OZ.\nSalted Cream + Roasted Coconut."
            },
            {
                id: 2,
                category_id: 2,
                category_name: "Tea",
                name: "Matcha Latte",
                image_path: "test-images/matcha-latte.png",
                ingredients_data: JSON.stringify([
                    { item: "Matcha Powder", v0: "0.5 scoop", v25: "1 scoop", v50: "1.5 scoops", vreg: "2 scoops", vxtra: "3 scoops" },
                    { item: "Hot Water", v0: "20ml", v25: "30ml", v50: "30ml", vreg: "50ml", vxtra: "50ml" },
                    { item: "Milk", v0: "100ml", v25: "150ml", v50: "250ml", vreg: "350ml", vxtra: "450ml" }
                ]),
                instructions: "Whisk matcha powder with hot water until smooth.\nSteam milk and pour over matcha base."
            },
            {
                id: 3,
                category_id: 3,
                category_name: "Bakery",
                name: "Butter Croissant",
                image_path: "test-images/crossian.png",
                ingredients_data: JSON.stringify([
                    { item: "Croissant", v0: "1", v25: "1", v50: "1", vreg: "1", vxtra: "2" }
                ]),
                instructions: "Warm in oven at 180°C for 2 minutes.\nServe on a white plate with butter on the side."
            }
        ]
    };

    allRecipes = mockData.recipes;
    allCategories = mockData.categories;
    renderCategories();
    renderRecipes();
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
        const isSelected = selectedRecipes.has(recipe.id);
        
        $container.append(`
            <div class="recipe-card-wrapper">
                <div class="recipe-card ${isSelected ? 'selected' : ''}" data-id="${recipe.id}">
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

function generateRecipeHtml(recipe) {
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
                            <th class="clickable-header" data-col="v0">0%</th>
                            <th class="clickable-header" data-col="v25">25%</th>
                            <th class="clickable-header" data-col="v50">50%</th>
                            <th class="clickable-header highlighted" data-col="vreg">REG</th>
                            <th class="clickable-header" data-col="vxtra">XTRA</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ingredients.map(ing => {
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
                                    <td class="col-v0"><span class="val-text">${ing.v0 || '-'}</span></td>
                                    <td class="col-v25"><span class="val-text">${ing.v25 || '-'}</span></td>
                                    <td class="col-v50"><span class="val-text">${ing.v50 || '-'}</span></td>
                                    <td class="col-vreg highlight-cell"><span class="val-text reg">${ing.vreg || '-'}</span></td>
                                    <td class="col-vxtra"><span class="val-text">${ing.vxtra || '-'}</span></td>
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

    return `
        <div class="recipe-content-detail">
            <div class="popup-header">
                <div class="popup-header-left">
                    <img src="${drinkImg}" alt="${recipe.name}" class="popup-drink-img">
                    <div>
                        <h2 class="popup-title">${recipe.name}</h2>
                        <span class="popup-category-tag">${categoryName}</span>
                    </div>
                </div>
            </div>
            <hr class="popup-divider">
            ${ingredientsHtml}
            ${stepsHtml}
        </div>
    `;
}

function showRecipeDetail(id) {
    const recipe = allRecipes.find(r => r.id == id);
    if (!recipe) return;

    const $modalDialog = $('#recipeModal .modal-dialog');
    $modalDialog.addClass('modal-lg').removeClass('modal-xl');

    let html = `
        <div class="popup-container">
            <div class="d-flex justify-content-end mb-1">
                <button type="button" class="popup-close-btn" data-bs-dismiss="modal" aria-label="Close">
                    <i class="fa fa-times"></i>
                </button>
            </div>
            ${generateRecipeHtml(recipe)}
        </div>
    `;

    $('#modal-content-body').html(html);
    $('#recipeModal .modal-header').hide();
    
    const myModal = new bootstrap.Modal(document.getElementById('recipeModal'));
    myModal.show();
}

function showMultipleRecipesDetail(ids) {
    if (ids.length === 0) return;

    const $modalDialog = $('#recipeModal .modal-dialog');
    if (ids.length > 1) {
        $modalDialog.addClass('modal-xl').removeClass('modal-lg');
    } else {
        $modalDialog.addClass('modal-lg').removeClass('modal-xl');
    }

    let accordionHtml = '<div class="accordion recipe-accordion" id="multiRecipeAccordion">';
    
    ids.forEach((id, index) => {
        const recipe = allRecipes.find(r => r.id == id);
        if (!recipe) return;

        accordionHtml += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${id}">
                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${id}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${id}">
                        ${recipe.name} (${recipe.category_name || 'Misc'})
                    </button>
                </h2>
                <div id="collapse${id}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${id}">
                    <div class="accordion-body">
                        ${generateRecipeHtml(recipe)}
                    </div>
                </div>
            </div>
        `;
    });

    accordionHtml += '</div>';

    let html = `
        <div class="popup-container">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="popup-title">Selected Recipes</h3>
                <button type="button" class="popup-close-btn" data-bs-dismiss="modal" aria-label="Close">
                    <i class="fa fa-times"></i>
                </button>
            </div>
            ${accordionHtml}
        </div>
    `;

    $('#modal-content-body').html(html);
    $('#recipeModal .modal-header').hide();
    
    const myModal = new bootstrap.Modal(document.getElementById('recipeModal'));
    myModal.show();
}
