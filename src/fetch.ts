import axios, { AxiosResponse } from "axios";
import { API_URL } from "./constant";

export function pullFromCodeSandbox(sandboxId: string): Promise<AxiosResponse> {
  return axios.get(API_URL + sandboxId);
}
