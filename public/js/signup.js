const signup = document.getElementById('signup-form');
signup.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const phone = event.target.phone.value;

    const user = {
        name,
        email,
        password,
        phone
    };

    axios.get(`/user/check?email=${email}`)
    .then((response) => {
        if (response.data.exists) {
            alert('User already exists!');
        } else {
            axios.post(`/user/signup`, user)
            .then((res) => {
                if (res.data.success) {
                    alert('Successfully signed up');
                }
            })
            .catch((err) => {
                document.body.innerHTML = `<h3>Something went wrong</h3>`;
            });
        }
    })
    .catch((error) => {
        console.error('Error checking user existence:', error);
    });
});
