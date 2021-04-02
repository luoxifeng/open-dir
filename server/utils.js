const fs = require('fs');
const chalk = require('chalk');
const config = require('../config');

const _ = module.exports;

_.readStore = () => {
  let store = {};
  try {
    store = JSON.parse(fs.readFileSync(config.storeFile).toString())
  } catch (error) { 
    console.log(chalk.redBright(error.message))
  }
  return store;
}

_.writeStore = store => {
  try {
    fs.writeFileSync(config.storeFile, JSON.stringify(store, null, 2))
  } catch (error) {
    console.log(chalk.redBright(error.message))
  }
}

_.createHotLevel = (counts = [0]) => {
  if (!counts.length) counts = [0];
  const min = Math.min(...counts);
  const avg = counts.reduce((a, b) => a + b) / counts.length;
  const max = Math.max(...counts);
  const half0 = (min + avg) / 2;
  const half1 = (max + avg) / 2;
  
  return (count = 0) => {
    if (count > min - 1 && count <= half0) return 'freez';
    if (count > half0 && count <= avg) return 'cold';
    if (count > avg && count <= half1) return 'warm';
    if (count > half1 && count <= max) return 'hot';
  }
}