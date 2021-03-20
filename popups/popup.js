
function getCurrentTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (callback) callback(tabs.length ? tabs[0].id : null);
  });
}

getCurrentTabId(id => {
  // const bg = chrome.extension.getBackgroundPage();

  const app = new Vue({
    el: '#app',
    data() {
      return {
        code: false,
        webstorm: false,
        error: '',
        doing: false,
        projects: [],
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
        // this.doing = true;
        this.error = '';
        window.fetch(`http://localhost:21319/open?project=${project}&tool=${tool}`)
          .catch(error => {
            this.error = `请检查服务: ${error}`
          })
          .finally(() => {
            // this.doing = false;
          })
      }
    },
    created() {
      this.refresh();
    },
    mounted() {
     
    }
  })
})
