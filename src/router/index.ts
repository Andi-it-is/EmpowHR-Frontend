import { createRouter, createWebHistory } from 'vue-router'

import IndexPage from '@/views/IndexPage.vue'
import PassThroughRouterview from '@/components/app/PassThroughRouterview.vue'
import { useUserStore } from '@/stores/user.store'

//! Very Important to NOT lazy-load the PassThroug Component
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
          path: 'login',
          name: 'Login',
          component: () => import('../views/LoginPage.vue'),
          meta: {
            layout: 'GuestLayout'
          }
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
          ]
        },
        {
          path: 'profile',
          component: PassThroughRouterview,
          meta: { title: 'Profil' },
          children: [
            {
              path: '',
              component: () => import('../views/profile/ProfileIndex.vue'),
            },
            {
              path: 'master-data',
              name: 'Stammdaten',
              component: () => import('../views/profile/MasterData.vue'),
              meta: { title: 'Stammdaten' }
            },
            {
              path: 'documents',
              name: 'Dokumente',
              component: () => import('../views/profile/DocumentOverview.vue'),
              meta: { title: 'Dokumente' }
            },
            {
              path: 'certificates',
              name: 'Zertifikate',
              component: () => import('../views/profile/CertificateOverview.vue'),
              meta: { title: 'Zertifikate' }
            }
          ]
        },
        {
          path: 'times',
          component: PassThroughRouterview,
          meta: { title: "Zeitverwaltung" },
          children: [
            {
              path: '',
              component: () => import('../views/times/TimesIndex.vue')
            },
            {
              path: 'absences',
              name: 'Abwesenheiten',
              component: () => import('../views/times/AbscencesOverview.vue'),
              meta: { title: 'Abwesenheiten'}
            },
            {
              path: 'booking',
              name: 'Buchung',
              component: () => import('../views/times/TimeBookingOverview.vue'),
              meta: { title: 'Zeitbuchung' }
            },
            {
              path: 'monitor',
              name: 'Monitor',
              component: () => import('../views/times/TimeMonitoringDashboard.vue'),
              meta: { title: 'Zeiten Monitoring' } 
            }
          ]
        },
        {
          path: 'management',
          component: PassThroughRouterview,
          meta: { title: "Management" },
          children: [
            {
              path: '',
              component: () => import('../views/management/ManagementIndex.vue')
            },
            {
              path: 'reportings',
              name: 'Report',
              component: () => import('../views/management/ReportingDashboard.vue'),
              meta: { title: 'Report' }
            },
            {
              path: 'user-control',
              name: 'Usercontrol',
              component: () => import('../views/management/UserControlOverview.vue'),
              meta : { title: 'Nutzerverwaltung' } 
            },
            {
              path: 'access-control',
              name: 'Accesscontrol',
              component: () => import('../views/management/AccessControlOverview.vue'),
              meta: { title: 'Zugriffsverwaltung' }
            },
          ]
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/CustomNotFound.vue'),
    },
  ],
})

// route level code-splitting
// a difference betweene component import and using an already imported component
// this generates a separate chunk (About.[hash].js) for this route
// which is lazy-loaded when the route is visited.

// router.beforeResolve((to, from, next) => {
//   next()
// })

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  // 1. Initialisierung abwarten
  if (userStore.isInitializing) {
    await userStore.fetchUser()
  }

  const isLoggedIn = !!userStore.user
  const requiresAuth = to.meta.layout !== 'GuestLayout'

  // 2. Logik per Return-Values (statt next)
  
  // Fall: Nicht eingeloggt auf geschützte Seite -> Umleiten zu Login
  if (requiresAuth && !isLoggedIn) {
    return '/login' 
  }

  // Fall: Eingeloggt auf Login-Seite -> Umleiten zur Home
  if (to.path === '/login' && isLoggedIn) {
    return '/'
  }

  // Fall: Alles okay -> Einfach nichts oder true zurückgeben
  return true 
})

export default router