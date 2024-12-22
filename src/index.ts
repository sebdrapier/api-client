type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";
type HeadersInit = Record<string, string>;

interface ApiClientConfig {
  token?: string;
  baseUrl?: string;
  baseOptions?: HeadersInit;
}

/**
 * A wrapper class for making API calls using fetch with token-based authentication.
 */
export default class ApiClient {
  private token: string | null = null;
  private baseUrl: string = "";
  private baseOptions: HeadersInit = {};

  /**
   * Initializes the ApiClient with a token and base URL.
   * @param token - The authentication token to include in requests.
   * @param baseUrl - The base URL for API endpoints.
   * @param baseOptions - Default headers to include in every request.
   */
  constructor(config: ApiClientConfig) {
    this.token = config.token || null;
    this.baseUrl = config.baseUrl || "";
    this.baseOptions = config.baseOptions || {};
  }

  /**
   * Base fetch handler.
   * @param method - The HTTP method to use (GET, POST, PUT, DELETE).
   * @param endpoint - The API endpoint (relative to the base URL).
   * @param data - The request body, if applicable.
   * @param customHeaders - Additional headers to include in the request.
   * @returns The response parsed as JSON.
   * @throws Will throw an error if the response status is not OK.
   */
  private async request<R, T = unknown>(
    method: RequestMethod,
    endpoint: string,
    data?: T,
    customHeaders?: HeadersInit
  ): Promise<R> {
    const headers: HeadersInit = {
      ...this.baseOptions,
      "Content-Type": "application/json",
      ...customHeaders,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && headers["Content-Type"] === "application/json") {
      options.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      options.body = data;
      delete headers["Content-Type"];
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `HTTP Error: ${response.status} - ${response.statusText} at ${this.baseUrl}${endpoint}\nDetails: ${errorDetails}`
        );
      }

      return (await response.json()) as R;
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Request failed: ${method} ${this.baseUrl}${endpoint}\nError: ${error.message}`
        );
        throw error;
      } else {
        throw new Error(`Unexpected error during fetch: ${error}`);
      }
    }
  }

  /**
   * Makes a GET request.
   * @param endpoint - The API endpoint (relative to the base URL).
   * @param customHeaders - Additional headers to include in the request.
   * @returns The response parsed as JSON.
   */
  public async get<R>(
    endpoint: string,
    customHeaders?: HeadersInit
  ): Promise<R> {
    return this.request<R>("GET", endpoint, undefined, customHeaders);
  }

  /**
   * Makes a POST request.
   * @param endpoint - The API endpoint (relative to the base URL).
   * @param data - The request body.
   * @param customHeaders - Additional headers to include in the request.
   * @returns The response parsed as JSON.
   */
  public async post<R, T>(
    endpoint: string,
    data: T,
    customHeaders?: HeadersInit
  ): Promise<R> {
    return this.request<R, T>("POST", endpoint, data, customHeaders);
  }

  /**
   * Makes a PUT request.
   * @param endpoint - The API endpoint (relative to the base URL).
   * @param data - The request body.
   * @param customHeaders - Additional headers to include in the request.
   * @returns The response parsed as JSON.
   */
  public async put<R, T>(
    endpoint: string,
    data: T,
    customHeaders?: HeadersInit
  ): Promise<R> {
    return this.request<R, T>("PUT", endpoint, data, customHeaders);
  }

  /**
   * Makes a DELETE request.
   * @param endpoint - The API endpoint (relative to the base URL).
   * @param customHeaders - Additional headers to include in the request.
   * @returns The response parsed as JSON.
   */
  public async delete<R>(
    endpoint: string,
    customHeaders?: HeadersInit
  ): Promise<R> {
    return this.request<R>("DELETE", endpoint, undefined, customHeaders);
  }
}
