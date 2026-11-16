-- Noņem 9. klases dabaszinātņu paraugu (2026, "paraugs") no platformas: dokuments, tā uzdevumi un lietotāju mēģinājumi.
-- Pats fails exams/dabaszinatnes-9-2026-paraugs.json ir izdzēsts, tāpēc import:exams to vairs neielādēs.
-- Uzdevumi tiek dzēsti kopā ar dokumentu (ON DELETE CASCADE). Drošs atkārtot.
DELETE FROM exam_attempts
WHERE task_id IN (
  SELECT t.id FROM exam_tasks t JOIN exam_documents d ON d.id = t.doc_id
  WHERE d.subject = 'dabaszinātnes' AND d.grade = 9 AND d.year = 2026 AND d.session = 'paraugs'
);
DELETE FROM exam_documents WHERE subject = 'dabaszinātnes' AND grade = 9 AND year = 2026 AND session = 'paraugs';
