import * as types from "./profile.types";
import { profileInitialState } from "./profile.initialState";

export const profileReducer = (state, action) => {
  switch (action.type) {
    case types.LOAD_PROFILE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        notFound: false,
      };
    case types.LOAD_PROFILE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        shipperProfile:
          action.role === "SHIPPER" ? action.payload : state.shipperProfile,
        carrierProfile:
          action.role === "CARRIER" ? action.payload : state.carrierProfile,
        notFound: false,
        lastLoadedRole: action.role,
      };
    case types.LOAD_PROFILE_NOT_FOUND:
      return {
        ...state,
        isLoading: false,
        shipperProfile: action.role === "SHIPPER" ? null : state.shipperProfile,
        carrierProfile: action.role === "CARRIER" ? null : state.carrierProfile,
        notFound: true,
        lastLoadedRole: action.role,
      };
    case types.LOAD_PROFILE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case types.SAVE_PROFILE_START:
      return {
        ...state,
        isSaving: true,
        error: null,
      };
    case types.SAVE_PROFILE_SUCCESS:
      return {
        ...state,
        isSaving: false,
        shipperProfile:
          action.role === "SHIPPER" ? action.payload : state.shipperProfile,
        carrierProfile:
          action.role === "CARRIER" ? action.payload : state.carrierProfile,
        notFound: false,
        lastLoadedRole: action.role,
      };
    case types.SAVE_PROFILE_FAILURE:
      return {
        ...state,
        isSaving: false,
        error: action.payload,
      };
    case types.CLEAR_PROFILE:
      return {
        ...profileInitialState,
      };
    default:
      return state;
  }
};
