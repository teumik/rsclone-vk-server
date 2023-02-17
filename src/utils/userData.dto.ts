import { IUserModel } from '../service/auth.service';

class UserDto {
  static getData = ({
    id, username, isActivated, isOnline,
  }: IUserModel) => ({
    id, username, isActivated, isOnline,
  });
}

export default UserDto;
