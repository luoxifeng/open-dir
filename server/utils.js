const _ = module.exports;

_.readStore = () => {
  let store = {};
  try {
    store = JSON.parse(fs.readFileSync(config.storeFile).toString())
  } catch (error) { }
  return store;
}

_.writeStore = store => {
  try {
    fs.writeFileSync(config.storeFile, JSON.stringify(store, null, 2))
  } catch (error) {
    console.log(chalk.redBright(error.message))
  }
}