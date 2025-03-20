import * as fs from "fs";
import axios from "axios";

const SECRETS_MANAGER_PREFIX = "sm://";

const AWS_SECRETS_EXTENTION_HTTP_PORT = 2773;
const AWS_SECRETS_EXTENTION_SERVER_ENDPOINT = `http://localhost:${AWS_SECRETS_EXTENTION_HTTP_PORT}/secretsmanager/get?secretId=`;

const ENV_SECRET_PREFIX = "ENV_SECRET_";

export class FileReadError extends Error {
  constructor(path: string) {
    super(`FileReadError: ${path}`);
  }
}

export class FileParseError extends Error {
  constructor(e: unknown) {
    super(`SecretService FileParseError: ${e}`);
  }
}

export class SecretsService {
  private readonly secrets: Map<string, string>;

  constructor(secrets: Map<string, string>) {
    this.secrets = secrets;
  }

  static async fromSecretsManager(secretName: string): Promise<string> {
    const url = `${AWS_SECRETS_EXTENTION_SERVER_ENDPOINT}${secretName}`;
    const response = await axios.get(url, {
      headers: {
        "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN ?? ""
      }
    });
    const secret = response.data?.SecretString;
    if (!secret) {
      throw new Error(`Secret value for ${secretName} not found!`);
    }
    return secret;
  }

  static async fromEnvVarJsonFile(
    envName?: string,
    pathToJsonFile?: string
  ): Promise<SecretsService> {
    const merged: [string, string][] = [];

    if (!envName) {
      console.warn(`Secrets env var name not set: ${envName}`);
    } else {
      try {
        const ssFromEnv = SecretsService.fromEnvVar(envName);
        merged.push(...ssFromEnv.getAll().entries());
      } catch (e) {
        console.warn("SecretService.fromEnvVarJsonFile: Ignored EnvVar");
      }
    }

    if (!pathToJsonFile) {
      console.warn(`Secrets file var name not set: ${pathToJsonFile}`);
    } else {
      try {
        const ssFromFile = SecretsService.fromJsonFile(pathToJsonFile);
        merged.push(...ssFromFile.getAll().entries());
      } catch (e) {
        console.warn("SecretService.fromEnvVarJsonFile: Ignored file");
      }
    }

    if (merged.length === 0) {
      console.warn("No secrets found!");
    }

    for (const secret of merged) {
      const [, value] = secret;
      if (value.startsWith(SECRETS_MANAGER_PREFIX)) {
        const secretName = value.replace(SECRETS_MANAGER_PREFIX, "");
        const secretValue = await this.fromSecretsManager(secretName);
        secret[1] = secretValue;
      }
    }

    return new SecretsService(new Map<string, string>(merged));
  }

  static fromJsonFile(pathToJsonFile: string): SecretsService {
    if (!fs.existsSync(pathToJsonFile)) {
      return new SecretsService(new Map<string, string>());
    }
    try {
      const fileContents = fs.readFileSync(pathToJsonFile).toString();
      const jsonData = JSON.parse(fileContents);
      return new SecretsService(SecretsService.fromJsonData(jsonData));
    } catch (e) {
      throw new FileReadError(pathToJsonFile);
    }
  }

  static fromEnvVar(envName: string): SecretsService {
    const envValue = process.env[envName];
    if (typeof envValue !== "string") {
      throw new Error(`Given env is not defined: ${envName}`);
    }

    let jsonData: Record<string, unknown>;
    try {
      jsonData = JSON.parse(envValue);
    } catch (e) {
      throw new FileParseError(e);
    }

    return new SecretsService(SecretsService.fromJsonData(jsonData));
  }

  private static fromJsonData(
    content: Record<string, unknown>
  ): Map<string, string> {
    const secrets = new Map<string, string>();
    Object.entries(content).forEach(([key, value]) => {
      if (typeof value !== "string") {
        return;
      }
      
      if (value.startsWith(ENV_SECRET_PREFIX)) {
        value = process.env[key];
      }
      
      secrets.set(key, value as string);
    });

    return secrets;
  }

  get(secretName: string): string {
    const secret = this.secrets.get(secretName);
    if (secret === undefined) {
      throw new Error("Secret missing: " + secretName);
    }

    return secret;
  }

  getAll(): Map<string, string> {
    return new Map(this.secrets);
  }
}
