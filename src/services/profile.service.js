import apiClient from "./apiClient";

const normalizeProfileResponse = (response) => {
  const payload = response.data?.profile ?? response.data;
  if (!payload || typeof payload !== "object") return payload;

  // Backend now returns flat address fields. Expose flat fields with safe
  // defaults so UI form bindings always have strings to display.
  return {
    ...payload,
    street: payload.street || "",
    city: payload.city || "",
    state: payload.state || "",
    zip: payload.zip || "",
    country: payload.country || "",
    phoneNumber: payload.phoneNumber || "",
  };
};

const buildFlatProfilePayload = (values) => ({
  firstName: values.firstName,
  lastName: values.lastName,
  companyName: values.companyName,
  businessName: values.businessName,
  companyEmail: values.companyEmail,
  street: values.street || "",
  city: values.city || "",
  state: values.state || "",
  zip: values.zip || "",
  country: values.country || "",
  phoneNumber: values.phoneNumber || "",
});

export const getShipperProfile = async () => {
  const response = await apiClient.get("/shippers/profile/me");
  return normalizeProfileResponse(response);
};

export const getPublicShipperProfile = async (shipperId) => {
  const response = await apiClient.get(`/shippers/profile/${shipperId}`);
  return normalizeProfileResponse(response);
};

export const createShipperProfile = async (payload) => {
  const body = buildFlatProfilePayload(payload);
  const response = await apiClient.post("/shippers/profile/create", {
    firstName: body.firstName,
    lastName: body.lastName,
    companyName: body.companyName,
    businessName: body.businessName,
    street: body.street,
    city: body.city,
    state: body.state,
    zip: body.zip,
    country: body.country,
    phoneNumber: body.phoneNumber,
  });
  return normalizeProfileResponse(response);
};

export const updateShipperProfile = async (payload) => {
  const body = buildFlatProfilePayload(payload);
  const response = await apiClient.patch("/shippers/profile/update", {
    firstName: body.firstName,
    lastName: body.lastName,
    companyName: body.companyName,
    businessName: body.businessName,
    street: body.street,
    city: body.city,
    state: body.state,
    zip: body.zip,
    country: body.country,
    phoneNumber: body.phoneNumber,
  });
  return normalizeProfileResponse(response);
};

export const getCarrierProfile = async () => {
  const response = await apiClient.get("/carrier/profile/me");
  return normalizeProfileResponse(response);
};

export const getPublicCarrierProfile = async (carrierId) => {
  const response = await apiClient.get(`/carrier/profile/${carrierId}`);
  return normalizeProfileResponse(response);
};

export const createCarrierProfile = async (payload) => {
  const body = buildFlatProfilePayload(payload);
  const response = await apiClient.post("/carrier/profile/create", {
    companyName: body.companyName,
    companyEmail: body.companyEmail,
    street: body.street,
    city: body.city,
    state: body.state,
    zip: body.zip,
    country: body.country,
    phoneNumber: body.phoneNumber,
  });
  return normalizeProfileResponse(response);
};

export const updateCarrierProfile = async (payload) => {
  const body = buildFlatProfilePayload(payload);
  const response = await apiClient.patch("/carrier/profile/update", {
    companyName: body.companyName,
    companyEmail: body.companyEmail,
    street: body.street,
    city: body.city,
    state: body.state,
    zip: body.zip,
    country: body.country,
    phoneNumber: body.phoneNumber,
  });
  return normalizeProfileResponse(response);
};
