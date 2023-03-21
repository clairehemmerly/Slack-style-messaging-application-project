-- create table reactions (
--     id INTEGER PRIMARY KEY,
--     user_id INTEGER,
--     message_id INTEGER,
--     emoji TEXT,
--     FOREIGN KEY(message_id) REFERENCES messages_and_replies(id)
-- )

alter table reactions 
add channel_id INTEGER
REFERENCES channels
