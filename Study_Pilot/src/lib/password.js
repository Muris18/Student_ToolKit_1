// Paroles: hash, pārbaude un prasības. Tīras funkcijas bez datubāzes, lai tās varētu testēt.
// Hash formāts (NEDRĪKST mainīties, citādi esošie lietotāji nevarēs pieslēgties): salt (16 baiti, hex) un
// scrypt(parole, salt, 64 baiti) hex virknē. Sāls tiek padots kā teksts (hex virkne), tāpat kā iepriekš ar scryptSync.
import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

export const newSalt = () => crypto.randomBytes(16).toString('hex');

// Asinhrons: scrypt darbojas libuv pavedienu kopā, tāpēc ar katru pieslēgšanos (~0,1 s) netiek bloķēts viss Node process
export async function hashPassword(password, salt) {
  return (await scrypt(String(password ?? ''), salt, 64)).toString('hex');
}

// user: { salt, passHash }
export async function checkPassword(user, password) {
  const a = Buffer.from(await hashPassword(password, user.salt), 'hex');
  const b = Buffer.from(user.passHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Fiktīvs salīdzinājums konstanta laika pieslēgšanās atbildei: ja lietotājs nav atrasts, tik un tā izpilda to pašu
// darbu, lai atbildes laiks neatklātu, kuri e-pasti ir reģistrēti. Vienmēr atgriež false.
const DUMMY_SALT = '00000000000000000000000000000000';
const DUMMY_HASH = Buffer.alloc(64);
export async function dummyPasswordCheck(password) {
  const a = Buffer.from(await hashPassword(password, DUMMY_SALT), 'hex');
  crypto.timingSafeEqual(a, DUMMY_HASH);
  return false;
}

// Paroles prasības: 8–200 simboli, ne tikai cipari, nav tāda pati kā e-pasts
export function passwordProblem(password, email = '') {
  const p = String(password || '');
  if (p.length < 8) return 'Parolei jābūt vismaz 8 simbolus garai';
  if (p.length > 200) return 'Parole ir pārāk gara';
  if (/^\d+$/.test(p)) return 'Parolē jābūt ne tikai cipariem';
  if (email && p.toLowerCase() === String(email).toLowerCase()) return 'Parole nedrīkst būt tāda pati kā e-pasts';
  if (['password', 'parole123', '12345678', 'qwertyui', 'studypilot'].includes(p.toLowerCase())) return 'Šī parole ir pārāk vienkārša';
  return null;
}
