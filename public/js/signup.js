const signup = document.getElementById('signup-form');
signup.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const email = event.target.name.value;
    const password = event.target.password.value;
    const phone = event.target.phone.value;

    const user = {
        name,
        email,
        password,
        phone
    }

    console.log(user);

    axios.post(`/user/signup`, user)
    .then((res) => {
        if (res.data.success) {
            alert('Signup Succesfull');
        }
    })
    .catch((err) => {
        document.body.innerHTML = document.body.innerHTML + `<h3>Something went wrong</h3>`
    })
})