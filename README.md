# Nicer-log [![Build Status](https://travis-ci.org/Cryrivers/nicer-log.svg?branch=master)](https://travis-ci.org/Cryrivers/nicer-log) [![npm version](https://badge.fury.io/js/nicer-log.svg)](https://badge.fury.io/js/nicer-log)

> A nicer replacement of `console.log`.

- Prints log with color group labels
- Logs the status of Promises or asynchronous functions
- Filters logs in Developer Tools, OR
- Filters logs by whitelist / blacklist
- Can be removed completely in production by using Babel/TypeScript transformers

## Install

```sh
npm install --save nicer-log
```

## Usage

### Print a log

```js
import nicerLog from "nicer-log";
const log = nicerLog("App");

log("Initializing...");
```

### Log Promises

```js
import nicerLog from "nicer-log";
import { fetchUserInfo } from "./api";
const log = nicerLog("User");

const promise = fetchUserInfo();
log.async("Fetching user info", promise);
```

### Filter logs

Just use built-in filter features to temporarily filter logs.
<br /><img src="https://raw.githubusercontent.com/Cryrivers/nicer-log/master/media/filter.gif" width="689" height="434">

### Setup whitelist or blacklist

```js
import { setNicerLogBlacklist, setNicerLogWhitelist } from "nicer-log";

setNicerLogWhitelist(["App", "User", "DashboardReducer"]);
setNicerLogBlacklist(["User"]);
```

### Remove nicer-log in Production

`nicer-log` provides plugins to remove `nicer-log` for Babel and TypeScript.

#### Using Babel

Install the babel plugin

```sh
npm install --save-dev nicer-log-remover-babel
```

Edit your `.babelrc` to enable the plugin

```json
{
  "plugins": ["module:nicer-log-remover-babel"]
}
```

#### Using TypeScript

Install the TypeScript plugin

```sh
npm install --save-dev nicer-log-remover-typescript
```

`tsc` doesn't seem to support custom transformers yet. You might want to use the transformer with third-party loaders. Config for `webpack` and `ts-loader` for example:

```js
const nicerLogRemover = require("nicer-log-remover-typescript").default;

module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          getCustomTransformers() {
            return {
              before: [nicerLogRemover]
            };
          }
        }
      }
    ]
  }
  // ...
};
```

## License

[MIT License](LICENSE.md) © [Zhongliang Wang](https://cryrivers.com)
