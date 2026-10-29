-- Torneos del LET y si Nuria está inscrita.
-- Lo llena api-web/sync-tournaments.php; la web lo lee desde api-web/tournaments.php.
CREATE TABLE IF NOT EXISTS tournaments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  season SMALLINT UNSIGNED NOT NULL,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location VARCHAR(255) NULL,
  city VARCHAR(255) NULL,
  country VARCHAR(100) NULL,
  scores_param VARCHAR(10) NOT NULL DEFAULT 'ESC',
  cancelled TINYINT(1) NOT NULL DEFAULT 0,
  -- Resultado del último chequeo del listado de "Entries"
  nuria_entered TINYINT(1) NOT NULL DEFAULT 0,
  nuria_status VARCHAR(100) NULL, -- "Entered", "Reserve #44", ... o NULL si no aparece
  entries_checked_at DATETIME NULL,
  -- Forzar a mano: 1 = juega, 0 = no juega, NULL = usar lo que diga el LET
  confirmed_override TINYINT(1) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_season_code (season, code),
  KEY idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
