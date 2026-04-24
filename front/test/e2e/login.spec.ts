import { test, expect } from '@playwright/test';

test.describe('Авторизация', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.error('BROWSER LOG:', msg.text()));
    page.on('pageerror', (err) => console.error('BROWSER ERROR:', err.message));
  });

  test('успешный вход после регистрации', async ({ page }) => {
    const uniqueUsername = `u_${Date.now().toString().slice(-8)}`;
    const uniqueEmail = `${uniqueUsername}@test.com`;
    const uniquePhone = `+7${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const password = 'password123';

    // 1. Сначала регистрируемся
    await page.goto('/register');
    await page.getByLabel(/^Имя$/).fill('Иван');
    await page.getByLabel(/^Фамилия$/).fill('Иванов');
    await page.getByLabel(/Имя пользователя/i).fill(uniqueUsername);
    await page.getByLabel(/Email/i).fill(uniqueEmail);
    await page.getByLabel(/Телефон/i).fill(uniquePhone);
    await page.getByLabel(/Пароль/i).fill(password);
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();

    // Ждем редиректа на логин
    await expect(page).toHaveURL(/\/login/);

    // 2. Теперь логинимся
    await page.getByLabel(/Логин, email или телефон/i).fill(uniqueUsername);
    await page.getByLabel(/Пароль/i).fill(password);
    await page.getByRole('button', { name: /Войти/i }).click();

    // Ждем редиректа на главную
    await expect(page).toHaveURL(/\/$/);

    // Проверяем что мы на главной
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('ошибка при неверных данных', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/Логин, email или телефон/i).fill('nonexistent_user');
    await page.getByLabel(/Пароль/i).fill('wrongpassword');
    await page.getByRole('button', { name: /Войти/i }).click();

    // Должно появиться сообщение об ошибке
    await expect(page.getByText(/логин или пароль/i)).toBeVisible({ timeout: 10000 });
  });
});
