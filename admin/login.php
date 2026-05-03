<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Recipe Guide</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #1a1a1a;
            color: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        .login-card {
            background-color: #2c2c2c;
            border: 1px solid #444;
            border-radius: 15px;
            padding: 2rem;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .btn-primary {
            background-color: #d4a373;
            border-color: #d4a373;
            color: #1a1a1a;
            font-weight: bold;
        }
        .btn-primary:hover {
            background-color: #bc8a5f;
            border-color: #bc8a5f;
            color: #1a1a1a;
        }
        .form-control {
            background-color: #333;
            border: 1px solid #555;
            color: #fff;
        }
        .form-control:focus {
            background-color: #3d3d3d;
            border-color: #d4a373;
            color: #fff;
            box-shadow: none;
        }
        .brand-text {
            color: #d4a373;
            font-family: 'Serif', serif;
            text-align: center;
            margin-bottom: 1.5rem;
        }
    </style>
</head>
<body>

<div class="login-card">
    <div class="text-center mb-4">
        <img src="../images/logo.webp" alt="Recipe Guide" class="img-fluid" style="max-height: 100px;">
    </div>
    
    <?php if (isset($_GET['error'])): ?>
        <div class="alert alert-danger py-2" role="alert">
            Invalid username or password.
        </div>
    <?php endif; ?>

    <form action="../api/login_action.php" method="POST">
        <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" name="username" class="form-control" id="username" required>
        </div>
        <div class="mb-4">
            <label for="password" class="form-label">Password</label>
            <input type="password" name="password" class="form-control" id="password" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>
</div>

</body>
</html>
