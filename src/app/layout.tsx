import "./globals.scss";
import {ReactNode} from "react";
import { AntdRegistry} from "@ant-design/nextjs-registry";
import {Providers} from "@/utils/providers";

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
      <AntdRegistry>
        <body>
            <Providers>
                {children}
            </Providers>
        </body>
      </AntdRegistry>
    </html>
  );
}
