# ApiClient

`ApiClient` is a lightweight TypeScript wrapper for making HTTP requests using the `fetch` API. It supports token-based authentication, customizable base URLs, and global default headers. The library simplifies common HTTP operations (`GET`, `POST`, `PUT`, and `DELETE`) and provides a consistent API for handling requests and responses.

## Features

- Token-based authentication
- Configurable base URL for API endpoints
- Customizable default headers
- Support for `FormData` and JSON request payloads
- Automatic error handling with detailed error messages
- Simplified method signatures for common HTTP verbs

## Installation

To use `ApiClient`, copy the class implementation into your project or install via your package manager (if applicable in the future):

```bash
# Add to your project manually or as part of your codebase.
```

## API

### Initialization

`ApiClient` must be initialized with a configuration object before making any requests.

### `ApiClient.init(config: ApiClientConfig): void`

#### Parameters

- `config` (optional): An object containing the following properties:

  - `token` (`string | undefined`): The authentication token to include in the `Authorization` header.
  - `baseUrl` (`string | undefined`): The base URL for all API requests.
  - `baseOptions` (`HeadersInit | undefined`): Global headers to include with every request (e.g., `Access-Control-Allow-Origin`).

- **Example:**

```typescript
import ApiClient from "./ApiClient";

ApiClient.init({
  token: "your-auth-token",
  baseUrl: "https://api.example.com",
  baseOptions: {
    "Access-Control-Allow-Origin": "*",
  },
});
```

---

### Methods

#### `ApiClient.get<R>(endpoint: string, customHeaders?: HeadersInit): Promise<R>`

Makes a `GET` request.

- **Parameters:**

  - `endpoint` (`string`): The relative API endpoint.
  - `customHeaders` (`HeadersInit | undefined`): Optional additional headers for the request.

- **Returns:** A `Promise` that resolves to the parsed JSON response.

- **Example:**

```typescript
const data = await ApiClient.get<MyResponseType>("/users");
```

---

#### `ApiClient.post<R, T>(endpoint: string, data: T, customHeaders?: HeadersInit): Promise<R>`

Makes a `POST` request.

- **Parameters:**

  - `endpoint` (`string`): The relative API endpoint.
  - `data` (`T`): The request payload (JSON or `FormData`).
  - `customHeaders` (`HeadersInit | undefined`): Optional additional headers for the request.

- **Returns:** A `Promise` that resolves to the parsed JSON response.

- **Example:**

```typescript
const user = await ApiClient.post<MyResponseType, MyRequestType>("/users", {
  name: "John Doe",
  email: "john@example.com",
});
```

---

#### `ApiClient.put<R, T>(endpoint: string, data: T, customHeaders?: HeadersInit): Promise<R>`

Makes a `PUT` request.

- **Parameters:**

  - `endpoint` (`string`): The relative API endpoint.
  - `data` (`T`): The request payload (JSON or `FormData`).
  - `customHeaders` (`HeadersInit | undefined`): Optional additional headers for the request.

- **Returns:** A `Promise` that resolves to the parsed JSON response.

- **Example:**

```typescript
const updatedUser = await ApiClient.put<MyResponseType, MyRequestType>(
  "/users/1",
  {
    name: "Jane Doe",
  }
);
```

---

#### `ApiClient.delete<R>(endpoint: string, customHeaders?: HeadersInit): Promise<R>`

Makes a `DELETE` request.

- **Parameters:**

  - `endpoint` (`string`): The relative API endpoint.
  - `customHeaders` (`HeadersInit | undefined`): Optional additional headers for the request.

- **Returns:** A `Promise` that resolves to the parsed JSON response.

- **Example:**

```typescript
await ApiClient.delete<MyResponseType>("/users/1");
```

---

### Error Handling

If a request fails, `ApiClient` will throw an error with a detailed message, including:

- HTTP status code
- Status text
- Request endpoint
- Error details (if available in the response body)

- **Example:**

```typescript
try {
  const data = await ApiClient.get("/invalid-endpoint");
} catch (error) {
  console.error(error.message);
}
```

---

### License

This library is provided as-is and can be freely integrated into your projects.
