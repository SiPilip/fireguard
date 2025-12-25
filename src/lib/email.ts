import nodemailer from 'nodemailer';

// Konfigurasi Email Transporter
// Development: Gunakan Mailpit (Laragon) di port 1025
// Production: Gunakan Gmail SMTP dengan App Password

const isDevelopment = process.env.NODE_ENV !== 'production';

// Cek apakah menggunakan Mailpit (development) atau Gmail (production)
const transporter = isDevelopment && (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD)
  ? nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'localhost',
    port: parseInt(process.env.MAIL_PORT || '1025'),
    secure: false,
    ignoreTLS: true,
  })
  : nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // Optimasi untuk pengiriman lebih cepat
    pool: true, // Gunakan connection pooling
    maxConnections: 5, // Maksimal 5 koneksi paralel
    maxMessages: 100, // Maksimal 100 pesan per koneksi
    rateDelta: 1000, // 1 detik antara batch
    rateLimit: 10, // Maksimal 10 email per detik
  });

// Verify transporter connection on startup
transporter.verify().then(() => {
  console.log('✅ Email transporter is ready');
}).catch((error) => {
  console.error('❌ Email transporter error:', error);
});

// Email pengirim default
const FROM_EMAIL = process.env.GMAIL_USER || 'fireguard@plaju.go.id';

/**
 * Kirim OTP via Email
 */
export async function sendEmailOTP(email: string, otp: string, type: 'register' | 'login' = 'login') {
  const subject = type === 'register'
    ? '🔐 Kode Verifikasi Pendaftaran FireGuard'
    : '🔐 Kode Login FireGuard';

  // Logo base URL - gunakan URL publik atau base64
  const logoUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/logofireguard.png`
    : 'https://fireguard-palembang.vercel.app/logofireguard.png';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #EF4444 0%, #F97316 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
          <img src="${logoUrl}" alt="FireGuard" width="48" height="48" style="border-radius: 12px; background: white; padding: 4px;" />
          <h1 style="color: white; margin: 0; font-size: 28px;">FireGuard</h1>
        </div>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Sistem Pelaporan Bencana Kec. Plaju</p>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">
          ${type === 'register' ? 'Verifikasi Email Anda' : 'Kode Login Anda'}
        </h2>
        <p style="color: #6b7280; line-height: 1.6;">
          ${type === 'register'
      ? 'Gunakan kode berikut untuk menyelesaikan pendaftaran akun FireGuard Anda:'
      : 'Gunakan kode berikut untuk login ke akun FireGuard Anda:'}
        </p>
        <div style="background: white; border: 2px dashed #EF4444; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #EF4444;">${otp}</span>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">
          ⏱️ Kode ini berlaku selama <strong>5 menit</strong>.<br>
          ⚠️ Jangan bagikan kode ini kepada siapapun.
        </p>
      </div>
      <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
          © 2024 FireGuard - Kec. Plaju, Palembang
        </p>
      </div>
    </div>
  `;

  try {
    console.log(`📧 Sending OTP email to: ${email}`);
    console.log(`🔑 OTP Code: ${otp}`);

    await transporter.sendMail({
      from: `"FireGuard" <${FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully to: ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending email OTP:', error);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 OTP (for testing): ${otp}`);
    return { success: false, error: error.message };
  }
}

/**
 * Kirim notifikasi update status laporan via Email
 */
export async function sendStatusUpdateEmail(
  email: string,
  name: string,
  reportId: number,
  newStatus: string,
  adminNotes?: string
) {
  const statusLabels: Record<string, { label: string; color: string; emoji: string }> = {
    pending: { label: 'Menunggu', color: '#F59E0B', emoji: '⏳' },
    diproses: { label: 'Sedang Diproses', color: '#3B82F6', emoji: '🔄' },
    dikirim: { label: 'Tim Dikirim', color: '#8B5CF6', emoji: '🚒' },
    ditangani: { label: 'Sedang Ditangani', color: '#06B6D4', emoji: '👨‍🚒' },
    selesai: { label: 'Selesai', color: '#10B981', emoji: '✅' },
    dibatalkan: { label: 'Dibatalkan', color: '#EF4444', emoji: '❌' },
  };

  const status = statusLabels[newStatus] || { label: newStatus, color: '#6B7280', emoji: '📋' };

  // Logo base URL
  const logoUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/logofireguard.png`
    : 'https://fireguard-palembang.vercel.app/logofireguard.png';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #EF4444 0%, #F97316 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
          <img src="${logoUrl}" alt="FireGuard" width="48" height="48" style="border-radius: 12px; background: white; padding: 4px;" />
          <h1 style="color: white; margin: 0; font-size: 28px;">FireGuard</h1>
        </div>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Update Status Laporan</p>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #6b7280;">Halo <strong>${name}</strong>,</p>
        <p style="color: #6b7280; line-height: 1.6;">
          Status laporan Anda <strong>#${reportId}</strong> telah diperbarui:
        </p>
        <div style="background: white; border-left: 4px solid ${status.color}; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 24px;">
            ${status.emoji} <strong style="color: ${status.color};">${status.label}</strong>
          </p>
        </div>
        ${adminNotes ? `
          <div style="background: #FEF3C7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E; font-size: 14px;">
              <strong>📝 Catatan Petugas:</strong><br>${adminNotes}
            </p>
          </div>
        ` : ''}
        <p style="color: #9ca3af; font-size: 14px;">
          Terima kasih telah menggunakan FireGuard untuk melaporkan kejadian di lingkungan Anda.
        </p>
      </div>
      <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
          © 2024 FireGuard - Kec. Plaju, Palembang
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FireGuard" <${FROM_EMAIL}>`,
      to: email,
      subject: `${status.emoji} Laporan #${reportId}: ${status.label}`,
      html,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error sending status update email:', error);
    return { success: false, error: error.message };
  }
}
