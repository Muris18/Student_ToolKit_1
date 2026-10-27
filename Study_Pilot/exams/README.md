# Eksāmenu faili

Ieliec šeit vienu `.json` failu uz vienu eksāmenu (viena priekšmeta, klases, gada un sesijas).
Piemēram: `matematika-9-2023.json`. Formātu skat. `_paraugs.json`.

Lauki uzdevumam:
- `number` (obligāts) — uzdevuma numurs eksāmenā
- `text` (obligāts) — uzdevuma teksts, formulas ar LaTeX (`$...$`)
- `answer` — pareizā atbilde vai vērtēšanas instrukcija (AI to izmanto, bet skolēnam neatklāj)
- `points`, `section`, `topic`, `solution` — pēc izvēles

Importēšana:

    npm run import:exams        # lokāli
    docker compose exec app npm run import:exams   # serverī

Faili, kuru nosaukums sākas ar `_`, netiek importēti. Importu drīkst palaist atkārtoti — esošie uzdevumi tiek atjaunināti.
Pirms ielikšanas repozitorijā pārbaudi VISC lietošanas noteikumus (vai drīkst publicēt uzdevumus).
