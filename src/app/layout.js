import "./globals.css";
import "@/assets/scss/theme.scss";
import dynamic from "next/dynamic";
import NavigationProvider from "@/contentApi/navigationProvider";
import SettingSideBarProvider from "@/contentApi/settingSideBarProvider";
import { AuthProvider } from "@/context/AuthProvider";

const ThemeCustomizer = dynamic(
  () => import("@/components/shared/ThemeCustomizer"),
  { ssr: false }
);

export const metadata = {
  title: "PT. RAD Indonesia CRM",
  description: "PT. RAD Indonesia - Customer Relationship Management System",
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
