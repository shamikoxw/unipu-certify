import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Main",
    component: () => import("../views/MainView.vue"),
  },
  {
    meta: {
      requiresAdmin: true,
    },
    path: "/upload",
    name: "Upload",
    component: () => import("../views/UploadView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

export default router;
