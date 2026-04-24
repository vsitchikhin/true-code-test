import { test, expect } from '@playwright/test';

test.describe('Бесконечная лента', () => {
  test('подгрузка постов при скролле', async ({ page }) => {
    const uniqueUsername = `scroll_user_${Date.now().toString().slice(-6)}`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel(/^Имя$/).fill('Иван');
    await page.getByLabel(/^Фамилия$/).fill('Иванов');
    await page.getByLabel(/Имя пользователя/i).fill(uniqueUsername);
    await page.getByLabel(/Email/i).fill(`${uniqueUsername}@test.com`);
    await page.getByLabel(/Телефон/i).fill(`+7999${Date.now().toString().slice(-7)}`);
    await page.getByLabel(/Пароль/i).fill(password);
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel(/Логин, email или телефон/i).fill(uniqueUsername);
    await page.getByLabel(/Пароль/i).fill(password);
    await page.getByRole('button', { name: /Войти/i }).click();

    await expect(page).toHaveURL(/\/$/);

    // Ждем, пока скелетоны исчезнут
    await expect(page.locator('[class*="skeleton"]')).toHaveCount(0, { timeout: 15000 });

    // Получаем начальное количество постов (первая страница — до 10)
    const initialCount = await page.locator('article').count();

    if (initialCount >= 10) {
      // Скроллим вниз и ждём подгрузки следующей страницы
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      await expect(async () => {
        const currentCount = await page.locator('article').count();
        expect(currentCount).toBeGreaterThan(initialCount);
      }).toPass({ timeout: 10000 });
    } else {
      // Постов меньше 10 — всё на одной странице, infinite scroll не нужен
      expect(initialCount).toBeGreaterThan(0);
    }
  });
});
