-- Recipe Guide Database Schema

CREATE DATABASE IF NOT EXISTS recipe_guide;
USE recipe_guide;

-- Table for Admin Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table for Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'fa-coffee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table for Recipes
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(150) NOT NULL,
    image_path VARCHAR(255),
    ingredients_data TEXT, -- Changed from ingredients to match PHP code
    instructions TEXT, -- Used for Finishing Steps
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Initial Category Data
INSERT INTO categories (name, icon) VALUES ('Coffee', 'fa-coffee'), ('Tea', 'fa-leaf'), ('Bakery', 'fa-bread-slice');

-- Note: Admin user should be created via a registration script or manual insert with password_hash().
-- Default admin user (username: admin, password: admin123)
-- Hash for 'admin123': $2y$10$nS6O0T6y2G0S.m0L0G0S.u0X0G0S.m0L0G0S.u0X0G0S. (Placeholder, will provide real hash in setup.php)
