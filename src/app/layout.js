import "./globals.css";
import "@/assets/scss/theme.scss";
import dynamic from "next/dynamic";
import NavigationProvider from "@/contentApi/navigationProvider";
import SettingSideBarProvider from "@/contentApi/settingSideBarProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { RAD_BRAND_TITLE } from "@/lib/radLandingContent";

const ThemeCustomizer = dynamic(
  () => import("@/components/shared/ThemeCustomizer"),
  { ssr: false }
);

export const metadata = {
  title: `${RAD_BRAND_TITLE} — CRM`,
  description: `${RAD_BRAND_TITLE} — sistem manajemen pelanggan & LMS internal.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SettingSideBarProvider>
          <NavigationProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NavigationProvider>
        </SettingSideBarProvider>
        <ThemeCustomizer />
      </body>
    </html>
  );
}
