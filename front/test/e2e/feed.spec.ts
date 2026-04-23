import { test, expect } from '@playwright/test';

test.describe('Лента событий', () => {
  test('отображение ленты после авторизации', async ({ page }) => {
    // 1. Логинимся (используем curluser, который создан сидом)
    await page.goto('/login');
    await page.getByLabel(/Логин, email или телефон/i).fill('curluser');
    await page.getByLabel(/Пароль/i).fill('password123'); // Мы не знаем пароль curluser из сида...
    // Стоп! В сид-скрипте я не регистрировал пользователя, я просто брал первого попавшегося.
    // Для E2E лучше создать нового пользователя в самом тесте.

    const uniqueUsername = `u_${Date.now().toString().slice(-8)}`;
    const password = 'password123';

    // Регистрируемся
    await page.goto('/register');
    await page.getByLabel(/Имя пользователя/i).fill(uniqueUsername);
    await page.getByLabel(/Email/i).fill(`${uniqueUsername}@test.com`);
    await page
      .getByLabel(/Телефон/i)
      .fill(`+7${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    await page.getByLabel(/Пароль/i).fill(password);
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();

    // Ждем редиректа на логин
    await expect(page).toHaveURL(/\/login/);

    // Логинимся
    await page.getByLabel(/Логин, email или телефон/i).fill(uniqueUsername);
    await page.getByLabel(/Пароль/i).fill(password);
    await page.getByRole('button', { name: /Войти/i }).click();

    // Проверяем редирект на главную
    await expect(page).toHaveURL(/\/$/);

    // Проверяем что хедер отрендерен (пользователь авторизован)
    await expect(page.getByRole('banner')).toBeVisible();

    // Ждем когда исчезнут скелетоны (если они были)
    await expect(page.locator('[class*="skeleton"]')).toHaveCount(0, { timeout: 15000 });

    // Проверяем наличие либо постов, либо сообщения о пустой ленте
    const feedContent = page.locator('article').first().or(page.getByText('Лента пуста'));
    await expect(feedContent).toBeVisible();
  });
});
