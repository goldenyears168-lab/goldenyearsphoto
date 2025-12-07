import { onRequestPost as __api_chat_ts_onRequestPost } from "/Users/jackm4/Documents/GitHub/goldenyearsphoto/functions/api/chat.ts"
import { onRequestGet as __api_faq_menu_ts_onRequestGet } from "/Users/jackm4/Documents/GitHub/goldenyearsphoto/functions/api/faq-menu.ts"

export const routes = [
    {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_ts_onRequestPost],
    },
  {
      routePath: "/api/faq-menu",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_faq_menu_ts_onRequestGet],
    },
  ]