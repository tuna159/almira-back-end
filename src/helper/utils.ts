import * as bcrypt from 'bcrypt';

export async function handleBCRYPTHash(text: string) {
  const saltOrRounds = await bcrypt.genSalt();
  return await bcrypt.hash(text, saltOrRounds);
}

export async function handleBCRYPTCompare(text: string, hash: string) {
  return await bcrypt.compare(text, hash);
}
