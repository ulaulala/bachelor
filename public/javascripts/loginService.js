const signinContainer = document.querySelector('.sign-in')
const userNameInput = document.querySelector('#username')
const userNameInputErrorMessage = document.querySelector('label[for="username"] .error-message')

const passwordInput = document.querySelector('#password')
const passwordInputErrorMessage = document.querySelector('label[for="password"] .error-message')
const signinButton = document.querySelector('.sign-in button')

signinButton.addEventListener('click', (event) => {
    event.preventDefault()

    console.log(userNameInput.value, passwordInput.value)
    if(!userNameInput.value) {
        userNameInput.classList.add('error-input')
        userNameInputErrorMessage.innerText = 'Enter username'
    } else {
        userNameInput.classList.remove('error-input')
        userNameInputErrorMessage.innerText = ''

        getUserByName(userNameInput.value)
            .then((user) => {
                if(!user) {
                    userNameInput.classList.add('error-input')
                    userNameInputErrorMessage.innerText = 'User not found'
                } else {
                    if(!passwordInput.value) {
                        passwordInput.classList.add('error-input')
                        passwordInputErrorMessage.innerText = 'Enter password'
                    } else {
                        console.log(user, userNameInput.value, passwordInput.value)

                        if(user.password === passwordInput.value) {
                            window.location.pathname = '/'
                            setLoggedUserId(user.id)
                        } else {
                            passwordInput.classList.add('error-input')
                            passwordInputErrorMessage.innerText = 'Wrong password'
                        }
                    }
                }
            })
    }
})