-- create table messages_and_replies (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   body TEXT,
--   channel_id INTEGER,
--   user_id INT,
--   message_id INT,
--   FOREIGN KEY(channel_id) REFERENCES channels(id)
-- );

-- migrate the posts first

insert into messages_and_replies
    (user_id, channel_id, body)
    select user_id, channel_id, body from messages;

-- then migrate the comments

insert into messages_and_replies
    (user_id, message_id, body)
    select user_id, message_id, body from replies;
