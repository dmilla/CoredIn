import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  UserInfoResponse,
  ListCredentialsResponse,
  LoginResponse,
  RequestCredentialIssuanceResponse,
  InitiateCredentialIssuanceRequest,
  InitiateCredentialIssuanceResponse,
  AcceptCredentialIssuanceRequest,
} from './app.types';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ContractsService } from './contracts/services/ContractService';
import { createHash } from 'crypto';
import {
  CredentialDegree,
  CredentialEmployment,
  CredentialEvent,
} from './contracts/generated/MyProject.types';
import parseInteger from './utils/parseInteger';

@Injectable()
export class AppService {
  private readonly apiHost: string;
  private readonly apiUrl: string;

  constructor(
    configService: ConfigService,
    private readonly contractsService: ContractsService,
  ) {
    this.apiHost = `${configService.getOrThrow(
      'walletKit.baseUrl',
    )}:${configService.getOrThrow('walletKit.port')}`;
    this.apiUrl = `${this.apiHost}/api`;
  }

  async login(walletAddress: string): Promise<LoginResponse> {
    // 1. Retrieve the user. NOTE: Also creates the account using wallet address as ID if it does not exist.
    const user = await this.getOrCreateUserAsync(walletAddress);
    const dids = await this.getDidsAsync(user.token);
    if (dids.length > 1) {
      throw new Error('More than one DID registered.');
    }
    // 3. Provide the user's did if available, or create a new one linked to the wallet.
    const did =
      dids.length > 0 ? dids[0] : await this.createDidAsync(user.token);
    return {
      did,
      token: user.token,
    };
  }

  async listCredentials(token: string): Promise<ListCredentialsResponse> {
    const options = this.getRequestOptions(token);
    const response = await axios.get(
      `${this.apiUrl}/wallet/credentials/list`,
      options,
    );
    this.validateResponse(response);
    return response.data;
  }

  async listOtherCredentials(
    token: string,
    targetWallet: string,
  ): Promise<ListCredentialsResponse> {
    const loggedUserInfo = await this.getUserInfoAsync(token);
    const isAllowed = await this.contractsService.isAllowed(
      loggedUserInfo.id,
      targetWallet,
    );
    if (!isAllowed) {
      console.log('Verifiable credentials are not visible for requesting user');
      return { list: [] };
    }
    console.log(
      'FOUND ONCHAIN SMART NFT ACCESS! Sharing verifiable credentials...',
    );
    const otherToken = await this.login(targetWallet);
    const options = this.getRequestOptions(otherToken.token);
    const response = await axios.get(
      `${this.apiUrl}/wallet/credentials/list`,
      options,
    );
    this.validateResponse(response);
    return response.data;
  }

  async issueCredential(token: string, credential: object): Promise<any> {
    // 1. Resolve token to id (walletAddress) through userInfo.
    const { id } = await this.getUserInfoAsync(token);
    const dids = await this.getDidsAsync(token);
    if (!id || dids.length !== 1) {
      throw new Error('User is not properly registered.');
    }
    console.log(JSON.stringify(dids));
    // 2. Make issuance request.
    const { oidcUri } = await this.requestCredentialIssuanceAsync(credential);
    console.log(JSON.stringify(oidcUri));
    // 3. Initiate issuance.
    const { sessionId } = await this.initiateCredentialIssuanceAsync({
      token,
      oidcUri,
    });

    // 4. Accept issuance.
    const res = await this.acceptCredentialIssuance({
      token,
      did: dids[0],
      sessionId,
    });

    // 5, Get DIDs
    const credentials = await this.listCredentials(token);

    const foundCredential = credentials.list.sort(
      (a, b) => Date.parse(b['issuanceDate']) - Date.parse(a['issuanceDate']),
    )[0];

    if (foundCredential) {
      console.log('found!', foundCredential);
      console.log('issued at', foundCredential['issuanceDate']);
      if (foundCredential['type'].includes('VerifiableDiploma')) {
        await this.storeDegreeVc(foundCredential, id);
      }
      if (foundCredential['type'].includes('VerifiableEmployment')) {
        await this.storeEmploymentVc(foundCredential, id);
      }
      if (foundCredential['type'].includes('VerifiableEvent')) {
        await this.storeEventVc(foundCredential, id);
      }
    }
  }

  private async storeDegreeVc(foundCredential: object, id: string) {
    const yearStr = foundCredential['credentialSubject']['awardingOpportunity'][
      'endedAtTime'
    ]?.slice(0, 4);
    const data: CredentialDegree = {
      institution_did: foundCredential['issuer'],
      institution_name:
        foundCredential['credentialSubject']['awardingOpportunity'][
          'awardingBody'
        ]['preferredName'],
      owner: id,
      year: parseInteger(yearStr),
    };
    console.log('found diploma, mapped to onchain', data);
    await this.contractsService.storeVc({
      Degree: {
        data,
        vc_hash: createHash('sha256')
          .update(JSON.stringify(foundCredential))
          .digest('hex'),
      },
    });
  }

  private async storeEmploymentVc(foundCredential: object, id: string) {
    const startYearStr =
      foundCredential['credentialSubject']['awardingOpportunity']['startYear'];
    const endYearStr =
      foundCredential['credentialSubject']['awardingOpportunity']['endYear'];
    const data: CredentialEmployment = {
      institution_did: foundCredential['issuer'],
      institution_name:
        foundCredential['credentialSubject']['awardingOpportunity'][
          'awardingBody'
        ]['preferredName'],
      owner: id,
      start_year: parseInteger(startYearStr),
      end_year: parseInteger(endYearStr),
    };
    console.log('found employment, mapped to onchain', data);
    await this.contractsService.storeVc({
      Employment: {
        data,
        vc_hash: createHash('sha256')
          .update(JSON.stringify(foundCredential))
          .digest('hex'),
      },
    });
  }

  private async storeEventVc(foundCredential: object, id: string) {
    const yearStr =
      foundCredential['credentialSubject']['awardingOpportunity']['year'];
    const data: CredentialEvent = {
      organizer_did: foundCredential['issuer'],
      event_name:
        foundCredential['credentialSubject']['awardingOpportunity'][
          'eventName'
        ],
      owner: id,
      year: parseInteger(yearStr),
    };
    console.log('found event, mapped to onchain', data);
    await this.contractsService.storeVc({
      Event: {
        data,
        vc_hash: createHash('sha256')
          .update(JSON.stringify(foundCredential))
          .digest('hex'),
      },
    });
  }

  private async getOrCreateUserAsync(
    walletAddress: string,
  ): Promise<UserInfoResponse> {
    const payload = { id: walletAddress };
    const response = await axios.post(`${this.apiUrl}/auth/login`, payload);
    this.validateResponse(response);
    return response.data;
  }

  private async getDidsAsync(token: string): Promise<string[]> {
    const options = this.getRequestOptions(token);
    const response = await axios.get(`${this.apiUrl}/wallet/did/list`, options);
    return response.data;
  }

  private async getUserInfoAsync(token: string): Promise<UserInfoResponse> {
    const options = this.getRequestOptions(token);
    const response = await axios.get(`${this.apiUrl}/auth/userInfo`, options);
    return response.data;
  }

  private async createDidAsync(token: string): Promise<string> {
    const payload = { method: 'key' };
    const options = this.getRequestOptions(token);
    const response = await axios.post(
      `${this.apiUrl}/wallet/did/create`,
      payload,
      options,
    );
    this.validateResponse(response);
    return response.data;
  }

  private async requestCredentialIssuanceAsync(
    credential: object,
  ): Promise<RequestCredentialIssuanceResponse> {
    const url = `${this.apiHost}/issuer-api/default/credentials/issuance/request?walletId=x-device&isPreAuthorized=true`;
    const payload = {
      credentials: [credential],
    };
    const response = await axios.post(url, payload);
    this.validateResponse(response);
    return {
      oidcUri: response.data,
    };
  }

  private async initiateCredentialIssuanceAsync({
    token,
    oidcUri,
  }: InitiateCredentialIssuanceRequest): Promise<InitiateCredentialIssuanceResponse> {
    const url = `${this.apiUrl}/wallet/issuance/startIssuerInitiatedIssuance`;
    const payload = { oidcUri };
    const options = this.getRequestOptions(token);
    const response = await axios.post(url, payload, options);
    this.validateResponse(response);
    return { sessionId: response.data };
  }

  private getRequestOptions(token: string): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  private async acceptCredentialIssuance({
    token,
    did,
    sessionId,
  }: AcceptCredentialIssuanceRequest): Promise<any> {
    const url = `${this.apiUrl}/wallet/issuance/continueIssuerInitiatedIssuance?sessionId=${sessionId}&did=${did}`;
    const options = this.getRequestOptions(token);
    const response = await axios.get(url, options);
    this.validateResponse(response);

    return response.data;
  }

  private validateResponse(response: AxiosResponse) {
    if (response.status !== 200) {
      throw new Error('Internal Server Error');
    }
  }

  healthCheck(): string {
    return 'Hello World!';
  }
}
