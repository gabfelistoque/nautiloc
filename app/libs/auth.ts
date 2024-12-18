import { createHash } from 'crypto';

export async function hash(password: string): Promise<string> {
  // Usando o mesmo método que o NextAuth usa por padrão
  return createHash('sha256')
    .update(`${password}`)
    .digest('hex');
}
