import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className={styles.wrapper}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.badge}>MEMI Logistics Platform</p>
            <h1 className={styles.title}>A digital logistics marketplace</h1>
            <p className={styles.subtitle}>
              Connect shippers, carriers, and logistics partners in one trusted
              platform that makes transport faster, clearer, and more reliable.
            </p>

            <div className={styles.actions}>
              <Link className={styles.primaryBtn} to="/register">
                Get Started
              </Link>
              <Link className={styles.secondaryBtn} to="/login">
                Login
              </Link>
            </div>
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
        <footer>
          <Footer />
        </footer>
      </div>
    </>
  );
};

export default Home;
