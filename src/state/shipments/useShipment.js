import { useContext } from "react";
import { ShipmentContext } from "./ShipmentProvider";

export const useShipment = () => useContext(ShipmentContext);
