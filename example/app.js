const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

class MessageService {
  constructor() {
    this.messages = [];
  }

  async find () {
    return this.messages;
  }

  async create (data) {
    const message = {
      ...data,
      id: this.messages.length
    };

    this.messages.push(message);

    return message;
  }
}

const app = express(feathers());

app.use(express.json());
app.use(express.static(__dirname));
app.configure(express.rest());
app.configure(socketio());
app.use('messages', new MessageService());

app.use(express.errorHandler());

app.on('connection', connection =>
  app.channel('everybody').join(connection)
);
app.publish(() => app.channel('everybody'));

app.service('messages').hooks({
  before: {
    create: async context => {
      context.data.createdAt = new Date();
    }
  }
});

app.service('messages').create({
  text: 'Hello world from the server'
});

app.listen(3030).on('listening', () =>
  console.log('Feathers server listening on http://localhost:3030')
);