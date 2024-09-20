import { client } from "./services.gen";


const API_BASE_URL = 'http://47.93.12.208:80'
client.setConfig({
    baseUrl: API_BASE_URL,
});
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