import {
  SignTransactionConfig,
  SignTransactionResponse,
} from "universal-authenticator-library";
import { User } from "universal-authenticator-library/dist/User";

export class NewstackUser extends User {
  constructor(private accountName: string, public chainId: string) {
    super();
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

  getAccountName(): Promise<string> {
    return Promise.resolve(this.accountName);
  }
  getChainId(): Promise<string> {
    return Promise.resolve(this.chainId);
  }
  getKeys(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
}
