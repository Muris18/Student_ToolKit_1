# Privātuma politika

Pati politika atrodas failā **[`Study_Pilot/content/privacy.md`](Study_Pilot/content/privacy.md)**. Lietotne to rāda lapā `/privacy`, tāpēc labo tikai to failu — tad GitHub un lietotnē būs viens un tas pats teksts.

> Šis nav juridisks atzinums. Ja iespējams, palūdz skolotāju vai juristu politiku pārskatīt.

Ja kodā mainās vācamie dati vai ārējie servisi, atjauno arī politiku un tabulu [saknes README](README.md#kādus-datus-platforma-apstrādā).

## Pirms publicēšanas

Kamēr politikā ir vietas ar `[ ]`, lapa `/privacy` rāda brīdinājumu "Melnraksts".

- [ ] Ierakstīt Rodrigo uzvārdu (1. sadaļa) — pārzinim jābūt identificējamam.
- [ ] Izveidot e-pastu jautajumi@studypilot.lv un pārliecināties, ka kāds to lasa.
- [ ] Pārbaudīt Hetzner servera atrašanās vietu (5. sadaļa).
- [ ] Iestatīt datubāzes rezerves kopijas un ierakstīt to glabāšanas termiņu (6. sadaļa).
- [ ] Ierakstīt spēkā stāšanās datumu.
- [ ] Ja tiek pievienota e-pasta apstiprināšana vai paroles atjaunošana, ierakstīt e-pasta sūtīšanas pakalpojumu 5. sadaļā.
- [ ] Ja tiek pievienoti maksājumi (Premium), ierakstīt maksājumu pakalpojumu un kādi dati tam tiek nodoti.

## Jau ieviests kodā

- [x] Lapa `/privacy` un saites uz to (sākumlapa, reģistrācija, pieslēgšanās, lietotnes kājene).
- [x] Reģistrācijā obligātas atzīmes "Man ir vismaz 13 gadi" un "Esmu izlasījis privātuma politiku"; apstiprinājuma laiks tiek saglabāts (`users.terms_accepted_at`).
- [x] Piekrišana pirms pirmā AI jautājuma; laiks tiek saglabāts (`users.ai_consent_at`), atsaukt var profilā. Bez piekrišanas `/api/ai/tutor` atbild ar 403.
- [x] "Lejupielādēt manus datus" profilā (`GET /api/me/export`, JSON).
- [x] Beigušās sesijas un 24 mēnešus neaktīvi konti tiek dzēsti automātiski (ne biežāk kā reizi 6 h; arī `npm run cleanup`). Administratoru kontus nedzēš.
