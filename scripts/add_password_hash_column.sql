-- Script non-destruktif untuk menambah password_hash pada tabel users
-- Jalankan di MySQL untuk database existing

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL AFTER phone_number;

-- Verifikasi hasil
DESCRIBE users;
