# Student Toolkit / Study Pilot

## Satura rādītājs

1. [Projekta apraksts](#projekta-apraksts)
2. [Projekta mērķis](#projekta-mērķis)
3. [MVP — pirmā strādājošā versija](#mvp--pirmā-strādājošā-versija)
4. [Pašreizējais projekta stāvoklis](#pašreizējais-projekta-stāvoklis)
5. [Izmantotās tehnoloģijas](#izmantotās-tehnoloģijas)
6. [Izstrādes ceļa karte](#izstrādes-ceļa-karte)
7. [Komandas pienākumi](#komandas-pienākumi)
8. [Datu bāzes struktūra](#datu-bāzes-struktūra)
9. [GitHub darba organizācija](#github-darba-organizācija)
10. [Drošība](#drošība)
11. [Projekta gatavības kritēriji](#projekta-gatavības-kritēriji)
12. [Noderīga dokumentācija](#noderīga-dokumentācija)

---

## Projekta apraksts

**Student Toolkit** jeb **Study Pilot** ir digitāls mācību palīgrīks, kas palīdz skolēniem un studentiem organizēt mācību procesu, gatavoties pārbaudījumiem un efektīvāk apgūt mācību vielu.

Platformas galvenais mērķis ir apvienot vairākus studentiem noderīgus rīkus vienā vietā, lai samazinātu laiku, kas tiek patērēts mācību materiālu meklēšanai un mācību plānošanai.

Projektā paredzēts izmantot mākslīgo intelektu, lai sniegtu uzdevumu skaidrojumus un palīdzētu lietotājiem saprast ne tikai pareizo atbildi, bet arī tās iegūšanas procesu.

### Galvenās funkcijas

- Mācību uzdevumu un pārbaudījumu risināšana.
- Atbilžu pārbaude un rezultātu attēlošana.
- Mākslīgā intelekta sniegti uzdevumu skaidrojumi.
- Mācību uzdevumu un eksāmenu plānotājs.
- Lietotāja progresa saglabāšana.
- Administratora iespējas pārvaldīt mācību saturu.

---

## Projekta mērķis

Izveidot vienkāršu, modernu un drošu platformu, kas palīdz studentiem mācīties efektīvāk un patstāvīgi sagatavoties pārbaudījumiem.

Projekta izstrādes laikā prioritāte ir izveidot stabilu pamata versiju, kuru var izmantot reāli skolēni. Papildu funkcijas tiks pievienotas pēc tam, kad galvenās funkcijas darbosies uzticami.

### Galvenie principi

1. Vienkāršs un saprotams lietotāja interfeiss.
2. Funkcijas, kas atrisina reālas studentu problēmas.
3. Mākslīgā intelekta izmantošana mācību procesa uzlabošanai.
4. Droša lietotāju datu un API atslēgu apstrāde.
5. Mobilajām ierīcēm piemērots dizains.
6. Pakāpeniska izstrāde un regulāra testēšana.

---

## MVP — pirmā strādājošā versija

MVP (*Minimum Viable Product*) ir projekta pirmā versija ar galvenajām funkcijām, kas ir pietiekama, lai to izmēģinātu reāli lietotāji.

### MVP obligātās funkcijas

- [ ] Galvenās lapas un navigācijas darbība.
- [ ] Mācību priekšmetu un uzdevumu attēlošana.
- [ ] Iespēja atvērt un izpildīt uzdevumu.
- [ ] Iespēja iesniegt atbildi.
- [ ] Pareizas un nepareizas atbildes noteikšana.
- [ ] Mākslīgā intelekta skaidrojums par uzdevumu.
- [ ] Lietotāja progresa saglabāšana datu bāzē.
- [ ] Mācību plānotājs.
- [ ] Lietotāja autentifikācija un autorizācija.
- [ ] Pielāgošanās datoru un mobilo ierīču ekrāniem.
- [ ] Pamata drošības pārbaudes.
- [ ] Darbojošās versijas izvietošana serverī.

### Funkcijas, kuras var pievienot vēlāk

- [ ] Maksas abonementi ar Stripe.
- [ ] Papildu mācību priekšmeti un uzdevumu kategorijas.
- [ ] Detalizēta progresa statistika.
- [ ] Personalizēti mācību ieteikumi.
- [ ] Papildu administratora rīki.
- [ ] Lietotāju atsauksmju sistēma.

**Svarīgi:** vispirms jāpabeidz un jāpārbauda pamata funkcijas. Maksājumu sistēmu un citas sarežģītākas funkcijas nevajadzētu ieviest, kamēr nav pārliecības, ka produkta pamata versija darbojas.

---

## Pašreizējais projekta stāvoklis

Projekts tiek izstrādāts, izmantojot tīmekļa tehnoloģijas. Daļa funkciju sākotnējā versijā var būt tikai prototipi vai izmantot testa datus.

Pirms jaunu funkciju pievienošanas jāpārbauda esošais kods un jānoskaidro, kuras funkcijas jau darbojas pilnvērtīgi.

### Sākotnējās pārbaudes uzdevumi

- [ ] Pārbaudīt, vai projekts tiek palaists bez kļūdām.
- [ ] Pārbaudīt visas lapas un navigācijas elementus.
- [ ] Pārbaudīt, vai uzdevumi tiek ielādēti no reāla datu avota.
- [ ] Pārbaudīt, vai atbilžu pārbaude darbojas pareizi.
- [ ] Pārbaudīt, vai AI funkcija izmanto reālu API.
- [ ] Pārbaudīt, vai lietotāja dati tiek saglabāti pēc lapas pārlādes.
- [ ] Pārbaudīt, vai autentifikācija jau ir ieviesta.
- [ ] Pārbaudīt, vai administratora funkcijas ir aizsargātas.
- [ ] Pārbaudīt, vai projektā nav ievietotas slepenas API atslēgas.

Pārbaudes rezultāti jāieraksta GitHub Issues vai projekta uzdevumu sarakstā.

---

## Izmantotās tehnoloģijas

| Tehnoloģija | Paredzētais lietojums |
|---|---|
| Next.js | Tīmekļa lietotnes izstrāde |
| React | Lietotāja saskarnes komponenti |
| Tailwind CSS | Lapas dizains un izkārtojums |
| PostgreSQL | Lietotāju, uzdevumu un progresa datu glabāšana |
| Docker | Lietotnes un datu bāzes palaišana izolētā vidē |
| DeepSeek API | Mākslīgā intelekta funkcijas |
| Hetzner Cloud | Serveris lietotnes izvietošanai |
| Stripe | Maksājumu un abonementu apstrāde, ja tā būs nepieciešama |
| GitHub | Koda glabāšana un komandas sadarbība |

Tehnoloģiju saraksts ir plānotā arhitektūra. Pirms katras tehnoloģijas ieviešanas jāpārbauda, vai tā jau ir konfigurēta projektā.

**Piezīme:** Docker nav datu bāze. Tas ir rīks lietotņu un pakalpojumu palaišanai konteineros. PostgreSQL ir paredzēts datu glabāšanai.

---

## Izstrādes ceļa karte

Plānotais izstrādes ilgums ir 16 nedēļas. Tā kā katrs komandas dalībnieks projektam var veltīt aptuveni 1–5 stundas nedēļā, uzdevumu izpildes laiks jāpielāgo faktiskajam progresam.

### 1. posms — projekta pārbaude un plānošana (1. nedēļa)

**Mērķis:** noskaidrot pašreizējo projekta stāvokli un vienoties par nākamajiem soļiem.

- [ ] Lejupielādēt vai klonēt jaunāko projekta versiju.
- [ ] Palaist projektu lokālajā datorā.
- [ ] Pārbaudīt visas esošās lapas.
- [ ] Izveidot sarakstu ar darbojošām un nedarbojošām funkcijām.
- [ ] Vienoties par projekta nosaukumu — Student Toolkit vai Study Pilot.
- [ ] Izveidot GitHub Projects uzdevumu sarakstu.
- [ ] Sadalīt uzdevumus starp četriem komandas dalībniekiem.

**Rezultāts:** skaidrs uzdevumu saraksts un saprotams projekta pašreizējais stāvoklis.

### 2. posms — datu bāze un servera loģika (2.–3. nedēļa)

**Mērķis:** sagatavot pamatu datu glabāšanai un izgūšanai.

- [ ] Izveidot PostgreSQL datu bāzi izstrādes videi.
- [ ] Izveidot datu bāzes savienojuma konfigurāciju.
- [ ] Izveidot sākotnējo datu bāzes shēmu.
- [ ] Izveidot API maršrutus nepieciešamo datu iegūšanai.
- [ ] Pievienot uzdevumu iegūšanu no datu bāzes.
- [ ] Aizvietot statiskos testa datus ar datiem no datu bāzes.
- [ ] Pārbaudīt kļūdu apstrādi un datu validāciju.

**Rezultāts:** lietotne var iegūt un saglabāt datus datu bāzē.

### 3. posms — mācību uzdevumu sistēma (4.–5. nedēļa)

**Mērķis:** izveidot pilnvērtīgu uzdevumu izpildes procesu.

- [ ] Izveidot mācību priekšmetu sarakstu.
- [ ] Izveidot uzdevumu sarakstu katram priekšmetam.
- [ ] Nodrošināt iespēju atvērt atsevišķu uzdevumu.
- [ ] Izveidot atbildes iesniegšanas funkciju.
- [ ] Izveidot atbilžu pārbaudes loģiku.
- [ ] Attēlot rezultātu un pareizo atbildi.
- [ ] Pārbaudīt dažādus atbilžu ievades variantus.
- [ ] Pārbaudīt funkcionalitāti mobilajās ierīcēs.

**Rezultāts:** lietotājs var izpildīt uzdevumu un saņemt rezultātu.

### 4. posms — mākslīgā intelekta integrācija (6.–7. nedēļa)

**Mērķis:** pievienot reālu AI funkcionalitāti.

- [ ] Izveidot servera puses API maršrutu DeepSeek API pieprasījumiem.
- [ ] Konfigurēt API atslēgu servera vides mainīgajos.
- [ ] Izveidot pieprasījumu, kas nosūta AI uzdevuma tekstu un lietotāja atbildi.
- [ ] Saņemt un parādīt AI skaidrojumu.
- [ ] Nodrošināt lietotājam saprotamu kļūdu paziņojumu, ja AI nav pieejams.
- [ ] Ierobežot pieprasījumu skaitu vienam lietotājam.
- [ ] Sekot līdzi API izmaksām.
- [ ] Pārbaudīt vismaz 20–30 dažādus uzdevumus.

**Rezultāts:** AI sniedz jēgpilnus uzdevumu skaidrojumus, un tā izmantošana tiek kontrolēta.

### 5. posms — lietotāju konti (8.–9. nedēļa)

**Mērķis:** nodrošināt individuālu lietotāju pieredzi.

- [ ] Izvēlēties autentifikācijas risinājumu.
- [ ] Izveidot reģistrācijas un pieteikšanās procesu.
- [ ] Nodrošināt drošu paroļu apstrādi, ja tiek izmantotas paroles.
- [ ] Saistīt lietotāja datus ar konkrēto kontu.
- [ ] Saglabāt lietotāja uzdevumu rezultātus.
- [ ] Nodrošināt piekļuves kontroli privātajiem datiem.
- [ ] Pārbaudīt pieteikšanos, atteikšanos un kļūdu gadījumus.

**Rezultāts:** katram lietotājam ir savs konts un individuāli saglabāti rezultāti.

### 6. posms — plānotājs un administratora funkcijas (10.–11. nedēļa)

**Mērķis:** nodrošināt mācību plānošanu un satura pārvaldību.

- [ ] Saglabāt plānotāja ierakstus datu bāzē.
- [ ] Nodrošināt iespēju pievienot un rediģēt plānotos uzdevumus.
- [ ] Nodrošināt iespēju dzēst plānotāja ierakstus.
- [ ] Pievienot lietotāja progresa pārskatu.
- [ ] Izveidot administratora lomu.
- [ ] Nodrošināt, ka administratora darbībām ir nepieciešamās atļaujas.
- [ ] Pievienot mācību satura validāciju.
- [ ] Pārbaudīt, ka parasts lietotājs nevar piekļūt administratora funkcijām.

**Rezultāts:** plānotājs saglabā datus, un administratora funkcijas ir aizsargātas.

### 7. posms — izvietošana un papildu funkcijas (12.–13. nedēļa)

**Mērķis:** sagatavot lietotni darbībai serverī.

- [ ] Izveidot Docker konfigurāciju.
- [ ] Sagatavot atsevišķu konfigurāciju izstrādes un produkcijas videi.
- [ ] Izvietot lietotni Hetzner Cloud serverī.
- [ ] Konfigurēt domēnu un HTTPS.
- [ ] Nodrošināt datu bāzes piekļuves aizsardzību.
- [ ] Izveidot datu rezerves kopiju veidošanas procesu.
- [ ] Pārbaudīt, vai lietotni var atjaunot pēc kļūmes.
- [ ] Ja pamata versija ir stabila, izmēģināt Stripe testrežīmu.
- [ ] Ja tiek izmantots Stripe, pārbaudīt maksājumu notikumu apstrādi servera pusē.

**Rezultāts:** lietotne ir pieejama testēšanai serverī un ir sagatavota drošai uzturēšanai.

### 8. posms — testēšana un projekta pabeigšana (14.–16. nedēļa)

**Mērķis:** sagatavot stabilu demonstrācijas versiju.

- [ ] Piesaistīt 5–10 studentus beta testēšanai.
- [ ] Savākt lietotāju atsauksmes.
- [ ] Novērst kritiskās kļūdas.
- [ ] Pārbaudīt darbību dažādās pārlūkprogrammās un ekrāna izmēros.
- [ ] Pārbaudīt autentifikāciju un piekļuves tiesības.
- [ ] Pārbaudīt AI pieprasījumu ierobežojumus.
- [ ] Pārskatīt privātuma un datu glabāšanas principus.
- [ ] Pārbaudīt, vai izmantotajiem mācību materiāliem ir atbilstošas izmantošanas tiesības.
- [ ] Sagatavot projekta dokumentāciju.
- [ ] Sagatavot demonstrāciju un projekta prezentāciju.
- [ ] Atjaunināt README ar faktiski ieviestajām funkcijām.

**Rezultāts:** darbojošs prototips, kuru var demonstrēt un izmēģināt reāli lietotāji.

---

## Komandas pienākumi

Projektā piedalās četri komandas dalībnieki. Pienākumus var mainīt atkarībā no komandas prasmēm un pieejamā laika.

### 1. Projekta vadītājs

- Uztur projekta plānu.
- Seko līdzi termiņiem.
- Sadalа uzdevumus.
- Organizē komandas saziņu.
- Pārbauda, vai uzdevumi atbilst projekta mērķim.
- Sagatavo dokumentāciju un prezentāciju.

### 2. Frontend izstrādātājs

- Izstrādā lapu dizainu.
- Veido React komponentus.
- Nodrošina navigācijas darbību.
- Pievieno formas un lietotāja saskarnes elementus.
- Pārbauda mobilās versijas darbību.
- Savieno lietotāja saskarni ar API.

### 3. Backend un AI izstrādātājs

- Izstrādā API maršrutus.
- Konfigurē datu bāzes savienojumu.
- Izstrādā datu saglabāšanas un izgūšanas loģiku.
- Integrē DeepSeek API.
- Nodrošina servera puses validāciju.
- Kontrolē AI pieprasījumu skaitu un izmaksas.

### 4. Testēšanas un drošības atbildīgais

- Pārbauda jauno funkciju darbību.
- Atrod un reģistrē kļūdas.
- Pārbauda piekļuves tiesības.
- Pārbauda, vai slepenie dati netiek publicēti.
- Pārbauda dažādus ievades variantus.
- Apkopo beta testētāju atsauksmes.

**Svarīgi:** katram uzdevumam jābūt vienam atbildīgajam, bet citi komandas dalībnieki var palīdzēt un pārskatīt paveikto.

---

## Datu bāzes struktūra

Sākotnēji paredzēts izmantot PostgreSQL datu bāzi.

Šī ir sākotnējā struktūra. Precīzi lauki un attiecības jānosaka izstrādes laikā atbilstoši lietotnes vajadzībām.

| Tabula | Paredzētais saturs |
|---|---|
| `users` | Lietotāju konti un profila dati |
| `subjects` | Mācību priekšmeti |
| `exams` | Pārbaudījumi un eksāmeni |
| `tasks` | Mācību uzdevumi un atbilžu konfigurācija |
| `attempts` | Lietotāju atbildes un rezultāti |
| `planner_items` | Lietotāju plānotie mācību uzdevumi |
| `subscriptions` | Abonementu dati, ja tiek ieviesta maksas sistēma |

### Datu bāzes pamatprincipi

- Katram ierakstam jābūt unikālam identifikatoram.
- Lietotāja rezultātiem jābūt saistītiem ar konkrētu lietotāju.
- Jāizmanto ārējās atslēgas, kur tās ir nepieciešamas.
- Jāvalidē dati pirms to saglabāšanas.
- Paroles nedrīkst glabāt atklātā tekstā.
- Datu bāzei nevajadzētu būt publiski pieejamai internetā.
- Jāparedz datu rezerves kopiju veidošana un atjaunošanas pārbaude.

---

## GitHub darba organizācija

Lai komanda varētu strādāt kopā, jāizmanto GitHub Issues, branches un Pull Requests.

### Darba process

1. Izveidot GitHub Issue ar uzdevuma aprakstu.
2. Norādīt atbildīgo komandas dalībnieku.
3. Izveidot atsevišķu zaru (*branch*) konkrētajai funkcijai.
4. Veikt izmaiņas un pārbaudīt tās lokāli.
5. Izveidot Pull Request.
6. Pārskatīt izmaiņas un novērst atrastās problēmas.
7. Apvienot izmaiņas `main` zarā pēc pārbaudes.

### Ieteicamie uzdevumu statusi

- `Backlog` — uzdevumi, kas vēl nav sākti.
- `To Do` — uzdevumi, kurus paredzēts sākt.
- `In Progress` — uzdevumi, pie kuriem pašlaik strādā.
- `In Review` — uzdevumi, kurus pārbauda.
- `Done` — pabeigti un pārbaudīti uzdevumi.

### Uzdevuma pieņemšanas kritēriji

Katram uzdevumam jābūt skaidram rezultātam. Piemēram, uzdevumam “Saglabāt mācību rezultātus” pieņemšanas kritēriji var būt:

- Rezultāts tiek saglabāts datu bāzē.
- Pēc lapas pārlādes rezultāts nepazūd.
- Rezultātam var piekļūt tikai atbilstošais lietotājs.
- Kļūdas gadījumā lietotājs saņem saprotamu paziņojumu.
- Funkcija ir pārbaudīta ar vairākiem testa gadījumiem.

**Svarīgi:** nekad neievietot GitHub repozitorijā `.env` failus, API atslēgas, paroles vai citus slepenus datus.

---

## Drošība

Drošība ir svarīga arī prototipa izstrādes laikā.

### Drošības kontrolsaraksts

- [ ] API atslēgas tiek glabātas servera vides mainīgajos.
- [ ] Slepenie dati nav ievietoti frontend kodā.
- [ ] `.env` faili ir iekļauti `.gitignore`.
- [ ] Lietotāju dati ir aizsargāti ar autentifikāciju un autorizāciju.
- [ ] Serveris pārbauda piekļuves tiesības katram aizsargātajam resursam.
- [ ] Lietotāja ievadītie dati tiek validēti.
- [ ] AI API pieprasījumiem ir noteikti izmantošanas ierobežojumi.
- [ ] Tiek kontrolētas AI API izmaksas.
- [ ] Produkcijas vide izmanto HTTPS.
- [ ] Datu bāzes piekļuve ir ierobežota.
- [ ] Tiek veidotas datu rezerves kopijas.
- [ ] Tiek pārbaudīta rezerves kopiju atjaunošana.
- [ ] Tiek pārskatīta kļūdu apstrāde, lai lietotājiem netiktu parādīta sensitīva tehniskā informācija.
- [ ] Tiek ievēroti lietotāju privātuma un datu glabāšanas principi.

---

## Projekta gatavības kritēriji

Projekts tiek uzskatīts par gatavu demonstrācijai, kad galvenās funkcijas darbojas stabili un ir pārbaudītas.

| Kritērijs | Gatavības nosacījums |
|---|---|
| Lietotāja saskarne | Galvenās lapas un navigācija darbojas |
| Uzdevumi | Lietotājs var atvērt un izpildīt uzdevumu |
| Atbilžu pārbaude | Rezultāts tiek noteikts un parādīts pareizi |
| AI skaidrojumi | Lietotājs var saņemt uzdevuma skaidrojumu |
| Datu glabāšana | Svarīgie dati saglabājas pēc lapas pārlādes |
| Lietotāju konti | Lietotāju dati ir nodalīti un aizsargāti |
| Plānotājs | Plānotie ieraksti tiek saglabāti |
| Drošība | Slepenie dati nav publiski pieejami |
| Mobilā versija | Galvenās funkcijas darbojas mobilajās ierīcēs |
| Izvietošana | Lietotne ir pieejama testēšanas vidē |
| Dokumentācija | Ir aprakstīta palaišana un galvenās funkcijas |

---

## Noderīga dokumentācija

- [Next.js dokumentācija](https://nextjs.org/docs)
- [React dokumentācija](https://react.dev/)
- [Tailwind CSS dokumentācija](https://tailwindcss.com/docs)
- [PostgreSQL dokumentācija](https://www.postgresql.org/docs/)
- [Docker dokumentācija](https://docs.docker.com/)
- [DeepSeek API dokumentācija](https://api-docs.deepseek.com/)
- [Stripe Checkout dokumentācija](https://docs.stripe.com/checkout/quickstart)
- [Stripe Webhooks dokumentācija](https://docs.stripe.com/webhooks)
- [Hetzner Cloud konsole](https://console.hetzner.cloud/)
- [GitHub dokumentācija](https://docs.github.com/)

---

## Pirmais nākamais solis

Pirms jaunu funkciju izstrādes komandai jāveic projekta audits un jānosaka, kuras funkcijas jau darbojas.

Pēc tam jāsāk ar datu bāzes un uzdevumu izpildes procesa pabeigšanu.

**Galvenā funkciju plūsma, kas jāpabeidz vispirms:**

1. Lietotājs atver eksāmenu vai mācību priekšmetu.
2. Lietotājs izvēlas uzdevumu.
3. Lietotājs iesniedz atbildi.
4. Sistēma pārbauda atbildi.
5. AI izskaidro risinājumu.
6. Sistēma saglabā rezultātu.
7. Lietotājs var apskatīt savu progresu.

Šī funkciju plūsma ir projekta galvenā prioritāte. Pārējās funkcijas jāattīsta tā, lai tās uzlabotu šo procesu, nevis aizkavētu tā pabeigšanu.

---

**Projekta princips:** vispirms izveidot vienkāršu, strādājošu un drošu produktu, pēc tam pakāpeniski pievienot jaunas funkcijas, balstoties uz lietotāju atsauksmēm.