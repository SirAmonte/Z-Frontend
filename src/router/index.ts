import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '@/views/TabsPage.vue';
import LoginPage from '@/views/components/LoginPage.vue';
import RegisterPage from '@/views/components/RegisterPage.vue';

const routes: Array<RouteRecordRaw> = [
   {
      path: '/',
      redirect: '/login'
   },
   {
      path: '/login',
      component: LoginPage
   },
   {
      path: '/register',
      component: RegisterPage
   },
   {
      path: '/',
      component: TabsPage,
      children: [
         {
            path: '',
            redirect: 'home'
         },
         {
            path: 'home',
            component: () => import('@/views/HomePage.vue')
         },
         {
            path: 'search',
            component: () => import('@/views/SearchPage.vue')
         },
         {
            path: 'notification',
            component: () => import('@/views/NotiPage.vue')
         },
         {
            path: 'message',
            component: () => import('@/views/MessagPage.vue')
         },
         {
            path: 'friends',
            component: () => import('@/views/FriendsPage.vue')
         },
         {
            path: 'profile',
            component: () => import('@/views/ProfilePage.vue')
         },
         {
            path: 'otherprofile',
            component: () => import('@/views/OtherProfilePage.vue')
         }
      ]
   }
];

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes
})

export default router
