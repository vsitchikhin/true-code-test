/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface RegisterUserDto {
  /** @example "user@example.com" */
  email: string;
  /** @example "johndoe" */
  username: string;
  /** @example "+79991234567" */
  phoneNumber: string;
  /** @example "password123" */
  password: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  username: string;
  phoneNumber: string;
  bio?: string | null;
  avatarPath?: string | null;
  /** @format date-time */
  createdAt: string;
}

export interface UpdateProfileDto {
  /** @example "new_username" */
  username?: string;
  /** @example "I am a software engineer" */
  bio?: string;
  /** @example "https://example.com/avatar.png" */
  avatarPath?: string;
}

export interface LoginDto {
  /**
   * Email или имя пользователя
   * @example "john_doe"
   */
  identifier: string;
  /**
   * Пароль пользователя
   * @example "Password123!"
   */
  password: string;
}

export interface AuthResponseDto {
  /**
   * JWT access token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  accessToken: string;
}

export interface PostImageResponseDto {
  id: string;
  path: string;
  order: number;
  /** @format date-time */
  createdAt: string;
}

export interface PostResponseDto {
  id: string;
  content: string;
  authorId: string;
  /** @format date-time */
  createdAt: string;
  images: PostImageResponseDto[];
  author?: UserResponseDto;
}

export interface FeedMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedResponseDto {
  posts: PostResponseDto[];
  meta: FeedMetaDto;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from 'axios';
import axios from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<
  AxiosRequestConfig,
  'data' | 'params' | 'url' | 'responseType'
> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<
  AxiosRequestConfig,
  'data' | 'cancelToken'
> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || '',
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { 'Content-Type': type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title True Code API
 * @version 1.0
 * @contact
 *
 * Документация API социальной сети
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags users
     * @name UserControllerRegister
     * @summary Регистрация нового пользователя
     * @request POST:/api/users/register
     */
    userControllerRegister: (data: RegisterUserDto, params: RequestParams = {}) =>
      this.request<UserResponseDto, void>({
        path: `/api/users/register`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerGetMe
     * @summary Получение профиля текущего пользователя
     * @request GET:/api/users/me
     */
    userControllerGetMe: (params: RequestParams = {}) =>
      this.request<UserResponseDto, void>({
        path: `/api/users/me`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerUpdateMe
     * @summary Обновление профиля текущего пользователя
     * @request PATCH:/api/users/me
     */
    userControllerUpdateMe: (data: UpdateProfileDto, params: RequestParams = {}) =>
      this.request<UserResponseDto, void>({
        path: `/api/users/me`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerUpdateAvatar
     * @summary Обновление аватара пользователя
     * @request PATCH:/api/users/avatar
     */
    userControllerUpdateAvatar: (params: RequestParams = {}) =>
      this.request<UserResponseDto, any>({
        path: `/api/users/avatar`,
        method: 'PATCH',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerLogin
     * @summary Авторизация пользователя
     * @request POST:/api/auth/login
     */
    authControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
      this.request<AuthResponseDto, void>({
        path: `/api/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerRefresh
     * @summary Обновление токенов
     * @request POST:/api/auth/refresh
     */
    authControllerRefresh: (params: RequestParams = {}) =>
      this.request<AuthResponseDto, void>({
        path: `/api/auth/refresh`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerLogout
     * @summary Выход из системы
     * @request POST:/api/auth/logout
     * @secure
     */
    authControllerLogout: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/auth/logout`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name PostControllerCreate
     * @summary Создание нового поста
     * @request POST:/api/posts
     */
    postControllerCreate: (
      data: {
        content?: string;
        images?: File[];
      },
      params: RequestParams = {},
    ) =>
      this.request<PostResponseDto, any>({
        path: `/api/posts`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name PostControllerGetFeed
     * @summary Получение ленты постов
     * @request GET:/api/posts
     */
    postControllerGetFeed: (
      query?: {
        page?: string;
        limit?: string;
        order?: 'ASC' | 'DESC';
      },
      params: RequestParams = {},
    ) =>
      this.request<FeedResponseDto, any>({
        path: `/api/posts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name PostControllerUpdate
     * @summary Обновление поста
     * @request PATCH:/api/posts/{id}
     */
    postControllerUpdate: (
      id: string,
      data: {
        content?: string;
        removeImageIds?: string[];
        images?: File[];
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/posts/${id}`,
        method: 'PATCH',
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags posts
     * @name PostControllerDelete
     * @request DELETE:/api/posts/{id}
     */
    postControllerDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/posts/${id}`,
        method: 'DELETE',
        ...params,
      }),
  };
}
