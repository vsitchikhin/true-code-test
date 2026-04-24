import { test, expect } from '@playwright/test';

test.describe('Автоматическое обновление токенов', () => {
  test('должен прозрачно обновлять токены при истечении access_token', async ({
    page,
    context,
  }) => {
    const uniqueUsername = `ref_${Date.now().toString().slice(-8)}`;
    const password = 'password123';

    // 1. Регистрируемся и логинимся
    await page.goto('/register');
    await page.getByLabel(/^Имя$/).fill('Иван');
    await page.getByLabel(/^Фамилия$/).fill('Иванов');
    await page.getByLabel(/Имя пользователя/i).fill(uniqueUsername);
    await page.getByLabel(/Email/i).fill(`${uniqueUsername}@test.com`);
    await page
      .getByLabel(/Телефон/i)
      .fill(`+7${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    await page.getByLabel(/Пароль/i).fill(password);
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel(/Логин, email или телефон/i).fill(uniqueUsername);
    await page.getByLabel(/Пароль/i).fill(password);
    await page.getByRole('button', { name: /Войти/i }).click();

    await expect(page).toHaveURL(/\/$/);

    // 2. Проверяем что мы залогинены (видим шапку сайта)
    await expect(page.getByRole('banner')).toBeVisible();

    // 3. Эмулируем "протухание" аксесс-токена, удаляя куку
    const cookies = await context.cookies();
    const otherCookies = cookies.filter((c) => c.name !== 'access_token');
    await context.clearCookies();
    await context.addCookies(otherCookies);

    // Убеждаемся что access_token удален, а refresh_token остался
    const newCookies = await context.cookies();
    expect(newCookies.find((c) => c.name === 'access_token')).toBeUndefined();
    expect(newCookies.find((c) => c.name === 'refresh_token')).toBeDefined();

    // 4. Перезагружаем страницу или просто пытаемся выполнить действие
    // При загрузке страницы сработает initAuth -> 401 -> Интерцептор (Refresh)
    await page.reload();

    // 5. Проверяем что мы ВСЕ ЕЩЕ залогинены
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('banner')).toBeVisible();

    // Проверяем что access_token ПЕРЕВЫПУЩЕН (кука снова появилась)
    const finalCookies = await context.cookies();
    expect(finalCookies.find((c) => c.name === 'access_token')).toBeDefined();
  });
});
