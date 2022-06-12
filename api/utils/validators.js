module.exports.validateRegisterInput = (username, email, password, confirmPassword) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty"
  }
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email address";
    }
  }
  if (password === "") {
    errors.password = "Password must not empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.email = "Username must not be empty";
  }
  if (password === "") {
    errors.password = "Password must not empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateDeliveryInfoInput = (address, city, phoneNumber) => {
  const errors = {};

  if (address.trim() === "") {
    errors.address = "Address must not be empty";
  }
  if (city.trim() === "") {
    errors.city = "City must not be empty";
  }
  const regEx = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  if (phoneNumber.length > 10) {
    errors.phoneNumber = "Invalid phone number";
  } else if (phoneNumber[0] !== "9") {
    errors.phoneNumber = "Invalid phone number";
  } else if (!phoneNumber.match(regEx)) {
    errors.phoneNumber = "Invalid phone number";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
