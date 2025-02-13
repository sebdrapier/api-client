type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";
type HeadersInit = Record<string, string>;

interface ApiClientConfig {
  token?: string;
  baseUrl?: string;
  baseOptions?: HeadersInit;
}

interface RequestOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
  params?: Record<string, string | number>;
  useXhr?: boolean;
  onProgress?: (event: ProgressEvent<EventTarget>) => void;
}

/**
 * A wrapper class for making API calls with token-based authentication.
 * Supports both fetch and XMLHttpRequest (for progress/cancellation).
 */
export default class ApiClient {
  private token: string | null = null;
  private baseUrl: string = "";
  private baseOptions: HeadersInit = {};

  /**
   * Initializes the ApiClient.
   * @param config - Client configuration including token, baseUrl, and default headers.
   */
  constructor(config: ApiClientConfig) {
    this.token = config.token || null;
    this.baseUrl = config.baseUrl || "";
    this.baseOptions = config.baseOptions || {};
  }

  /**
   * Parses the fetch Response based on its Content-Type.
   * @param response - The Response object from fetch.
   * @returns Parsed JSON, text, or a Blob.
   */
  private async parseFetchResponse<R>(response: Response): Promise<R> {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    } else if (contentType.includes("text/")) {
      return response.text() as unknown as R;
    } else {
      return response.blob() as unknown as R;
    }
  }

  /**
   * Internal request handler that supports fetch (by default) and XMLHttpRequest (if opted).
   * It also handles query parameters, cancellation, and FormData.
   *
   * @param method - HTTP method to use.
   * @param endpoint - API endpoint (relative to baseUrl).
   * @param data - Request body (if applicable).
   * @param options - Additional request options.
   * @returns Parsed JSON response.
   */
  private async request<R, T = unknown>(
    method: RequestMethod,
    endpoint: string,
    data?: T,
    options?: RequestOptions,
  ): Promise<R> {
    let url = `${this.baseUrl}${endpoint}`;
    if (options?.params) {
      const queryString = new URLSearchParams(
        options.params as Record<string, string>,
      ).toString();
      url += (url.includes("?") ? "&" : "?") + queryString;
    }

    if (options?.useXhr) {
      return this.xhrRequest<R, T>(method, url, data, options);
    }

    const headers: HeadersInit = {
      ...this.baseOptions,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: options?.signal,
    };

    if (data) {
      if (data instanceof FormData) {
        requestOptions.body = data;
        delete headers["Content-Type"];
      } else if (headers["Content-Type"] === "application/json") {
        requestOptions.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `HTTP Error: ${response.status} - ${response.statusText} at ${url}\nDetails: ${errorDetails}`,
        );
      }

      return this.parseFetchResponse<R>(response);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Request failed: ${method} ${url}\nError: ${error.message}`,
        );
        throw error;
      }
      throw new Error(`Unexpected error during fetch: ${error}`);
    }
  }

  /**
   * Alternative request implementation using XMLHttpRequest.
   * Supports progress events and cancellation.
   *
   * @param method - HTTP method to use.
   * @param url - Fully qualified URL.
   * @param data - Request body.
   * @param options - Additional options (headers, signal, onProgress).
   * @returns Parsed JSON response.
   */
  private xhrRequest<R, T = unknown>(
    method: RequestMethod,
    url: string,
    data?: T,
    options?: RequestOptions,
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);

      const headers: HeadersInit = {
        ...this.baseOptions,
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      };

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      if (data instanceof FormData) {
        delete headers["Content-Type"];
      }

      for (const key in headers) {
        xhr.setRequestHeader(key, headers[key]);
      }

      xhr.responseType = "json";

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as R);
        } else {
          reject(
            new Error(
              `HTTP Error: ${xhr.status} - ${xhr.statusText} at ${url}`,
            ),
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network Error"));
      };

      if (options?.onProgress) {
        if (data && !(data instanceof FormData)) {
          xhr.upload.onprogress = options.onProgress;
        } else {
          xhr.onprogress = options.onProgress;
        }
      }

      if (options?.signal) {
        options.signal.addEventListener("abort", () => {
          xhr.abort();
          reject(new DOMException("Aborted", "AbortError"));
        });
      }

      if (data) {
        if (data instanceof FormData) {
          xhr.send(data);
        } else {
          xhr.send(JSON.stringify(data));
        }
      } else {
        xhr.send();
      }
    });
  }

  /**
   * Makes a GET request.
   *
   * @param endpoint - API endpoint (relative to baseUrl).
   * @param options - Additional request options (headers, params, cancellation signal, etc.).
   * @returns Parsed JSON response.
   */
  public async get<R>(endpoint: string, options?: RequestOptions): Promise<R> {
    return this.request<R>("GET", endpoint, undefined, options);
  }

  /**
   * Makes a POST request.
   *
   * @param endpoint - API endpoint (relative to baseUrl).
   * @param data - Request body.
   * @param options - Additional request options.
   * @returns Parsed JSON response.
   */
  public async post<R, T>(
    endpoint: string,
    data: T,
    options?: RequestOptions,
  ): Promise<R> {
    return this.request<R, T>("POST", endpoint, data, options);
  }

  /**
   * Makes a PUT request.
   *
   * @param endpoint - API endpoint (relative to baseUrl).
   * @param data - Request body.
   * @param options - Additional request options.
   * @returns Parsed JSON response.
   */
  public async put<R, T>(
    endpoint: string,
    data: T,
    options?: RequestOptions,
  ): Promise<R> {
    return this.request<R, T>("PUT", endpoint, data, options);
  }

  /**
   * Makes a DELETE request.
   *
   * @param endpoint - API endpoint (relative to baseUrl).
   * @param options - Additional request options.
   * @returns Parsed JSON response.
   */
  public async delete<R>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<R> {
    return this.request<R>("DELETE", endpoint, undefined, options);
  }
}
