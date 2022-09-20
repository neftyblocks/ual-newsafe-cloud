import { User } from "universal-authenticator-library/dist/User";
import { Authenticator } from "universal-authenticator-library/dist/Authenticator";
import { Chain } from "universal-authenticator-library/dist/interfaces";
import { FetchOptions, $fetch } from "ohmyfetch";
import { NewstackAuthenticatorOptions, NGUserResponse } from "./types";
import {
  NEWSTACK_ACCOUNT_NAME_STORAGE_KEY,
  NEWSTACK_LOCAL_STORAGE_KEY,
} from "./constants";
import { NewstackUser } from "./user";
import {
  getAccountNameFromLocalStorage,
  getJwtFromLocalStorage,
  getJwtPayload,
  setAccountNameToLocalStorage,
  setJwtToLocalStorage,
} from "./storage";

export class NewsafeCloudAuthenticator extends Authenticator {
  appId: string;
  authUrl: string;
  signUrl: string;
  newgraphUrl: string;
  daoDomain: string;
  redirectPath: string;
  users: User[] = [];
  loginResolve: (() => void) | null = null;
  loginReject: (() => void) | null = null;
  timeoutRef: ReturnType<typeof setTimeout> | null = null;
  chainId: string;

  constructor(chains: Chain[], options: NewstackAuthenticatorOptions) {
    super(chains);
    this.appId = options.appId;
    this.authUrl = options.authUrl;
    this.signUrl = options.signUrl;
    this.daoDomain = options.daoDomain;
    this.redirectPath = options.redirectPath;
    this.newgraphUrl = options.newgraphUrl;
    this.chainId = chains?.[0]?.chainId;
  }

  init(): Promise<void> {
    return Promise.resolve();
  }

  reset = () => {
    this.users = [];
    localStorage.removeItem(NEWSTACK_LOCAL_STORAGE_KEY);
    localStorage.removeItem(NEWSTACK_ACCOUNT_NAME_STORAGE_KEY);
  };
  isErrored() {
    return false;
  }
  getOnboardingLink = () => {
    return this.authUrl;
  };
  getError() {
    return null;
  }
  isLoading() {
    return false;
  }
  getName() {
    return "Newsafe Cloud";
  }

  getStyle = () => {
    return {
      icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjAgMjIwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4KICA8Y2lyY2xlIHN0eWxlPSJzdHJva2U6IzAwMDtzdHJva2Utd2lkdGg6MDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtZGFzaG9mZnNldDowO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O2ZpbGw6IzAwMDtmaWxsLXJ1bGU6bm9uemVybztvcGFjaXR5OjEiIHZlY3Rvci1lZmZlY3Q9Im5vbi1zY2FsaW5nLXN0cm9rZSIgcj0iNDAiIHRyYW5zZm9ybT0ibWF0cml4KDIuNzUgMCAwIDIuNzUgMTEwLjM4IDExMC4zOCkiLz4KICA8Zz4KICAgIDxwYXRoIHN0eWxlPSJzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MTtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtZGFzaG9mZnNldDowO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O2ZpbGw6I2ZmZjtmaWxsLXJ1bGU6bm9uemVybztvcGFjaXR5OjEiIHRyYW5zZm9ybT0ibWF0cml4KDEuMTggMCAwIDEuMTggLjE3IC42NykiIGQ9Im02OC4yMDQgMzYuNjQ4IDcuNzEgMjMuMjMgNC44NTctMi4xNjYtMTIuMTA3LTIxLjI3Ny02LjcyNi0zMC44NzRhOTEuNTMzIDkxLjUzMyAwIDAgMC0xMi4yMDYgNS40NDdsMTguNDcyIDI1LjY0Wk0yMC4xODcgMzUuOTQ0IDQ3LjQ2OCA1MS44NGwxNi40ODcgMTguMDk1IDMuNTQ0LTMuOTM3LTE5LjcyLTE0LjUxOS0xOC42NjgtMjUuNDZhOTEuNjQ3IDkxLjY0NyAwIDAgMC04Ljk0IDkuOTI1aC4wMTZaTTU3LjAzMiA0My4xNmwxMi4zNyAyMS4xMyA0LjI5Ny0zLjExOC0xNi4yNzMtMTguMjkxLTEyLjk3Ny0yOC44MDdhOTIuNTUxIDkyLjU1MSAwIDAgMC0xMC43OTQgNy44NThMNTcuMDMyIDQzLjE2Wk0zMi4xMTQgOTkuNzQybDI0LjQ3Ni0uMTQ4LS41NTgtNS4yODItMjMuOTg0IDQuOTM4TC42NSA5Ni4wODRhOTMuMjY4IDkzLjI2OCAwIDAgMCAxLjM3OCAxMy4yODhsMzAuMDctOS42M2guMDE3Wk0zMi4wNDggODYuODE0bDIzLjk4NCA0LjkzOC41NTgtNS4yODItMjQuNDc2LS4xNDgtMzAuMDg3LTkuNjNBOTMuMDE0IDkzLjAxNCAwIDAgMCAuNjUgODkuOThsMzEuNC0zLjE2NlpNMzQuNjkgNzQuMTY4bDIyLjQyNSA5LjgyNiAxLjY0LTUuMDUyLTIzLjkxOC01LjIzNC0yNy40MjktMTUuN2E5Mi44MDIgOTIuODAyIDAgMCAwLTQuMTM0IDEyLjcxNWwzMS40MTUgMy40NDVaTTgwLjQ3NSAzMi42MTNsMi43MDYgMjQuMzI4IDUuMTg0LTEuMDk5LTcuNDE1LTIzLjMyNy0uMTMtMzEuNThhOTEuMTYgOTEuMTYgMCAwIDAtMTMuMDc2IDIuNzcybDEyLjczIDI4LjkwNlpNMzkuOTA2IDYyLjMzN2wxOS45IDE0LjI3MyAyLjY1Ny00LjU5NC0yMi4zMS0xMC4wODlMMTYuNTc3IDQwLjg4YTkyLjk0OCA5Mi45NDggMCAwIDAtNi42OTMgMTEuNTY1bDMwLjAyMSA5Ljg5MlpNMTMwLjAzNSA4My45NzdsMjIuNDI1LTkuODI3IDMxLjQxNi0zLjQ0NWE5Mi44ODEgOTIuODgxIDAgMCAwLTQuMTM0LTEyLjcxNGwtMjcuNDI5IDE1LjY4My0yMy45MTkgNS4yMzMgMS42NDEgNS4wNTN2LjAxN1pNMTQ2Ljk5NyA2MS45MSAxMjQuNjg2IDcybDIuNjU4IDQuNTkzIDE5Ljg5OS0xNC4yNzMgMzAuMDIxLTkuODkyYTkxLjgyOCA5MS44MjggMCAwIDAtNi42OTMtMTEuNTY1TDE0Ni45OTcgNjEuOTFaTTEyOS43MjIgNDIuODY4bC0xNi4yNzMgMTguMjkxIDQuMjk4IDMuMTE3IDEyLjM2OS0yMS4xMyAyMy4zNzctMjEuMjI3YTkyLjYxNiA5Mi42MTYgMCAwIDAtMTAuNzk0LTcuODU5bC0xMi45NzcgMjguODA4Wk04Ni45MDYuMjk1bDYuNDMgMzAuOTA3LTIuNDEgMjQuMzZoNS4zMTRsLTIuNDExLTI0LjM2TDEwMC4yNi4yOTVhOTAuMTMgOTAuMTMgMCAwIDAtNi42NzctLjI2M2MtMi4yNDggMC00LjQ2Mi4xMTUtNi42NzcuMjYzWk0xMTguNTAyIDM2LjQ1bC0xMi4xMDcgMjEuMjc4IDQuODU2IDIuMTY1IDcuNzEtMjMuMjI5IDE4LjQ3Mi0yNS42NGE5MS41MTcgOTEuNTE3IDAgMCAwLTEyLjIwNS01LjQ0N2wtNi43MSAzMC44OS0uMDE2LS4wMTZaTTEwNi4xOTggMzIuNDk3bC03LjQxNSAyMy4zMjggNS4xODQgMS4wOTkgMi43MDYtMjQuMzI5TDExOS40MDQgMy42OUE5Mi45NDQgOTIuOTQ0IDAgMCAwIDEwNi4zMjkuOTE3bC0uMTMxIDMxLjU4Wk0xNTguMDIyIDI2LjAxOWwtMTguNjY5IDI1LjQ2LTE5LjcxOSAxNC41MTkgMy41NDQgMy45MzcgMTYuNDg2LTE4LjA5NSAyNy4yODItMTUuODk2YTkzLjE5OSA5My4xOTkgMCAwIDAtOC45NDEtOS45MjVoLjAxN1pNMTE4Ljk0NSAxNDkuNDE2bC03LjcxLTIzLjIyOS00Ljg1NiAyLjE2NSAxMi4xMDcgMjEuMjc4IDYuNzEgMzAuODlhOTEuNDA5IDkxLjQwOSAwIDAgMCAxMi4yMDUtNS40NDZsLTE4LjQ3Mi0yNS42NDEuMDE2LS4wMTdaTTEzMC4xMTYgMTQyLjkybC0xMi4zNjktMjEuMTI5LTQuMjk4IDMuMTE2IDE2LjI3MyAxOC4yOTIgMTIuOTc3IDI4LjgwN2E5Mi41NTggOTIuNTU4IDAgMCAwIDEwLjc5NC03Ljg1OGwtMjMuMzc3LTIxLjIyOFpNMTQ3LjI0MyAxMjMuNzQybC0xOS44OTktMTQuMjcyLTIuNjU4IDQuNTkzIDIyLjMxMSAxMC4wODkgMjMuNTc0IDIxLjA0OGE5My4wNDUgOTMuMDQ1IDAgMCAwIDYuNjkzLTExLjU2NmwtMzAuMDIxLTkuODkyWk0xNjYuOTYyIDE1MC4xMzhsLTI3LjI4MS0xNS44OTYtMTYuNDg3LTE4LjA5NS0zLjU0NCAzLjkzNyAxOS43MTkgMTQuNTE5IDE4LjY2OSAyNS40NmE5MS42MDEgOTEuNjAxIDAgMCAwIDguOTQtOS45MjVoLS4wMTZaTTE1NS4wMzUgODYuMzIybC0yNC40NzYuMTQ4LjU1OCA1LjI4MiAyMy45ODQtNC45MzhMMTg2LjUgODkuOThhOTMuMzE3IDkzLjMxNyAwIDAgMC0xLjM3OC0xMy4yODhsLTMwLjA3MSA5LjYzaC0uMDE2Wk0xNTUuMTAxIDk5LjI1bC0yMy45ODQtNC45MzgtLjU1OCA1LjI4MiAyNC40NzYuMTQ4IDMwLjA3IDkuNjNhOTIuOTI0IDkyLjkyNCAwIDAgMCAxLjM3OC0xMy4yODhsLTMxLjM5OSAzLjE2NmguMDE3Wk0xNTIuNDYgMTExLjkxNGwtMjIuNDI1LTkuODI2LTEuNjQxIDUuMDUzIDIzLjkxOSA1LjIzMyAyNy40MjkgMTUuNjgzYTkyLjg2MiA5Mi44NjIgMCAwIDAgNC4xMzQtMTIuNzE0bC0zMS40MTYtMy40NDV2LjAxNlpNMTAwLjI2IDE4NS43NjlsLTYuNDMxLTMwLjkwNyAyLjQxMS0yNC4zNjFoLTUuMzE1bDIuNDEyIDI0LjM2MS02LjQzMSAzMC45MDdhOTAuMTQgOTAuMTQgMCAwIDAgNi42NzcuMjYzYzIuMjQ3IDAgNC40NjItLjExNSA2LjY3Ny0uMjYzWk0xMDYuNjczIDE1My40NjZsLTIuNzA2LTI0LjMyOC01LjE4NCAxLjA5OSA3LjQxNSAyMy4zMjguMTMxIDMxLjU3OWE5MS4yMjIgOTEuMjIyIDAgMCAwIDEzLjA3NS0yLjc3MmwtMTIuNzMxLTI4LjkwNlpNNTcuNDI2IDE0My4xOTlsMTYuMjczLTE4LjI5Mi00LjI5OC0zLjExNi0xMi4zNjkgMjEuMTI5LTIzLjM3NyAyMS4yMjhhOTIuNTA1IDkyLjUwNSAwIDAgMCAxMC43OTQgNy44NThsMTIuOTc3LTI4LjgwN1pNNDAuMTUyIDEyNC4xNjhsMjIuMzExLTEwLjA4OS0yLjY1Ny00LjU5NC0xOS45IDE0LjI3My0zMC4wMiA5Ljg5MmE5MS43NjIgOTEuNzYyIDAgMCAwIDYuNjkyIDExLjU2NWwyMy41NzQtMjEuMDQ3Wk0yOS4xMjggMTYwLjA0N2wxOC42NjktMjUuNDYgMTkuNzE4LTE0LjUxOC0zLjU0My0zLjkzOC0xNi40ODcgMTguMDk1LTI3LjI2NSAxNS44OTZhOTMuMTU5IDkzLjE1OSAwIDAgMCA4Ljk0IDkuOTI1aC0uMDMyWk02OC42NDcgMTQ5LjYzbDEyLjEwNy0yMS4yNzgtNC44NTYtMi4xNjUtNy43MSAyMy4yMjktMTguNDU2IDI1LjY0MWE5MS41NjIgOTEuNTYyIDAgMCAwIDEyLjIwNiA1LjQ0N2w2LjcxLTMwLjg5MXYuMDE3Wk0zNC44MzcgMTEyLjM3NGwyMy45MTgtNS4yMzMtMS42NC01LjA1My0yMi40MjYgOS44MjYtMzEuNDE1IDMuNDQ1YTkyLjc4MiA5Mi43ODIgMCAwIDAgNC4xMzQgMTIuNzE0bDI3LjQyOS0xNS42ODN2LS4wMTZaTTgwLjk2OCAxNTMuNTY1bDcuNDE1LTIzLjMyOC01LjE4NC0xLjA5OS0yLjcwNyAyNC4zMjgtMTIuNzMgMjguOTA2YTkyLjk0NiA5Mi45NDYgMCAwIDAgMTMuMDc1IDIuNzcybC4xMy0zMS41NzlaIi8+CiAgPC9nPgo8L3N2Zz4=",
      text: this.getName(),
      textColor: "black",
      background: "#FFFFFF",
    };
  };

  shouldRender = () => {
    return true;
  };

  shouldAutoLogin = () => {
    return this.users.length > 0;
  };

  shouldInvalidateAfter = () => {
    const payload = getJwtPayload();
    let invalidateAfter = 0;
    if (payload) {
      const expires = new Date(payload.config.expires);
      const diffInSeconds = (expires.getTime() - Date.now()) / 1000;
      invalidateAfter = Math.max(0, diffInSeconds);
    }
    return invalidateAfter;
  };

  async shouldRequestAccountName() {
    return false;
  }

  login = async (): Promise<User[]> => {
    const isLoggedIn = this.isLoggedIn();
    const accountName = getAccountNameFromLocalStorage();
    if (isLoggedIn && accountName) {
      const { chainId, signUrl } = this;
      const user = new NewstackUser({
        accountName,
        chainId,
        authUrl: signUrl,
      });
      this.users = [user];
      return this.users;
    }
    await this.waitForAuthFlow();
    const user = await this.getUser();
    if (user) {
      this.users = [user];
    } else {
      this.users = [];
    }
    return this.users;
  };

  logout = async () => {
    this.reset();
  };

  requiresGetKeyConfirmation() {
    return false;
  }

  private isLoggedIn = () => {
    return !!getJwtFromLocalStorage();
  };

  private waitForAuthFlow = async () => {
    return new Promise<void>((res, rej) => {
      this.loginResolve = res;
      this.loginReject = rej;
      const requestor = encodeURIComponent(this.daoDomain);
      const referer = encodeURIComponent(window.origin);
      const redirectUrl = encodeURIComponent(
        `${window.origin}${this.redirectPath}`
      );
      window.open(
        `${this.authUrl}/explore?requestor=${requestor}&referer=${referer}&redirectUrl=${redirectUrl}`,
        "login"
      );
      window.addEventListener("message", this.processMessage);
      this.timeoutRef = setTimeout(this.onTimeout, 60000);
    });
  };

  private processMessage = (event: MessageEvent) => {
    if (event.origin === window.location.origin) {
      const token = event.data?.["newstack_login"];
      if (token) {
        setJwtToLocalStorage(token);
        this.loginResolve?.();
        this.afterAuthFlow();
      }
    }
  };

  private onTimeout = () => {
    this.loginReject?.();
    this.afterAuthFlow();
  };

  private afterAuthFlow = () => {
    const { timeoutRef } = this;
    window.removeEventListener("message", this.processMessage);
    if (timeoutRef !== null) {
      clearTimeout(timeoutRef);
    }
    this.loginResolve = null;
    this.loginReject = null;
    this.timeoutRef = null;
  };

  private getUser = async (): Promise<User> => {
    const data = await this.fetch<NGUserResponse>(
      `${this.newgraphUrl}/creator/user/current`
    );
    setAccountNameToLocalStorage(data.username);
    const { chainId, signUrl } = this;
    return new NewstackUser({
      accountName: data.username,
      chainId,
      authUrl: signUrl,
    });
  };

  private fetch<T>(request: RequestInfo, opts?: FetchOptions): Promise<T> {
    const jwt = getJwtFromLocalStorage();
    return $fetch(request, {
      ...opts,
      headers: {
        ...opts?.headers,
        Authorization: `unsid ${jwt}`,
      },
    });
  }
}
