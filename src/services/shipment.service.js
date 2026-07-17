import apiClient from "./apiClient";

const normalizeShipment = (shipment = {}) => {
  const normalized = {
    id: shipment.id,
    reference: shipment.reference || shipment.trackingNumber || null,
    status:
      shipment.status != null
        ? shipment.status.toString().toUpperCase()
        : undefined,
    origin: shipment.origin || shipment.pickupPoint || null,
    destination: shipment.destination || null,
    createdAt: shipment.createdAt || shipment.created_at || null,
    updatedAt: shipment.updatedAt || shipment.updated_at || null,
    carrier: shipment.carrier || null,
    assignedCarrierId: shipment.assignedCarrierId || shipment.carrierId || null,
    assignedCarrierName:
      shipment.assignedCarrierName || shipment.carrierName || null,
    shipperId: shipment.shipperId || shipment.userId || null,
    shipperName: shipment.shipperName || null,
    shipmentType:
      shipment.shipmentType || shipment.type || shipment.shipmentItem || null,
    amount: shipment.weightKg ?? shipment.amount ?? 0,
    weightKg: shipment.weightKg ?? shipment.amount ?? 0,
    unit: shipment.unit || "kg",
    pickupPoint: shipment.pickupPoint || shipment.origin || null,
    date: shipment.date || shipment.pickupDate || shipment.pickupDate || null,
    safetyOption: shipment.safetyOption || shipment.safetyType || "safe",
    items: shipment.items || [],
    metadata: shipment.metadata || {},
    ...shipment,
  };

  return normalized;
};

const normalizeShipmentList = (payload) => {
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizeShipment);
};

const normalizeOffer = (offer = {}) => ({
  id: offer.id || offer.offerId || offer.shipmentOfferId || null,
  shipmentId: offer.shipmentId || offer.shipment_id || offer.shipmentId || null,
  // Backend may return carrierCompanyId for the carrier reference — prefer it
  carrierId:
    offer.carrierCompanyId || offer.carrierId || offer.carrier_id || null,
  carrierName:
    offer.carrierName ||
    offer.carrier_name ||
    offer.carrierCompanyName ||
    "Carrier",
  offerPrice:
    offer.offerPrice || offer.price || offer.amount || offer.offer_price || 0,
  offerStatus: (offer.offerStatus || offer.status || "PENDING")
    .toString()
    .toUpperCase(),
  createdAt: offer.createdAt || offer.created_at || new Date().toISOString(),
  updatedAt: offer.updatedAt || offer.updated_at || null,
  ...offer,
});

const normalizeOfferList = (payload) => {
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizeOffer);
};

export const fetchActiveShipments = async (params = {}) => {
  const queryString = new URLSearchParams({
    status: "active",
    ...params,
  }).toString();
  const response = await apiClient.get(
    `/shipments${queryString ? `?${queryString}` : ""}`,
  );
  const data = response.data?.shipments ?? response.data;
  return normalizeShipmentList(data);
};

const fetchShipmentList = async (path, params = {}) => {
  const response = await apiClient.get(path, { params });
  const data = response.data?.shipments ?? response.data;
  return normalizeShipmentList(data);
};

export const listShipments = async ({
  fragile,
  origin,
  destination,
  page = 0,
  size = 20,
} = {}) => {
  const params = { page, size };
  const calls = [];

  if (fragile === true) {
    calls.push(
      fetchShipmentList("/shipment/list/fragile", {
        ...params,
        fragile: true,
      }),
    );
  }

  if (origin) {
    calls.push(
      fetchShipmentList(
        `/shipment/list-by-origin/${encodeURIComponent(origin)}`,
        params,
      ),
    );
  }

  if (destination) {
    calls.push(
      fetchShipmentList(
        `/shipment/list-by-destination/${encodeURIComponent(destination)}`,
        params,
      ),
    );
  }

  if (calls.length === 0) {
    return fetchShipmentList("/shipment/list", params);
  }

  if (calls.length === 1) {
    return calls[0];
  }

  const results = await Promise.all(calls);
  const [firstList, ...remainingLists] = results;
  const intersectionIds = new Set(firstList.map((shipment) => shipment.id));

  for (const list of remainingLists) {
    const nextIds = new Set(list.map((shipment) => shipment.id));
    for (const id of [...intersectionIds]) {
      if (!nextIds.has(id)) {
        intersectionIds.delete(id);
      }
    }
  }

  return firstList.filter((shipment) => intersectionIds.has(shipment.id));
};

export const fetchShipmentDetails = async (shipmentId) => {
  const response = await apiClient.get(`/shipment/${shipmentId}`);
  const payload = response.data?.shipment ?? response.data;
  return normalizeShipment(payload);
};

export const fetchShipmentOffers = async (shipmentId) => {
  const response = await apiClient.get(`/shipment/${shipmentId}/offers`);
  const data = response.data?.offers ?? response.data;
  return normalizeOfferList(data);
};

export const createShipment = async (payload) => {
  const response = await apiClient.post("/shipment/create", payload);
  const data = response.data?.shipment ?? response.data;
  return normalizeShipment(data);
};

export const submitShipmentOffer = async (shipmentId, price) => {
  const numPrice = Number(price);
  // Ensure we send the price as a numeric query parameter and no request body.
  // Use axios `params` to reliably include the query string and avoid sending
  // any unintended JSON payload that some backends may ignore.
  // Use `request` and omit `data` so no request body is sent at all.
  const response = await apiClient.request({
    method: "post",
    url: `/shipments/${shipmentId}/offer-shipment`,
    params: { price: numPrice },
  });
  const data = response.data?.offer ?? response.data;
  return normalizeOffer(data);
};

export const cancelShipmentOffer = async (shipmentOfferId) => {
  const response = await apiClient.post(
    `/shipments/${shipmentOfferId}/cancel-shipment-offer`,
  );
  const data = response.data?.offer ?? response.data;
  return normalizeOffer(data);
};

export const assignCarrier = async (shipmentId, payload) => {
  const response = await apiClient.post(
    `/shipments/${shipmentId}/assign-carrier`,
    payload,
  );
  const data = response.data?.shipment ?? response.data;
  return normalizeShipment(data);
};

export const updateShipmentStatus = async (
  shipmentId,
  status,
  location = "",
) => {
  try {
    const finalLocation =
      (location && String(location).trim()) || `Shipment ${shipmentId}`;
    const response = await apiClient.patch(
      `/shipments/${shipmentId}/update-status`,
      {
        location: finalLocation,
        status: String(status).toUpperCase(),
      },
    );
    const data = response.data?.shipment ?? response.data;
    return normalizeShipment(data);
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update shipment status",
    );
  }
};

const getApiErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Request failed";

export const initiatePayment = async (shipmentId, payload) => {
  try {
    await apiClient.post(`/payment/${shipmentId}/initiate-payment`, payload);
    return await fetchShipmentDetails(shipmentId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const confirmPayment = async (shipmentId) => {
  try {
    await apiClient.post(`/payment/${shipmentId}/confirm-payment`);
    return await fetchShipmentDetails(shipmentId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const fetchShipmentDashboardData = async () => {
  const response = await apiClient.get("/shipments/dashboard");
  const data = response.data ?? {};

  return {
    activeShipments: normalizeShipmentList(
      data.activeShipments ?? data.shipments ?? [],
    ),
    totals: {
      pending: data.totalPending ?? data.pendingCount ?? 0,
      delivered: data.totalDelivered ?? data.deliveredCount ?? 0,
      inTransit: data.inTransitCount ?? 0,
    },
    metadata: data.metadata ?? {},
  };
};

export const fetchAdminDashboardData = async () => {
  try {
    const response = await apiClient.get("/shipment/dashboard");
    return response.data ?? {};
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load admin dashboard data",
    );
  }
};

export const fetchCarrierAssignedShipments = async (carrierId, params = {}) => {
  const response = await apiClient.get(`/carrier/shipments/assigned`, {
    params,
  });
  const data = response.data?.shipments ?? response.data;
  return normalizeShipmentList(data);
};

export const fetchShipperShipments = async (params = {}) => {
  const response = await apiClient.get("/shipment/my", { params });
  const payload = response.data ?? {};
  // Support paginated responses with a `content` array, or legacy `shipments` key,
  // or direct array response. Always return a normalized array of shipments.
  const list = payload.content ?? payload.shipments ?? payload;
  return normalizeShipmentList(list);
};

export const assignCarrierByCarrierId = async (shipmentId, carrierId) => {
  const response = await apiClient.post(
    `/shipments/${shipmentId}/assign-carrier`,
    null,
    { params: { carrierId } },
  );
  const data = response.data?.shipment ?? response.data;
  return normalizeShipment(data);
};
