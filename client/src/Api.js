/*
    This is a static class to handle data from and to database.
    It is based on CRUD principle.
*/
class apiClass {
     static statusCheck = async () => {
        let res = fetch(`http://localhost:9000/users`)
        return res;
    }

    static getUser = async (email, password) => {
        return await fetch(`http://localhost:9000/users/${email}`)
            .then(res => JSON.parse(res))
            .catch(err => err);
    }

    static resetPass = async (email) => {
        return await fetch(`http://localhost:9000/users/${email}`)
            .then(res => JSON.parse(res))
            .catch(err => err);
    }
    static createUser = async (username, email, password) => {
        const options = {
            method: 'POST',
            mode: "cors",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
            }),
        };
        console.log(options);
        return await fetch(`http://localhost:9000/users`, options)
            .then(res => JSON.parse(res))
            .catch(err => err);
    }
}

export default apiClass;