import { Request } from "express";

interface IRequest<T> extends Request {
  body: T;
}

export default IRequest;
