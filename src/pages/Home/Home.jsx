import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import HeroCarousel from "../../components/homeHero/HeroCarousel/HeroCarousel";
import HeroContent from "../../components/homeHero/HeroContent/HeroContent";
import heroStyles from "../../components/homeHero/HomeHero.module.css";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import { ads } from "../../assets/carouselImages";
const Home = () => {


  return (
    <>
      <Navbar buttons={true} />
      <div className={styles.wrapper}>
        <section className={styles.hero}>
          <div className={heroStyles.container}>
            <main className={heroStyles.center}>
              <div className={heroStyles.centerInner}>
                <HeroContent />
                <HeroCarousel ads={ads} />
              </div>
            </main>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why MEMI?</h2>
          <div className={styles.grid}>
            <article className={styles.card}>
              <h3 className={styles.cardTitle}>Faster Matching</h3>
              <p className={styles.cardText}>
                Shippers quickly find available transport and carriers find real
                jobs without manual back-and-forth.
              </p>
            </article>

            <article className={styles.card}>
              <h3 className={styles.cardTitle}>Better Visibility</h3>
              <p className={styles.cardText}>
                Track shipments, see ETA updates, and confirm delivery in one
                place.
              </p>
            </article>

            <article className={styles.card}>
              <h3 className={styles.cardTitle}>Trusted Coordination</h3>
              <p className={styles.cardText}>
                Ratings, verification, and structured workflows help reduce
                delays, disputes, and misuse.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Who it serves</h2>
          <div className={styles.grid}>
            <article className={styles.card}>
              <h3 className={styles.cardTitle}>Shippers</h3>
              <p className={styles.cardText}>
                Businesses and individuals who need reliable transport for
                goods.
              </p>
            </article>

            <article className={styles.card}>
              <h3 className={styles.cardTitle}>Carriers</h3>
              <p className={styles.cardText}>
                Truck owners and transport providers looking for more jobs and
                better utilization.
              </p>
            </article>

            <article className={styles.card}>
              <h3 className={styles.cardTitle}>Support Partners</h3>
              <p className={styles.cardText}>
                Warehousing, maintenance, fuel, insurance, and logistics support
                partners.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2 className={styles.sectionTitle}>Start with MEMI</h2>
          <p className={styles.ctaText}>
            Join the platform, create your account, and become part of a smarter
            logistics system.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryBtn} to="/register">
              Register
            </Link>
            <Link className={styles.secondaryBtn} to="/login">
              Login
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
