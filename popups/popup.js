
function getCurrentTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (callback) callback(tabs.length ? tabs[0].id : null);
  });
}

const debounce = (fun, time) => {
  let timer = 0;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fun, time);
  }
}

getCurrentTabId(id => {
  const getDragTarget = e => {
    let target = e.target;
    if (target.tagName ===  'IMG') target = e.target.parentElement
    return target;
  };
  const isSameRole = e => getDragTarget(e).dataset.role === e.dataTransfer.getData('dragRole')
  const openAndRecover = current => {
    current.opened = true;
    setTimeout(() => current.opened = false, 1000)
  } 
  
  const app = new Vue({
    el: '#app',
    data() {
      return {
        uiConfig: CONFIG,
        code: false,
        webstorm: false,
        sublime: false,
        error: '',
        fetching: false,
        projects: [],
        dragRole: '',
        dragValue: '',
        dropValue: '',
        showOptPanel: false,
        target: '',
        draged: true, // 曾经拖拽过
      };
    },
    watch: {
      target(val) {
        if (this.fetching) return;
        const trimed = (val || '').trim().toLowerCase();
        this.draged = false;
        this.projects.forEach(t => {
          t.show = t.name.toLowerCase().includes(trimed);
          t.matched = trimed && t.show
          t.dragHovered = false; // 是不是曾被drag hover 搜索的时候重置
          t.opened = false; // 是不是曾被打开过
        })
      }
    },
    methods: {
      refresh() {
        this.draged = false;
        this.target = '';
        this.fetching = true;
        this.error = '';
        this.projects = [];
        window.fetch('http://localhost:21319/refresh')
          .then((res) => {
            if (res.status !== 200) {
              return res.text().then(Promise.reject.bind(Promise));
            }
            return res.json()
          })
          .then(data => {
            Object.assign(this, data)
          })
          .catch(error => {
            this.error = error
          })
          .finally(() => {
            const close = () => this.fetching = false;
            if (!this.uiConfig.delayLoadingClose) return close();
            setTimeout(close, this.uiConfig.delayLoadingClose)
          })
      },
      open(tool, path) {
        console.log(`%copen: %cpath=${path} tool=${tool}`,  'background: #222; color: #bada55', 'color: blue');
        this.error = '';
        window.fetch(`http://localhost:21319/open?path=${path}&tool=${tool}`)
          .then(function (response) {                      // first then()
            if (response.ok) {
              return response.text();
            }
            response.text().then(alert);
          })
          .catch(error => {
            alert(`请检查服务: ${error}`);
          })
      },
      clickOpen(project) {
        project.dragHovered = true;
        openAndRecover(project)
        this.open(this.uiConfig.clickUseTool, project.path)
      },
      dragstart(e) {
        let target = getDragTarget(e);
        console.log('dragstart', target.dataset, target.dataset.value)

        this.dragRole = target.dataset.role;
        this.dragValue = target.dataset.value;
        this.draged = true

        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("dragRole", this.dragRole);
        e.dataTransfer.setData("dragValue", this.dragValue);
      },
      dragover(e) {
        e.preventDefault();
        if (isSameRole(e)) return;
        const { role, value } = getDragTarget(e).dataset;
        e.dataTransfer.dropEffect = "move";
        this.dropValue = value;
        let current = this.find(role === 'project' ? value : e.dataTransfer.getData('dragValue'));
        current.dragHovered = true;
      },
      dragend(e) {
        e.preventDefault();
        this.dragRole = '';
        this.dragValue = '';
        this.dropValue = '';
      },
      drop(e) {
        const target = getDragTarget(e);
        console.log(e, 'drop')
        if (isSameRole(e)) return;

        const dragRole = e.dataTransfer.getData('dragRole');
        const dragValue = e.dataTransfer.getData('dragValue');
        const { value } = target.dataset;
        let current = {};
        if (dragRole === 'tool') {
          current = this.find(value)
          this.open(dragValue, value /* as project path */);
        } else {
          current = this.find(dragValue)
          this.open(value /* as tool name */, dragValue);
        }
        openAndRecover(current);
      },
      find(val) {
        return this.projects.find(t => t.path === val) || {};
      }
    },
    created() {
      this.refresh();
    },
    mounted() {
    }
  })
})
