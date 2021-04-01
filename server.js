const child = require('child_process');
const fs = require('fs');
const http = require('http');
const qs = require('querystring');
const chalk = require('chalk');
const DEFAULT_PATHS = ['chongyang/workspace', 'chongyang/github']

http.createServer((request, response) => {
    const [path, queryStr = ''] = request.url.split('?');
    const query = qs.parse(queryStr);
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

        // scan projects list
        try {
          const paths = DEFAULT_PATHS.map(p => `/Users/${p}`)
          log(`Scaning projects list in paths:\n${chalk.yellow(JSON.stringify(paths, null, 2))}`)
          res.projects = paths
            .reduce((acc, curr) => {
              return [
                ...acc,
                ...fs.readdirSync(curr)
                  .filter(t => !t.startsWith('.') && fs.statSync(`${curr}/${t}`).isDirectory())
              ]
            }, [])
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
        if (!query.project) {
          return response.end('缺少project参数')
        }
        if (!query.tool) {
          return response.end('缺少tool参数')
        }
  
        try {
          child.execSync(`${query.tool} ~/workspace/${query.project}`)
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
  .listen(21319, () => {
    console.log('服务已启动');
  })
