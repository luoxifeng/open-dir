


function inject(target) {
  /**
   *  注册插件
   */
  const register = opts => {
    /**
     * 注册插件只能是开发页面
     */
    if (window.location.port) {
      const app = opts.app;
      const routers = app.$router.options.routes.map(t => {
        return {
          name: t.name,
          title: (t.meta && t.meta.title) || t.title,
          entry: t.meta ? t.meta.isEntry : false
        };
      }).filter(t => t.entry);
      // debugger

      app.$router.afterEach((to, from) => {
        target.postMessage({
          type: 'ROUTER_VIEW_DEVTOOL_CURRENT_ROUTE',
          payload: to.name
        }, '*')
      })

      target.postMessage({
        type: 'ROUTER_VIEW_DEVTOOL_REGISTER',
        payload: {
          routers: routers,
          loginUrl: opts.loginUrl,
          current: app.$router.currentRoute.name
        }
      }, '*')

      target.addEventListener('message', e => {
        if (e.data.type === 'ROUTER_VIEW_DEVTOOL_SWITCH_ROUTER') {
          console.log('ROUTER_VIEW_DEVTOOL_SWITCH_ROUTER', e.data.payload)
          if (app.$router.currentRoute.name === e.data.payload.name) {
            app.$alert ? app.$alert(`已经是当前页面`) : alert(`已经是当前页面`)
            return;
          }
          app.$router.push(e.data.payload, () => {
            console.log('ROUTER_VIEW_DEVTOOL_跳转成功');
          });
        }
      })
    }
  }
  target.__ROUTER_VIEW_DEVTOOL__ = register;

  /**
   * 自动登录实现
   * url必须包含from=routerviewdevtool标识
   */
  let url = window.location.href;
  if (url.includes('from=routerviewdevtool')) {
    function insertValue(el, value) {
      el.value = value
      el.dispatchEvent(new InputEvent('input', {
        data: value
      }))
    }
    // 页面加载完成
    document.addEventListener('DOMContentLoaded', function () {
      // 提取phone, code,
      const { '1': phone, '2': code } = url.match(/phone=(\d{11})&code=(\d{6})/) || {};
      const [phoneEl, codeEl] = document.querySelectorAll('input[placeholder=手机号],input[placeholder=验证码]')
      const loginEl = [...document.querySelectorAll('button')].find(t => t.textContent.replace(/\s/g, '').includes('登录'))
      if (phone && code && phoneEl && codeEl && loginEl) {
        console.log(`%cROUTER_VIEW_DEVTOOL_LOGIN_PREPARE:%c phone=${phone} code=${code}`, 'background: #222; color: #bada55', 'color: blue')
        insertValue(phoneEl, phone)
        insertValue(codeEl, code)
        loginEl.click();

        // 发通知到content js 准备登录
        // target.postMessage({
        //   type: 'ROUTER_VIEW_DEVTOOL_LOGIN_PREPARE',
        //   payload: { phone, code }
        // }, '*')
        // debugger
        
       
        
      }
    }, false);
  }
}

function injectScript() {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.textContent = `;(${inject.toString()})(window)`;
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

function initLogin() {
  chrome.storage.sync.get({ color: 'red', age: 18 }, function (items) {
    console.log(items.color, items.age);
  });
  _ROUTER_VIEW_LOGIN_
}



// 接收inject 消息发送到内部
window.addEventListener("message", function (e) {
  /**
   * 路由相关
   */
  // 初始化路由配置
  if (e.data.type === 'ROUTER_VIEW_DEVTOOL_REGISTER') {
    chrome.runtime.sendMessage({
      ...e.data,
      type: 'ROUTER_VIEW_DEVTOOL_INIT',
    });
  }
  if (e.data.type === 'ROUTER_VIEW_DEVTOOL_CURRENT_ROUTE') {
    chrome.runtime.sendMessage(e.data);
  }

  /**
   * 登录相关
   */
  // // 接收到inject js通知 准备登录
  // if (e.data.type === 'ROUTER_VIEW_DEVTOOL_LOGIN_PREPARE') {
  //   setTimeout(() => {
  //     debugger
  //     chrome.runtime.sendMessage(e.data);
  //   }, 10000)
  // }

  // 登录准备阶段
  if (e.data.type === 'ROUTER_VIEW_DEVTOOL_LOGIN_PREPARE') {
    debugger
    const [phoneEl, codeEl] = document.querySelectorAll('input[placeholder=手机号],input[placeholder=验证码]')
    const loginEl = [...document.querySelectorAll('button')].find(t => t.textContent.replace(/\s/g, '').includes('登录'))


    console.log(phoneEl, codeEl, loginEl);
  }


}, false);

// 接受内部消息发给inject
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'ROUTER_VIEW_DEVTOOL_SWITCH_ROUTER') {
    window.postMessage(request, '*')
  }

  sendResponse(request.type);
});


injectScript();

// phoneEl.onclick = (e) => {
//   console.log(e);
//   e.target.value = 12345678902
// }

// phoneEl.onblur = (e) => {
//   console.log(e);
//   e.target.value = 12345678902
// }
// phoneEl.oninput = (e) => {
//   console.log(e);
//   e.target.value = 12345678902
// }
// const [phoneEl, codeEl] = document.querySelectorAll('input[placeholder=手机号],input[placeholder=验证码]')

// function inputvalue(el, value) {
//   el.value = value
//   el.dispatchEvent(new InputEvent('input', {
//     data: value
//   }))
// }

// inputvalue(phoneEl, 12345678902)
// inputvalue(codeEl, 151488)




