
function getCurrentTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (callback) callback(tabs.length ? tabs[0].id : null);
  });
}

getCurrentTabId(id => {
  // const bg = chrome.extension.getBackgroundPage();

  const isSameRole = e => e.target.dataset.role === e.dataTransfer.getData('dragRole')

  const app = new Vue({
    el: '#app',
    data() {
      return {
        code: false,
        webstorm: false,
        sublime: false,
        error: '',
        doing: false,
        projects: [],
        dragRole: '',
        dragName: '',
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
      dragstart(ev) {
        console.log('dragstart', ev.target, ev.srcElement)

        console.log('dragstart', ev.target.dataset, ev.target.dataset.name)

        this.dragRole = ev.target.dataset.role;
        this.dragName = ev.target.dataset.name;

        ev.dataTransfer.dropEffect = "copy";
        ev.dataTransfer.setData("dragRole", this.dragRole);
        ev.dataTransfer.setData("dragName", this.dragName);

        // console.log(ev, 'dragstart')
      },
      dragend() {
        this.dragInfo = {
          role: '',
          name: ''
        };
      },
      dragover(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "copy";
        console.log(ev, 'dragover')
      },
      drop(ev) {
        console.log(ev, 'drop')

        console.log(ev.dataTransfer.getData('dragRole'))
        console.log(ev.dataTransfer.getData('dragName'))

        if (isSameRole(ev)) {
          console.log('isSameRole', 'drop')
        }
        console.log(ev, 'drop')
      }
    },
    created() {
      this.refresh();
    },
    mounted() {

    }
  })
})
