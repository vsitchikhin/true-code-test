import { test, expect, type Page } from '@playwright/test';

async function registerAndLogin(page: Page) {
  const username = `post_${Date.now().toString().slice(-8)}`;
  const password = 'password123';

  await page.goto('/register');
  await page.getByLabel(/Имя пользователя/i).fill(username);
  await page.getByLabel(/Email/i).fill(`${username}@test.com`);
  await page
    .getByLabel(/Телефон/i)
    .fill(`+7${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  await page.getByLabel(/Пароль/i).fill(password);
  await page.getByRole('button', { name: /Создать аккаунт/i }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel(/Логин, email или телефон/i).fill(username);
  await page.getByLabel(/Пароль/i).fill(password);
  await page.getByRole('button', { name: /Войти/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe('Создание поста', () => {
  test('публикация текстового поста', async ({ page }) => {
    await registerAndLogin(page);

    // Открываем модалку
    await page.getByRole('button', { name: /создать пост/i }).click();
    await expect(page.getByPlaceholder('Что нового?')).toBeVisible();

    // Заполняем и отправляем
    const postText = `E2E пост ${Date.now()}`;
    await page.getByPlaceholder('Что нового?').fill(postText);
    await page.getByRole('button', { name: /опубликовать/i }).click();

    // Модалка должна закрыться
    await expect(page.getByPlaceholder('Что нового?')).not.toBeVisible({ timeout: 8000 });

    // Пост должен появиться в ленте
    await expect(page.getByText(postText)).toBeVisible({ timeout: 10000 });
  });

  test('нельзя опубликовать пустой пост', async ({ page }) => {
    await registerAndLogin(page);

    await page.getByRole('button', { name: /создать пост/i }).click();
    await expect(page.getByPlaceholder('Что нового?')).toBeVisible();

    // Пытаемся отправить пустую форму
    await page.getByRole('button', { name: /опубликовать/i }).click();

    // Ошибка валидации должна появиться, модалка остаётся открытой
    await expect(page.getByText('Введите текст поста')).toBeVisible();
    await expect(page.getByPlaceholder('Что нового?')).toBeVisible();
  });

  test('закрытие модалки сбрасывает форму', async ({ page }) => {
    await registerAndLogin(page);

    await page.getByRole('button', { name: /создать пост/i }).click();
    await page.getByPlaceholder('Что нового?').fill('Текст который пропадёт');

    // Закрываем через кнопку X в модалке
    await page.locator('[class*="closeButton"]').click();
    await expect(page.getByPlaceholder('Что нового?')).not.toBeVisible();

    // Открываем снова — форма чистая
    await page.getByRole('button', { name: /создать пост/i }).click();
    await expect(page.getByPlaceholder('Что нового?')).toHaveValue('');
  });
});
