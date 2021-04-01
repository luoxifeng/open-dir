const child = require('child_process');
const fs = require('fs');
const http = require('http');
const qs = require('querystring');

const scanProjects = (paths = ['chongyang/workspace', 'chongyang/github']) => {
  let projects = paths.reduce((acc, curr) => [...acc, ...fs.readdirSync(`/Users/${curr}`)], [])
  return projects ? projects.filter(t => !t.startsWith('.')) : [];
}

http.createServer((request, response) => {
    const [path, queryStr = ''] = request.url.split('?');
    const query = qs.parse(queryStr);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    
    try {
      if (path === '/refresh') {
        const res = {
          code: true,
          webstorm: true,
          projects: scanProjects(),
        };
        try {
          child.execSync(`code --version`)
        } catch (error) {
          res.code = false;
          console.error(error);
        }
        try {
          child.execSync(`webstorm --version`)
        } catch (error) {
          res.webstorm = false;
          console.error(error);
        }
        console.log(JSON.stringify(res));

        return response.end(JSON.stringify(res))
      } else if (path === '/open') {
        if (!query.project) {
          response.statusCode = 500;
          return response.end('缺少project参数')
        }
        if (!query.tool) {
          response.statusCode = 500;
          return response.end('缺少tool参数')
        }
  
        try {
          child.execSync(`${query.tool} ~/workspace/${query.project}`)
        } catch (error) {
          response.statusCode = 500;
          const err = [
            `项目打开失败:`,
            error.message,
            '可能是有以下原因：',
            '1. 你电脑上没有安装相应的程序',
            '2. 程序已经安装，没有配置环境变量',
          ]
          return response.end(err.join('\n'))
        }
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
