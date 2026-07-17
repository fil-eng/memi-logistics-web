import Logistics from "./Logistics.png";
import Warehouse from "./Warehouse.png";
import Carriershipper from "./Carrier&shipper.png";
import delivery from "./delivery.png";
import fuel from "./Fuel.png"
import insurance from "./Insurance.png"
export const carouselImages = [Logistics, Warehouse, delivery, Carriershipper];
export const sideImages=[
fuel,insurance
]

  // Local ad array for the center hero ad rotator.
  export const ads = [
    {
      image: carouselImages[0],
      alt: "Partner Logistics",
      url: "https://zemenbazaar.com/en",
      interval: 10000,
      sponsored: false,
    },
    {
      image: carouselImages[1],
      alt: "Warehouse Services",
      url: "https://zemenbazaar.com/en",
      interval: 5000,
      sponsored: false,
    },
    {
      image: carouselImages[2],
      alt: "Delivery Network",
      url: "https://zemenbazaar.com/en",
      interval: 8000,
    },
    {
      image: carouselImages[3],
      alt: "Carrier Shipper",
      url: "https://zemenbazaar.com/en",
      interval: 5000,
    },
  ];

  // const carouselImages = [
  //   "/ads/ad1.svg",
  //   "/ads/ad2.svg",
  //   "/ads/ad3.svg",
  //   "/ads/ad4.svg",
  //   "/ads/ad5.svg",
  // ];