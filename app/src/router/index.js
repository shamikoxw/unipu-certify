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
  {
    meta: {
      requiresAdmin: false,
    },
    path: "/my-documents",
    name: "My documents",
    component: () => import("../views/MyDocuments.vue"),
  },
  {
    path: "/alumni",
    name: "Alumni",
    component: () => import("../views/AlumniView.vue"),
  },
  {
    meta: {
      requiresAdmin: true,
    },
    path: "/token-mint",
    name: "TokenMint",
    component: () => import("../views/TokenMintView.vue"),
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
