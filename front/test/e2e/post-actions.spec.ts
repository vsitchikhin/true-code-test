import { test, expect, type Page } from '@playwright/test';

async function registerAndLogin(page: Page) {
  const username = `actions_${Date.now().toString().slice(-8)}`;
  const password = 'password123';

  await page.goto('/register');
  await page.getByLabel(/^Имя$/).fill('Иван');
  await page.getByLabel(/^Фамилия$/).fill('Иванов');
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

async function createPost(page: Page, text: string) {
  await page.getByRole('button', { name: /создать пост/i }).click();
  await expect(page.getByPlaceholder('Что нового?')).toBeVisible();
  await page.getByPlaceholder('Что нового?').fill(text);
  await page.getByRole('button', { name: /опубликовать/i }).click();
  await expect(page.getByPlaceholder('Что нового?')).not.toBeVisible({ timeout: 8000 });
  await expect(page.getByText(text)).toBeVisible({ timeout: 10000 });
}

// Открывает контекстное меню нужного поста (кнопка "⋯" в header карточки)
async function openPostMenu(page: Page, postText: string) {
  const postCard = page.getByText(postText).locator('xpath=ancestor::article');
  await postCard.locator('[class*="moreButton"]').click();
}

test.describe('Действия с постами', () => {
  test('удаление своего поста убирает его из ленты', async ({ page }) => {
    await registerAndLogin(page);

    const postText = `Пост для удаления ${Date.now()}`;
    await createPost(page, postText);

    await openPostMenu(page, postText);
    await page.getByRole('menuitem', { name: /Удалить/i }).click();

    // Кастомный диалог подтверждения — жмём кнопку "Удалить"
    await page.getByRole('button', { name: /^Удалить$/ }).click();

    // Пост должен исчезнуть из ленты
    await expect(page.getByText(postText)).not.toBeVisible({ timeout: 8000 });
  });

  test('редактирование своего поста обновляет его в ленте', async ({ page }) => {
    await registerAndLogin(page);

    const originalText = `Оригинальный пост ${Date.now()}`;
    const updatedText = `Обновлённый пост ${Date.now()}`;
    await createPost(page, originalText);

    await openPostMenu(page, originalText);
    await page.getByRole('menuitem', { name: /Редактировать/i }).click();

    // Модалка редактирования открывается с исходным текстом
    const textarea = page.getByPlaceholder('Что нового?');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue(originalText);

    // Меняем текст и сохраняем
    await textarea.fill(updatedText);
    await page.getByRole('button', { name: /сохранить/i }).click();

    // Модалка закрывается
    await expect(textarea).not.toBeVisible({ timeout: 8000 });

    // Обновлённый текст должен быть в ленте, старый — нет
    await expect(page.getByText(updatedText)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(originalText)).not.toBeVisible();
  });

  test('меню действий не отображается для чужих постов', async ({ page }) => {
    // Создаём первого пользователя и публикуем пост
    await registerAndLogin(page);
    const user1Post = `Пост первого пользователя ${Date.now()}`;
    await createPost(page, user1Post);

    // Выходим из аккаунта первого пользователя
    await page.getByTitle('Выйти').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

    // Регистрируемся вторым пользователем
    const user2 = `other_${Date.now().toString().slice(-8)}`;
    await page.goto('/register');
    await page.getByLabel(/^Имя$/).fill('Иван');
    await page.getByLabel(/^Фамилия$/).fill('Иванов');
    await page.getByLabel(/Имя пользователя/i).fill(user2);
    await page.getByLabel(/Email/i).fill(`${user2}@test.com`);
    await page
      .getByLabel(/Телефон/i)
      .fill(`+7${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Создать аккаунт/i }).click();
    await page.getByLabel(/Логин, email или телефон/i).fill(user2);
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Войти/i }).click();
    await expect(page).toHaveURL(/\/$/);

    // Пост первого пользователя должен быть в ленте без кнопки меню
    const postCard = page.getByText(user1Post).locator('xpath=ancestor::article');
    await expect(postCard).toBeVisible({ timeout: 10000 });
    await expect(postCard.locator('[class*="moreButton"]')).not.toBeVisible();
  });
});
