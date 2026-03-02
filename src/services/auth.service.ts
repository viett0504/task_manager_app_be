import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(email: string, password: string, fullName: string) {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already exists', 409, 'CONFLICT');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role: 'member',
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'AUTH_FAILED');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'AUTH_FAILED');
    }

    // Check if active
    if (!user.is_active) {
      throw new AppError('Account is inactive', 403, 'FORBIDDEN');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      ...tokens,
    };
  }

  private generateTokens(user: User) {
    const accessToken = (jwt.sign as any)(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = (jwt.sign as any)(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
