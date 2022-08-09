import Vue from 'vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookie from 'vue-cookie'
import VueLazyload from 'vue-lazyload'
import { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import store from './store/index'
import { getToken } from './util/auth'
import { MessageBox } from 'element-ui'
import Cookies from 'js-cookie'
// import env from './env'

//根据前端跨域进行调整，`baseURL` 将自动加在 `url` 前面
axios.defaults.baseURL = '/api'
// axios.defaults.baseURL = env.baseURL
//设置超时时间
axios.defaults.timeout = 15000



// request拦截器
axios.interceptors.request.use(
  config => {

    if (getToken()) {
      // 演示方便，header里面放userid，跳过验证
      config.headers['userid'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)


//接口错误拦截
axios.interceptors.response.use(function(response){   //拦截页面返回数据状态码
  let res = response.data   //返回的数据为response.data，包括status和data
  if(res.status == 0){      //状态码为0代表登陆成功
    return res.data
  }else if(res.status == 10){    //状态码为10代表未登陆，跳转到登陆页面
    if(location.hash!="#/index"){     //如果没有登录则只能访问首页
      window.location.href = "/#/login"   //跳转到登陆页面
    }
    return Promise.reject()   //发生错误，promise返回拒绝值
  }else{
    Message.error(res.msg)
    return Promise.reject()   //发生错误，promise返回拒绝值
  }
},(error)=>{    //拦截http请求状态码（请求发送失败）
  let res = error.response
  Message.error(res.data.message)
  return Promise.reject()   //发生错误，promise返回拒绝值
})

//mock开关，需要使用mock的时候使用
const mock = false
if(mock){
  //注意这里要用require，注意这里不能使用import，import是预编译加载，不使用的时候会报错，require不使用的时候不会报错
  require('./mock/api')
}

//把message组件挂载到vue实例，供全局使用
Vue.prototype.$message = Message;
Vue.prototype.$messageBox=MessageBox;
//VueAxios的作用是将axios框架挂载到vue实例上，这样我们在其他vue文件中使用axios就不用importer了，直接用this.axios
Vue.use(VueAxios,axios)
Vue.use(VueLazyload,{
  loading: '/imgs/loading-svg/loading-bars.svg'   //懒加载loading动画
})
Vue.use(VueCookie)
Vue.config.productionTip = false

new Vue({
  store,
  router: router,
  render: h => h(App),
}).$mount('#app')
