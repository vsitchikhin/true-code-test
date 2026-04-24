import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';
import { RegisterUserDto } from '@presentation/dtos/register-user.dto';

import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByPhoneNumber: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should register a user successfully when all fields are unique and names are provided', async () => {
    const dto: RegisterUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      phoneNumber: '+79991112233',
      firstName: 'Иван',
      lastName: 'Иванов',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByPhoneNumber.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed_password');
    userRepository.save.mockImplementation((user) => Promise.resolve(user));

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(User);
    expect(result.email).toBe(dto.email);
    expect(result.username).toBe(dto.username);
    expect(result.firstName).toBe(dto.firstName);
    expect(result.lastName).toBe(dto.lastName);
    expect(result.passwordHash).toBe('hashed_password');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('should throw error when email already exists', async () => {
    const dto: RegisterUserDto = {
      email: 'existing@example.com',
      username: 'testuser',
      password: 'password123',
      phoneNumber: '+79991112233',
    };

    userRepository.findByEmail.mockResolvedValue({} as User);

    await expect(useCase.execute(dto)).rejects.toThrow('Пользователь с таким email уже существует');
  });

  it('should throw error when username already exists', async () => {
    const dto: RegisterUserDto = {
      email: 'test@example.com',
      username: 'existinguser',
      password: 'password123',
      phoneNumber: '+79991112233',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue({} as User);

    await expect(useCase.execute(dto)).rejects.toThrow(
      'Пользователь с таким именем пользователя уже существует',
    );
  });

  it('should throw error when phone number already exists', async () => {
    const dto: RegisterUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      phoneNumber: '+79991112233',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByPhoneNumber.mockResolvedValue({} as User);

    await expect(useCase.execute(dto)).rejects.toThrow(
      'Пользователь с таким номером телефона уже существует',
    );
  });
});
