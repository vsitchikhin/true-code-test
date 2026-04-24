import { test, expect, type Page } from '@playwright/test';

async function registerAndLogin(page: Page) {
  const username = `profile_${Date.now().toString().slice(-8)}`;
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

  return username;
}

test.describe('Страница профиля', () => {
  test('переход на /user/me показывает профиль текущего пользователя', async ({ page }) => {
    const username = await registerAndLogin(page);

    await page.goto('/user/me');

    await expect(page.getByText(username)).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /редактировать/i })).toBeVisible();
  });

  test('клик по аватару в хедере ведёт на страницу профиля', async ({ page }) => {
    await registerAndLogin(page);

    await page.locator('[class*="user"]').click();
    await expect(page).toHaveURL(/\/user\//);
  });

  test('пост созданный пользователем отображается на его странице профиля', async ({ page }) => {
    await registerAndLogin(page);

    const postText = `профиль-тест-${Date.now()}`;
    await page.getByRole('button', { name: /создать пост/i }).click();
    await page.getByPlaceholder('Что нового?').fill(postText);
    await page.getByRole('button', { name: /опубликовать/i }).click();
    await expect(page.getByPlaceholder('Что нового?')).not.toBeVisible({ timeout: 8000 });

    await page.goto('/user/me');
    await expect(page.getByText(postText)).toBeVisible({ timeout: 8000 });
  });

  test('редактирование профиля: изменение bio сохраняется', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto('/user/me');

    await page.getByRole('button', { name: /редактировать/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const newBio = `Обновлённое био ${Date.now()}`;
    const bioField = page.getByPlaceholder(/расскажите немного о себе/i);
    await bioField.clear();
    await bioField.fill(newBio);

    await page.getByRole('button', { name: /сохранить/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 8000 });

    await page.goto('/user/me');
    await expect(page.getByText(newBio)).toBeVisible({ timeout: 8000 });
  });

  test('счётчик постов отображается корректно', async ({ page }) => {
    await registerAndLogin(page);

    await page.getByRole('button', { name: /создать пост/i }).click();
    await page.getByPlaceholder('Что нового?').fill('Тест счётчика');
    await page.getByRole('button', { name: /опубликовать/i }).click();
    await expect(page.getByPlaceholder('Что нового?')).not.toBeVisible({ timeout: 8000 });

    await page.goto('/user/me');
    await expect(page.getByText(/1\s*пост/i)).toBeVisible({ timeout: 8000 });
  });
});
