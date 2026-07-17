import { useContext } from "react";
import { ProfileContext } from "./ProfileProvider";

export const useProfile = () => useContext(ProfileContext);
