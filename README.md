# Student Toolkit

**Iespējamais projekta nosaukums Study Pilot**

**Student Toolkit** ir digitāla platforma skolēniem, kas palīdz organizēt mācības, sagatavoties pārbaudes darbiem un efektīvāk apgūt mācību vielu. Projekta galvenais attīstības virziens ir Latvijas 9. un 12. klases valsts pārbaudes darbu un eksāmenu sagatavošanās sadaļa ar AI mācību palīgu, kas izmanto iepriekšējo gadu eksāmenu uzdevumus un atbilžu materiālus.

> **Projekta statuss:** izstrādes/prototipa stadija. Funkcijas un tehnoloģijas var mainīties projekta izstrādes laikā.

## Satura rādītājs

- [Projekta mērķis](#projekta-mērķis)
- [Galvenās funkcijas](#galvenās-funkcijas)
- [Eksāmenu sagatavošanās sadaļa](#eksāmenu-sagatavošanās-sadaļa)
- [Kā paredzēts izmantot AI](#kā-paredzēts-izmantot-ai)
- [Eksāmenu materiālu pārvaldība](#eksāmenu-materiālu-pārvaldība)
- [Plānotās tehnoloģijas](#plānotās-tehnoloģijas)
- [Projekta struktūra](#projekta-struktūra)
- [Palaišana lokāli](#palaišana-lokāli)
- [Vides mainīgie](#vides-mainīgie)
- [Drošība un datu aizsardzība](#drošība-un-datu-aizsardzība)
- [Attīstības plāns](#attīstības-plāns)
- [Avoti un autortiesības](#avoti-un-autortiesības)
- [Ieguldījums projektā](#ieguldījums-projektā)

## Projekta mērķis

Izveidot vienkārši lietojamu platformu, kurā skolēns var:

- sekot līdzi mācību uzdevumiem un termiņiem;
- plānot gatavošanos eksāmeniem;
- trenēties ar iepriekšējo gadu eksāmenu uzdevumiem;
- saņemt saprotamus uzdevumu risinājumu skaidrojumus;
- noteikt tēmas, kurās nepieciešams vairāk trenēties;
- pārbaudīt zināšanas ar testiem un praktiskiem uzdevumiem.

Projekts neaizstāj skolotāju vai oficiālos vērtēšanas materiālus. Tas ir papildu rīks patstāvīgām mācībām.

## Galvenās funkcijas

- **Student Dashboard** — mācību uzdevumi, eksāmenu progress un tuvākie termiņi vienuviet.
- **Deadline Radar** — pārskatāmi kontroldarbu, projektu un eksāmenu termiņi.
- **Study Planner** — individuāls mācību grafiks.
- **Exam Preparation** — eksāmenu materiāli, uzdevumi, treniņi un progresa uzskaite.
- **AI Study Tutor** — AI palīgs, kas izskaidro mācību vielu un palīdz saprast kļūdas.
- **Quiz Mode** — īsi testi un zināšanu pārbaudes.
- **Progress Tracking** — rezultātu un apgūto tēmu pārskats.

Šīs ir iecerētās funkcijas; konkrētā versijā pieejamās iespējas būs atkarīgas no izstrādes stadijas.

## Eksāmenu sagatavošanās sadaļa

Šī ir viena no galvenajām projekta funkcijām. Sākumā ieteicams izstrādāt vienu pilnvērtīgu eksāmena sagatavošanās plūsmu, piemēram, 9. klases matemātikā, un pēc pārbaudes paplašināt sistēmu.

### 9. klase

- Matemātika
- Latviešu valoda
- Svešvaloda, atbilstoši pieejamajiem materiāliem
- Citi mācību priekšmeti, ja pieejami atbilstoši un pārbaudīti resursi

### 12. klase

Plānotās jomas var ietvert matemātiku, latviešu valodu, svešvalodas un izvēles priekšmetus, piemēram, fiziku, ķīmiju, bioloģiju, vēsturi vai programmēšanu. Precīzs priekšmetu un līmeņu saraksts jāsaskaņo ar aktuālajām valsts pārbaudes darbu prasībām.

### Lietotāja darbplūsma

1. Skolēns izvēlas klasi, priekšmetu un eksāmena līmeni.
2. Skolēns izvēlas tēmu vai iepriekšējā gada eksāmena uzdevumu.
3. Sistēma parāda uzdevumu un, ja pieejams, oficiālo atbilžu materiālu.
4. Skolēns mēģina atrisināt uzdevumu.
5. AI izskaidro risinājuma soļus, izmantojot atbilstošus avotus.
6. Skolēns izpilda līdzīgus treniņuzdevumus.
7. Sistēma reģistrē rezultātu un palīdz noteikt tēmas, kurām vajadzīga papildu uzmanība.

## Kā paredzēts izmantot AI

AI paredzēts izmantot kā mācību palīgu, nevis kā nekļūdīgu oficiālo atbilžu avotu.

### Ieteicamā pieeja: RAG

**RAG** (*Retrieval-Augmented Generation*) ir pieeja, kurā sistēma vispirms atrod atbilstošu informāciju dokumentu un uzdevumu datubāzē, bet pēc tam nodod šo informāciju AI modelim atbildes sagatavošanai.

Paredzētā plūsma:

1. Eksāmenu materiāli tiek iegūti no atbilstošiem avotiem.
2. PDF saturs tiek nolasīts; skenētiem dokumentiem vajadzības gadījumā izmanto OCR.
3. Uzdevumi, atbildes un vērtēšanas kritēriji tiek sadalīti atsevišķos ierakstos.
4. Katram ierakstam saglabā metadatus: klase, priekšmets, gads, uzdevuma numurs un avots.
5. Pēc skolēna jautājuma sistēma atrod saistītos materiālus.
6. AI sagatavo skaidrojumu, balstoties uz atrastajiem materiāliem, un norāda avotu, ja tas pieejams.

### AI atbilžu kvalitāte

- Skaidri atšķir oficiālo atbildi no AI ģenerēta skaidrojuma.
- Ja sistēma neatrod pietiekamu informāciju, tai tas jāpasaka, nevis jāizdomā atbilde.
- Matemātikas formulām, tabulām, grafikiem un attēliem var būt nepieciešama īpaša apstrāde.
- AI ģenerētie risinājumi jāpārbauda ar zināmiem pareizajiem rezultātiem.
- Lietotājam jābūt iespējai atvērt sākotnējo uzdevumu un apskatīt tā avotu.

## Eksāmenu materiālu pārvaldība

Materiālus ieteicams pārvaldīt administrēšanas sadaļā, lai tos varētu pievienot un pārbaudīt bez izmaiņām programmas kodā.

Katram materiālam vēlams saglabāt:

| Lauks | Apraksts |
|---|---|
| Klase | 9. vai 12. klase |
| Priekšmets | Piemēram, matemātika |
| Gads | Eksāmena vai materiāla gads |
| Līmenis | Ja attiecināms |
| Materiāla tips | Uzdevumi, atbildes, vērtēšanas kritēriji vai programma |
| Uzdevuma numurs | Konkrētā uzdevuma identifikators |
| Avota saite | Sākotnējā dokumenta vai vietnes saite |
| Pārbaudes statuss | Importēts, jāpārbauda vai pārbaudīts |
| Atbilžu pieejamība | Vai pieejams atbilžu vai vērtēšanas materiāls |

### Importēšanas process

1. Administrators pievieno PDF un ievada tā metadatus.
2. Sistēma izvelk tekstu un vajadzības gadījumā veic OCR.
3. Materiāls tiek sadalīts uzdevumos vai loģiskās sadaļās.
4. Administrators pārbauda tekstu, formulas, tabulas un attēlus.
5. Ja pieejams, tiek sasaistīts atbilžu dokuments vai vērtēšanas kritēriji.
6. Pēc pārbaudes materiāls tiek publicēts meklēšanai un AI izmantošanai.

Automātiska importēšana negarantē pareizu rezultātu. Pirms publicēšanas materiāli jāpārbauda, īpaši tad, ja ir diagrammas, attēli vai sarežģītas formulas.

## Plānotās tehnoloģijas

Tehnoloģiju izvēle var mainīties. Iespējamais prototipa risinājums:

| Daļa | Iespējamā tehnoloģija | Pielietojums |
|---|---|---|
| Frontend | React vai Next.js | Lietotāja saskarne |
| Autentifikācija | Supabase Auth | Lietotāju konti |
| Datubāze | PostgreSQL / Supabase | Lietotāji, uzdevumi un progress |
| Failu glabāšana | Supabase Storage vai līdzīgs risinājums | PDF un mācību materiāli |
| AI | AI API servera pusē | Skaidrojumi un mācību atbalsts |
| Dokumentu apstrāde | PDF teksta izvilkšana un OCR | Materiālu importēšana |
| Semantiskā meklēšana | Embeddings un vektoru meklēšana | Atbilstošu uzdevumu atrašana |

Pirmajai demonstrācijas versijai var pietikt ar vienu priekšmetu, nelielu pārbaudītu materiālu kopu un vienkāršu meklēšanu.

## Projekta struktūra

Šis ir iespējamās struktūras piemērs, nevis garantēts pašreizējā repozitorija failu saraksts:

```text
student-toolkit/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── features/
│   │   ├── exams/
│   │   ├── planner/
│   │   └── dashboard/
│   ├── services/
│   └── styles/
├── server/
├── docs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Pielāgo šo struktūru faktiskajam projektam; neveido tukšas mapes tikai tāpēc, ka tās redzamas piemērā.

## Palaišana lokāli

**Prasības:** Git, Node.js LTS un npm, ja projekts izmanto Node.js.

1. Noklonē repozitoriju:

   ```bash
   git clone <REPOSITORY_URL>
   cd <PROJECT_FOLDER>
   ```

2. Instalē atkarības:

   ```bash
   npm install
   ```

3. Ja projektā ir `.env.example`, izveido savu `.env` failu un aizpildi nepieciešamās vērtības. Nekopē īstas API atslēgas repozitorijā.

4. Ja `package.json` satur `dev` skriptu, palaid:

   ```bash
   npm run dev
   ```

5. Terminālī apskati vietējo adresi, ko norāda izstrādes serveris.

Šīs ir vispārīgas instrukcijas. Precīzās komandas ir atkarīgas no faktiskā `package.json` un servera konfigurācijas.

## Vides mainīgie

Piemērs `.env.example` failam:

```env
# Aizpildi tikai tos mainīgos, kurus projekts tiešām izmanto.
DATABASE_URL=
AI_API_KEY=
```

- Nekad neievieto īstu API atslēgu GitHub repozitorijā.
- AI API pieprasījumus veic servera pusē, nevis publiski pieejamā frontend kodā.
- `.env` failam jābūt iekļautam `.gitignore`.
- Maksas AI API gadījumā izmanto pieprasījumu ierobežojumus un izmaksu uzskaiti.
- Šie mainīgo nosaukumi ir piemēri; saskaņo tos ar izvēlēto tehnoloģiju konfigurāciju.

## Drošība un datu aizsardzība

- Glabā slepenās atslēgas tikai servera pusē vai drošā izvietošanas platformas konfigurācijā.
- Validē lietotāju ievadītos datus un augšupielādētos failus.
- Ierobežo piekļuvi administratora funkcijām.
- Neļauj vienam lietotājam piekļūt cita lietotāja privātajiem datiem.
- Ievies failu izmēra un pieprasījumu skaita ierobežojumus, ja nepieciešams.
- Izstrādā datu glabāšanas un dzēšanas kārtību un privātuma paziņojumu.

## Attīstības plāns

### 1. posms — MVP

- [ ] Izveidot pamata vietni un navigāciju.
- [ ] Izveidot eksāmenu sadaļu vienam priekšmetam.
- [ ] Pievienot dažus iepriekšējo gadu eksāmenu materiālus un metadatus.
- [ ] Norādīt avotus un oficiālās atbildes, ja tās pieejamas.
- [ ] Izveidot uzdevumu pārlūkošanu un meklēšanu.
- [ ] Pārbaudīt materiālu kvalitāti.

### 2. posms — AI mācību palīgs

- [ ] Pievienot servera puses AI API integrāciju.
- [ ] Nodrošināt, ka AI saņem atbilstošos avota materiālus.
- [ ] Rādīt izmantotos avotus un atšķirt AI skaidrojumu no oficiālās atbildes.
- [ ] Pārbaudīt atbilžu precizitāti ar zināmiem uzdevumiem.
- [ ] Ieviest pieprasījumu un izmaksu ierobežojumus.

### 3. posms — personalizēta sagatavošanās

- [ ] Pievienot treniņuzdevumus un testus.
- [ ] Saglabāt skolēna rezultātus un progresa datus.
- [ ] Piedāvāt mācību plānu atbilstoši atlikušajam laikam un grūtajām tēmām.
- [ ] Paplašināt materiālu klāstu uz citiem priekšmetiem un 12. klasi.
- [ ] Veikt lietotāju testēšanu un uzlabot saskarni.

## Avoti un autortiesības

Sākotnējais oficiālo materiālu meklēšanas punkts ir Valsts izglītības attīstības aģentūra (VIAA):

- [VIAA — Valsts pārbaudes darbu programmas](https://www.viaa.gov.lv/lv/valsts-parbaudes-darbu-programmas)
- [VIAA — Biežāk uzdotie jautājumi par valsts pārbaudes darbiem](https://www.viaa.gov.lv/lv/biezak-uzdotie-jautajumi-par-valsts-parbaudes-darbiem)

Pirms materiālu publicēšanas vai atkārtotas izplatīšanas pārbaudi to izmantošanas nosacījumus un autortiesības. Tas, ka PDF ir publiski pieejams, automātiski nenozīmē, ka to drīkst brīvi pārpublicēt. Ja atļaujas nav skaidras, apsver iespēju norādīt saiti uz oriģinālu un izmantot paša veidotus skaidrojumus, ievērojot piemērojamos noteikumus.

## Ieguldījums projektā

Ja vēlies palīdzēt projektam:

1. Izveido atsevišķu Git zaru jaunai funkcijai vai labojumam.
2. Veic izmaiņas un pārbaudi tās lokāli.
3. Izveido Pull Request ar īsu izmaiņu un pārbaužu aprakstu.
4. Neiekļauj repozitorijā API atslēgas, paroles vai citus noslēpumus.

---

**Student Toolkit** — mācību rīki, kas palīdz skolēniem mācīties gudrāk un sagatavoties eksāmeniem pārliecinošāk.
