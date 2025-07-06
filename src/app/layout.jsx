import { Inter } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext"; // AuthProviderをインポート

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Forgejo Auth TODO App",
  description: "Forgejo Auth TODO App with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
