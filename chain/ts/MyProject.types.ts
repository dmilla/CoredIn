/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint128 = string;
export interface InstantiateMsg {
  purchase_price?: Coin | null;
  transfer_price?: Coin | null;
  [k: string]: unknown;
}
export interface Coin {
  amount: Uint128;
  denom: string;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  register: {
    bio: string;
    did: string;
    username: string;
    [k: string]: unknown;
  };
} | {
  issue_credential: {
    credential: CredentialEnum;
    [k: string]: unknown;
  };
};
export type CredentialEnum = {
  Degree: {
    data: CredentialDegree;
    [k: string]: unknown;
  };
} | {
  Employment: {
    data: CredentialEmployment;
    [k: string]: unknown;
  };
} | {
  Event: {
    data: CredentialEvent;
    [k: string]: unknown;
  };
};
export interface CredentialDegree {
  institution_did: string;
  institution_name: string;
  owner: string;
  year: number;
  [k: string]: unknown;
}
export interface CredentialEmployment {
  end_year?: number | null;
  institution_did: string;
  institution_name: string;
  owner: string;
  start_year?: number | null;
  [k: string]: unknown;
}
export interface CredentialEvent {
  event_name: string;
  organizer_did: string;
  owner: string;
  year?: number | null;
  [k: string]: unknown;
}
export type QueryMsg = {
  resolve_user_info: {
    address: string;
    [k: string]: unknown;
  };
} | {
  config: {
    [k: string]: unknown;
  };
} | {
  verify_credential: {
    data: CredentialEnum;
    [k: string]: unknown;
  };
} | {
  list_credentials: {
    address: string;
    [k: string]: unknown;
  };
};
export interface Config {
  purchase_price?: Coin | null;
  transfer_price?: Coin | null;
  [k: string]: unknown;
}
export interface ListCredentialsResponse {
  credentials: CredentialEnum[];
  [k: string]: unknown;
}
export interface ResolveRecordResponse {
  user_info?: UserInfo | null;
  [k: string]: unknown;
}
export interface UserInfo {
  bio: string;
  did: string;
  username: string;
  [k: string]: unknown;
}
export interface VerifyCredentialResponse {
  valid: boolean;
  [k: string]: unknown;
}