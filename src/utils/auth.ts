import bcrypt from 'bcrypt';

export const encryptPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const parseJwtExpires = (exp: string) => {
  const unit = exp.slice(-1);
  const value = parseInt(exp.slice(0, -1));
  switch (unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value * 1000;
  }
}