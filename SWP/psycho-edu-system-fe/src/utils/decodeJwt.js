import { jwtDecode } from "jwt-decode";

export default function DecodeJWT(token) {
  const data = jwtDecode(token);
  return data;
}
