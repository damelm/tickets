-- app_settings guarda solo configuración de negocio no sensible.
-- Secretos (GOOGLE_CLIENT_ID, JWT_SECRET, DATABASE_URL) siempre en variables de entorno, nunca acá.
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by BIGINT REFERENCES users(id)
);

INSERT INTO app_settings (key, value) VALUES ('google_allowed_domain', NULL)
ON CONFLICT DO NOTHING;
