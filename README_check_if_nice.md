# Study Pilot

**Study Pilot** (iepriekš darba nosaukums *Student Toolkit*) ir digitāla platforma skolēniem, kas palīdz organizēt mācības, sagatavoties pārbaudes darbiem un efektīvāk apgūt mācību vielu. Galvenais attīstības virziens ir Latvijas **9. un 12. klases valsts pārbaudes darbu un eksāmenu sagatavošanās sadaļa** ar AI mācību palīgu, kas balstās uz iepriekšējo gadu eksāmenu uzdevumiem un atbilžu materiāliem.

> **Projekta statuss:** izstrādes / prototipa stadija. Funkcijas un tehnoloģijas var mainīties.

## Satura rādītājs

- [Projekta mērķis](#projekta-mērķis)
- [Pašreizējais stāvoklis un uzlabojumi](#pašreizējais-stāvoklis-un-uzlabojumi)
- [Galvenās funkcijas](#galvenās-funkcijas)
- [Eksāmenu sagatavošanās sadaļa](#eksāmenu-sagatavošanās-sadaļa)
- [AI mācību palīgs (RAG)](#ai-mācību-palīgs-rag)
- [Eksāmenu materiālu pārvaldība](#eksāmenu-materiālu-pārvaldība)
- [Tehnoloģijas](#tehnoloģijas)
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

Study Pilot neaizstāj skolotāju vai oficiālos vērtēšanas materiālus. Tas ir papildu rīks patstāvīgām mācībām.

## Pašreizējais stāvoklis un uzlabojumi

| Joma | Ir / iecerēts | Uzlabojums |
|---|---|---|
| Nosaukums | Student Toolkit | Jauns nosaukums **Study Pilot** — īsāks, atmiņā paliekošāks, atspoguļo "pilota" ideju (vadīt skolēnu pretī eksāmenam) |
| Fokuss | Daudz vispārīgu funkciju | Sākt ar **vienu pilnvērtīgu plūsmu** (9. klases matemātika), tad paplašināt |
| AI | Skaidrojumi | Atbildes tikai ar **avotu norādēm**; "nezinu", ja materiālu nepietiek |
| Materiāli | PDF imports | **Admin pārbaudes process** pirms publicēšanas |
| Mācīšanās | Treniņuzdevumi | **Vājo tēmu noteikšana** un atkārtošanas ieteikumi |
| Plānošana | Study Planner | Plāns, kas **automātiski pielāgojas** atlikušajam laikam līdz eksāmenam |
| Motivācija | — | Sērijas (streaks), mērķi, nedēļas kopsavilkums |
| Pieejamība | — | Mobilā versija, tumšais režīms, vieglā valoda skaidrojumos |

## Galvenās funkcijas

- **Dashboard** — mācību uzdevumi, eksāmenu progress un tuvākie termiņi vienuviet.
- **Deadline Radar** — kontroldarbu, projektu un eksāmenu termiņi ar prioritātēm.
- **Study Planner** — individuāls mācību grafiks, kas pielāgojas progresam.
- **Exam Preparation** — eksāmenu materiāli, uzdevumi, treniņi un progresa uzskaite.
- **AI Study Tutor (Study Pilot AI)** — izskaidro vielu un palīdz saprast kļūdas, norādot avotu.
- **Quiz Mode** — īsi testi un zināšanu pārbaudes.
- **Progress Tracking** — rezultātu, apgūto un vājo tēmu pārskats.

Konkrētā versijā pieejamās iespējas ir atkarīgas no izstrādes stadijas.

## Eksāmenu sagatavošanās sadaļa

Viena no galvenajām projekta funkcijām. Sākumā tiek izstrādāta viena pilnīga plūsma (9. klases matemātika), un pēc pārbaudes sistēma tiek paplašināta.

### 9. klase

- Matemātika
- Latviešu valoda
- Svešvaloda (atbilstoši pieejamajiem materiāliem)
- Citi priekšmeti, ja pieejami pārbaudīti resursi

### 12. klase

Plānotās jomas: matemātika, latviešu valoda, svešvalodas un izvēles priekšmeti (fizika, ķīmija, bioloģija, vēsture, programmēšana). Precīzs priekšmetu un līmeņu saraksts jāsaskaņo ar aktuālajām valsts pārbaudes darbu prasībām.

### Lietotāja darbplūsma

1. Skolēns izvēlas klasi, priekšmetu un eksāmena līmeni.
2. Izvēlas tēmu vai iepriekšējā gada uzdevumu.
3. Sistēma parāda uzdevumu un, ja pieejams, oficiālo atbilžu materiālu.
4. Skolēns mēģina atrisināt uzdevumu pats.
5. AI izskaidro risinājuma soļus, izmantojot atbilstošus avotus.
6. Skolēns izpilda līdzīgus treniņuzdevumus.
7. Sistēma reģistrē rezultātu un norāda tēmas, kurām vajadzīga papildu uzmanība.

## AI mācību palīgs (RAG)

AI tiek izmantots kā **mācību palīgs**, nevis nekļūdīgs oficiālo atbilžu avots.

**RAG** (*Retrieval-Augmented Generation*): sistēma vispirms atrod atbilstošu informāciju uzdevumu un dokumentu datubāzē, un tikai tad nodod to AI modelim atbildes sagatavošanai.

Plūsma:

1. Eksāmenu materiāli tiek iegūti no atbilstošiem avotiem.
2. PDF saturs tiek nolasīts; skenētiem dokumentiem izmanto OCR.
3. Uzdevumi, atbildes un vērtēšanas kritēriji tiek sadalīti atsevišķos ierakstos.
4. Katram ierakstam saglabā metadatus: klase, priekšmets, gads, uzdevuma numurs, avots.
5. Pēc skolēna jautājuma sistēma atrod saistītos materiālus.
6. AI sagatavo skaidrojumu, balstoties uz atrastajiem materiāliem, un norāda avotu.

### Atbilžu kvalitātes principi

- Skaidri atšķirt **oficiālo atbildi** no **AI ģenerēta skaidrojuma**.
- Ja informācijas nepietiek, AI to atklāti pasaka, nevis izdomā atbildi.
- Formulām, tabulām, grafikiem un attēliem — īpaša apstrāde.
- AI risinājumus pārbaudīt ar zināmiem pareizajiem rezultātiem.
- Lietotājs vienmēr var atvērt sākotnējo uzdevumu un tā avotu.
- Tutors vispirms mudina domāt (mājieni, soļi), nevis uzreiz dod gatavu atbildi.

## Eksāmenu materiālu pārvaldība

Materiālus pārvalda administrēšanas sadaļā, lai tos varētu pievienot un pārbaudīt bez izmaiņām kodā.

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

1. Administrators pievieno PDF un ievada metadatus.
2. Sistēma izvelk tekstu un vajadzības gadījumā veic OCR.
3. Materiāls tiek sadalīts uzdevumos vai loģiskās sadaļās.
4. Administrators pārbauda tekstu, formulas, tabulas un attēlus.
5. Ja pieejams, tiek sasaistīts atbilžu dokuments vai vērtēšanas kritēriji.
6. Pēc pārbaudes materiāls tiek publicēts meklēšanai un AI izmantošanai.

Automātiska importēšana negarantē pareizu rezultātu — īpaši ar diagrammām, attēliem un sarežģītām formulām.

## Tehnoloģijas

Tehnoloģiju izvēle var mainīties. Iespējamais prototipa risinājums:

| Daļa | Tehnoloģija | Pielietojums |
|---|---|---|
| Frontend | React vai Next.js | Lietotāja saskarne |
| Autentifikācija | Supabase Auth | Lietotāju konti |
| Datubāze | PostgreSQL / Supabase | Lietotāji, uzdevumi, progress |
| Failu glabāšana | Supabase Storage | PDF un mācību materiāli |
| AI | AI API servera pusē | Skaidrojumi un mācību atbalsts |
| Dokumentu apstrāde | PDF teksta izvilkšana + OCR | Materiālu importēšana |
| Semantiskā meklēšana | Embeddings + vektoru meklēšana (pgvector) | Atbilstošu uzdevumu atrašana |
| Matemātikas attēlošana | KaTeX / MathJax | Formulu rādīšana |

Pirmajai demo versijai pietiek ar vienu priekšmetu, nelielu pārbaudītu materiālu kopu un vienkāršu meklēšanu.

## Projekta struktūra

Iespējamās struktūras piemērs (pielāgo faktiskajam projektam):

```text
study-pilot/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── features/
│   │   ├── exams/
│   │   ├── planner/
│   │   ├── dashboard/
│   │   └── tutor/
│   ├── services/
│   └── styles/
├── server/
├── docs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Palaišana lokāli

**Prasības:** Git, Node.js LTS un npm.

1. Noklonē repozitoriju:

   ```bash
   git clone <REPOSITORY_URL>
   cd <PROJECT_FOLDER>
   ```

2. Instalē atkarības:

   ```bash
   npm install
   ```

3. Izveido savu `.env` failu pēc `.env.example` un aizpildi vērtības. Nekopē īstas API atslēgas repozitorijā.

4. Palaid izstrādes serveri:

   ```bash
   npm run dev
   ```

5. Atver terminālī norādīto vietējo adresi.

Precīzās komandas ir atkarīgas no faktiskā `package.json`.

## Vides mainīgie

Piemērs `.env.example`:

```env
# Aizpildi tikai tos mainīgos, kurus projekts tiešām izmanto.
DATABASE_URL=
AI_API_KEY=
```

- Nekad neievieto īstu API atslēgu GitHub repozitorijā.
- AI pieprasījumus veic tikai servera pusē.
- `.env` jābūt iekļautam `.gitignore`.
- Maksas AI API gadījumā izmanto pieprasījumu ierobežojumus un izmaksu uzskaiti.

## Drošība un datu aizsardzība

- Slepenās atslēgas glabā tikai servera pusē vai drošā platformas konfigurācijā.
- Validē lietotāju ievadi un augšupielādētos failus.
- Ierobežo piekļuvi administratora funkcijām.
- Neļauj vienam lietotājam piekļūt cita lietotāja privātajiem datiem.
- Ievieš failu izmēra un pieprasījumu skaita ierobežojumus.
- Izstrādā datu glabāšanas un dzēšanas kārtību un privātuma paziņojumu (īpaši, jo lietotāji var būt nepilngadīgi).

## Attīstības plāns

### 1. posms — MVP

- [ ] Pamata vietne un navigācija.
- [ ] Eksāmenu sadaļa vienam priekšmetam (9. klases matemātika).
- [ ] Daži iepriekšējo gadu materiāli un metadati.
- [ ] Avotu un oficiālo atbilžu norādīšana.
- [ ] Uzdevumu pārlūkošana un meklēšana.
- [ ] Materiālu kvalitātes pārbaude.

### 2. posms — AI mācību palīgs

- [ ] Servera puses AI API integrācija.
- [ ] AI saņem atbilstošos avota materiālus (RAG).
- [ ] Izmantoto avotu rādīšana; AI skaidrojuma un oficiālās atbildes nošķiršana.
- [ ] Precizitātes pārbaude ar zināmiem uzdevumiem.
- [ ] Pieprasījumu un izmaksu ierobežojumi.

### 3. posms — personalizēta sagatavošanās

- [ ] Treniņuzdevumi un testi.
- [ ] Skolēna rezultātu un progresa saglabāšana.
- [ ] Mācību plāns atbilstoši atlikušajam laikam un grūtajām tēmām.
- [ ] Paplašināšana uz citiem priekšmetiem un 12. klasi.
- [ ] Lietotāju testēšana un saskarnes uzlabošana.

### 4. posms — ilgtermiņa idejas

- [ ] Mobilā lietotne / PWA.
- [ ] Nedēļas progresa ziņojumi skolēnam (un pēc vēlmes vecākiem).
- [ ] Skolotāju skats klases progresam.
- [ ] Mērķi, sērijas un motivācijas elementi.
- [ ] Papildu valodas (piem., angļu saskarne).

## Avoti un autortiesības

Sākotnējais oficiālo materiālu avots ir Valsts izglītības attīstības aģentūra (VIAA):

- [VIAA — Valsts pārbaudes darbu programmas](https://www.viaa.gov.lv/lv/valsts-parbaudes-darbu-programmas)
- [VIAA — Biežāk uzdotie jautājumi par valsts pārbaudes darbiem](https://www.viaa.gov.lv/lv/biezak-uzdotie-jautajumi-par-valsts-parbaudes-darbiem)

Pirms materiālu publicēšanas vai izplatīšanas pārbaudi to izmantošanas nosacījumus un autortiesības. Tas, ka PDF ir publiski pieejams, automātiski nenozīmē, ka to drīkst brīvi pārpublicēt. Ja atļaujas nav skaidras, norādi saiti uz oriģinālu un izmanto paša veidotus skaidrojumus.

## Ieguldījums projektā

1. Izveido atsevišķu Git zaru jaunai funkcijai vai labojumam.
2. Veic izmaiņas un pārbaudi tās lokāli.
3. Izveido Pull Request ar īsu izmaiņu un pārbaužu aprakstu.
4. Neiekļauj repozitorijā API atslēgas, paroles vai citus noslēpumus.

---

**Study Pilot** — mācību rīki, kas palīdz skolēniem mācīties gudrāk un sagatavoties eksāmeniem pārliecinošāk.
