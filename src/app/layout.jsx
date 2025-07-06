import { Inter } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import NavBar from "../components/NavBar";

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
          {/* ナビゲーションバーを全ページ共通で表示 */}
          <div style={{ minHeight: "56px" }}>
            <div style={{ position: "relative", zIndex: 100 }}>
              <NavBar />
            </div>
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
