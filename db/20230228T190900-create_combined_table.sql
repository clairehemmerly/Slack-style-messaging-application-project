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

create table messages_and_replies (
  id INTEGER PRIMARY KEY,
  body TEXT,
  channel_id INTEGER,
  user_id INT,
  message_id INT,
  FOREIGN KEY(channel_id) REFERENCES channels(id)
);
