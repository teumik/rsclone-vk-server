# rsclone-vk-server

[Link to repository](https://github.com/teumik/rsclone-vk-server)

[Link to server](https://rsclone-vk-server-production-ff8c.up.railway.app)

[Link to description](https://github.com/teumik/rsclone-vk-server/blob/main/DESCRIPTION.md)

# RS Clone VK API

## Stack

  1. ```Node.js```
  2. ```Express```
  3. ```TypeScript```
  4. ```JSON Web Tokens``` (```jsonwebtoken```)
  5. ```MongoDB``` (```Mongoose```)
  6. ```Socket.IO```
  7. ```dotenv```

## Description

Сервер был разработан на `Node.js` с использованием `TypeScript`, `Express` и размещен на платформе `railway.app`

Основным архитектурным паттерном был выбран `MVC`, для обеспечения абстракций и разделения слоев приложения

Была реализована аутентификация и авторизация на основе `JWT` с верификацией предоставленных токенов на срок жизни и валидность, также возможность обновления токенов по истечению токена доступа

Токены хешируются с помощью пары секретных ключей, токен обновления передается через Cookie, доступ к нему имеет только со стороны сервера, посредством чего происходит верификация пользователя и доступ к данным

Все данные хранятся в базе данных `MongoDB`, для взаимодействия используется ORM `Mongoose`

Сервер реализует `CRUD` для операций с базой данных, при этом сервер не хранит никаких данных, все взаимодействие с ресурсом происходит посредством запросов, где сервер управляет и контролирует процесс операций над базой данных

Для оповещения о событиях операций других пользователей: добавление и удаление друзей, создание постов, лайков, комментариев и оповещения о сообщениях и чатах ; применяется `Socket.IO` на основе `WebSocket`

Для хранения чувствительной информации, отвечающей за корректную работу сервисов, используется переменные окружения через `dotenv`

Данные о запросах отражают корректную информацию и уместную информацию для использования на стороне клиента

Ошибки читабельны и информативны, применяется кастомный класс ошибок с подробным описанием каждой проблемы, которым можно легко оперировать на стороне клиента

## Example Routes

1. ### ```/auth```

    - ### Registration

        <details>

        ### ```/registration```

        **Method**: ```POST```

        **Body:**

        ```ts
        interface IUser {
          email: string;
          username: string;
          password: string;
          firstName: string;
          lastName: string;
        }
        ```

        **Options:**

        ```ts
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
        ```

        </details>

    - ### Login

        <details>

        ### ```/login```

        **Method**: ```POST```

        **Body:**

        ```ts
        type TLogin = {
          email: string;
          password: string;
        } | {
          username: string;
          password: string;
        };
        ```

        **Options:**

        ``` ts
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
        ```

        </details>

    - ### Logout

        <details>

        ### ```/logout```

        **Method**: ```GET``` *Required сookies*

        **Options:**

        ``` ts
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ```

        </details>

    - ### Refresh

        <details>

        ### ```/refresh```

        **Method**: ```GET``` *Required сookies*

        **Options:**

        ```ts
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ```

        </details>

    - ### Activation

        <details>

        ### ```/activate/:link```

        **Method**: ```GET```

        **Parameters:** auto generate string for account activation

        </details>

2. ### ```/user```

    - ### Get user by ID

        <details>

        ### ```/:id```

        **Method**: ```GET``` *Required сookies*

        **Description:** send access token from login or refresh responce's headers

        **Parameters:** user's id

        **Options:**

        ```ts
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include',
        ```

        </details>

    - ### Get all users

        <details>

        ### ```/```

        **Method**: ```GET``` *Required сookies*

        **Description:** send access token from login or refresh responce's headers

        **Options:**

        ```ts
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include',
        ```

        </details>

    - ### Get list of friends

      <details>

      ### ```/friends```

      **Method**: ```GET``` *Required сookies*

      **Description:** get all accepted friends

      **Options:**

      ```ts
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      credentials: 'include',
      ```

      </details>

    - ### Add friend

      <details>

      ### ```/friends```

      **Method**: ```POST``` *Required сookies*

      **Description:** add friend

      **Body:**

      ```ts
      type IUser = {
        username: string;
      } | {
        friendId: string;
      }
      ```

      **Options:**

      ```ts
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      credentials: 'include',
      ```

      </details>

    - ### Accept friend

      <details>

      ### ```/friends```

      **Method**: ```PUT``` *Required сookies*

      **Description:** accept friend

      **Body:**

      ```ts
      type IUser = {
        username: string;
      } | {
        friendId: string;
      }
      ```

      **Options:**

      ```ts
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      credentials: 'include',
      ```

      </details>

    - ### Remove friend

      <details>

      ### ```/friends```

      **Method**: ```DELETE``` *Required сookies*

      **Description:** remove user from friends

      **Body:**

      ```ts
      type IUser = {
        username: string;
      } | {
        friendId: string;
      }
      ```

      **Options:**

      ```ts
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      credentials: 'include',
      ```

      </details>

    - ### Incoming friend requests

      <details>

      ### ```/friends/incomming```

      **Method**: ```GET``` *Required сookies*

      **Description:** get incoming friend requests

      **Options:**

      ```ts
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      credentials: 'include',
      ```

      </details>

    - ### Outcoming friend requests

      <details>

      ### ```/friends/outcomming```

      **Method**: ```GET``` *Required сookies*

      **Description:** get incoming friend requests

      **Options:**

      ```ts
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
        },
      credentials: 'include',
      ```

      </details>
