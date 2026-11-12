-- Globālais AI dienas limits skaita visus šodienas ierakstus visiem lietotājiem (pēc created_at).
-- Esošais indekss ir (user_id, created_at), tāpēc globālajam skaitījumam vajag atsevišķu indeksu. Drošs atkārtot.
CREATE INDEX IF NOT EXISTS ai_usage_created_idx ON ai_usage (created_at DESC);
