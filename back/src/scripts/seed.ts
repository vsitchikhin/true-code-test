/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app.module';
import { CreatePostUseCase } from '@application/use-cases/create-post.use-case';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import type { User } from '@domain/entities/user.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

const SEED_USERS = [
  {
    email: 'alice@example.com',
    username: 'alice',
    password: 'password123',
    phoneNumber: '+79001110001',
  },
  {
    email: 'bob@example.com',
    username: 'bob',
    password: 'password123',
    phoneNumber: '+79001110002',
  },
  {
    email: 'carol@example.com',
    username: 'carol',
    password: 'password123',
    phoneNumber: '+79001110003',
  },
];

const SEED_POSTS = [
  {
    userIndex: 0,
    content: 'Привет всем! Это мой первый пост на True Code. Рад быть здесь 🚀',
    imagePaths: [],
  },
  {
    userIndex: 1,
    content:
      'Сегодня разобрался с NestJS и чистой архитектурой. Очень мощная связка! #backend #nestjs',
    imagePaths: [],
  },
  {
    userIndex: 2,
    content: 'Только что задеплоила новый проект. CI/CD настроен, тесты зелёные — кайф 🎉',
    imagePaths: [],
  },
  {
    userIndex: 0,
    content:
      'Работаю над лентой новостей. Tanstack Query + React — просто огонь для работы с сервером.',
    imagePaths: [],
  },
  {
    userIndex: 1,
    content:
      'Попробовал Playwright для e2e тестов. Кросс-браузерность из коробки — это серьёзно круто.',
    imagePaths: [],
  },
  {
    userIndex: 2,
    content:
      'Рефакторила монолит на чистую архитектуру весь день. Болит голова, но результат того стоит 😅',
    imagePaths: [],
  },
  {
    userIndex: 0,
    content: 'Reminder: TypeScript помогает поймать баги до рантайма. Не пренебрегайте типами!',
    imagePaths: [],
  },
  {
    userIndex: 1,
    content:
      'JWT vs Cookie-сессии: у каждого подхода свои плюсы. httpOnly cookie — мой фаворит для веба.',
    imagePaths: [],
  },
  {
    userIndex: 2,
    content:
      'Настроила Zustand для глобального стейта. Минимализм и удобство — именно то, что нужно.',
    imagePaths: [],
  },
  {
    userIndex: 0,
    content: 'Feature-Sliced Design меняет подход к организации фронтенда. Рекомендую изучить 📐',
    imagePaths: [],
  },
  {
    userIndex: 1,
    content:
      'Провёл код-ревью три часа подряд. Глаза устали, но код стал чище. Стоит оно того? Да.',
    imagePaths: [],
  },
  {
    userIndex: 2,
    content:
      'Sass + CSS Modules = идеальный дуэт для компонентных стилей. Переехала с plain CSS и не жалею.',
    imagePaths: [],
  },
  {
    userIndex: 0,
    content:
      'Оптимизировал SQL-запросы в PostgreSQL. Индексы творят чудеса, N+1 больше не проблема 📊',
    imagePaths: [],
  },
  {
    userIndex: 1,
    content:
      'Docker Compose для локальной разработки — маст-хэв. Поднять всё окружение одной командой.',
    imagePaths: [],
  },
  {
    userIndex: 2,
    content:
      'Написала кастомный хук useDebounce для поиска. Сервер скажет спасибо за меньшее количество запросов 😄',
    imagePaths: [],
  },
  {
    userIndex: 0,
    content:
      'Vite 6 с sass-embedded работает значительно быстрее, чем старый sass. Апгрейд однозначно стоит.',
    imagePaths: [],
  },
  {
    userIndex: 1,
    content:
      'Алгоритмы — это не страшно. Просто нужно практиковаться каждый день. LeetCode, вперёд! 💪',
    imagePaths: [],
  },
  {
    userIndex: 2,
    content:
      'Когда pull request наконец принят после 15 ревизий. Маленькая победа, но всё равно победа 🏆',
    imagePaths: [],
  },
  {
    userIndex: 0,
    content:
      'Refresh token rotation реализован. Теперь сессии безопасные и долгоживущие. Безопасность прежде всего!',
    imagePaths: [],
  },
  {
    userIndex: 1,
    content:
      'Пишите тесты. Всегда. Даже если кажется, что "и так понятно". Будущий вы скажет спасибо 🙏',
    imagePaths: [],
  },
];

async function ensureUser(
  registerUseCase: RegisterUserUseCase,
  userRepository: IUserRepository,
  data: (typeof SEED_USERS)[number],
): Promise<User> {
  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    console.log(`Пользователь уже существует: ${data.username}`);
    return existing;
  }
  const user = await registerUseCase.execute(data);
  console.log(`Создан пользователь: ${data.username}`);
  return user;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get<IUserRepository>('IUserRepository');
  const postRepository = app.get<IPostRepository>(IPostRepository);
  const registerUseCase = app.get(RegisterUserUseCase);
  const createPostUseCase = app.get(CreatePostUseCase);

  // Создаём пользователей (если их нет)
  const users: User[] = [];
  for (const userData of SEED_USERS) {
    users.push(await ensureUser(registerUseCase, userRepository, userData));
  }

  // Очищаем старые посты
  const { posts: existingPosts } = await postRepository.findPaginated(1, 200);
  for (const post of existingPosts) {
    await postRepository.delete(post.id);
  }
  if (existingPosts.length > 0) {
    console.log(`Удалено старых постов: ${existingPosts.length}`);
  }

  // Создаём посты
  for (const postData of SEED_POSTS) {
    const author = users[postData.userIndex];
    await createPostUseCase.execute({
      authorId: author.id,
      content: postData.content,
      imagePaths: postData.imagePaths,
    });
    console.log(`[${author.username}] Пост создан: "${postData.content.slice(0, 40)}..."`);
  }

  console.log(`\nСидинг завершён: ${users.length} пользователей, ${SEED_POSTS.length} постов.`);
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Ошибка при сидинге:', err);
  process.exit(1);
});
