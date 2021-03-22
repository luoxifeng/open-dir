
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
        sublime: false,
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
      }
    },
    created() {
      this.refresh();
    },
    mounted() {

    }
  })
})
