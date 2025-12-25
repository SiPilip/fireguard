-- Script untuk menambahkan kolom phone_number ke tabel otp_attempts
-- Jalankan script ini di phpMyAdmin atau MySQL CLI

-- 1. Tambahkan kolom phone_number jika belum ada
ALTER TABLE otp_attempts ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT NULL AFTER email;

-- 2. Tambahkan kolom type jika belum ada (untuk membedakan login/register)
ALTER TABLE otp_attempts ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'login' AFTER otp_hash;

-- 3. Tambahkan index untuk mempercepat query
ALTER TABLE otp_attempts ADD INDEX IF NOT EXISTS idx_phone_number (phone_number);
ALTER TABLE otp_attempts ADD INDEX IF NOT EXISTS idx_type (type);

-- Verifikasi struktur tabel
DESCRIBE otp_attempts;
