import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import VuePluginHiprint from 'vue-plugin-hiprint';
import 'element-plus/dist/index.css'
import router from './router'
import '/src/client/customize.ts'

const app = createApp(App)
app.use(ElementPlus)
app.use(VuePluginHiprint);
app.use(router)
app.mount('#app')

