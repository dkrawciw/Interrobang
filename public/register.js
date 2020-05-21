var password1 = document.querySelector('#password'),
    password2 = document.querySelector('#confirm_password');

function validatePassword(){
  if(password1.value != password2.value) {
    password2.setCustomValidity("Passwords Don't Match");
  } else {
    password2.setCustomValidity('');
  }
}

password1.onchange = validatePassword;
password2.onkeyup = validatePassword;
