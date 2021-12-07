export interface IError {
  message?: string;
  validationError?: IValidationError;
}

export interface IValidationError {
  allFields?: string;
  password?: string;
  email?: string;
}
