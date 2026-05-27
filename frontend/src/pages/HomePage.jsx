import Header from "../components/Header";
import Hero from "../components/Hero";
import AreaSection from "../components/AreaSection";
import Product from "../components/Product";
import CertGallery from "../components/CertGallery";
import NewsSection from "../components/NewsSection";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="main">
        <Hero />
        <AreaSection />
        <Product />
        <CertGallery />
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}
