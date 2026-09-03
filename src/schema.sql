CREATE TABLE IF NOT EXISTS products (
										id INTEGER PRIMARY KEY AUTOINCREMENT,
										name TEXT NOT NULL,
										price REAL NOT NULL,
										description TEXT,
										color TEXT,
										shafa_link TEXT UNIQUE,
										created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
