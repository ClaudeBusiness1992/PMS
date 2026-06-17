CREATE TABLE IF NOT EXISTS dokumente (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mietverhaeltnis_id   uuid        REFERENCES mietverhaeltnisse(id) ON DELETE CASCADE,
  typ                  text        NOT NULL CHECK (typ IN ('upload', 'vorlage')),
  titel                text        NOT NULL DEFAULT '',
  datei_path           text        NOT NULL DEFAULT '',
  vorlage_id           text        NOT NULL DEFAULT '',
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE dokumente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eingeloggte user: dokumente"
  ON dokumente FOR ALL
  USING  (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumente', 'dokumente', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "User kann Dokumente hochladen" ON storage.objects;
DROP POLICY IF EXISTS "User kann Dokumente lesen"     ON storage.objects;
DROP POLICY IF EXISTS "User kann Dokumente loeschen"  ON storage.objects;

CREATE POLICY "User kann Dokumente hochladen"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User kann Dokumente lesen"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User kann Dokumente loeschen"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);
