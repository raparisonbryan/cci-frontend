import "./globals.scss";
import { ReduxProvider } from './providers';
import {ReactNode} from "react";
import { AntdRegistry} from "@ant-design/nextjs-registry";

export const metadata = {
  title: "Application de gestion de planning CCI",
  description: "Application de gestion de planning CCI",
};

export interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <ReduxProvider>
          <AntdRegistry>
            <body>{children}</body>
          </AntdRegistry>
      </ReduxProvider>
    </html>
  );
}
