const signin = document.getElementById('signin-form');
signin.addEventListener('submit', (event) => {
    event.preventDefault();
    const loginDetails = {
      email: event.target.email.value,
      password: event.target.password.value
    }
        axios.post(`/user/signin`, loginDetails)
        .then(res => {
          alert(res.data.message);
          localStorage.setItem('token', res.data.token);
          window.location.href = '/expense/add-expense';
        })
        .catch((err) => {
          console.log(err);
          const msg = err.response.data.msg ? err.response.data.msg : 'Could not login user';
          document.body.innerHTML += `<strong><div style="color:red;">${msg}</div></strong>`;
      });
});
