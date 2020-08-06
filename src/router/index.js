import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Goods from '../views/goods/GoodList.vue';
import Shops from '../views/goods/ShopList.vue';
import Welcome from '../views/Welcome.vue';
// import Login from '../views/login/Login.vue';
// import Users from '../views/user/User.vue';
// import Roles from '../views/power/Roles.vue';
// import PowerList from '../views/power/PowerList.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  // {
  //   path: '/login',
  //   component: Login
  // },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect:'/welcome',
    children: [
      // {
      //   path: '/user',
      //   component: Users
      // },
      // {
      //   path: '/role',
      //   component: Roles
      // },
      // {
      //   path: '/rule',
      //   component: PowerList
      // }
      {
        path:'/goods',
        component:Goods
      },
      {
        path:'/welcome',
        component:Welcome
      },
      {
        path:'/shops',
        component:Shops
      }
    ]
  },
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作 next('/login')强制跳转login
// router.beforeEach((to, from, next) => {
//   // 访问登录页，放行
//   if (to.path === '/login') return next()
//   // 获取token
//   const tokenStr = window.sessionStorage.getItem('token')
//   // 没有token, 强制跳转到登录页
//   if (!tokenStr) return next('/login')
//   next()
// })
// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router