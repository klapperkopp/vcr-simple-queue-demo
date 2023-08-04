import fs from "fs";
import os from "os";

const DIRS_TO_SEARCH = [
  "~/.neru-cli",
  `/home/${os.userInfo().username}/.neru-cli`,
  `/Users/${os.userInfo().username}/.neru-cli`,
];

const RETURN_TYPES = {
  KEY_AND_SECRET: "KEY_AND_SECRET",
  KEY_ONLY: "KEY_ONLY",
  SECRET_ONLY: "SECRET_ONLY",
};

export function validateApiKeyAndSecret(reqApiKey, reqApiSecret) {
  const [sysApiKey, sysApiSecret] = getAppApiKeyAndSecret();
  if (sysApiKey === reqApiKey && sysApiSecret === reqApiSecret) {
    return true;
  } else {
    return false;
  }
}

function getAppApiKey() {
  return readNeruCliFile(RETURN_TYPES.KEY_ONLY);
}

function getAppApiSecret() {
  return readNeruCliFile(RETURN_TYPES.SECRET_ONLY);
}

function getAppApiKeyAndSecret() {
  return readNeruCliFile(RETURN_TYPES.KEY_AND_SECRET);
}

function getValueByKey(text, key) {
  var regex = new RegExp("^" + key + "\\s*=\\s*(.*)$", "m");
  var match = regex.exec(text);
  if (match) return match[1];
  else return;
}

function readNeruCliFile(returnType = RETURN_TYPES.KEY_AND_SECRET) {
  try {
    let data;
    // read neru config file from all known dirs
    try {
      let fileDir = DIRS_TO_SEARCH.find((dir) => fs.existsSync(dir) === true);
      if (fileDir) {
        data = fs.readFileSync(fileDir, "utf8");
      }
    } catch (e) {
      console.error("error: ", e);
      throw new Error("no config file found.");
    }

    switch (returnType) {
      case RETURN_TYPES.KEY_ONLY:
        return getValueByKey(data, "api_key");
        break;
      case RETURN_TYPES.SECRET_ONLY:
        return getValueByKey(data, "api_secret");
        break;
      case RETURN_TYPES.KEY_AND_SECRET:
        return [
          getValueByKey(data, "api_key"),
          getValueByKey(data, "api_secret"),
        ];
        break;
      default:
        return;
    }
  } catch (e) {
    console.error("read error: ", e);
    return;
  }
}
