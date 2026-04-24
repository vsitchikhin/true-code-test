import { test, expect } from '@playwright/test';

test.describe('Регистрация', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.error('BROWSER LOG:', msg.text()));
    page.on('pageerror', (err) => console.error('BROWSER ERROR:', err.message));
  });

  test('успешная регистрация нового пользователя', async ({ page }) => {
    const uniqueUsername = `user_${Date.now()}`;
    const uniqueEmail = `${uniqueUsername}@test.com`;

    const uniquePhone = `+7${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    // Переходим на страницу регистрации
    await page.goto('/register');

    // Заполняем форму
    await page.getByLabel(/^Имя$/).fill('Иван');
    await page.getByLabel(/^Фамилия$/).fill('Иванов');
    await page.getByLabel(/Имя пользователя/i).fill(uniqueUsername);
    await page.getByLabel(/Email/i).fill(uniqueEmail);
    await page.getByLabel(/Телефон/i).fill(uniquePhone);
    await page.getByLabel(/Пароль/i).fill('password123');

    // Сабмитим
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();

    try {
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    } catch (e) {
      console.error('--- PAGE CONTENT ON FAILURE ---');
      console.error(await page.content());
      console.error('-------------------------------');
      throw e;
    }
  });

  test('показ ошибки при пустых полях', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();

    // Проверяем наличие сообщений о валидации
    await expect(page.getByText(/Минимум 3 символа/i)).toBeVisible();
    await expect(page.getByText(/Некорректный email/i)).toBeVisible();
  });
});
