import { createConfig } from "@hey-api/client-fetch";
import { client } from "./services.gen";


const API_BASE_URL = 'http://localhost:80'
const config = createConfig({
    baseUrl: API_BASE_URL,
    throwOnError: true
  })
client.setConfig(config);
client.interceptors.request.use((request) => {
    const token = localStorage.getItem('token')
    if (token !== null) {
        request.headers.set('Authorization', token);
    }
    return request;
});

client.interceptors.response.use((response) => {
    const token = response.headers.get('Authorization')
    if (token !== null) {
        localStorage.setItem('token', token)
    }
    return response;
});