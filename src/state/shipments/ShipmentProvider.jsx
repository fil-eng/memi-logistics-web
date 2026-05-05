import { createContext, useEffect, useReducer } from "react";
import { shipmentReducer } from "./shipment.reducer";
import { shipmentInitialState } from "./shipment.initialState";
import {
  loadStoredShipments,
  saveStoredShipments,
} from "../../utils/shipmentStorage";
import * as types from "./shipment.types";

export const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shipmentReducer, shipmentInitialState);

  useEffect(() => {
    const stored = loadStoredShipments();
    dispatch({ type: types.LOAD_SHIPMENTS, payload: stored });
  }, []);

  useEffect(() => {
    saveStoredShipments(state.shipments);
  }, [state.shipments]);

  const addShipment = (shipment) => {
    dispatch({ type: types.ADD_SHIPMENT, payload: shipment });
  };

  return (
    <ShipmentContext.Provider value={{ state, dispatch, addShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
};
