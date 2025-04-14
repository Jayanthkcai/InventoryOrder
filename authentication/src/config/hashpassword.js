import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const saltRounds = 10; // Number of hashing rounds
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};