# Pārbaude pirms beta palaišanas

Izmanto pirms publiskas palaišanas (datums nav noteikts; beta pagaidām nav pieejama nevienam, sk. `PLANS_SERVERIS_UN_DOMENS.md`). Lokālo pārbaudi var veikt jebkurā laikā, serverī pēc uzstādīšanas. Atzīmē `[x]`, kad pārbaudīts. Pamats: 20 punktu atbilstības saraksts + mūsu projekta īpatnības.
Šis nav juridisks padoms; pirms publiskas palaišanas tekstus jāizskata Rodrigo vai juristam.

## A. Juridiskie dokumenti (kods: `content/privacy.md`, `content/terms.md`)
- [ ] Privātuma politika atbilst realitātei (datu saraksts, DeepSeek, Stripe, Resend/Brevo, Hetzner)
- [ ] Noteikumi: AI vērtēšana atvērtajiem uzdevumiem (Rodrigo)
- [ ] Noteikumi: tokenu limits (bezmaksas 200k / Premium 1M) un "bezmaksas plānā līdz 3 saviem testiem" (Rodrigo)
- [ ] **Pārziņa dati: nosaukums, reģistrācijas numurs, juridiskā adrese, kontakti** (patlaban ir tikai jautajumi@studypilot.lv)
- [ ] Atteikuma tiesības un atmaksa (`terms.md`, 14 dienu punkts) atbilst Stripe iestatījumiem
- [ ] Abonementa automātiskā atjaunošana un atcelšana ir skaidri redzama Premium lapā
- [ ] Datu pārkāpuma rīcības plāns (kam un cik ātri ziņot; 72 h uzraugam)

## B. Sīkdatnes un trešās puses
- [ ] Tikai `sp_session` (nepieciešamā); nav analītikas, reklāmu un izsekošanas (pārbaudīt DevTools → Application → Cookies)
- [ ] Fonti tiek piegādāti no mūsu servera (DevTools → Network nav `fonts.googleapis.com`)
- [ ] Ārējie izsaukumi tikai: DeepSeek (ar piekrišanu), Stripe, e-pasta pakalpojums
- [ ] Datu apstrādes līgumi/noteikumi: DeepSeek, e-pasta pakalpojums, Hetzner

## C. Piekrišanas un dati
- [ ] Reģistrācija bez atzīmēm (13+, noteikumi) nenotiek
- [ ] AI jautājums bez AI piekrišanas netiek sūtīts uz DeepSeek
- [ ] "Lejupielādēt manus datus" (profils) atdod pilnu failu
- [ ] "Dzēst kontu" izdzēš kontu un atceļ abonementu
- [ ] Neaktīvo kontu tīrīšana (`npm run cleanup`) darbojas; 24 mēnešu noteikums sakrīt ar politiku
- [ ] Reģistrācijā un formās netiek prasīts nekas lieks

## D. E-pasti
- [ ] Apstiprināšana un paroles atjaunošana atnāk (ne mēstulēs), SPF/DKIM zaļi
- [ ] Teksts formāls ("Jūs"), fons seko tēmai
- [ ] Tikai darījuma e-pasti, tāpēc atrakstīšanās saite nav vajadzīga; ja pievienosim jaunumus, tā būs obligāta

## E. Saturs un apgalvojumi (Landing, Premium lapa, BUJ)
- [ ] Nav viltotu atsauksmju vai neizdomātu skaitļu (pārbaudīts 17.11.: nav)
- [ ] "VIAA eksāmeni 2023–2026", "9. un 12. klase", "100% latviski" atbilst datiem (36 faili; 9. kl. 2023–2026, 12. kl. 2024–2026)
- [ ] Premium apraksti atbilst `src/lib/plans.js` (labots 17.11.)
- [ ] Cena parādās vai ir "tiks paziņota drīzumā"; nav slēptu maksu
- [ ] Neizmantojam bildes/fontus bez licences (fonti: atvērtas licences; pārbaudīt, vai nav pievienotu svešu attēlu)

## F. Pieejamība
- [ ] Tastatūras navigācija: Tab cauri Landing, Login, Dashboard, Eksāmeni; redzams fokuss
- [ ] Krāsu kontrasts abās tēmās (gaišā un tumšā); rīks: DevTools → Lighthouse → Accessibility
- [ ] Ikonas ar nozīmi ir ar `aria-label`; dekoratīvās ar `aria-hidden`
- [ ] Modālie logi aizveras ar Esc, fokuss neizkrīt ārā

## G. Funkcijas (visa lietotne)
- [ ] Reģistrācija, ielogošanās, izlogošanās, paroles atjaunošana
- [ ] Pārbaudes darbu materiāli (AI) un testi no kļūdām
- [ ] Eksāmeni: treniņš, simulācija, atbilžu pārbaude, AI vērtēšana atvērtajiem
- [ ] AI skolotājs; limita josla rāda % un atjaunošanās laiku
- [ ] Tēmu karte un progress
- [ ] Planotājs, termiņu radars, fokusa režīms
- [ ] Mācību istabas: izveide, pievienošanās ar kodu, taimeris, kārtu beigas, pārskats
- [ ] Premium: pirkums (Stripe test), atcelšana, atgriešanās bezmaksas plānā
- [ ] Telefons (šaurs ekrāns) un tumšā tēma

## H. Drošība un uzturēšana
- [ ] `.env` serverī: `DEEPSEEK_API_KEY`, e-pasta atslēga, Stripe, `AI_DAILY_LIMIT_GLOBAL`, `AI_TOKEN_LIMIT_*`, `COOKIE_SECURE` nav izslēgts
- [ ] HTTPS (Caddy) strādā, sīkdatne ir `Secure`
- [ ] SSH atslēga pirms `server-setup.sh`; parole serverī atspējota
- [ ] Rezerves kopija (`scripts/backup.sh`) un **atjaunošana no tās izmēģināta**
- [ ] `npm test` zaļš, `npm run build` zaļš, CI zaļš
- [ ] Vecais Bearer atbalsts un `examAttempts` blobs: tīrīt ~30 dienas pēc palaišanas
