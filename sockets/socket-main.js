/**
 * Created by kellysmith on 2/20/16.
 *
 * 2014 pokingBears.com
 */
'use strict';
var socketio = function (io) {

	var people = {};
	var rooms = {};
	var clients = [];

	var roomID = '';

	io.on('connection', function (client) {

		client.on('join', function (name){
			roomID = null;
			people[client.id] = {"name" : name, "room" : roomID};
			client.emit("update", "You have connected to the server.");
			io.sockets.emit("update", people[client.id].name + " is online.")
			io.sockets.emit("update-people", people);
			client.emit("roomList", {rooms: rooms});
			clients.push(client);

		});

		client.on('createRoom', function(name){
			if (people[client.id].room === null) {
				var id = uuid.v4();
				var chatroom = new ChatRoom(name, id, client.id);
				rooms[id] = room;

				// Update room list on client
				io.sockets.emit('roomList', {rooms:rooms});
				client.chatroom = name;

				// join creator of room
				client.join(client.chatroom);
				chatroom.addPerson(client.id);

				//update the room key with the ID of the created room
				people[client.id].chatroom = id;
			} else {
				io.sockets.emit("update", "You have already created a room.");
			}
		});

		client.on("joinRoom", function(id) {
			var chatroom = rooms[id];
			if (client.id === chatroom.owner) {
				client.emit("update", "You are the owner of this room and you have already been joined.");
			} else {
				chatroom.people.contains(client.id, function(found) {
					if (found) {
						client.emit("update", "You have already joined this room.");
					} else {
						if (people[client.id].inroom !== null) { //make sure that one person joins one room at a time
							client.emit("update", "You are already in a room ("+rooms[people[client.id].inroom].name+"), please leave it first to join another room.");
						} else {
							chatroom.addPerson(client.id);
							people[client.id].inroom = id;
							client.room = chatroom.name;
							client.join(client.chatroom);

							//add person to the room
							user = people[client.id];
							io.sockets.in(client.chatroom).emit("update", user.name + " has connected to " + chatroom.name + " room.");
							client.emit("update", "Welcome to " + chatroom.name + ".");
							client.emit("sendRoomID", {id: id});
						}
					}
				});
			}

			console.log(io.sockets.manager.roomClients[client.id]); //should return { '': true }
			client.room = 'myroom';
			client.join('myroom');
			console.log(io.sockets.manager.roomClients[client.id]); //should return { '': true, '/myroom': true }
		});

		client.on("leaveRoom", function(id) {
			var chatroom = rooms[id];
			if (client.id === chatroom.owner) {
				var i = 0;
				while(i < clients.length) {
					if(clients[i].id == chatroom.people[i]) {
						people[clients[i].id].inroom = null;
						clients[i].leave(chatroom.name);
					}
					++i;
				}
				delete rooms[id];
				people[chatroom.owner].owns = null; //reset the owns object to null so new room can be added
				socket.sockets.emit("roomList", {rooms: rooms});
				socket.sockets.in(client.chatroom).emit("update", "The owner (" +user.name + ") is leaving the room. The room is removed.");
			} else {
				chatroom.people.contains(client.id, function(found) {
					if (found) { //make sure that the client is in fact part of this room
						var personIndex = chatroom.people.indexOf(client.id);
						chatroom.people.splice(personIndex, 1);
						io.sockets.emit("update", people[client.id].name + " has left the chatroom.");
						client.leave(chatroom.name);
					}
				});
			}
		});

		client.on("removeRoom", function(id) {
			var chatroom = rooms[id];
			if (chatroom) {
				if (client.id === chatroom.owner) { //only the owner can remove the chatroom
					var personCount = chatroom.people.length;
					if (personCount > 2) {
						console.log('there are still people in the chatroom warning'); //This will be handled later
					}  else {
						if (client.id === chatroom.owner) {
							io.sockets.in(client.chatroom).emit("update", "The owner (" +people[client.id].name + ") removed the room.");
							var i = 0;
							while(i < clients.length) {
								if(clients[i].id === chatroom.people[i]) {
									people[clients[i].id].inroom = null;
									clients[i].leave(chatroom.name);
								}
								++i;
							}
							delete rooms[id];
							people[chatroom.owner].owns = null;
							io.sockets.emit("roomList", {rooms: rooms});

						}
					}
				} else {
					client.emit("update", "Only the owner can remove a room.");
				}
			}
		});

		client.on('message', function (from, msg) {

			console.log('recieved message from',
				from, 'msg', JSON.stringify(msg));

			console.log('broadcasting message');
			console.log('payload is', msg);
			io.sockets.emit('broadcast', {
				payload: msg,
				source: from
			});
			console.log('broadcast complete');
		});
	});
};

module.exports = socketio;