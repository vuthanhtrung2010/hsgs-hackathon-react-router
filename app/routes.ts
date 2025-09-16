import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("users", "routes/users.tsx"),
  route("user/:userId", "routes/user.$userId.tsx"),
  route("problems", "routes/problems.tsx"),

  // Admin routes
  route("admin", "routes/admin/layout.tsx", [
    index("routes/admin/dashboard.tsx"),
    route("classes", "routes/admin/classes.tsx"),
    route("classes/create", "routes/admin/classes.create.tsx"),
    route("classes/:id", "routes/admin/classes.$id.tsx"),
    route("announcements", "routes/admin/announcements.tsx"),
    route("announcements/create", "routes/admin/announcements.create.tsx"),
    route("announcements/:id/edit", "routes/admin/announcements.$id.edit.tsx"),
    route("gen", "routes/admin/gen.tsx"),
    route("users", "routes/admin/users.tsx"),
  ]),

  // API routes
  route("api/announcements", "routes/api.announcements.ts"),
  route("api/ranking/:courseId", "routes/api.ranking.$courseId.ts"),
  route("api/auth/login", "routes/api.auth.login.ts"),
  route("api/auth/session", "routes/api.auth.session.ts"),
  route("api/auth/logout", "routes/api.auth.logout.ts"),
  route("api/admin/classes", "routes/api.admin.classes.ts"),
  route("api/admin/classes/create", "routes/api.admin.classes.create.ts"),
  route("api/admin/classes/:id", "routes/api.admin.classes.$id.ts"),
  route("api/admin/classes/update", "routes/api.admin.classes.update.ts"),
  route("api/admin/stats", "routes/api.admin.stats.ts"),
  route("api/admin/announcements", "routes/api.admin.announcements.ts"),
  route(
    "api/admin/announcements/create",
    "routes/api.admin.announcements.create.ts",
  ),
  route("api/admin/announcements/:id", "routes/api.admin.announcements.$id.ts"),
  route(
    "api/admin/announcements/update",
    "routes/api.admin.announcements.update.ts",
  ),
  route("api/admin/users", "routes/api.admin.users.ts"),
  route("api/admin/users/:id", "routes/api.admin.users.$id.ts"),
  route("api/users/profile", "routes/api.users.profile.ts"),

  // 404 catch-all
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
