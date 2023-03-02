# rsclone-vk-server

Link to repository: https://github.com/teumik/rsclone-vk-server

Link to server: https://rsclone-vk-server-production-ff8c.up.railway.app

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
          firstName: string;
          lastName: string;
        }
        ```

        **Options:**

        ``` ts
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
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

        **Options:**

        ``` ts
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
        ```

    - ### ```/logout```

       **Method**: ```GET``` *Required сookies*

        **Options:**

        ``` ts
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ```

    - ### ```/refresh```

        **Method**: ```GET``` *Required сookies*

        **Options:**

        ```ts
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ```

    - ### ```/user/:id```

        **Method**: ```GET``` *Required сookies*

        **Options:**

        ```ts
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include',
        ```

    - ### ```/users```

        **Method**: ```GET```

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
