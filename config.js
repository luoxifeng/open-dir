const path = require('path');
const paths = require('./paths');


/**
 * 动画效果的实现是使用animate.css
 * 具体配置请参照 https://animate.style
 * 只需要配置相应的动画名就行了，animate__animated animate__客户端已经配置
 */

module.exports = {
  paths,
  storeFile: path.resolve(__dirname, './store.json'),
  serverPort: 21319,
}