import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api-candidates.hewart.az/account/api/",
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/Account/Login",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
          accept: "text/plain",
        },
      }),
    }),
  }),
});

export const { useLoginMutation } = api;
