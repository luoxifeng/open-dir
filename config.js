const path = require('path');

/**
 * 动画效果的实现是使用animate.css
 * 具体配置请参照 https://animate.style
 * 只需要配置相应的动画名就行了，animate__animated animate__客户端已经配置
 */

module.exports = {
  uiType: 'drag', // block table drag
  paths: [
    '/Users/chongyang/workspace',
    '/Users/chongyang/github'
  ],
  storeFile: path.resolve(__dirname, './store.json'),
  serverPort: 21319,
  appearAnimate: 'fadeInUp', // 默认出现动画
  matchedAnimate: 'fadeInLeft', // 搜索匹配到，出现动画
  showOpenCount: true, // 显示拖拽模式下打开次数，table模式下默认显示
  radiusStyle: true, // 拖拽模式下圆角风格
}
