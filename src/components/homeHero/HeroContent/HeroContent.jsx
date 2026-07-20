import React from "react";
import { Link } from "react-router-dom";
import homeStyles from "../../../pages/Home/Home.module.css";
import styles from "./HeroContent.module.css";

const HeroContent = () => {
  return (
    <div className={`${homeStyles.heroContent} ${styles.wrapper}`}>
      <p className={homeStyles.badge}>MEMI Logistics Platform</p>
      <h1 className={homeStyles.title}>A digital logistics marketplace</h1>
      {/* <p className={homeStyles.subtitle}>
        Connect shippers, carriers, and logistics partners in one trusted
        platform that makes transport faster, clearer, and more reliable.
      </p> */}
      {/* <div className={homeStyles.actions}>
        <Link className={homeStyles.primaryBtn} to="/register">
          Get Started
        </Link>
        <Link className={homeStyles.secondaryBtn} to="/login">
          Login
        </Link>
      </div> */}
    </div>
  );
};

export default HeroContent;
