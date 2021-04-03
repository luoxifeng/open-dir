const child = require('child_process');
const fs = require('fs');
const http = require('http');
const qs = require('querystring');
const chalk = require('chalk');
const config = require('../config');
const utils = require('./utils');

http.createServer((request, response) => {
    const [path, queryStr = ''] = request.url.split('?');
    const query = qs.parse(queryStr);
    const store = utils.readStore();
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.statusCode = 500;

    try {
      /**
       * 刷新项目列表
       */
      if (path === '/refresh') {
        const log = (msg = 'Start') => console.log(chalk.cyanBright(`Refresh Projects List: ${msg}`));
        
        log();
        const res = {
          code: true,
          webstorm: true,
          radiusStyle: config.radiusStyle,
          projects: [],
        };

        // check vscode
        try {
          log(`Check if vscode is installed`)
          child.execSync(`code --version`)
          log(`Vscode is installed`)
        } catch (error) {
          res.code = false;
          log(chalk.redBright(`VSCcode is not installed`))
        }

        // check webstorm
        try {
          log(`Check if webstorm is installed`)
          child.execSync(`webstorm --version`)
          log(`WebStorm is installed`)
        } catch (error) {
          res.webstorm = false;
          log(chalk.redBright(`WebStorm is not installed`))
        }

        // scan projects list and map data
        try {
          const counts = [];
          let getHotLevel = () => 'freeze';
          const paths = config.paths;
          log(`Scaning projects list in paths:\n${chalk.yellow(JSON.stringify(paths, null, 2))}`)
          res.projects = paths
            .reduce((acc, curr) => {
              return [
                ...acc,
                ...fs.readdirSync(curr)
                  .filter(t => !t.startsWith('.') && fs.statSync(`${curr}/${t}`).isDirectory())
                  .map(name => {
                    const path = `${curr}/${name}`;
                    const count = store[path] || 0;
                    counts.push(count)
                    return {
                      name,
                      showOpenCount: config.showOpenCount,
                      count,
                      path,
                      show: true,
                      matched: false, // 搜索匹配到
                      appearAnimate: config.appearAnimate,
                      matchedAnimate: config.matchedAnimate,
                      dragHovered: false, // 曾被拖拽到另一方上面hover过，或者另一个拖到当前这个上方hover过
                      opened: false, // 曾被打开过
                    }
                  })
              ]
            }, [])
            .map((t, i) => {
              if (!i) getHotLevel = utils.createHotLevel(counts);
              return {
                ...t,
                hot: getHotLevel(t.count)
              }
            })
            .sort((a, b) => -(a.count - b.count))

          log(`Scan out these projects:\n${chalk.yellow(JSON.stringify(res.projects, null, 2))}`)
        } catch (error) {
          log(`Scan projects error:\n${chalk.red(error.message)}`)
          return response.end(`服务出错，请检查服务: ${error.message}`)
        }

        log(`${chalk.green('Success')}`)
        response.statusCode = 200;
        return response.end(JSON.stringify(res))
      } 
      
      /**
       * 打开项目
       */
      if (path === '/open') {
        const { path, tool } = query;
        if (!path) return response.end('缺少path参数')
        if (!tool) return response.end('缺少tool参数')

        /**
         * update store
         */
        store[path] = (store[path] || 0) + 1;
        utils.writeStore(store)
  
        try {
          child.execSync(`${tool} ${query.path}`)
        } catch (error) {
          const err = [
            `项目打开失败:`,
            error.message,
            '可能是有以下原因：',
            '1. 你电脑上没有安装相应的程序',
            '2. 程序已经安装，没有配置环境变量',
          ]
          return response.end(err.join('\n'))
        }

        response.statusCode = 200;
        return response.end('项目已经打开')
      }

    } catch (error) {
      response.end(`
        服务出错，请检查服务
        ${error.message}
      `)
    }
})
  .listen(config.serverPort, () => {
    console.log(chalk.greenBright(`Server start on port ${config.serverPort}`));
  })



  function curry(fn, ...list) {
    if (list.length >= fn.length) return fn(...list)
    return (...args) => curry(fn, ...list, ...args)
  }

  function curry(fn, ...list) {
    const allArgs = [...list];

    function curryed(...args) {
      allArgs.push(...args)
      return allArgs.length >= fn.length ? fn(...allArgs) : curryed
    }
    return curryed();
  }
  
  function sum(a, b, c, d) {
    return a + b + c + d;
  }
  curry(sum)(1)(2)(3, 4)
  curry(sum)(1,2)(3, 4, 5)
