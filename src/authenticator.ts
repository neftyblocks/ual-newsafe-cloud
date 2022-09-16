import { User } from "universal-authenticator-library/dist/User";
import { Authenticator } from "universal-authenticator-library/dist/Authenticator";
import { Chain } from "universal-authenticator-library/dist/interfaces";
import { FetchOptions, $fetch } from "ohmyfetch";
import { NewstackAuthenticatorOptions, NGUserResponse } from "./types";
import { NEWSTACK_ACCOUNT_NAME, NEWSTACK_LOCAL_STORAGE_KEY } from "./constants";
import { NewstackUser } from "./user";

export class NewsafeCloudAuthenticator extends Authenticator {
  appId: string;
  authUrl: string;
  newgraphUrl: string;
  daoDomain: string;
  redirectUrl: string;
  users: User[] = [];
  loginResolve: (() => void) | null = null;
  loginReject: (() => void) | null = null;
  timeoutRef: ReturnType<typeof setTimeout> | null = null;
  chainId: string;

  constructor(chains: Chain[], options: NewstackAuthenticatorOptions) {
    super(chains);
    this.appId = options.appId;
    this.authUrl = options.authUrl;
    this.daoDomain = options.daoDomain;
    this.redirectUrl = options.redirectUrl;
    this.newgraphUrl = options.newgraphUrl;
    this.chainId = chains?.[0]?.chainId;
  }

  init(): Promise<void> {
    return Promise.resolve();
  }

  reset = () => {
    this.users = [];
    localStorage.removeItem(NEWSTACK_LOCAL_STORAGE_KEY);
    localStorage.removeItem(NEWSTACK_ACCOUNT_NAME);
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
      icon: "",
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
    const payload = this.getJwtPayload();
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
    const accountName = this.getAccountNameFromLocalStorage();
    if (isLoggedIn && accountName) {
      const { chainId, authUrl } = this;
      const user = new NewstackUser({
        accountName,
        chainId,
        authUrl,
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
    return !!this.getJwtFromLocalStorage();
  };

  private waitForAuthFlow = async () => {
    return new Promise<void>((res, rej) => {
      this.loginResolve = res;
      this.loginReject = rej;
      const requestor = encodeURIComponent(this.daoDomain);
      const referer = encodeURIComponent(window.origin);
      const redirectUrl = encodeURIComponent(`${window.origin}/newstack/login`);
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
        this.setJwtToLocalStorage(token);
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
    this.setAccountNameToLocalStorage(data.username);
    const { chainId, authUrl } = this;
    return new NewstackUser({
      accountName: data.username,
      chainId,
      authUrl,
    });
  };

  private fetch<T>(request: RequestInfo, opts?: FetchOptions): Promise<T> {
    const jwt = this.getJwtFromLocalStorage();
    return $fetch(request, {
      ...opts,
      headers: {
        ...opts?.headers,
        Authorization: `unsid ${jwt}`,
      },
    });
  }

  private getJwtFromLocalStorage() {
    return localStorage.getItem(NEWSTACK_LOCAL_STORAGE_KEY);
  }

  private getJwtPayload() {
    const jwt = this.getJwtFromLocalStorage();
    if (!jwt) {
      return null;
    }
    const payload = jwt.split(".")[1];
    return JSON.parse(atob(payload));
  }

  private getAccountNameFromLocalStorage() {
    return localStorage.getItem(NEWSTACK_ACCOUNT_NAME);
  }

  private setJwtToLocalStorage(jwt: string) {
    localStorage.setItem(NEWSTACK_LOCAL_STORAGE_KEY, jwt);
  }

  private setAccountNameToLocalStorage(accountName: string) {
    localStorage.setItem(NEWSTACK_ACCOUNT_NAME, accountName);
  }
}
