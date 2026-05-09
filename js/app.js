/**
 * js/app.js - Recipe Guide Frontend Logic (Public View)
 */

// --- CONFIGURATION ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuLAJMlzyukHvWM67OpvwxxuwRA7KW7W2w2fDyN-4EPbX4IqxRgHUNRPMiDNwewfAKBQ/exec'; 
// ---------------------

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

    // Reload Button
    $('#btn-reload').on('click', function() {
        $(this).find('i').addClass('fa-spin');
        fetchData();
    });

    // Column Highlighting
    $(document).on('click', '.clickable-header', function() {
        const colType = $(this).data('col');
        const $table = $(this).closest('.elegant-table');
        const isAlreadyActive = $(this).hasClass('highlighted');
        
        $table.find('.clickable-header').removeClass('highlighted');
        $table.find('td').removeClass('highlight-cell');
        
        if (!isAlreadyActive) {
            $(this).addClass('highlighted');
            $table.find(`.col-${colType}`).addClass('highlight-cell');
        }
    });
});

function fetchData() {
    if (SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
        loadMockData();
        return;
    }

    $.ajax({
        url: SCRIPT_URL,
        method: 'GET',
        dataType: 'jsonp',
        data: { action: 'get_data' },
        success: function(data) {
            if (data.status === 'success') {
                allRecipes = data.recipes;
                allCategories = data.categories;
                renderCategories();
                renderRecipes();
                $('#btn-reload i').removeClass('fa-spin');
            }
        },
        error: function() {
            loadMockData();
            $('#btn-reload i').removeClass('fa-spin');
        }
    });
}

function loadMockData() {
    const mockData = {
        categories: [
            { id: 1, name: "Coffee", image_path: "test-images/coffee.png" },
            { id: 2, name: "Tea", image_path: "test-images/chai.png" },
            { id: 3, name: "Bakery", image_path: "test-images/crossian.png" }
        ],
        recipes: [
            {
                id: 1,
                category_id: 1,
                category_name: "Coffee",
                name: "Coconut Cloud (Mock)",
                image_path: "test-images/coconut.png",
                ingredients_data: JSON.stringify([
                    { item: "Coconut Milk", v0: "", v25: "", v50: "", vreg: "50 GR", vxtra: "" }
                ]),
                instructions: "Phin Espresso 3 OZ.\nSalted Cream + Roasted Coconut."
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
    $pillContainer.empty().removeClass('justify-content-center');
    const allCount = allRecipes.length;
    $pillContainer.append(`<a href="#" class="filter-pill ${currentCategory === 'all' ? 'active' : ''}" data-category="all">All <span class="count">${allCount}</span></a>`);

    allCategories.forEach(cat => {
        const count = allRecipes.filter(r => r.category_id == cat.id).length;
        const imgSrc = cat.image_path || 'images/placeholder.png';
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
    if (currentCategory !== 'all') filtered = filtered.filter(r => r.category_id == currentCategory);
    if (searchQuery) {
        filtered = filtered.filter(r => r.name.toLowerCase().includes(searchQuery) || (r.category_name && r.category_name.toLowerCase().includes(searchQuery)));
    }

    if (filtered.length === 0) {
        $container.append('<div class="col-12 text-center py-5"><p class="text-muted">No recipes found.</p></div>');
        return;
    }

    filtered.forEach(recipe => {
        const img = recipe.image_path || 'https://placehold.co/80x80?text=No+Image';
        const isSelected = selectedRecipes.has(recipe.id);
        $container.append(`
            <div class="recipe-card-wrapper">
                <div class="recipe-card ${isSelected ? 'selected' : ''}" data-id="${recipe.id}">
                    <div class="status-dot"></div>
                    <div class="card-img-container"><img src="${img}" alt="${recipe.name}" class="img-fluid"></div>
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
    let ingredients = [];
    try { ingredients = JSON.parse(recipe.ingredients_data || '[]'); } catch(e) {}
    const drinkImg = recipe.image_path || 'https://placehold.co/80x80?text=No+Image';

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
                        ${ingredients.map(ing => `
                            <tr class="ingredient-row">
                                <td class="item-col"><span class="ingredient-name">${ing.item}</span></td>
                                <td class="col-v0">${ing.v0 || '-'}</td>
                                <td class="col-v25">${ing.v25 || '-'}</td>
                                <td class="col-v50">${ing.v50 || '-'}</td>
                                <td class="col-vreg highlight-cell">${ing.vreg || '-'}</td>
                                <td class="col-vxtra">${ing.vxtra || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    const steps = (recipe.instructions || "").split('\n').filter(s => s.trim() !== '');
    const stepsHtml = steps.length > 0 ? `
        <div class="steps-container">
            <div class="section-label">FINISHING STEPS</div>
            <div class="steps-list">
                ${steps.map((step, index) => `<div class="step-item"><div class="step-number">${index + 1}</div><div class="step-text">${step}</div></div>`).join('')}
            </div>
        </div>
    ` : '';

    return `
        <div class="recipe-content-detail">
            <div class="popup-header">
                <div class="popup-header-left">
                    <img src="${drinkImg}" alt="${recipe.name}" class="popup-drink-img">
                    <div><h2 class="popup-title">${recipe.name}</h2><span class="popup-category-tag">${recipe.category_name || 'MISC'}</span></div>
                </div>
            </div>
            <hr class="popup-divider">
            ${ingredientsHtml}${stepsHtml}
        </div>
    `;
}

function showRecipeDetail(id) {
    const recipe = allRecipes.find(r => r.id == id);
    if (!recipe) return;
    $('#modal-content-body').html(`<div class="popup-container">${generateRecipeHtml(recipe)}</div>`);
    $('#recipeModal .modal-header').hide();
    new bootstrap.Modal(document.getElementById('recipeModal')).show();
}

function showMultipleRecipesDetail(ids) {
    if (ids.length === 0) return;
    const $modalDialog = $('#recipeModal .modal-dialog');
    $modalDialog.toggleClass('modal-xl', ids.length > 1).toggleClass('modal-lg', ids.length <= 1);
    let accordionHtml = '<div class="accordion recipe-accordion" id="multiRecipeAccordion">';
    ids.forEach((id, index) => {
        const recipe = allRecipes.find(r => r.id == id);
        if (recipe) {
            accordionHtml += `
                <div class="accordion-item">
                    <h2 class="accordion-header"><button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${id}">${recipe.name}</button></h2>
                    <div id="collapse${id}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}"><div class="accordion-body">${generateRecipeHtml(recipe)}</div></div>
                </div>`;
        }
    });
    accordionHtml += '</div>';
    $('#modal-content-body').html(`<div class="popup-container">${accordionHtml}</div>`);
    $('#recipeModal .modal-header').hide();
    new bootstrap.Modal(document.getElementById('recipeModal')).show();
}

function toggleRecipeSelection(id, $card) {
    if (selectedRecipes.has(id)) { selectedRecipes.delete(id); $card.removeClass('selected'); }
    else { selectedRecipes.add(id); $card.addClass('selected'); }
    updateSelectionBar();
}

function clearSelection() {
    selectedRecipes.clear();
    $('.recipe-card').removeClass('selected');
    updateSelectionBar();
}

function updateSelectionBar() {
    const count = selectedRecipes.size;
    $('#selection-action-bar').toggleClass('d-none', !isSelectionMode || count === 0);
    $('#selected-count').text(count);
}
