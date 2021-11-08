// Shoutout to Nader for helping w/ this!
// https://twitter.com/dabit3

const fs = require('fs');
const anchor = require('@project-serum/anchor');

const account = anchor.web3.Keypair.generate();
console.log(account);
fs.writeFileSync('./utilities/keypair.json', JSON.stringify(account));
