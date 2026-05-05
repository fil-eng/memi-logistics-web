export const shipmentInitialState = {
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
