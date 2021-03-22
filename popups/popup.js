
function getCurrentTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (callback) callback(tabs.length ? tabs[0].id : null);
  });
}

getCurrentTabId(id => {
  // const bg = chrome.extension.getBackgroundPage();
  const getDragTarget = e => {
    let target = e.target;
    if (target.tagName ===  'IMG') target = e.target.parentElement
    return target;
  };
  const isSameRole = e => getDragTarget(e).dataset.role === e.dataTransfer.getData('dragRole')
  
  const app = new Vue({
    el: '#app',
    data() {
      return {
        uiType: 'table',
        code: false,
        webstorm: false,
        sublime: false,
        error: '',
        doing: false,
        projects: [],
        dragRole: '',
        dragName: '',
        dropName: '',
      };
    },
    methods: {
      refresh() {
        this.doing = true;
        this.error = '';
        this.projects = [];
        window.fetch('http://localhost:21319/refresh')
          .then((res) => {
            return res.json()
          })
          .then(data => {
            Object.assign(this, data)
          })
          .catch(error => {
            this.error = `请检查服务: ${error}`
          })
          .finally(() => {
            this.doing = false;
          })
      },
      open(project, tool) {
        console.log(`%copen: %cproject=${project} tool=${tool}`,  'background: #222; color: #bada55', 'color: blue');
        this.error = '';
        window.fetch(`http://localhost:21319/open?project=${project}&tool=${tool}`)
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
      dragstart(e) {
        let target = getDragTarget(e);
        console.log('dragstart', target.dataset, target.dataset.name)

        this.dragRole = target.dataset.role;
        this.dragName = target.dataset.name;

        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("dragRole", this.dragRole);
        e.dataTransfer.setData("dragName", this.dragName);
      },
      dragover(e) {
        e.preventDefault();

        if (isSameRole(e)) return;
        const dataset = getDragTarget(e).dataset;
        e.dataTransfer.dropEffect = "move";
        this.dropName = dataset.name;
        console.log('dragover', this.dropRole, this.dropName)
      },
      dragend(e) {
        e.preventDefault();
        this.dragRole = '';
        this.dragName = '';
        this.dropRole = '';
        this.dropName = '';
      },
      drop(e) {
        const target = getDragTarget(e);
        console.log(e, 'drop')
        if (isSameRole(e)) return;

        const dragRole = e.dataTransfer.getData('dragRole');
        const dragName = e.dataTransfer.getData('dragName');
        if (dragRole === 'tool') {
          this.open(target.dataset.name, dragName);
        } else {
          this.open(dragName, target.dataset.name);
        }
        // console.log(ev.dataTransfer.getData('dragName'))
      }
    },
    created() {
      this.refresh();
    },
    mounted() {

    }
  })
})
