


export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Nacs Car Rental - Vehicle Rental Platform",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || null,
  theme: process.env.NEXT_PUBLIC_THEME || "blue",
  layout: process.env.NEXT_PUBLIC_LAYOUT || "semi-box",
  // semi-box, horizontal, vertical
  hideSideBar: process.env.NEXT_PUBLIC_HIDE_SIDEBAR === "true" || false,
  sidebarType: process.env.NEXT_PUBLIC_SIDEBAR_TYPE || "module",
  // popover, classic, module
  sidebarColor: process.env.NEXT_PUBLIC_SIDEBAR_COLOR || null,
  navbarType: process.env.NEXT_PUBLIC_NAVBAR_TYPE || "sticky",
  // sticky, floating, static
  footerType: process.env.NEXT_PUBLIC_FOOTER_TYPE || "static",
  // sticky,  static, hidden
  sidebarBg: process.env.NEXT_PUBLIC_SIDEBAR_BG || "none",
  radius: parseFloat(process.env.NEXT_PUBLIC_RADIUS || "0.5"),
};
