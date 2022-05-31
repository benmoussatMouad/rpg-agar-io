// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#3-client-entrypoints
// eslint-disable-next-line import/order

import { connect, play } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { setLeaderboardHidden } from './leaderboard';

const axios = require('axios').default;
const Constants = require('../shared/constants');
// I'm using a tiny subset of Bootstrap here for convenience - there's some wasted CSS,
// but not much. In general, you should be careful using Bootstrap because it makes it
// easy to unnecessarily bloat your site.
import './css/bootstrap-reboot.css';
import './css/main.css';

const playMenu = document.getElementById('play-menu');
const createAccount = document.getElementById('createAccount');
const backButton = document.getElementById('back-button');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const newAccountButton = document.getElementById('newAccount-button');
const newUsernameInput = document.getElementById('newUsername-input');
const newPasswordInput = document.getElementById('newPassword-input');
const createAccountButton = document.getElementById('createAccount-button');


Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  playMenu.classList.remove('hidden');
  usernameInput.focus();
  playButton.onclick = () => {
    // Play!
    const socket = play(usernameInput.value, passwordInput.value);
    socket.on('login_success', onLoginSuccessful);
    socket.on('login_error', onLoginFail);
  };
  newAccountButton.onclick = () => {
    playMenu.classList.add('hidden');
    createAccount.classList.remove('hidden');
  };
  backButton.onclick = () => {
    playMenu.classList.remove('hidden');
    createAccount.classList.add('hidden');
  };
  createAccountButton.onclick = () => {
    const Url = `${Constants.CLOUDDB}/createAccount`;
    axios.post(Url, {
      username: newUsernameInput.value,
      password: newPasswordInput.value,
    }).then(response => {
      console.log(response);
      alert('Account created successfully');
    }).catch(error => {
      console.log(error);
      alert(error.response.data.message);
    });
  };
}).catch(console.error);

function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
}
function onLoginSuccessful(){
  playMenu.classList.add('hidden');
  initState();
  startCapturingInput();
  startRendering();
  setLeaderboardHidden(false);
}
function onLoginFail(){
  alert('Failed to login : username/password incorrect, or player already online.');
}
