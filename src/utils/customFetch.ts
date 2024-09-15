// utils/customFetch.ts

// 定义 fetch 的 input 和 init 类型
// export const customFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
//     // 从 LocalStorage 获取 JWT
//     const requestToken = localStorage.getItem('token');
  
//     // 如果存在 JWT，添加到 Authorization 头中
//     const headers = {
//       ...init?.headers,
//       Authorization: requestToken ? `Bearer ${requestToken}` : ''
//     };
  
//     // 发起请求，使用自定义的 headers
//     const response = await fetch(input, {
//       ...init,
//       headers
//     });
//     const responseToken=response.headers.get('Authorization')
//     // 检查响应状态码
//     console.log("custom: response"+response)
//     console.log("custom: response"+JSON.stringify(response))
//     if (responseToken!==null) {
//       localStorage.setItem("token",responseToken)
//     }
  
//     return response;
//   };
  