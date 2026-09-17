import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';

export async function authenticate(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}
