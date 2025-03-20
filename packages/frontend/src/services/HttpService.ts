/* eslint-disable @typescript-eslint/no-explicit-any */
import { persistentStorageService } from "@/dependencies";
import {
  ConnectedWalletKey,
  getAuthKey,
  makeUnauthorizedAPIRequestEvent
} from "@/constants";
import axios, { AxiosRequestConfig } from "axios";

export class HttpService {
  constructor(private readonly baseApiUrl: string) {}

  async get<T>(path: string, config?: AxiosRequestConfig<any>): Promise<T> {
    const token = this.getBearerToken();
    return axios
      .get(this.baseApiUrl + path, {
        headers: {
          Authorization: "Bearer " + token,
          "my-custom-header": "my-custom-value"
        },
        ...config
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 401) {
          document.dispatchEvent(makeUnauthorizedAPIRequestEvent(error));
        }
        throw error;
      });
  }

  async post<T>(
    path: string,
    body: any,
    config?: AxiosRequestConfig<any>
  ): Promise<T> {
    const token = this.getBearerToken();
    return axios
      .post(this.baseApiUrl + path, body, {
        headers: {
          Authorization: "Bearer " + token
        },
        ...config
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 401) {
          document.dispatchEvent(makeUnauthorizedAPIRequestEvent(error));
        }
        if (error.response.data.message) {
          throw new Error(error.response.data.message);
        }
        throw error;
      });
  }

  async put<T>(
    path: string,
    body: any,
    config?: AxiosRequestConfig<any>
  ): Promise<T> {
    const token = this.getBearerToken();
    return axios
      .put(this.baseApiUrl + path, body, {
        headers: {
          Authorization: "Bearer " + token
        },
        ...config
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 401) {
          document.dispatchEvent(makeUnauthorizedAPIRequestEvent(error));
        }
        throw error;
      });
  }

  async delete<T>(path: string, config?: AxiosRequestConfig<any>): Promise<T> {
    const token = this.getBearerToken();
    return axios
      .delete(this.baseApiUrl + path, {
        headers: {
          Authorization: "Bearer " + token
        },
        ...config
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 401) {
          document.dispatchEvent(makeUnauthorizedAPIRequestEvent(error));
        }
        throw error;
      });
  }

  private getBearerToken() {
    const wallet = persistentStorageService.getString(ConnectedWalletKey);

    return wallet && persistentStorageService.getString(getAuthKey(wallet));
  }
}
