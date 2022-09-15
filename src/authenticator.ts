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

  reset() {
    this.users = [];
    localStorage.removeItem(NEWSTACK_LOCAL_STORAGE_KEY);
    localStorage.removeItem(NEWSTACK_ACCOUNT_NAME);
  }
  isErrored() {
    return false;
  }
  getOnboardingLink() {
    return this.authUrl;
  }
  getError() {
    return null;
  }
  isLoading() {
    return false;
  }
  getName() {
    return "Newstack Cloud";
  }

  getStyle = () => {
    return {
      icon: "",
      text: this.getName(),
      textColor: "black",
      background: "#FFFFFF",
    };
  };

  shouldRender() {
    return true;
  }

  shouldAutoLogin() {
    return this.users.length > 0;
  }

  async shouldRequestAccountName() {
    return false;
  }

  async login(): Promise<User[]> {
    const isLoggedIn = this.isLoggedIn();
    const accountName = this.getAccountNameFromLocalStorage();
    if (isLoggedIn && accountName) {
      const user = new NewstackUser(accountName, this.chainId);
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
  }

  async logout() {
    this.reset();
  }

  requiresGetKeyConfirmation() {
    return false;
  }

  private isLoggedIn() {
    return !!this.getJwtFromLocalStorage();
  }

  private async waitForAuthFlow() {
    return new Promise<void>((res, rej) => {
      this.loginResolve = res;
      this.loginReject = rej;
      const requestor = encodeURIComponent(this.daoDomain);
      const referer = encodeURIComponent(window.origin);
      const redirectUrl = encodeURIComponent(`${window.origin}/newstack/login`);
      window.open(
        `${this.authUrl}?requestor=${requestor}&referer=${referer}&redirectUrl=${redirectUrl}`,
        "login"
      );
      window.addEventListener("message", this.processMessage);
      this.timeoutRef = setTimeout(this.onTimeout, 60000);
    });
  }

  private processMessage = (event: MessageEvent) => {
    if (event.origin === window.location.origin) {
      const token = event.data?.["newstack_login"];
      if (token) {
        this.setJwtToLocalStorage(token);
      }
      this.loginResolve?.();
      this.afterAuthFlow();
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

  private async getUser(): Promise<User> {
    const data = await this.fetch<NGUserResponse>(
      `${this.newgraphUrl}/creator/user/current`
    );
    this.setAccountNameToLocalStorage(data.username);
    return new NewstackUser(data.username, this.chainId);
  }

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
