CREATE TABLE world_players (
  token_hash TEXT PRIMARY KEY,
  alias TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE world_matches (
  id TEXT PRIMARY KEY,
  player TEXT NOT NULL REFERENCES world_players(token_hash) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 6),
  tier INTEGER NOT NULL CHECK (tier BETWEEN 0 AND 2),
  season TEXT NOT NULL,
  seed INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  answered INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  last_correct INTEGER NOT NULL DEFAULT 0,
  finished_at INTEGER
);
--> statement-breakpoint
CREATE UNIQUE INDEX world_one_active_match ON world_matches(player) WHERE finished_at IS NULL;
--> statement-breakpoint
CREATE INDEX world_standings ON world_matches(season,year,tier,finished_at,correct);
--> statement-breakpoint
CREATE INDEX world_player_history ON world_matches(player,started_at);
