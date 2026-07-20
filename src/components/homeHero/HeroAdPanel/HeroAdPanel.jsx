import React from "react";
import styles from "./HeroAdPanel.module.css";

const HeroAdPanel = ({ ad }) => {
  if (!ad) return null;
  return (
    <div className={styles.adCard} aria-label="Sponsored ad">
      <div className={styles.adTag}>Sponsored</div>
      <div className={styles.adImageWrap}>
        <img
          src={ad.image}
          alt={ad.alt || "Sponsored"}
          className={styles.adImage}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default HeroAdPanel;
