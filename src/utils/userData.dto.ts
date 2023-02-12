import { IUserModel } from '../service/user.service';

const userDataDTO = (user: IUserModel) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  isActivated: user.isActivated,
});

export default userDataDTO;
