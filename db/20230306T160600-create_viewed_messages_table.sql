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

create table viewed_messages_count (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    channel_id INTEGER,
    count INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(channel_id) REFERENCES channels(id)
)

