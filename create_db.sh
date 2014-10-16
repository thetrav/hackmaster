rm events.db
sqlite3 events.db "CREATE TABLE events (id INTEGER PRIMARY KEY, deleted bool, str text);"