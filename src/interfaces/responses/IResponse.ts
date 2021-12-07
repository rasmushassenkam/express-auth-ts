import { EStatusCode } from "../../enums/EStatusCode";
import { IError } from "./IError";

export interface IResponse<T> {
  status: EStatusCode;
  response: T;
  error?: IError;
  redirectUrl?: string;
}
