import { test, expect } from '@playwright/test';

test.describe('Регистрация', () => {
  test.beforeEach(async ({ page }) => {
    // eslint-disable-next-line no-console
    page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
    // eslint-disable-next-line no-console
    page.on('pageerror', (err) => console.log('BROWSER ERROR:', err.message));
  });

  test('успешная регистрация нового пользователя', async ({ page }) => {
    const uniqueUsername = `user_${Date.now()}`;
    const uniqueEmail = `${uniqueUsername}@test.com`;

    // Переходим на страницу регистрации
    await page.goto('/register');

    // Заполняем форму
    await page.getByLabel(/Имя пользователя/i).fill(uniqueUsername);
    await page.getByLabel(/Email/i).fill(uniqueEmail);
    await page.getByLabel(/Телефон/i).fill('+79991112233');
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
