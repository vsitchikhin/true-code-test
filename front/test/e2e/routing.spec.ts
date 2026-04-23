import { test, expect } from '@playwright/test';

test.describe('Авторизационный роутинг', () => {
  test.beforeEach(async ({ page }) => {
    // eslint-disable-next-line no-console
    page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
  });

  test('неавторизованный пользователь перенаправляется на /login с главной страницы', async ({
    page,
  }) => {
    // Переходим на главную без кук
    await page.goto('/');

    // Должны оказаться на /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('авторизованный пользователь перенаправляется на главную со страницы входа', async ({
    page,
  }) => {
    // Имитируем успешную регистрацию и логин
    const username = `user_${Date.now()}`;
    const email = `${username}@test.com`;
    const phone = `+7${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    await page.goto('/register');
    await page.getByLabel(/Имя пользователя/i).fill(username);
    await page.getByLabel(/Email/i).fill(email);
    await page.getByLabel(/Телефон/i).fill(phone);
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();

    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel(/Логин, email или телефон/i).fill(username);
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Войти/i }).click();

    // Ждем редиректа на главную после логина
    await expect(page).toHaveURL(/\/$/);

    // Пытаемся зайти на /login будучи залогиненным
    await page.goto('/login');

    // Должны быть отброшены назад на главную
    await expect(page).toHaveURL(/\/$/);
  });

  test('авторизованный пользователь перенаправляется на главную со страницы регистрации', async ({
    page,
  }) => {
    // Сначала логинимся (используем уже созданного юзера или регистрируем нового)
    const username = `user_${Date.now()}`;
    const phone = `+7${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    await page.goto('/register');
    await page.getByLabel(/Имя пользователя/i).fill(username);
    await page.getByLabel(/Email/i).fill(`${username}@test.com`);
    await page.getByLabel(/Телефон/i).fill(phone);
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    await page.getByLabel(/Логин, email или телефон/i).fill(username);
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Войти/i }).click();
    await expect(page).toHaveURL(/\/$/);

    // Пытаемся зайти на /register
    await page.goto('/register');

    // Должны быть отброшены на главную
    await expect(page).toHaveURL(/\/$/);
  });
});
