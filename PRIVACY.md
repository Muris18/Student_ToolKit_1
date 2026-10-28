# Privātuma politika un lietošanas noteikumi

- Privātuma politika: **[`Study_Pilot/content/privacy.md`](Study_Pilot/content/privacy.md)** — lietotnē lapa `/privacy`.
- Lietošanas noteikumi: **[`Study_Pilot/content/terms.md`](Study_Pilot/content/terms.md)** — lietotnē lapa `/terms`.

Labo tikai šos failus — tad GitHub un lietotnē būs viens un tas pats teksts. Pēc izmaiņām vajag jaunu build.

> Šis nav juridisks atzinums. Ja iespējams, palūdz skolotāju vai juristu abus dokumentus pārskatīt.

Ja kodā mainās vācamie dati vai ārējie servisi, atjauno arī politiku un tabulu [saknes README](README.md#kādus-datus-platforma-apstrādā).

## Pirms publicēšanas

Kamēr dokumentā ir vietas ar `[ ]`, lapa rāda brīdinājumu "Melnraksts".

- [ ] **Rakstiska vienošanās starp kopīgajiem pārziņiem** (Rodrigo Šaudiņš un Kristers Mortuzāns, VDAR 26. pants): kurš atbild uz lietotāju pieprasījumiem, kurš uztur serveri un rezerves kopijas, kurš ziņo par datu noplūdi. Pietiek ar īsu dokumentu, ko abi parakstāt. Politikā jau rakstīts, ka tāda vienošanās ir.
- [ ] Izveidot e-pastu jautajumi@studypilot.lv un pārliecināties, ka kāds to lasa.
- [ ] Pārbaudīt Hetzner servera atrašanās vietu (5. sadaļa).
- [ ] Serverī ieslēgt arī Hetzner Cloud rezerves kopijas (pēc izvēles, drošībai pret servera bojājumu).
- [ ] Ierakstīt spēkā stāšanās datumu abos dokumentos.
- [ ] Ja tiek pievienota e-pasta apstiprināšana vai paroles atjaunošana, ierakstīt e-pasta sūtīšanas pakalpojumu 5. sadaļā.
- [ ] Ja tiek pievienoti maksājumi (Premium), ierakstīt maksājumu pakalpojumu, kādi dati tam tiek nodoti un cik ilgi glabā rēķinus; papildināt lietošanas noteikumu 3. sadaļu (cena, atteikuma tiesības).
- [ ] Ja tiek pievienota analītika vai sīkdatnes, pievienot sīkdatņu paziņojumu.
- [ ] Ja tiek ieviesta konta bloķēšana vai AI ierobežošana administratoram, pārbaudīt, ka tā atbilst lietošanas noteikumu 8. sadaļai.

## Jau ieviests kodā

- [x] Lapas `/privacy` un `/terms` un saites uz tām (sākumlapa, reģistrācija, pieslēgšanās, lietotnes kājene).
- [x] Politikā: kopsavilkums "Īsumā", obligātie un neobligātie dati, IP adreses, automatizēti lēmumi, DeepSeek glabāšana un saite uz tā politiku, e-pasta maiņa, pieprasījumi no vecākiem.
- [x] Reģistrācijā obligātas atzīmes "Man ir vismaz 13 gadi" un "Piekrītu lietošanas noteikumiem un esmu izlasījis privātuma politiku"; apstiprinājuma laiks tiek saglabāts (`users.terms_accepted_at`).
- [x] Piekrišana pirms pirmā AI jautājuma; laiks tiek saglabāts (`users.ai_consent_at`), atsaukt var profilā. Bez piekrišanas `/api/ai/tutor` atbild ar 403.
- [x] "Lejupielādēt manus datus" profilā (`GET /api/me/export`, JSON).
- [x] Pārziņi: Rodrigo Šaudiņš un Kristers Mortuzāns (kopīgi pārziņi).
- [x] Automātiskas datubāzes rezerves kopijas reizi dienā, glabā 7 dienas (`backup` serviss `docker-compose.yml`); termiņš ierakstīts politikā.
- [x] Beigušās sesijas un 24 mēnešus neaktīvi konti tiek dzēsti automātiski (ne biežāk kā reizi 6 h; arī `npm run cleanup`). Administratoru kontus nedzēš.
