import { AuthHttp } from "./AuthHttp";
import { AuthResponse, LoginRequest, RegisterRequest } from "../Types";

const AuthApi = {
  login: (payload: LoginRequest): Promise<AuthResponse> => {
    return AuthHttp("/api/User/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  register: (payload: RegisterRequest): Promise<AuthResponse> => {
    return AuthHttp("/api/User/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export default AuthApi;