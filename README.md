# rsclone-vk-server

Link to repository: https://github.com/teumik/rsclone-vk-server

# RS Clone VK API

## Routes

1. ### ```/auth```
    - ### ```/registration```

        **Method**: ```POST```

        **Body:**

        ```ts
        interface IUser {
          email: string;
          username: string;
          password: string;
        }
        ```

        **Response:**

        ```ts
        interface IUserData {
          user: {
            id: string | undefined;
            email: string;
            username: string;
            isActivated: boolean | undefined;
          };
          accessToken: string;
          refreshToken: string;
        }
        ```

    - ### ```/login```

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

        **Response:**

        ```ts
        interface IUserData {
          user: {
            id: string | undefined;
            email: string;
            username: string;
            isActivated: boolean | undefined;
          };
          accessToken: string;
          refreshToken: string;
        }
        ```

    - ### ```/logout```

       **Method**: ```GET``` *Required auto Cookies*

        **Response:**

        ```ts
        interface ILogout {
          status: boolean;
          type: 'Logout';
        }
        ```

    - ### ```/refresh```


        **Method**: ```GET``` *Required auto Cookies*

        **Response:** *Temporery*

        ```ts
        interface IUserData {
          user: {
            id: string | undefined;
            email: string;
            username: string;
            isActivated: boolean | undefined;
          };
          accessToken: string;
          refreshToken: string;
        }
        ```

    - ### ```/activate/:link```

        **Method**: ```GET``` *Required auto Cookies*

        **Description:** get url params from activation link and redirect to ```SITE_URL/user/:id``` (*temporary ```SITE_URL/auth/user/:id```*)

        ```ts
        res.redirect(`${SITE_URL}/auth/user/${user.id}`);
        ```

    - ### ```/user```

        **Method**: ```GET```

        **Request:**

        ```ts
        const fetchOptions: RequestInit = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            credentials: 'include',
          },
        }
        ```

        **Response:**

        ```ts
        interface IUserData {
          id: string | undefined;
          email: string;
          username: string;
          isActivated: boolean | undefined;
        }
        ```

    - ### ```/users```

        **Method**: ```GET```

        **Description:** send access token from previous responce's headers


        **Request:**

        ```ts
        const fetchOptions: RequestInit = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            credentials: 'include',
          },
        }
        ```

        **Response:**

        ```ts
        interface IUserData {
          id: string | undefined;
          email: string;
          username: string;
          isActivated: boolean | undefined;
        }

        type TUsersResponse = IUserData[];
        ```

## Errors

```ts
interface IApiError {
  status: boolean;
  code: number;
  type: string;
  message: string;
  name: string;
}

type TErrorsResponse = Partial<IApiError>;

error instanceof ApiError
```

1. ### ```ServerError```

    ```ts
    interface IServerError {
      status: false,
      code: 500,
      type: 'Unnamed',
      name: 'ServerError',
      message: 'Server was crash, we does not know cause',
    } | {
      code: 500,
      type: 'DBUrlError',
      message: 'Database URL cannot be empty string',
    } | {
      code: 500,
      message: 'Problems with sites whitelist',
    }
    ```

2. ### ```LoginError```

    ```ts
    interface ILoginError {
      status: false,
      code: 401,
      type: 'Unnamed',
      name: 'LoginError',
      message: 'Server was crash, we does not know cause',
    } | {
      type: 'Unauthorize',
      message: 'Token does not exist, user unauthorized',
    } | {
      type: 'Unauthorized',
      message: 'User unauthorized for logout',
    } | {
      type: 'Unauthorized',
      message: 'User unauthorized',
    } | {
      code: 400,
      type: 'Unconfirmed',
      message: `User ${email || username} has not confirmed account`,
    }
    ```

3. ### ```CorsError```

    ```ts
    interface ICorsError {
      status: false,
      code: 400,
      type: 'Unnamed',
      name: 'CorsError',
      message: 'Server was crash, we does not know cause',
    } | {
      type: 'InvalidURL',
      message: `${requestOrigin} is not allowed`,
    }
    ```

4. ### ```ActivationError```

    ```ts
    interface IActivationError {
      status: false,
      code: 500,
      type: 'Unnamed',
      name: 'ActivationError',
      message: 'Server was crash, we does not know cause',
    } | {
      code: 422,
      type: 'BrokenLink',
      message: 'Incorrect activation link',
    }
    ```

4. ### ```DatabaseError```

    ```ts
    interface IDatabaseError {
      status: false,
      name: 'DatabaseError',
    } | {
      code: 500,
      type: 'DBConectionError',
      message: error.message,
    } | {
      code: 421,
      type: 'Duplicate',
      message: `User with '${email || username}' exist`,
    } | {
      code: 404,
      type: 'NotFound',
      message: 'User not found',
    } | {
      code: 404,
      type: 'NotFound',
      message: `User ${email || username} not found`,
    }
    ```
