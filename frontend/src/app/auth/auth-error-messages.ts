export const AUTH_ERROR_MESSAGES: { [key: string]: string } = {
    "account.unauthorized": "Incorrect email or password",
    "email.required": "Email required",
    "email.string": "Email is not a text",
    "email.email": "Incorrect email format",
    "email.maxlength": "Email is longer than 254 characters",
    "password.required": "Password required",
    "password.string": "Password is not a text",
    "password.minlength": "Email is shorter than 8 characters",
    "password.maxlength": "Email is longer than 20 characters",
    "password.pattern": "Password does not contain a capital and lower case letter, number or special character",
    "username.required": "Username required",
    "username.string": "Username is not a text",
    "username.minlength": "Email is shorter than 2 characters",
    "username.maxlength": "Email is longer than 20 characters",
    "avatar.array": "Avatar is not a array",
    "avatar.required": "Avatar required",
    "avatar.minsize": "Avatar width too small",
    "avatar.maxsize": "Avatar width too big",
    "avatar.string": "Avatar field is not text",
    "avatar.pattern": "Incorrect avatar format",
    "birthdate.required": "Birthdate required",
    "birthdate.pattern": "Incorrect birthdate format",
    "birthdate.invalid": "We have zero tolerance for time travellers and immortals.",
    "favGames.array": "Avatar is not a array",
    "favGames.required": "Favourite games required",
    "favGames.minsize": "At least one favourite game required",
    "favGames.maxsize": "A maximum of 10 favourite games are allowed",
    "favGames.string": "Favourite games is not text",
    "favGames.minlength": "Favourite game is shorter than 3 characters",
    "favGames.maxlength": "Favourite game is longer than 20 characters",
    "gender.required": "Gender required",
    "gender.string": "Gender is not text",
    "joinReasons.array": "Roles is not array",
    "joinReasons.required": "Role required",
    "joinReasons.minsize": "At least one role required",
    "joinReasons.maxsize": "More roles are given than exist",
    "joinReasons.string": "Roles is not string",
    "joinReasons.pattern": "Roles contain prohibited values",
    "error": "An unknown error occurred"
  };




  // Priorytety błędów (niższa liczba oznacza wyższy priorytet)
export const ERROR_PRIORITIES: { [key: string]: number } = {
  'required': 1,
  'minlength': 2,
  'maxlength': 3,
  'pattern': 4
  // Dodaj inne priorytety błędów
};