-- sqlite3 weblog.sqlite < 20200224T184900-insert_posts_and_comments.sql

-- text from http://shakespeare.mit.edu/tempest/full.html

insert into messages (user_id, channel_id, body) values (
  1,
  1,
  "Enter a Master and a Boatswain"
);

insert into replies (user_id, message_id, body) values (
  2, 1, "Boatswain!"
);

insert into replies (user_id, message_id, body) values (
  3, 1, "Here, master: what cheer?"
);

insert into replies (user_id, message_id, body) values (
  2, 1, "Good, speak to the mariners nfall to't, yarely,
or we run ourselves aground: bestir, bestir."
);

insert into replies (user_id, message_id, body) values (
  3, 1, "Heigh, my hearts! cheerly, cheerly, my hearts!
yare, yare! Take in the topsail. Tend to the
master's whistle. Blow, till thou burst thy wind,
if room enough!"
);

insert into messages (user_id, channel_id, body) values (
  2,
  1,
  "If by your art, my dearest father, you have
Put the wild waters in this roar, allay them."
);

insert into replies (user_id, message_id, body) values (
  1, 2, "Be collected:
No more amazement: tell your piteous heart
There's no harm done."
);

insert into replies (user_id, message_id, body) values (
  3, 2, "O, woe the day!"
);

insert into messages (user_id, channel_id, body) values (
  3,
  2,
  "Beseech you, sir, be merry; you have cause,
So have we all, of joy; for our escape
Is much beyond our loss. Our hint of woe
Is common; every day some sailor's wife,
The masters of some merchant and the merchant
Have just our theme of woe; but for the miracle,
I mean our preservation, few in millions
Can speak like us: then wisely, good sir, weigh
Our sorrow with our comfort."
);

insert into replies (user_id, message_id, body) values (
  1, 3, "Prithee, peace."
);

insert into replies (user_id, message_id, body) values (
  2, 3, "He receives comfort like cold porridge."
);

insert into replies (user_id, message_id, body) values (
  1, 3, "The visitor will not give him o'er so."
);

insert into replies (user_id, message_id, body)values (
  4, 3, "Look he's winding up the watch of his wit;
by and by it will strike."
);

insert into messages (user_id, channel_id, body) values (
  2,
  1,
  "All the infections that the sun sucks up
From bogs, fens, flats, on Prosper fall and make him
By inch-meal a disease! His spirits hear me
And yet I needs must curse."
);

insert into replies (user_id, message_id, body) values (
  1, 4, "Here's neither bush nor shrub, to bear off
any weather at all, and another storm brewing;
I hear it sing i' the wind: yond same black
cloud, yond huge one, looks like a foul
bombard that would shed his liquor."
);
