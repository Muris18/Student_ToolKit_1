// Dzēš beigušās sesijas un kontus, kas nav lietoti 24 mēnešus (administratorus nedzēš).
// Lietotne to dara arī pati (ne biežāk kā reizi 6 h). Šo var palaist manuāli vai no cron:
//   npm run cleanup
//   docker compose exec app npm run cleanup
// Termiņam jāsakrīt ar INACTIVE_MONTHS src/server/db.js un content/privacy.md.
const { connect } = require('./lib');

const INACTIVE_MONTHS = 24;

(async () => {
  const pool = await connect();
  const s = await pool.query('DELETE FROM sessions WHERE expires_at < now()');
  const u = await pool.query(
    "DELETE FROM users WHERE role <> 'admin' AND last_active < now() - make_interval(months => $1)",
    [INACTIVE_MONTHS]
  );
  console.log(`Izdzēstas sesijas: ${s.rowCount}, neaktīvi konti: ${u.rowCount}`);
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
