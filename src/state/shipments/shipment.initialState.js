export const shipmentInitialState = {
  shipments: [],
  offers: [],
  notifications: [],
  selectedShipment: null,
  filters: {
    status: "all",
    search: "",
  },
  isLoading: false,
  errorMessage: null,
  successMessage: null,
};
