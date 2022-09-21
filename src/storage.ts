import {
  NEWSTACK_ACCOUNT_NAME_STORAGE_KEY,
  NEWSTACK_LOCAL_STORAGE_KEY,
} from "./constants";
import { NewsafeJwtPayload } from "./types";

export function getJwtFromLocalStorage() {
  return localStorage.getItem(NEWSTACK_LOCAL_STORAGE_KEY);
}

export function getJwtPayload() {
  const jwt = getJwtFromLocalStorage();
  if (!jwt) {
    return null;
  }
  const payload = jwt.split(".")[1];
  return JSON.parse(atob(payload)) as NewsafeJwtPayload;
}

export function getJwtExpirationDate() {
  const payload = getJwtPayload();
  if (payload?.config?.expires) {
    return new Date(payload.config.expires);
  }
  return null;
}

export function getAccountNameFromLocalStorage() {
  return localStorage.getItem(NEWSTACK_ACCOUNT_NAME_STORAGE_KEY);
}

export function setJwtToLocalStorage(jwt: string) {
  localStorage.setItem(NEWSTACK_LOCAL_STORAGE_KEY, jwt);
}

export function setAccountNameToLocalStorage(accountName: string) {
  localStorage.setItem(NEWSTACK_ACCOUNT_NAME_STORAGE_KEY, accountName);
}
