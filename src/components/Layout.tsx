import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingButtons from "./FloatingButtons";
import EmergencyBanner from "./EmergencyBanner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <EmergencyBanner />
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default Layout;
