import { IUserModel } from '../service/auth.service';

class UserDto {
  static getData = ({
    id, email, username, isActivated,
  }: IUserModel) => ({
    id, email, username, isActivated,
  });
}

export default UserDto;
