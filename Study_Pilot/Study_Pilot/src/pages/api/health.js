import { db } from '../../server/db';

// Servera "palaišanas ID" — mainās pie katra restarta, tā klients zina, ka dati ir notīrīti
export default function handler(req, res) {
  res.status(200).json({ ok: true, bootId: db.bootId, startedAt: db.startedAt, users: db.users.size });
}
