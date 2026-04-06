import api from "@/lib/axios";

export interface LoginObject {
  email: string,
  password: string,
  isDemo?: boolean
}

export interface RegisterObject {
  email: string,
  password: string,
  passwordConfirm: string
}

interface LoginResponse {
  access_token: string,
  expires_in: number
}

async function loginDemoAccount(data: LoginObject): Promise<LoginResponse> {

  const response = (await api.post("/public/login", data)).data
  console.log("|-- DEMO --| response von der login route" , response)
  return response
}

async function login(data: LoginObject): Promise<LoginResponse> {

  const response = (await api.post("/public/login", data)).data.data
  console.log("|-- LOGIN --| response von der login route" , response)
  return response
}

async function register(data: RegisterObject): Promise<LoginResponse> {

  const response = (await api.post("/public/register", data)).data
  console.log("response register" , response)
  return response
}

async function logout(): Promise <void> {
  await api.post('/public/logout')
}

export const authService = {
  loginDemoAccount,
  login,
  register,
  logout
}