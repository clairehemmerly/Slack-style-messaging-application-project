import string
import random
import sqlite3
from datetime import datetime
from flask import Flask, g
from functools import wraps
from flask import *
import json
import re

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/belay.sqlite3')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one: 
            return rows[0]
        return rows
    return None

def new_user(name, password):
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    query_db('insert into users (name, password, api_key) values (?, ?, ?)',
        (name, password, api_key),
        one=True)
    u = query_db('select * from users order by id desc', one=True)
    return u

@app.route('/')
# @app.route('/profile')
# @app.route('/login')
# @app.route('/create-account')
@app.route('/<path:text>')
def index(text=None, reply=None):
    return app.send_static_file('index.html')

# -------------------------------- API ROUTES ----------------------------------

@app.route('/api/signup', methods=['GET', 'POST'])
def signup():  
    if request.method == 'POST':
        print('request new user')
        username = request.json['username']
        print(username)
        password = request.json['password']
        print(password)
        user = new_user(username, password)
        json_resp = {}
        for key in user.keys():
            json_resp[key] = user[key]
        return json_resp

@app.route('/api/getchannels', methods=['GET'])
def get_rooms():
    print('load channels')
    api_key = request.headers.get('api_key')
    if api_key is None: 
        return {}, 400
    channels = query_db('select * from channels')
    if channels is None:
        return {}
    list_channels = [dict(ch) for ch in channels]
    return json.dumps(list_channels)

@app.route('/api/login', methods=['POST'])
def login():
    print('login')
    username = request.json['username']
    password = request.json['password']
    user = query_db('select * from users where name == ? and password == ?', [username, password], one=True)
    if user is None:
        return {}, 400
    json_resp = {}
    for key in user.keys():
        json_resp[key] = user[key]
    return json_resp

@app.route('/api/getuser', methods=['GET'])
def get_user():
    print('get user')
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    user = query_db('select * from users where api_key == ?', [api_key], one=True)
    if user is None: return {}, 400
    json_resp = {}
    for key in user.keys():
        json_resp[key] = user[key]
    return json_resp

@app.route('/api/username', methods = ["POST"])
def update_username():    
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    if request.method == "POST":
        username = request.json['username']
        print('request', username)
        query_db('update users set name = ? where api_key == ?', [username, api_key]) 
    return {}

@app.route('/api/password', methods = ["POST"])
def update_password():    
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    if request.method == "POST":
        password = request.json['password']
        print('request', password)
        query_db('update users set password = ? where api_key == ?', [password, api_key])
    return {}

@app.route('/api/addchannel', methods=['POST'])
def add_channel():
    print("add channel")
    if (request.method == 'POST'):
        name = request.json['channel']
        query_db('insert into channels (name) values (?)', [name], one=True)   
    return {}

@app.route('/api/getmessages', methods=['GET'])
def messages():
    api_key = request.headers.get('api_key')
    channel_id = request.headers.get('channel_id')
    if api_key is None: return {}, 403
    messages = query_db('''select messages_and_replies.id, body, channel_id, channels.name as channel_name,
                        messages_and_replies.user_id, users.id, users.name, replies
                        from messages_and_replies 
                        join users on messages_and_replies.user_id = users.id 
                        join channels on messages_and_replies.channel_id = channels.id
                        left join (select message_id, count() AS replies 
                        from messages_and_replies group by message_id) counts
                        on messages_and_replies.id = counts.message_id
                        where channel_id = ?''', [channel_id])
    reactions = query_db('''SELECT reactions.id, user_id, message_id, emoji, users.name
                        from reactions join users on reactions.user_id = users.id where channel_id = ?''', [channel_id])
    if messages is None:
        return json.dumps([{'id': 0, 'user_id': 0, 'name': '', 'body': 'Select a channel to get started', 'image': '',
                             'reactions': [{'id': 0, 'user_id': 0, 'message_id': 0, 'emoji': 0, 'name': ''}]}])
    list_messages = [dict(message) for message in messages]
    if reactions is not None:
        list_reactions = [dict(reaction) for reaction in reactions]
    for message in list_messages:
        urls = re.findall("([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))", message['body'])
        if len(urls) > 0:
            print(urls[0][0])
            message['image'] = urls[0][0]
        else:
            message['image'] = ''
        if reactions is not None:
            message_id = message.get('id')
            message_reactions = [reaction for reaction in list_reactions if reaction['message_id'] == message_id]
            message['reactions'] = message_reactions
        else: 
            message['reactions'] = [{'id': 0, 'user_id': 0, 'message_id': 0, 'emoji': 0, 'name': ''}]
    print(list_messages)
    return json.dumps(list_messages) 

@app.route('/api/getreplies', methods=['GET'])
def get_replies():
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    message_id = request.headers.get('message_id')
    messages = query_db('''SELECT * from messages_and_replies join users on messages_and_replies.user_id = users.id 
                        where message_id = ?''', [message_id])
    if messages is None:
        return {} #fix these to return empty array of correct object
    list_messages = [dict(message) for message in messages]
    return json.dumps(list_messages)

@app.route('/api/postmessage', methods=['POST'])
def post_message():
    print('post messages')
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    if request.method == "POST":
        message = request.json['message']
        user_id = request.json['userid']
        channel_id = request.json['channel']
        print('request', message)
        query_db('insert into messages_and_replies (user_id, channel_id, body) values (?, ?, ?)', [user_id, channel_id, message])
    return {}

@app.route('/api/postreply', methods=['POST'])
def post_reply():
    print('post reply')
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    if request.method == "POST":
        reply = request.json['reply']
        user_id = request.json['userid']
        message_id = request.json['message']
        print('request', reply)
        query_db('insert into messages_and_replies (user_id, message_id, body) values (?, ?, ?)', [user_id, message_id, reply])
    return {}

@app.route('/api/postreaction', methods=['POST'])
def post_reaction():
    print('post reaction')
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    if request.method == "POST":
        message_id = request.json['message_id']
        user_id = request.json['user_id']
        channel_id = request.json['channel_id']
        emoji = request.json['emoji']
        print(emoji)
        query_db('insert into reactions (user_id, message_id, channel_id, emoji) values (?, ?, ?, ?)', [user_id, message_id, channel_id, emoji])
        return {}, 200

@app.route('/api/countunread', methods=['GET'])
def count_unread():
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    user_id = request.headers.get('user_id')
    channel_count = query_db('''select total_messages.channel_id, 
                        coalesce(total_messages.count,0) - coalesce(read_messages.count,0) as unread_count from
                        (select channel_id, count() as count
                        from messages_and_replies
                        group by channel_id) as total_messages
                        left join (select user_id, channel_id, count 
                        from viewed_messages_count where user_id = ?) as read_messages
                        on total_messages.channel_id = read_messages.channel_id
                        ''', [user_id])
    if channel_count is None:
        return {'channel_id': 0, 'unread_count': 0}
    list_channel_count = [dict(count) for count in channel_count]
    print(list_channel_count)
    return json.dumps(list_channel_count)

@app.route('/api/updateread', methods=['GET', 'POST'])
def update_read():
    print('post updated read')
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    channel_id = request.json['channel_id']
    user_id = request.json['user_id']
    num_read = query_db("select count() as count from messages_and_replies where channel_id = ? group by channel_id", [channel_id], one=True)
    if num_read is None: return {}, 200
    record = query_db("select * from viewed_messages_count where channel_id = ? and user_id = ?", [channel_id, user_id])
    print('num read', num_read['count'])
    if record is None:
        print('insert happens')
        query_db('insert into viewed_messages_count (user_id, channel_id, count) values (?, ?, ?)', [user_id, channel_id, num_read['count']])  
    else:
        print('update happens')
        query_db('update viewed_messages_count set count = ? where user_id = ? and channel_id = ?', [num_read['count'], user_id, channel_id])
    return {}, 200

@app.route('/api/get_single_channel', methods=['GET'])
def get_single_channel():
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    channel_name = request.headers.get('channel_name')
    channel = query_db("select * from channels where name = ?", [channel_name], one=True)
    if channel is None:
        return {}
    json_resp = {}
    for key in channel.keys():
        json_resp[key] = channel[key]
    return json_resp

@app.route('/api/get_single_message', methods=['GET'])
def get_single_message():
    api_key = request.headers.get('api_key')
    if api_key is None: return {}, 403
    message_id = request.headers.get('message_d')
    message = query_db('''select messages_and_replies.id, body, channel_id, 
                    channels.name as channel_name, users.name as user_name
                    from messages_and_replies
                    join channels on messages_and_replies.channel_id = channels.id
                    join users on messages_and_replies.user_id = users.id
                    where messages_and_replies.id = ?''', [message_id], one=True)
    if message is None:
        return {}
    json_resp = {}
    for key in message.keys():
        json_resp[key] = message[key]
    return json_resp