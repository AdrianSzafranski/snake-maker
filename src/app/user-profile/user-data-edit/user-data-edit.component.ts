import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService } from '../user-profile.service';
import { UserData } from '../user-data.model';

@Component({
  selector: 'app-user-data-edit',
  templateUrl: './user-data-edit.component.html',
  styleUrls: ['./user-data-edit.component.css']
})
export class UserDataEditComponent {
  @Input() userData!: UserData;
  @Output() newUserData = new EventEmitter<UserData>();
  isLoading = false;
  userDataForm!: FormGroup;
  error: string | null = null;
  selectedColor = "black";
  isShownGrid = false;

  avatarLength = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  avatarArray: string[][] = Array.from({ length: 10 }, () => Array(10).fill('#ccc'));
  defaultAvatarArray!: string[][];
  grayAvatarArray: string[][] = Array.from({ length: 10 }, () => Array(10).fill('#ccc'));

  genders = ['male', 'female', 'other'];
  roles = [
    'recruiter',
    'friend',
    'gamer',
    'tester',
    'other'];

  constructor(
    private userProfileService: UserProfileService,
    private router: Router
  ) { }

  ngOnInit() {
    this.setCurrentAvatar();
    this.createDefaultAvatar();
    this.initUserDetailsForm();
  }

  initUserDetailsForm() {
    this.userDataForm = new FormGroup({
      username: new FormControl(this.userData.username, [
        Validators.required,
      ]),
      birthdate: new FormControl(this.userData.birthdate, [Validators.required, this.invalidDate]),
      gender: new FormControl(this.userData.gender),
      roles: new FormGroup({}, this.invalidRoles.bind(this)),
      favGames: new FormArray([], this.emptyFavGameField),
    });


    this.roles.forEach((role, index) => {
      const isChecked = this.userData.roles.includes(role);
      const checkboxControl = new FormControl(isChecked);
      (<FormGroup>this.userDataForm.get('roles')).addControl(role, checkboxControl);
    });

    const favGamesFormArray = <FormArray>this.userDataForm.get('favGames');
    favGamesFormArray.push(new FormControl(this.userData.favGames[0], Validators.required));

    const favGameNumber = this.userData.favGames.length;
    for(let i = 1; i < favGameNumber; i++) {
      const favGame = this.userData.favGames[i];
      favGamesFormArray.push(new FormControl(favGame));
    }
  }

  onAddFavGame() {
    const favGamesFormArray = <FormArray>this.userDataForm.get('favGames');
    if (favGamesFormArray.length == 0) {
      favGamesFormArray.push(new FormControl(null, Validators.required));
    } else {
      favGamesFormArray.push(new FormControl(null));
    }
  }

  get favGamesControls() {
    return (this.userDataForm.get('favGames') as FormArray).controls;
  }

  onEditUserData() {
    if (!this.userDataForm.valid) {
      return;
    }

    const userDetailsValues = this.userDataForm.value;
    const username = userDetailsValues.username;
    const birthdate = userDetailsValues.birthdate;
    const gender = userDetailsValues.gender;
    let roles: string[] = [];
    this.roles.forEach(role => {
      if (userDetailsValues.roles['' + role]) {
        roles.push(role);
      }
    });
    const favGames = userDetailsValues.favGames;

    const editedUser = {
      username: username,
      avatar: JSON.stringify(this.avatarArray),
     
    };

    const editedUserDetails = {
      birthdate: birthdate,
      gender: gender,
      roles: roles,
      favGames: favGames
    };

    this.isLoading = true;

    this.userProfileService.editUserData(editedUser, editedUserDetails)
      .subscribe({
        next: resData => {
          this.isLoading = false;
          this.newUserData.emit({...editedUser, ...editedUserDetails, email: this.userData.email});
        },
        error: errorMessage => {
          this.error = errorMessage.message;
          this.isLoading = false;
        }
      });

    this.userDataForm.reset();
  }

  onClearForm() {
    this.userDataForm.reset();
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
    (<FormArray>this.userDataForm.get('favGames')).removeAt(index);
  }

  setCurrentAvatar() {
    if (!this.userData.avatar) {
      return;
    }
    this.avatarArray = JSON.parse(this.userData.avatar);
  }

  onSetCurrentAvatar() {
    this.setCurrentAvatar();
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
    this.avatarArray = JSON.parse(JSON.stringify(this.defaultAvatarArray));
  }

  onResetAvatar() {
    this.avatarArray = JSON.parse(JSON.stringify(this.grayAvatarArray));
  }

  onChangeGridMode() {
    this.isShownGrid = !this.isShownGrid;
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
}
