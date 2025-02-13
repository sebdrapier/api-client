# ApiClient

A lightweight TypeScript API client that simplifies making API calls with token-based authentication. It supports both the Fetch API and XMLHttpRequest (XHR) for scenarios requiring progress events or request cancellation. The client automatically detects the response type (JSON, text, or Blob) based on the `Content-Type` header.

## Features

- **Token-Based Authentication:** Easily pass an authorization token to your API calls.
- **Flexible Request Options:** Supports custom headers, query parameters, cancellation (via `AbortSignal`), and progress events.
- **Dual Transport Support:** Uses the Fetch API by default with an option to switch to XMLHttpRequest for advanced features (e.g., progress tracking).
- **Dynamic Response Parsing:** Automatically parses the response as JSON, text, or Blob according to the `Content-Type` header.
- **Framework Agnostic:** Use it with React, Vue, Svelte, or any other framework.

## Installation

Simply add the `ApiClient.ts` file to your project. Make sure your TypeScript configuration (`tsconfig.json`) includes the `"dom"` lib to support browser-specific types like `XMLHttpRequest` and `ProgressEvent`:

```json
{
  "compilerOptions": {
    "lib": ["esnext", "dom"],
    // ... other options
  }
}
```

## Usage

### Basic Example

```ts
import ApiClient from './ApiClient';

const client = new ApiClient({
  token: 'your-token-here',
  baseUrl: 'https://api.example.com',
  baseOptions: {
    'X-Custom-Header': 'value',
  },
});

// GET request example
client.get('/data')
  .then((response) => {
    console.log('Data:', response);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

### Request Cancellation & Progress (Using XHR)

```ts
// Create an AbortController for cancellation
const controller = new AbortController();

client.post('/upload', formData, {
  signal: controller.signal,
  useXhr: true, // use XMLHttpRequest to track progress
  onProgress: (event) => {
    if (event.lengthComputable) {
      const percent = (event.loaded / event.total) * 100;
      console.log(`Upload progress: ${percent.toFixed(2)}%`);
    }
  },
}).catch((error) => {
  if (error.name === 'AbortError') {
    console.log('Request was aborted');
  } else {
    console.error(error);
  }
});

// Cancel the request when needed
controller.abort();
```

## Framework Examples

### React with Context

Create a React context to provide the API client across your application.

#### `ApiClientContext.tsx`

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import ApiClient from './ApiClient';

interface ApiClientContextProps {
  apiClient: ApiClient;
  setToken: (token: string) => void;
}

const ApiClientContext = createContext<ApiClientContextProps | undefined>(undefined);

export const ApiClientProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState('your-token-here');
  const apiClient = new ApiClient({
    token,
    baseUrl: 'https://api.example.com',
  });

  return (
    <ApiClientContext.Provider value={{ apiClient, setToken }}>
      {children}
    </ApiClientContext.Provider>
  );
};

export const useApiClient = () => {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return context;
};
```

#### `ExampleComponent.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { useApiClient } from './ApiClientContext';

const ExampleComponent: React.FC = () => {
  const { apiClient } = useApiClient();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiClient.get('/data');
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [apiClient]);

  return (
    <div>
      <h1>Data from API</h1>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

export default ExampleComponent;
```

#### `App.tsx`

```tsx
import React from 'react';
import { ApiClientProvider } from './ApiClientContext';
import ExampleComponent from './ExampleComponent';

const App: React.FC = () => (
  <ApiClientProvider>
    <ExampleComponent />
  </ApiClientProvider>
);

export default App;
```

### Vue Example

```vue
<template>
  <div>
    <h1>Data from API</h1>
    <pre v-if="data">{{ data }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import ApiClient from './ApiClient';

export default defineComponent({
  setup() {
    const data = ref<any>(null);
    const apiClient = new ApiClient({
      token: 'your-token-here',
      baseUrl: 'https://api.example.com',
    });

    onMounted(async () => {
      try {
        data.value = await apiClient.get('/data');
      } catch (error) {
        console.error(error);
      }
    });

    return { data };
  },
});
</script>
```

### Svelte Example

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import ApiClient from './ApiClient';

  let data: any = null;
  const apiClient = new ApiClient({
    token: 'your-token-here',
    baseUrl: 'https://api.example.com',
  });

  onMount(async () => {
    try {
      data = await apiClient.get('/data');
    } catch (error) {
      console.error(error);
    }
  });
</script>

<main>
  <h1>Data from API</h1>
  {#if data}
    <pre>{JSON.stringify(data, null, 2)}</pre>
  {/if}
</main>
```

## API Overview

### Configuration

- **token:** *(string)* The authentication token to be included in API requests.
- **baseUrl:** *(string)* The base URL for all API endpoints.
- **baseOptions:** *(Record&lt;string, string&gt;)* Default headers applied to every request.

### Request Options

When making a request, you can optionally supply a `RequestOptions` object that supports:

- **headers:** Custom headers for the request.
- **signal:** An `AbortSignal` to allow cancellation.
- **params:** An object of query parameters that are appended to the URL.
- **useXhr:** A boolean flag to use XMLHttpRequest (for progress events).
- **onProgress:** A callback function to handle progress events.

## License

This project is licensed under the [MIT License](LICENSE).
