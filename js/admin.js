/**
 * js/admin.js - Optimized Admin Dashboard Logic
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuLAJMlzyukHvWM67OpvwxxuwRA7KW7W2w2fDyN-4EPbX4IqxRgHUNRPMiDNwewfAKBQ/exec';
const ADMIN_PASSWORD = 'admin123';

let allRecipes = [];
let allCategories = [];

$(document).ready(function() {
    if (localStorage.getItem('admin_session') === 'active') {
        $('#login-overlay').fadeOut();
        fetchData();
    }

    $('#login-btn').on('click', function() {
        if ($('#admin-pass').val() === ADMIN_PASSWORD) {
            localStorage.setItem('admin_session', 'active');
            $('#login-overlay').fadeOut();
            fetchData();
        } else {
            alert("Wrong password!");
        }
    });

    $('#nav-recipes').on('click', function(e) {
        e.preventDefault();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        $('#section-recipes').removeClass('d-none');
        $('#section-categories').addClass('d-none');
    });

    $('#nav-categories').on('click', function(e) {
        e.preventDefault();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        $('#section-recipes').addClass('d-none');
        $('#section-categories').removeClass('d-none');
    });

    $('#btn-save-recipe').on('click', function() {
        saveRecipe();
    });

    $('#btn-save-category').on('click', function() {
        saveCategory();
    });

    $('#btn-logout').on('click', function(e) {
        e.preventDefault();
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('admin_session');
            window.location.reload();
        }
    });

    // File Input Listeners
    $('#recipe-image-file').on('change', function(e) {
        processImage(e.target.files[0], '#recipe-image', '#recipe-img-preview');
    });

    $('#category-image-file').on('change', function(e) {
        processImage(e.target.files[0], '#category-image', '#category-img-preview');
    });
});

/**
 * processImage - Resizes and converts image to Base64
 */
function processImage(file, targetInputSelector, previewSelector) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Target dimensions for thumbnail (max 300px)
            const MAX_SIZE = 300;
            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to Base64 with high compression (0.7 quality)
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            $(targetInputSelector).val(base64);
            $(previewSelector).attr('src', base64);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function fetchData() {
    $.ajax({
        url: SCRIPT_URL,
        method: 'GET',
        dataType: 'jsonp',
        data: { action: 'get_data' },
        success: function(data) {
            if (data.status === 'success') {
                allRecipes = data.recipes;
                allCategories = data.categories;
                renderRecipeList();
                renderCategoryList();
                populateCategoryDropdown();
            }
        }
    });
}

function renderCategoryList() {
    const $list = $('#category-list');
    $list.empty();
    allCategories.forEach(cat => {
        const img = cat.image_path || 'https://placehold.co/50x50?text=None';
        $list.append(`
            <div class="recipe-list-item">
                <div class="d-flex align-items-center">
                    <img src="${img}" class="recipe-list-img">
                    <div><h5 class="mb-0">${cat.name}</h5><small class="text-muted">ID: ${cat.id}</small></div>
                </div>
                <div><button class="btn btn-sm btn-outline-primary" onclick="openCategoryEditor(${cat.id})"><i class="fa fa-edit"></i> Edit</button></div>
            </div>`);
    });
}

function openCategoryEditor(id = null) {
    const cat = id ? allCategories.find(c => c.id == id) : { id: Date.now(), name: "", image_path: "" };
    $('#category-id').val(cat.id);
    $('#category-name-field').val(cat.name);
    $('#category-image').val(cat.image_path);
    $('#category-img-preview').attr('src', cat.image_path || 'https://placehold.co/80x80?text=No+Image');
    $('#category-image-file').val('');
    new bootstrap.Modal(document.getElementById('categoryEditorModal')).show();
}

function saveCategory() {
    const category = {
        id: $('#category-id').val(),
        name: $('#category-name-field').val(),
        image_path: $('#category-image').val()
    };
    if (!category.name) { alert("Category name is required!"); return; }
    $('#btn-save-category').prop('disabled', true).text('Saving...');

    // Using fetch POST to handle large Base64 strings
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script POST
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'save_category',
            data: JSON.stringify(category)
        })
    })
    .then(() => {
        // With no-cors, we can't read the response status, 
        // so we assume success after a short delay and refresh.
        setTimeout(() => {
            fetchData();
            bootstrap.Modal.getInstance(document.getElementById('categoryEditorModal')).hide();
            $('#btn-save-category').prop('disabled', false).text('Save Category');
        }, 1000);
    })
    .catch(error => {
        console.error("Post Error:", error);
        alert("Error saving category. Check console.");
        $('#btn-save-category').prop('disabled', false).text('Save Category');
    });
}

function populateCategoryDropdown() {
    const $select = $('#recipe-category');
    $select.empty();
    allCategories.forEach(cat => { $select.append(`<option value="${cat.id}">${cat.name}</option>`); });
}

function renderRecipeList() {
    const $list = $('#recipe-list');
    $list.empty();
    allRecipes.forEach(recipe => {
        const img = recipe.image_path || 'https://placehold.co/50x50?text=None';
        $list.append(`
            <div class="recipe-list-item">
                <div class="d-flex align-items-center">
                    <img src="${img}" class="recipe-list-img">
                    <div><h5 class="mb-0">${recipe.name}</h5><small class="text-muted">${recipe.category_name}</small></div>
                </div>
                <div><button class="btn btn-sm btn-outline-primary" onclick="openRecipeEditor(${recipe.id})"><i class="fa fa-edit"></i> Edit</button></div>
            </div>`);
    });
}

function openRecipeEditor(id = null) {
    const recipe = id ? allRecipes.find(r => r.id == id) : { id: Date.now(), name: "", category_id: allCategories[0]?.id || 1, image_path: "", ingredients_data: "[]", instructions: "" };
    $('#recipe-id').val(recipe.id);
    $('#recipe-name').val(recipe.name);
    $('#recipe-category').val(recipe.category_id);
    $('#recipe-image').val(recipe.image_path);
    $('#recipe-img-preview').attr('src', recipe.image_path || 'https://placehold.co/80x80?text=No+Image');
    $('#recipe-image-file').val('');

    // Load dynamic ingredients
    const $ingContainer = $('#ingredients-container');
    $ingContainer.empty();
    let ingredients = [];
    try { ingredients = JSON.parse(recipe.ingredients_data || '[]'); } catch(e) {}
    if (ingredients.length === 0) addIngredientRow();
    else ingredients.forEach(ing => addIngredientRow(ing));

    // Load dynamic steps
    const $stepContainer = $('#steps-container');
    $stepContainer.empty();
    const steps = (recipe.instructions || "").split('\n').filter(s => s.trim() !== '');
    if (steps.length === 0) addStepRow();
    else steps.forEach(step => addStepRow(step));

    new bootstrap.Modal(document.getElementById('recipeEditorModal')).show();
}

function addIngredientRow(data = null) {
    const html = `
        <div class="ingredient-row row g-2">
            <div class="col-md-6"><input type="text" class="form-control ing-item" placeholder="Item Name" value="${data?.item || ''}"></div>
            <div class="col-md-1"><input type="text" class="form-control ing-v0" placeholder="0%" value="${data?.v0 || ''}"></div>
            <div class="col-md-1"><input type="text" class="form-control ing-v25" placeholder="25%" value="${data?.v25 || ''}"></div>
            <div class="col-md-1"><input type="text" class="form-control ing-v50" placeholder="50%" value="${data?.v50 || ''}"></div>
            <div class="col-md-1"><input type="text" class="form-control ing-vreg" placeholder="Reg" value="${data?.vreg || ''}"></div>
            <div class="col-md-1"><input type="text" class="form-control ing-vxtra" placeholder="Extra" value="${data?.vxtra || ''}"></div>
            <div class="col-md-1 d-flex align-items-center justify-content-center"><i class="fa fa-trash btn-remove-row" onclick="$(this).closest('.ingredient-row').remove()"></i></div>
        </div>`;
    $('#ingredients-container').append(html);
}

function addStepRow(data = "") {
    const html = `
        <div class="step-row d-flex gap-2 mb-2">
            <input type="text" class="form-control recipe-step-input" placeholder="Enter step description" value="${data}">
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="$(this).closest('.step-row').remove()">
                <i class="fa fa-trash"></i>
            </button>
        </div>`;
    $('#steps-container').append(html);
}

function saveRecipe() {
    const ingredients = [];
    $('.ingredient-row').each(function() {
        const item = $(this).find('.ing-item').val();
        if (item) {
            ingredients.push({
                item: item,
                v0: $(this).find('.ing-v0').val(),
                v25: $(this).find('.ing-v25').val(),
                v50: $(this).find('.ing-v50').val(),
                vreg: $(this).find('.ing-vreg').val(),
                vxtra: $(this).find('.ing-vxtra').val()
            });
        }
    });

    const steps = [];
    $('.recipe-step-input').each(function() {
        const val = $(this).val().trim();
        if (val) steps.push(val);
    });

    const recipe = { 
        id: $('#recipe-id').val(), 
        name: $('#recipe-name').val(), 
        category_id: $('#recipe-category').val(), 
        category_name: $("#recipe-category option:selected").text(), 
        image_path: $('#recipe-image').val(), 
        ingredients_data: JSON.stringify(ingredients), 
        instructions: steps.join('\n') 
    };
    $('#btn-save-recipe').prop('disabled', true).text('Saving...');

    // Using fetch POST to handle large Base64 strings
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'save_recipe',
            data: JSON.stringify(recipe)
        })
    })
    .then(() => {
        setTimeout(() => {
            fetchData();
            bootstrap.Modal.getInstance(document.getElementById('recipeEditorModal')).hide();
            $('#btn-save-recipe').prop('disabled', false).text('Save to Google Sheets');
        }, 1000);
    })
    .catch(error => {
        console.error("Post Error:", error);
        alert("Error saving recipe. Check console.");
        $('#btn-save-recipe').prop('disabled', false).text('Save to Google Sheets');
    });
}
