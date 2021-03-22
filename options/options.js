new Vue({
  el: '#app',
  data() {
    alert()
    return {
      dir: '',
      chcheDir: '',
    };
  },
  methods: {
    store() {
      if (!this.dir) return alert('请输入工作空间目录');
      chrome.storage.sync.set({ chcheDir: this.dir }, data => {
        this.chcheDir = data.chcheDir
        console.log(`设置成功: 配置的工作空间为chcheDir=${this.chcheDir}`)
      });
    }
  },
  created() {
    chrome.storage.sync.get({ chcheDir: '' }, data => {
      this.chcheDir = data.chcheDir
      console.log(`获取成功: 配置的工作空间为chcheDir=${this.chcheDir}`)
    });
  }
})