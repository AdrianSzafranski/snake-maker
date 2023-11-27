import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserDetails } from 'src/app/user-profile/userDetails.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  isLoading = false;
  signUpForm!: FormGroup;
  error: string | null = null;
  selectedColor = "black";
  isShownGrid = false;

  avatarLength = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  avatarArray: string[][] = Array.from({ length: 10 }, () => Array(10).fill('#ccc'));
  defaultAvatarArray!: string[][];
  grayAvatarArray: string[][] = Array.from({ length: 10 }, () => Array(10).fill('#ccc'));
  
  genders = ['male', 'female', 'other'];
  hobbies = ['Sport', 'Muzyka', 'Podróże'];
  roles = [
    'recruiter', 
    'friend', 
    'gamer',
    'tester', 
    'other'];
  constructor(
    private authService: AuthService,
    private router: Router
    ) {}

  ngOnInit() {
    this.createDefaultAvatar();
    this.setDefaultAvatar();

    this.signUpForm = new FormGroup({
        userAuth: new FormGroup({
          email: new FormControl(null, [
            Validators.required,
            Validators.email,
          ]),
          password: new FormControl(
            null,
            [Validators.required, Validators.minLength(6)]),
        }),
        user: new FormGroup({
          username: new FormControl(null, [
            Validators.required,
          ]),
          birthdate: new FormControl(null, [Validators.required, this.invalidDate]),
          gender: new FormControl('male'),
          roles: new FormGroup({ }, this.invalidRoles.bind(this)),
          favGames: new FormArray([], this.emptyFavGameField),
        })
      });

      
      this.roles.forEach((role, index) => {
        const checkboxControl = new FormControl(false);
        (<FormGroup>this.signUpForm.get('user.roles')).addControl(role, checkboxControl);
      });

      const favGamesFormArray = <FormArray>this.signUpForm.get('user.favGames');
      favGamesFormArray.push(new FormControl(null, Validators.required));
      
      this.signUpForm.statusChanges.subscribe((status) => {
        console.log(status);
      });
    }

    createDefaultAvatar() {
      this.defaultAvatarArray = Array.from({ length: 10 }, () => Array(10).fill('#347e2c'));
      const blackColorCoords = [
        [2, 2], [2, 3], [2, 6], [2, 7],
        [3, 2], [3, 3], [3, 6], [3, 7],
        [4, 4], [4, 5],
        [5, 3], [5, 4], [5, 5], [5, 6],
        [6, 3], [6, 4], [6, 5], [6, 6],
        [7, 3], [7, 6],
      ];
      blackColorCoords.forEach(blackColorCoord => {
        this.defaultAvatarArray[blackColorCoord[0]][blackColorCoord[1]] = "#000";
      });
    }

    onAddFavGame() {
      const favGamesFormArray = <FormArray>this.signUpForm.get('user.favGames');
      if (favGamesFormArray.length == 0) {
        favGamesFormArray.push(new FormControl(null, Validators.required));
      } else {
        favGamesFormArray.push(new FormControl(null));
      }
    }

    get favGamesControls() {
      return (this.signUpForm.get('user.favGames') as FormArray).controls;
    }
  

  onSignUp() {
    if(!this.signUpForm.valid) {
      return;
    }

    const userAuthValues = this.signUpForm.value.userAuth;
    const email = userAuthValues.email;
    const password = userAuthValues.password;

    const userValues = this.signUpForm.value.user;
    const username = userValues.username;
    const birthdate = userValues.birthdate;
    const gender = userValues.gender;
    let roles = "";
    this.roles.forEach(role => {
      if(userValues.roles[''+role]) {
        roles += role + ";";
      }
    });
    const favGames = userValues.favGames;

    const userDetails = new UserDetails(
      birthdate,
      gender,
      roles,
      favGames
    );

    this.isLoading = true;

    this.authService.signUp(
      email, 
      password, 
      username, 
      JSON.stringify(this.avatarArray),
      userDetails)
      .subscribe({
        next: resData => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: errorMessage => {
          this.error = errorMessage.message;
          this.isLoading = false;
        }
      });

      this.signUpForm.reset();
  }

  invalidDate(control: FormControl): { [s: string]: boolean } | null {
    if (new Date(control.value) > new Date() || new Date(control.value) < new Date(new Date().getTime() - 3784320000000)) { //120 years
      return { dateIsInvalid: true };
    }
    return null;
  }

  invalidRoles(control: AbstractControl): { [s: string]: boolean } | null {
    
    const values = Object.values(control.value);
    if (values.some(value => value === true)) {
      return null;
    } else {
      return { roleIsNotSelected: true };
    }
  }

  onDeleteFavGame(index: number) {
    (<FormArray>this.signUpForm.get('user.favGames')).removeAt(index);
  }

  setDefaultAvatar() {
    this.avatarArray = JSON.parse(JSON.stringify(this.defaultAvatarArray));
  }

  emptyFavGameField(control: AbstractControl): { [s: string]: boolean } | null {
    const values = Object.values(control.value);
    if (values[0] && values[0] != "") {
      return null;
    } else {
      return { emptyFavGameFieldExists: true };
    }
  }

  onChangeColor(row: number, column: number) {
    this.avatarArray[row][column] = this.selectedColor;
  }

  onColorChange(event: any) {
    this.selectedColor = event.target.value;
  }

  onSetDefaultAvatar() {
    this.setDefaultAvatar();
  }

  onResetAvatar() {
    this.avatarArray = JSON.parse(JSON.stringify(this.grayAvatarArray));
  }

  onChangeGridMode() {
    this.isShownGrid = !this.isShownGrid;
  }
}
