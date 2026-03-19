import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '@/views/IndexPage.vue'
import PassThroughRouterview from '@/components/app/PassThroughRouterview.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: PassThroughRouterview,
      meta: {
        title: 'Startseite'
      },
      children: [
        {
          path: '',          // empty path = this is the actual homepage
          name: 'home',
          component: IndexPage,
        },
        {
          path: 'settings',
          component: PassThroughRouterview,
          meta: {
            title: 'Einstellungen'
          },
          children: [
            {
              path: '',
              name: 'settings',
              component: () => import('../views/profile/UserSettings.vue'),
            },
            {
              path: 'preferences',
              name: 'preferences',
              component: () => import('../views/profile/UserPrefernces.vue'),
              meta: { title: 'Präferenzen' }
            }
          ]
        }
      ]
    },
  ],
})

// route level code-splitting
// a difference betweene component import and using an already imported component
// this generates a separate chunk (About.[hash].js) for this route
// which is lazy-loaded when the route is visited.

router.beforeResolve((to, from, next) => {
  next()
})
export default router
