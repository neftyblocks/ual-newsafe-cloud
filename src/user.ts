import {
  SignTransactionConfig,
  SignTransactionResponse,
} from "universal-authenticator-library";
import { User } from "universal-authenticator-library/dist/User";
import { NewstackUserParams } from "./types";

export class NewstackUser extends User {
  public accountName: string;
  constructor(private params: NewstackUserParams) {
    super();
    this.accountName = params.accountName;
  }

  signTransaction = async (
    transaction: unknown,
    config?: SignTransactionConfig
  ): Promise<SignTransactionResponse> => {
    // TODO: implement
    console.log("executing transaction", transaction, config);
    throw new Error("Method not implemented.");
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
