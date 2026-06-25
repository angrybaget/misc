const API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY ?? '';
const FROM = 'НУШ Навчання <onboarding@resend.dev>';
const APP_URL = 'https://school28-d2877.web.app';

export async function sendWelcomeEmail(
  to: string,
  displayName: string,
  password: string,
): Promise<void> {
  if (!API_KEY) return;

  const name = displayName.split(' ')[0] || 'учень';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: 'Ласкаво просимо до НУШ Навчання! 🇺🇦',
      html: html(name, to, password),
    }),
  });
}

function html(name: string, email: string, password: string): string {
  return `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
  <div style="background:#4F46E5;padding:24px;border-radius:8px 8px 0 0;text-align:center">
    <div style="font-size:40px">🇺🇦</div>
    <h1 style="color:#fff;margin:8px 0 0;font-size:22px">НУШ Навчання</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    <p style="font-size:16px;color:#1f2937;margin-top:0">Привіт, <strong>${name}</strong>! 👋</p>
    <p style="color:#374151">Дякуємо за реєстрацію. Твій акаунт успішно створено через Google.</p>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
      <p style="margin:0 0 12px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Дані для входу через Email</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        <tr>
          <td style="padding:6px 0;color:#6b7280;width:80px">Email</td>
          <td style="padding:6px 0;font-weight:600;color:#1f2937">${email}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280">Пароль</td>
          <td style="padding:6px 0;font-weight:600;color:#1f2937;font-family:monospace;font-size:17px;letter-spacing:1px">${password}</td>
        </tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:13px">Збережи цей лист — пароль дозволяє входити без Google-акаунту.</p>
    <div style="text-align:center;margin-top:24px">
      <a href="${APP_URL}" style="background:#4F46E5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Відкрити застосунок →</a>
    </div>
  </div>
</div>`;
}
