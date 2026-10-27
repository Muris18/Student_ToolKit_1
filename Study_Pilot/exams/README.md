# Eksāmenu faili

Ieliec šeit vienu `.json` failu uz vienu eksāmenu (viena priekšmeta, klases, gada un sesijas).
Piemērs, kas jau ir pilnībā aizpildīts: `dabaszinatnes-9-2026-paraugs.json` (VIAA 9. klases dabaszinātņu paraugs).

## Faila uzbūve

    {
      "subject": "dabaszinātnes", "grade": 9, "year": 2026, "session": "paraugs",
      "title": "...", "source_url": "",
      "groups": { "u2a": { "section": "...", "topic": "...", "context": "...", "figure": "..." } },
      "tasks": [ { "number": "2.1", "group": "u2a", "kind": "open", "text": "...", "points": 2, "answer": "..." } ]
    }

Uzdevuma lauki:
- `number` (obligāts) un `text` (obligāts)
- `kind`: `choice` (testa jautājums ar variantiem) vai `open` (atvērtais). Ja nav norādīts, tiek ņemts `choice`, kad ir `options`.
- `options`: `{"A": "...", "B": "..."}` — tikai testa jautājumiem
- `answer`: testam — pareizā atbilde; atvērtajam — vērtēšanas kritēriji. AI to izmanto, bet skolēnam neatklāj.
- `group`: atsauce uz `groups`, no kuras uzdevums pārņem kopīgo `section`, `topic`, `context` (ievadteksts, tabula) un `figure`. Uzdevumā norādīts lauks ir svarīgāks par grupas lauku.
- `figure`: īss attēla apraksts tekstā, jo AI zīmējumus neredz
- `points`, `solution` — pēc izvēles

## Importēšana

    npm run migrate        # vienreiz pēc jaunām migrācijām
    npm run import:exams   # lokāli
    docker compose exec app npm run import:exams   # serverī

Faili, kuru nosaukums sākas ar `_`, netiek importēti. Importu drīkst palaist atkārtoti — esošie uzdevumi tiek atjaunināti.
Pirms ielikšanas publiskā repozitorijā pārbaudi VIAA lietošanas noteikumus (vai drīkst publicēt uzdevumus).
