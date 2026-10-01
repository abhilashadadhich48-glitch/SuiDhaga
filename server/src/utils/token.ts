import jwt from 'jsonwebtoken';

export const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'tailorconnect_secret_key';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d',
  });
};
