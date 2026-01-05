use defter_db;
-- ========================================================
-- DEFTER DATABASE SCHEMA
-- Description: Auth, Members, Finance, CMS, Events, Audit
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS cms_pages;
DROP TABLE IF EXISTS notification_logs;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS app_settings;
DROP TABLE IF EXISTS verification_codes;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS member_dues;
DROP TABLE IF EXISTS fee_schedules;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS member_categories;
DROP TABLE IF EXISTS fee_types;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- A. CŒUR SYSTÈME & CONFIGURATION
-- ========================================================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE, 
    label VARCHAR(100) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE
);

CREATE TABLE app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE cms_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE, -- ex: 'cgu', 'about', 'privacy'
    title VARCHAR(200) NOT NULL,
    content_html LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    contact_target VARCHAR(255),
    channel ENUM('whatsapp', 'email', 'sms') NOT NULL,
    message_type VARCHAR(50),
    status ENUM('sent', 'failed', 'delivered') DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- B. AUTHENTIFICATION
-- ========================================================

CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identity VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identity (identity)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT chk_user_identity CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(64) NOT NULL, 
    device_fingerprint VARCHAR(255), 
    ip_address VARCHAR(45),
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_token_hash (token_hash)
);

-- ========================================================
-- C. MÉTIER : MEMBRES & ÉVÉNEMENTS
-- ========================================================

CREATE TABLE member_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    barcode VARCHAR(50) UNIQUE,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    phone_contact VARCHAR(20), 
    email_contact VARCHAR(255),
    category_id INT NOT NULL,
    arrival_year_quimper INT NOT NULL,
    address_fr_line1 VARCHAR(255),
    address_fr_line2 VARCHAR(255),
    address_fr_zip VARCHAR(10),
    address_fr_city VARCHAR(100),
    address_tr_line1 VARCHAR(255),
    address_tr_line2 VARCHAR(255),
    address_tr_city VARCHAR(100),
    address_tr_region VARCHAR(100),
    has_cenaze_fonu BOOLEAN DEFAULT FALSE,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES member_categories(id)
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    total_seats INT NOT NULL,
    max_seats_per_member INT DEFAULT 2,
    
    is_lottery BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'open', 'closed', 'completed') DEFAULT 'draft',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    member_id INT NOT NULL,
    
    quantity_requested INT NOT NULL,
    quantity_allocated INT DEFAULT 0,
    
    status ENUM('pending', 'approved', 'rejected', 'waitlist') DEFAULT 'pending',
    ticket_sent_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- ========================================================
-- D. FINANCE
-- ========================================================

CREATE TABLE fee_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE fee_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    fee_type_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id),
    FOREIGN KEY (category_id) REFERENCES member_categories(id),
    UNIQUE(year, fee_type_id, category_id)
);

CREATE TABLE member_dues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    year INT NOT NULL,
    fee_type_id INT NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('pending', 'partial', 'paid', 'waived', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id),
    UNIQUE(member_id, year, fee_type_id)
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    recorded_by_user_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    method ENUM('cash', 'card', 'transfer', 'check', 'stripe') NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    stripe_payment_id VARCHAR(255),
    check_reference VARCHAR(50),
    notes TEXT,
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
);


-- ========================================================
-- E. SEED DATA
-- ========================================================

INSERT INTO roles (slug, label, is_system) VALUES 
('sudo', 'Super Administrateur', 1),
('admin', 'Administrateur Métier', 1),
('technician', 'Responsable Technique', 1),
('moderator', 'Modérateur', 1),
('member', 'Membre Standard', 1);

INSERT INTO fee_types (slug, label, is_recurring, is_system) VALUES 
('aidat', 'Cotisation Annuelle', 1, 1),
('cenaze_fonu', 'Fond Funéraire', 1, 1),
('don', 'Donation', 0, 0);

INSERT INTO member_categories (slug, label, is_system) VALUES 
('normal', 'Adulte (Standard)', 1),
('student', 'Étudiant', 1),
('young', 'Jeunes -25', 1),
('retiree', 'Retraité', 1),
('outsider', 'Hors Département', 0);

INSERT INTO users (email, phone, password_hash, role_id) 
VALUES ('admin@defter.local', '+33600000000', '$2a$10$X7V.j/1.f1/1.f1/1.f1/1.f1/1.f1/1.f1/1.f1/1.f1', 1);

INSERT INTO fee_schedules (year, fee_type_id, category_id, amount) VALUES 
(2025, (SELECT id FROM fee_types WHERE slug='aidat'), (SELECT id FROM member_categories WHERE slug='normal'), 240.00),
(2025, (SELECT id FROM fee_types WHERE slug='aidat'), (SELECT id FROM member_categories WHERE slug='student'), 0.00),
(2025, (SELECT id FROM fee_types WHERE slug='aidat'), (SELECT id FROM member_categories WHERE slug='young'), 100.00),
(2025, (SELECT id FROM fee_types WHERE slug='aidat'), (SELECT id FROM member_categories WHERE slug='retiree'), 100.00);

INSERT INTO cms_pages (slug, title, content_html) VALUES
('cgu', 'Conditions Générales d\'Utilisation', '<p>CGU à rédiger...</p>'),
('privacy', 'Politique de Confidentialité', '<p>Vos données sont protégées...</p>');

INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('maintenance_mode', 'false', 'Mode maintenance');