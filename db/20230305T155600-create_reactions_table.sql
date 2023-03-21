-- create table users (
--   id INTEGER PRIMARY KEY,
--   name VARCHAR(40) UNIQUE,
--   password VARCHAR(40),
--   api_key VARCHAR(40)
-- );

-- create table channels (
--     id INTEGER PRIMARY KEY,
--     name VARCHAR(40) UNIQUE
-- );

-- create table messages (
--   id INTEGER PRIMARY KEY,
--   user_id INTEGER,
--   channel_id INTEGER,
--   body TEXT,
--   FOREIGN KEY(user_id) REFERENCES users(id),
--   FOREIGN KEY(channel_id) REFERENCES channels(id)
-- );

-- create table replies (
--   id INTEGER PRIMARY KEY,
--   user_id INTEGER,
--   message_id INTEGER,
--   body TEXT,
--   FOREIGN KEY(message_id) REFERENCES messages(id)
-- );

create table reactions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    message_id INTEGER,
    emoji TEXT,
    FOREIGN KEY(message_id) REFERENCES messages_and_replies(id)
)