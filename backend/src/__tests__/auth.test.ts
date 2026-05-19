import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../app.js';

vi.mock('../models/User.js', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

import { User } from '../models/User.js';

const app = createApp();
const mockUser = {
  _id: { toString: () => 'user123' },
  email: 'test@example.com',
  passwordHash: '',
  name: 'Test User',
};

describe('Auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    vi.mocked(User.create).mockResolvedValue(mockUser as never);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@example.com', password: 'secret12', name: 'New User' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('logs in with valid credentials', async () => {
    const hash = await bcrypt.hash('secret12', 10);
    vi.mocked(User.findOne).mockResolvedValue({ ...mockUser, passwordHash: hash } as never);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'secret12' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects invalid login', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });
});
