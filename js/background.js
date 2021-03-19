

// window.__OPTIONS__ = {};

// // window.__LOGIN__ = {}
// window.getOptionsById = id => (window.__OPTIONS__[id] || {});

// function getTab(params = {}, callback) {
//   chrome.tabs.query({ active: true, currentWindow: true, ...params }, function (tabs) {
//     if (callback) callback(tabs.length ? tabs[0] : null);
//   });
// }

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

//   if (request.type === 'ROUTER_VIEW_DEVTOOL_INIT') {

//     // 设置配置
//     __OPTIONS__[sender.tab.id] = request.payload;

//     /**
//      * 更改icon
//      */
//     chrome.browserAction.setIcon({
//       tabId: sender.tab.id,
//       path: {
//         16: `icons/enabled.png`,
//         48: `icons/enabled.png`,
//         128: `icons/enabled.png`
//       }
//     })

//     // 更改popup
//     chrome.browserAction.setPopup({
//       tabId: sender.tab.id,
//       popup: `popups/enabled.html`
//     })

//     sendResponse('ROUTER_VIEW_DEVTOOL_INIT: COMPLETE');
//   }

//   if (request.type === 'ROUTER_VIEW_DEVTOOL_CURRENT_ROUTE') {
//     __OPTIONS__[sender.tab.id].current = request.payload;
//   }
// });

// chrome.tabs.onCreated.addListener(() => {

//   getTab({}, tab => {
//     if (!tab || !tab.pendingUrl) return;
//     // 特定url
//     if (tab.pendingUrl.includes('from=routerviewdevtool')) {
//       console.log(tab, '=====')
//       // 提取phone, code,
//       const { '1': phone, '2': code } = tab.pendingUrl.match(/phone=(\d{11})&code=(\d{6})/) || {};

//       if (phone && code) {
//         console.log(`保存开始:phone=${phone}&code=${code}`, tab)

//         chrome.storage.sync.set({ _ROUTER_VIEW_LOGIN_: { phone, code } }, function () {
//           console.log(`保存成功:phone=${phone}&code=${code}`, tab)
//         });

//         // window.__LOGIN__
//         // debugger
//         // chrome.tabs.sendMessage(
//         //   tab.id,
//         //   {
//         //     type: 'ROUTER_VIEW_DEVTOOL_LOGIN_PREPARE',
//         //     payload: { 
//         //       phone,
//         //       code
//         //     }
//         //   },
//         //   function (response) {
//         //     console.log(response);
//         //   }
//         // );
//       }
//     }
//   })

// })

