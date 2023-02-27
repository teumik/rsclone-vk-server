import { Router } from 'express';
import chatsController from '../controllers/chats.controller';

const chatsRouter = Router();

chatsRouter.get('/:chatId', chatsController.getChatById);
chatsRouter.patch('/:chatId', chatsController.renameChat);
chatsRouter.delete('/:chatId', chatsController.removeChat);

chatsRouter.get('', chatsController.getChats);
chatsRouter.post('', chatsController.createChat);

export default chatsRouter;
