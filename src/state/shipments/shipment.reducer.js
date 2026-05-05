import * as types from "./shipment.types";

export const shipmentReducer = (state, action) => {
  switch (action.type) {
    case types.LOAD_SHIPMENTS:
      return {
        ...state,
        shipments: Array.isArray(action.payload) ? action.payload : [],
      };

    case types.ADD_SHIPMENT:
      return {
        ...state,
        shipments: [...state.shipments, action.payload],
        successMessage: "Shipment posted successfully",
        errorMessage: null,
      };

    case types.FETCH_SHIPMENTS_START:
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
        successMessage: null,
      };

    case types.FETCH_SHIPMENTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        shipments: action.payload,
        errorMessage: null,
        successMessage: "Shipments loaded successfully",
      };

    case types.FETCH_SHIPMENTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload,
        successMessage: null,
      };

    case types.CLEAR_SHIPMENT_MESSAGES:
      return {
        ...state,
        errorMessage: null,
        successMessage: null,
      };

    case types.SELECT_SHIPMENT:
      return {
        ...state,
        selectedShipment: action.payload,
      };

    case types.UPDATE_SHIPMENT_STATUS:
      return {
        ...state,
        shipments: state.shipments.map((shipment) =>
          shipment.id === action.payload.id
            ? { ...shipment, status: action.payload.status }
            : shipment,
        ),
        successMessage: "Shipment status updated",
        errorMessage: null,
      };

    case types.RESET_SHIPMENT_STATE:
      return {
        ...state,
        shipments: [],
        selectedShipment: null,
        filters: {
          status: "all",
          search: "",
        },
        isLoading: false,
        errorMessage: null,
        successMessage: null,
      };

    default:
      return state;
  }
};
