(function(){

	window.ChatBar = function(user) {
		var self = this;

		self.chatBar = $("<div>", {"class": "chat-bar"});
		$("body").append(self.chatBar);

		var client = self.client = new ChatClient({
			url: "http://localhost:8081",
			groupId: 329,
			invisible: true,
			user: user
		});

		client.connect(function(){
			client.getUsers(function(users){
				self.users = users;
				populateUserList.call(self);
			})
		});

		self.openChats = [];

		var userList = self.userList = $("<div>", {"class": "chat-user-list"})
		self.chatBar.append(userList);

		client.pushListener({
			type: "chat-message",
			callback: function(data) {
				if(!self.openChats[data.fromId]) {
					self.users.forEach(function(user){
						if(user.id===data.fromId){
							openChat.call(self, user, data.body)
						}
					})
				}
			}
		})

		client.pushListener({
			type: "chat-user-connect",
			callback: function(user) {
				var userIsNew = $.grep(self.users, function(existingUser){
					return existingUser.id==user.id
				}).length==0;

				if(userIsNew){
					self.users.push(user)
					populateUserList.call(self);
				}
			}
		})

		client.pushListener({
			type: "chat-user-disconnect",
			callback: function(user) {
				self.users = $.grep(self.users, function(existingUser){
					return existingUser.id!=user.id
				})
				populateUserList.call(self);
			}
		})


	}

	var populateUserList = function(){
		var self = this;
		self.userList.empty();
		self.users.forEach(function(user){
			var userElem = $("<div>")
				.html(user.username)
				.click(function(){
					if(!self.openChats[user.id]) {
						openChat.call(self, user)
					}
					else self.openChats[user.id].focus()
				})
			self.userList.append(userElem)
		})
	}

	var openChat = function(user, message){
		var self = this;
		var container = $("<div>", {"class": "chat-box"});
		this.chatBar.append(container)
		var chat = new Chat({
			container: container,
			chatClient: self.client,
			users: [user]
		})
		self.openChats[user.id] = chat;
		if(message) {
			chat.addMessage(user.username, message)
		}

		chat.focus()
	}

}()) 
