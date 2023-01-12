import * as bcrypt from 'bcrypt';

export async function handleBCRYPTHash(text: string) {
  const saltOrRounds = await bcrypt.genSalt();
  return await bcrypt.hash(text, saltOrRounds);
}
