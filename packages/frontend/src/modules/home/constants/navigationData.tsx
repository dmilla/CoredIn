import { ROUTES } from "@/router/routes";
import {
  FaGear,
  FaHouse,
  FaPaperPlane,
  FaUser,
  FaCertificate,
  FaBinoculars,
  FaCoins
} from "react-icons/fa6";

export const navigationData = (wallet: string) =>
  [
    {
      title: "home",
      icon: FaHouse,
      link: ROUTES.HOME.path
    },
    {
      title: "messages",
      icon: FaPaperPlane,
      link: ROUTES.MESSAGES.path
    },
    {
      title: "credentials",
      icon: FaCertificate,
      link: ROUTES.CREDENTIALS.path
    },
    {
      title: "subscriptions",
      icon: FaBinoculars,
      link: ROUTES.SUBSCRIPTIONS.path
    },
    {
      title: "wallet",
      icon: FaCoins,
      link: ROUTES.WALLET.path
    },
    {
      title: "profile",
      icon: FaUser, // maybe replace with a user avatar
      link: ROUTES.USER.buildPath(wallet)
    },
    {
      title: "settings",
      icon: FaGear,
      link: ROUTES.SETTINGS.path
    }
  ] as const;
