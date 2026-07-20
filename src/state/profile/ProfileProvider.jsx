import { createContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { profileReducer } from "./profile.reducer";
import { profileInitialState } from "./profile.initialState";
import * as types from "./profile.types";
import {
  createCarrierProfile,
  createShipperProfile,
  getCarrierProfile,
  getShipperProfile,
  updateCarrierProfile,
  updateShipperProfile,
} from "../../services/profile.service";

export const ProfileContext = createContext();

const isStringFilled = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isProfileNotFoundError = (error) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message || error?.message || "",
  ).toLowerCase();
  return (
    status === 404 || /profile.*not found|not_found|not found/i.test(message)
  );
};

const isProfileConflictError = (error) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message || error?.message || "",
  ).toLowerCase();
  return (
    status === 409 ||
    /already exists|already exist|duplicate|conflict/i.test(message)
  );
};

const isProfileCompleteByRole = (role, profile) => {
  if (!profile || typeof profile !== "object") return false;
  if (role === "SHIPPER") {
    const required = [
      "firstName",
      "lastName",
      "companyName",
      "businessName",
      "street",
      "city",
      "state",
      "zip",
      "country",
      "phoneNumber",
    ];
    return required.every((field) => isStringFilled(profile[field]));
  }
  if (role === "CARRIER") {
    const required = [
      "companyName",
      "companyEmail",
      "street",
      "city",
      "state",
      "zip",
      "country",
      "phoneNumber",
    ];
    return required.every((field) => isStringFilled(profile[field]));
  }
  return false;
};

const getProfilePayload = (role, values) => {
  if (role === "SHIPPER") {
    return {
      firstName: values.firstName || "",
      lastName: values.lastName || "",
      companyName: values.companyName || "",
      businessName: values.businessName || "",
      street: values.street || "",
      city: values.city || "",
      state: values.state || "",
      zip: values.zip || "",
      country: values.country || "",
      phoneNumber: values.phoneNumber || "",
    };
  }

  if (role === "CARRIER") {
    return {
      companyName: values.companyName || "",
      companyEmail: values.companyEmail || "",
      street: values.street || "",
      city: values.city || "",
      state: values.state || "",
      zip: values.zip || "",
      country: values.country || "",
      phoneNumber: values.phoneNumber || "",
    };
  }

  return values;
};

const isProfilePayloadUnchanged = (
  role,
  currentProfile = {},
  nextValues = {},
) => {
  const currentPayload = getProfilePayload(role, currentProfile);
  const nextPayload = getProfilePayload(role, nextValues);

  return Object.keys(currentPayload).every(
    (key) => currentPayload[key] === nextPayload[key],
  );
};

const getFriendlyErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (isProfileNotFoundError(error) || isProfileConflictError(error)) {
    return fallback;
  }
  return fallback;
};

export const ProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, profileInitialState);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      dispatch({ type: types.CLEAR_PROFILE });
    }
  }, [auth?.isAuthenticated]);

  const getCurrentRole = () => auth?.role || auth?.user?.role || null;

  const getCurrentProfile = (role) => {
    const effectiveRole = role || getCurrentRole();
    if (effectiveRole === "SHIPPER") return state.shipperProfile;
    if (effectiveRole === "CARRIER") return state.carrierProfile;
    return null;
  };

  const loadProfile = async (role) => {
    const currentRole = role || getCurrentRole();
    if (!currentRole) return null;

    dispatch({ type: types.LOAD_PROFILE_START });

    try {
      let profileData = null;
      if (currentRole === "SHIPPER") {
        profileData = await getShipperProfile();
      } else if (currentRole === "CARRIER") {
        profileData = await getCarrierProfile();
      }
      dispatch({
        type: types.LOAD_PROFILE_SUCCESS,
        payload: profileData,
        role: currentRole,
      });
      return profileData;
    } catch (error) {
      if (isProfileNotFoundError(error)) {
        dispatch({ type: types.LOAD_PROFILE_NOT_FOUND, role: currentRole });
        return null;
      }
      dispatch({
        type: types.LOAD_PROFILE_FAILURE,
        payload: "Unable to load profile. Please try again.",
      });
      return null;
    }
  };

  const saveProfile = async (payload) => {
    const currentRole = getCurrentRole();
    if (!currentRole) {
      throw new Error("Unable to save profile: missing role.");
    }

    const existingProfile = getCurrentProfile(currentRole);
    if (
      existingProfile &&
      isProfilePayloadUnchanged(currentRole, existingProfile, payload)
    ) {
      return { noChanges: true };
    }

    dispatch({ type: types.SAVE_PROFILE_START });

    try {
      const profileValues = getProfilePayload(currentRole, payload);
      let savedProfile;

      const safeUpdate = async (updateFn, createFn) => {
        try {
          return existingProfile
            ? await updateFn(profileValues)
            : await createFn(profileValues);
        } catch (error) {
          if (!existingProfile && isProfileConflictError(error)) {
            await loadProfile(currentRole);
            return currentRole === "SHIPPER"
              ? await updateShipperProfile(profileValues)
              : await updateCarrierProfile(profileValues);
          }

          if (existingProfile && isProfileNotFoundError(error)) {
            return currentRole === "SHIPPER"
              ? await createShipperProfile(profileValues)
              : await createCarrierProfile(profileValues);
          }

          throw error;
        }
      };

      if (currentRole === "SHIPPER") {
        savedProfile = await safeUpdate(
          updateShipperProfile,
          createShipperProfile,
        );
      } else if (currentRole === "CARRIER") {
        savedProfile = await safeUpdate(
          updateCarrierProfile,
          createCarrierProfile,
        );
      } else {
        throw new Error("Unsupported user role.");
      }

      const refreshedProfile = await loadProfile(currentRole).catch(() => null);
      const finalProfile = refreshedProfile || savedProfile;

      dispatch({
        type: types.SAVE_PROFILE_SUCCESS,
        payload: finalProfile,
        role: currentRole,
      });
      return finalProfile;
    } catch (error) {
      const message = getFriendlyErrorMessage(
        error,
        "Unable to save profile. Please try again.",
      );
      dispatch({ type: types.SAVE_PROFILE_FAILURE, payload: message });
      throw new Error(message);
    }
  };

  const ensureProfileComplete = async (role) => {
    const currentRole = getCurrentRole();
    const effectiveRole = role || currentRole;
    if (!effectiveRole) return;

    const profileToCheck =
      getCurrentProfile(effectiveRole) && state.lastLoadedRole === effectiveRole
        ? getCurrentProfile(effectiveRole)
        : null;

    if (
      profileToCheck &&
      isProfileCompleteByRole(effectiveRole, profileToCheck)
    ) {
      return true;
    }

    const loadedProfile = await loadProfile(effectiveRole);
    const isComplete = isProfileCompleteByRole(effectiveRole, loadedProfile);

    if (!isComplete) {
      const redirectPath =
        effectiveRole === "CARRIER" ? "/carrier/profile" : "/shipper/profile";
      navigate(redirectPath, {
        replace: true,
        state: {
          message: "Please complete your profile first.",
        },
      });
      throw new Error("Please complete your profile first.");
    }

    return true;
  };

  useEffect(() => {
    if (!auth?.isAuthenticated || !auth?.role) return;
    if (state.lastLoadedRole === auth.role) return;
    loadProfile(auth.role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isAuthenticated, auth?.role]);

  const currentRole = getCurrentRole();
  const profile = getCurrentProfile(currentRole);

  return (
    <ProfileContext.Provider
      value={{
        ...state,
        profile,
        shipperProfile: state.shipperProfile,
        carrierProfile: state.carrierProfile,
        isProfileComplete: isProfileCompleteByRole(currentRole, profile),
        loadProfile,
        saveProfile,
        ensureProfileComplete,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
