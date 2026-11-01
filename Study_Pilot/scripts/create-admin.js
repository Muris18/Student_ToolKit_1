// Izveido administratora kontu vai padara esošu kontu par administratoru.
//   npm run create-admin -- e-pasts@domens.lv            (esošam kontam)
//   npm run create-admin -- e-pasts@domens.lv "Parole123" "Vārds"   (jaunam kontam)
// Serverī: docker compose exec app npm run create-admin -- e-pasts@domens.lv
const crypto = require('crypto');
const { connect } = require('./lib');

(async () => {
  const [email, password, firstName = 'Admin'] = process.argv.slice(2);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Lietošana: npm run create-admin -- e-pasts@domens.lv [parole] [vārds]');
    process.exit(1);
  }
  const e = email.trim().toLowerCase();
  const pool = await connect();
  const found = await pool.query('SELECT id FROM users WHERE email = $1', [e]);
  if (found.rowCount) {
    await pool.query("UPDATE users SET role = 'admin', blocked_at = NULL, email_verified_at = COALESCE(email_verified_at, now()) WHERE email = $1", [e]);
    console.log(`✔ ${e} tagad ir administrators.`);
  } else {
    if (!password || password.length < 8) {
      console.error('Šāda konta nav. Lai to izveidotu, norādi paroli (vismaz 8 simboli): npm run create-admin -- e-pasts parole');
      process.exit(1);
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const profile = { firstName, lastName: '', level: 'kurss', grade: 1, school: '', program: '' };
    const data = { subjects: [], tasks: [], exercises: [], quizzes: [], quizResults: [], chat: [], activity: [], examAttempts: [] };
    await pool.query(
      `INSERT INTO users (email, salt, pass_hash, role, profile, data, terms_accepted_at, email_verified_at)
       VALUES ($1,$2,$3,'admin',$4,$5, now(), now())`,
      [e, salt, hash, profile, data]
    );
    console.log(`✔ Izveidots administrators ${e}. Pieslēdzies un nomaini paroli profilā.`);
  }
  await pool.end();
})().catch((err) => { console.error(err.message); process.exit(1); });
