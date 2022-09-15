# UAL module for Newsafe Cloud wallet

## Installation

```sh
yarn add ual-newsafe-cloud
# or
npm install ual-newsafe-cloud
```

## Usage

### Configuring the authenticator

```ts
import { NewsafeCloudAuthenticator } from "ual-newsafe-cloud";
const eos = {
  chainId: "add7deb61981d83563f2c09f266acbfa48153f14453639b4a6259c4c8225d0e7"
  rpcEndpoints: [
    {
      protocol: "https",
      host: "nodeos-dev.newcoin.org",
      port: "443",
    },
  ],
};

const config = {
  appId: NEWSTACK_APP_ID,
  authUrl: "https://auth-dev.unsid.org/explore",
  daoDomain: YOUR_DAO_DOMAIN,
  newgraphUrl: "https://api-eu-dev.newlife.io",
  redirectUrl: YOUR_REDIRECT_URL,
};

const newsafeCloud = new NewsafeCloudAuthenticator([eos], config);

// add to authenticators list, for example:
<UALProvider chains={[newcoin]} authenticators={[newsafeCloud]}>
  <AppWithUAL />
</UALProvider>

```

### Configuring the callback page

As part of the OAuth flow implemented by newsafe cloud wallet, you site will receive the
token to the specified `redirectUrl`, for that we provide a function to handle the response.
You can execute it in the page you specified:

```ts
//    /your/redirect/page
import { handleTokenResponse } from "ual-newsafe-cloud";

handleTokenResponse();
```

The function will fetch the token from the query params, send it to your application's original page and close the current page.
