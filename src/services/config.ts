import jsonConfig from "../config/default.json";

// This is what the config file should look like
interface Config {
  apiURL: string;
  socketURL: string;
}

const config: Config = jsonConfig;

export default config;
