import "./globals.scss";
import { ReduxProvider } from './providers';

export const metadata = {
  title: "Application de gestion de planning CCI",
  description: "Application de gestion de planning CCI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <ReduxProvider>
        <body>{children}</body>
      </ReduxProvider>
    </html>
  );
}
