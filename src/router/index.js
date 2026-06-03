import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/catalog', name: 'Catalog', component: () => import('../views/Catalog.vue') },
  { path: '/update', name: 'WeeklyUpdate', component: () => import('../views/WeeklyUpdate.vue') },
  { path: '/rank', name: 'Rank', component: () => import('../views/Rank.vue') },
  { path: '/detail/:id', name: 'Detail', component: () => import('../views/Detail.vue') },
  { path: '/play/:id/:source/:ep', name: 'Play', component: () => import('../views/Play.vue') },
  { path: '/search', name: 'Search', component: () => import('../views/Search.vue') },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') },
]

export default createRouter({ history: createWebHistory(), routes })
