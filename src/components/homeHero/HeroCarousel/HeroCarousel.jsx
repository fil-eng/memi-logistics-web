import React, { useEffect, useState, useRef } from "react";
import styles from "./HeroCarousel.module.css";

// Supports either `images` (legacy: array of strings) OR `ads` (array of objects).
// Ad item shape: { image, alt, url, interval, sponsored, sponsoredLabel }
const HeroCarousel = ({ images = [], ads = [], defaultInterval = 4000 }) => {
  // Normalize into ad items
  const adItems =
    ads && ads.length > 0
      ? ads
      : (images || []).map((img) => ({
          image: img,
          alt: "Promotional",
          url: null,
          interval: defaultInterval,
        }));

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!adItems || adItems.length <= 1) return;

    const schedule = () => {
      clearTimeout(timerRef.current);
      const current = adItems[index] || {};
      const wait = Number(current.interval) || defaultInterval;
      timerRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % adItems.length);
      }, wait);
    };

    schedule();
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, adItems]);

  if (!adItems || adItems.length === 0) return null;

  const current = adItems[index];

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-label="Promotional carousel"
    >
      <div className={styles.carouselInner}>
        {current.url ? (
          <a
            href={current.url}
            className={styles.adLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={current.alt || "Sponsored link"}
          >
            {current.sponsored || current.sponsoredLabel ? (
              <div className={styles.sponsoredTag}>
                {current.sponsoredLabel || "Sponsored"}
              </div>
            ) : null}
            <img
              src={current.image}
              alt={current.alt || "Promotional"}
              className={styles.carouselImage}
              loading="lazy"
            />
          </a>
        ) : (
          <>
            {current.sponsored || current.sponsoredLabel ? (
              <div className={styles.sponsoredTag}>
                {current.sponsoredLabel || "Sponsored"}
              </div>
            ) : null}
            <img
              src={current.image}
              alt={current.alt || "Promotional"}
              className={styles.carouselImage}
              loading="lazy"
            />
          </>
        )}
      </div>

      <div className={styles.carouselDots}>
        {adItems.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
