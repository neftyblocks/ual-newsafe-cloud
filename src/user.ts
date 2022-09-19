import { $fetch } from "ohmyfetch";
import { SignTransactionResponse } from "universal-authenticator-library/dist/interfaces";
import { User } from "universal-authenticator-library/dist/User";
import { getJwtFromLocalStorage } from "./storage";
import { NewsafeTransactionResultPayload, NewstackUserParams } from "./types";

export class NewstackUser extends User {
  public accountName: string;
  public chainId: string;

  constructor(private params: NewstackUserParams) {
    super();
    this.accountName = params.accountName;
    this.chainId = params.chainId;
  }

  signTransaction = async (
    transaction: unknown
  ): Promise<SignTransactionResponse> => {
    const jwt = getJwtFromLocalStorage();
    const result = await $fetch<NewsafeTransactionResultPayload>(
      `${this.params.authUrl}/v1/tx/newcoin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `newsafe ${jwt}`,
        },
        body: transaction as Record<string, unknown>,
      }
    );
    return {
      transaction: result,
      wasBroadcast: true,
      transactionId: result.transaction_id,
    };
  };

  signArbitrary(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  verifyKeyOwnership(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  getAccountName = (): Promise<string> => {
    return Promise.resolve(this.params.accountName);
  };
  getChainId(): Promise<string> {
    return Promise.resolve(this.params.chainId);
  }
  getKeys(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
}
