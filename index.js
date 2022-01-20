const { readFile, writeFile, readFileSync, writeFileSync } = require('fs');

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');

var rawLists = readFileSync('lists.json');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

io.on('connection', (socket) => {
  socket.emit('list', JSON.parse(rawLists));

  socket.on('add list', (message) => {
    let lists = JSON.parse(rawLists);
    lists.push({
      "id": uuidv4(),
      "title": message['list'],
      "data": []
    });

    rawLists = JSON.stringify(lists);
    writeFileSync('lists.json', rawLists);
    io.emit('list', JSON.parse(rawLists));
  })

  socket.on('remove list', (message) => {
    let lists = JSON.parse(rawLists);
    let id = message["list-id"];
    lists = lists.filter((list) => list.id !== id);

    rawLists = JSON.stringify(lists);
    writeFileSync('lists.json', rawLists);
    io.emit('list', JSON.parse(rawLists));
  })

  socket.on('add item', (message) => {
    let lists = JSON.parse(rawLists);
    let id = message["list-id"];
    let item = message["item"];
    lists
      .filter((list) => list.id === id)
      .forEach((list) => list.data.push(item));

    rawLists = JSON.stringify(lists);
    writeFileSync('lists.json', rawLists);
    io.emit('list', JSON.parse(rawLists));
  })

  socket.on('remove item', (message) => {
    let lists = JSON.parse(rawLists);
    let id = message["list-id"];
    let itemName = message["item"];
    lists
      .filter((list) => list.id === id)
      .forEach((list) => list.data = list
        .data
        .filter((item) => item !== itemName));

    rawLists = JSON.stringify(lists);
    writeFileSync('lists.json', rawLists);
    io.emit('list', JSON.parse(rawLists));
  })
});

http.listen(3001, () => {
  console.log('listening on *:3001');
});