
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
        uiType: 'drag',
        // uiType: 'table',
        code: false,
        webstorm: false,
        sublime: false,
        error: '',
        doing: false,
        projects: [],
        dragRole: '',
        dragValue: '',
        dropValue: '',
      };
    },
    methods: {
      refresh() {
        this.doing = true;
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
            this.doing = false;
          })
      },
      open(path, tool) {
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
      dragstart(e) {
        let target = getDragTarget(e);
        console.log('dragstart', target.dataset, target.dataset.value)

        this.dragRole = target.dataset.role;
        this.dragValue = target.dataset.value;

        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("dragRole", this.dragRole);
        e.dataTransfer.setData("dragValue", this.dragValue);
      },
      dragover(e) {
        e.preventDefault();

        if (isSameRole(e)) return;
        const dataset = getDragTarget(e).dataset;
        e.dataTransfer.dropEffect = "move";
        this.dropValue = dataset.value;
        console.log('dragover', this.dropRole, this.dropValue)
      },
      dragend(e) {
        e.preventDefault();
        this.dragRole = '';
        this.dragValue = '';
        this.dropRole = '';
        this.dropValue = '';
      },
      drop(e) {
        const target = getDragTarget(e);
        console.log(e, 'drop')
        if (isSameRole(e)) return;

        const dragRole = e.dataTransfer.getData('dragRole');
        const dragValue = e.dataTransfer.getData('dragValue');
        if (dragRole === 'tool') {
          this.open(target.dataset.value, dragValue);
        } else {
          this.open(dragValue, target.dataset.value);
        }
      }
    },
    created() {
      this.refresh();
    },
    mounted() {

    }
  })
})
