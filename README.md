# rsclone-vk-server

[Link to repository](https://github.com/teumik/rsclone-vk-server)

[Link to server](https://rsclone-vk-server-production-ff8c.up.railway.app)

[Link to description]()

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

    - ### ```/activate/:link```

        **Method**: ```GET```

        **Parameters:** auto generate string for account activation

2. ### ```/user```

    - ### ```/:id```

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

    - ### ```/```

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

    - ### ```/friends```

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

    - ### ```/friends```

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

    - ### ```/friends```

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

    - ### ```/friends```

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

    - ### ```/friends/incomming```

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

    - ### ```/friends/outcomming```

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
