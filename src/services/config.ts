import jsonConfig from "../config/default.json";

interface Config {
  apiURL: string;
  socketURL: string;
}

const config: Config = jsonConfig;

export default config;
