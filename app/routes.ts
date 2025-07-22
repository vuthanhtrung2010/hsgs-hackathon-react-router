import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("users", "routes/users.tsx"),
  route("user/:userId", "routes/user.$userId.tsx"),
] satisfies RouteConfig;
