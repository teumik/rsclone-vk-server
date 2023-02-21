export interface IUser {
  id?: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface IValidateResponce {
  status: boolean;
  type: string;
  message?: string;
}

type TValidator = (data: IUser) => IValidateResponce;

class AuthValidate {
  private setValid() {
    return {
      status: true,
      type: 'Valid',
    };
  }

  private setInvalid(message: string) {
    return {
      status: false,
      type: 'Denied',
      message,
    };
  }

  private isValid(data: IUser) {
    if (!data.username || !data.password) {
      return this.setInvalid('Field cannot be empty');
    }
    return this.setValid();
  }

  private isEmpty(data: IUser) {
    const {
      username, password, firstName, lastName, email,
    } = data;
    if (!email) {
      return this.setInvalid('Email cannot be empty');
    }
    if (!username) {
      return this.setInvalid('Username cannot be empty');
    }
    if (!password) {
      return this.setInvalid('Password cannot be empty');
    }
    if (!firstName) {
      return this.setInvalid('FirstName cannot be empty');
    }
    if (!lastName) {
      return this.setInvalid('LastName cannot be empty');
    }
    return this.setValid();
  }

  private checkNameLength(data: IUser) {
    const { username } = data;
    const minLength = 4;
    if (username.length < minLength) {
      return this.setInvalid(`Username less than ${minLength} symbols`);
    }
    return this.setValid();
  }

  private checkPasswordLength(data: IUser) {
    const { password } = data;
    const minLength = 8;
    if (password.length < minLength) {
      return this.setInvalid(`Password less than ${minLength} symbols`);
    }
    return this.setValid();
  }

  private checkEmailSymbols(data: IUser) {
    const { email } = data;
    const regexValue = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    const regex = new RegExp(regexValue);
    if (!regex.test(email)) {
      return this.setInvalid('Email incorrect');
    }
    return this.setValid();
  }

  private checkPasswordSymbols(data: IUser) {
    const { password } = data;
    const regexValue = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;
    const regex = new RegExp(regexValue);
    if (!regex.test(password)) {
      return this.setInvalid('Password incorrect');
    }
    return this.setValid();
  }

  private compose = (...fns: TValidator[]) => (data: IUser) => fns.reduce((acc, fn) => {
    if (acc.status) Object.assign(acc, fn(data));
    return acc;
  }, { status: true, type: 'valid' });

  validate(data: IUser): IValidateResponce {
    const chainValidation = this.compose(
      this.isValid.bind(this),
      this.isEmpty.bind(this),
      this.checkNameLength.bind(this),
      this.checkPasswordLength.bind(this),
      this.checkPasswordLength.bind(this)
    );
    const catchedError = chainValidation(data);
    if (!catchedError.status) return catchedError;
    return this.setValid();
  }
}

const authValidate = new AuthValidate();

export default authValidate;
