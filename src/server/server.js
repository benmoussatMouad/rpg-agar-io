const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');
const axios = require('axios').default;
const Constants = require('../shared/constants');
const Game = require('./game');
const webpackConfig = require('../../webpack.dev.js');

// Setup an Express server
const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3001;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Setup the Game
const game = new Game();

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);
  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on(Constants.MSG_TYPES.FIX, handleFix);
  socket.on(Constants.MSG_TYPES.CREATE_ACCOUNT, createAccount);
  socket.on('disconnect', onDisconnect);
});


async function joinGame(username, password) {
  const Url = `${Constants.CLOUDDB}/login`;
  let requestResponse = null;
  await axios.post(Url, {
    username : username,
    password : password,
  }).then(response => {
    requestResponse = Object.assign({}, response);
  }).catch(error => {
    console.log(error);
    requestResponse = Object.assign({}, error);
  });
  console.log(requestResponse);
  if (requestResponse.status === 200) {
    const player = requestResponse.data.user;
    console.log(requestResponse);
    game.addPlayer(this,
      player.username, player.x, player.y, player.hp, player.score, player.avatar);
    this.emit('login_success');
  } else this.emit('login_error');
}

function handleInput(dir) {
  game.handleInput(this, dir);
}
function handleFix() {
  game.handleFix(this);
}

function onDisconnect() {
  game.removePlayer(this);
}

function createAccount(username, password, avatar) {
  const Url = `${Constants.CLOUDDB}/createAccount`;
  axios.post(Url, {
    username: username,
    password: password,
    avatar: avatar,
  }).then(response => {
    console.log(response);
    this.emit('account_creation_successful');
  }).catch(error => {
    console.log(error);
    this.emit('account_creation_failure');
  });
}
