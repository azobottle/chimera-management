import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  client: '@hey-api/client-fetch',
  // input: 'openapi.json',
  input: 'http://localhost/v3/api-docs',
  output: 'src/client'
})
