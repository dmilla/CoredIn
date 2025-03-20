import { userService } from "@/dependencies";
import { BaseServerStateKeys } from "../constants";

export const USER_QUERIES = {
  // Using needsAuth bool from useAuth() hook ensures refresh after user logs in
  getUser: (user: string, needsAuth?: boolean) => ({
    queryKey: [
      BaseServerStateKeys.USER,
      user,
      needsAuth?.toString() || "false"
    ],
    queryFn: () => userService.getUser(user)
  }),
  getTips: () => ({
    queryKey: [BaseServerStateKeys.USER_TIPS],
    queryFn: () => userService.getTips()
  }),
  search: (username: string) => ({
    queryKey: [BaseServerStateKeys.USER_SEARCH, username],
    queryFn: () => userService.search(username)
  })
};
