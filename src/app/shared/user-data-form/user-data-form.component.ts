import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { UserData } from 'src/app/user-profile/user-data.model';
import { UserDetails } from 'src/app/user-profile/user-details.model';
import { UserProfileService } from 'src/app/user-profile/user-profile.service';

interface UserMain {
  email: string,
  password: string,
}

@Component({
  selector: 'app-user-data-form',
  templateUrl: './user-data-form.component.html',
  styleUrls: ['./user-data-form.component.css']
})
export class UserDataFormComponent {
  @Input() userData!: UserData;
  @Output() newUserData = new EventEmitter<UserData>();

  isEditMode = false;
  isLoading = false;
  userDataForm!: FormGroup;
  error: string | null = null;
  formData!: {
    title: string,
    submitButtonName: string,
    genders: string[],
    roles: string[]
  }
  avatar!: {
    selectedColor: string,
    isShowGrid: boolean,
    length: boolean[],
    newContent: string[][],
    currentContentString: string,
    defaultContentString: string,
    clearContentString: string
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private userProfileService: UserProfileService
  ) { }

  ngOnInit() {
    if (this.userData.email) {
      this.isEditMode = true;
    }

    this.initFormData();
    this.initForm();
    this.initAvatar();
  }

  initFavGamesArrayContent(): any {
    const favGames = this.userData.favGames;

    if (favGames.length === 0) {
      return [[null, Validators.required]];
    }

    return this.userData.favGames.map((favGame, index) =>
      [favGame, index === 0 ? Validators.required : null]);
  }

  initUserDetailsGroup() {
    return this.formBuilder.group({
      birthdate: [this.userData.birthdate, [Validators.required, this.invalidDate]],
      gender: [this.userData.gender],
      roles: this.formBuilder.array(
        this.formData.roles.map(role => this.formBuilder.control(this.userData.roles.includes(role))),
        { validators: this.invalidRoles.bind(this) }
      ),
      favGames: this.formBuilder.array(
        this.initFavGamesArrayContent(),
        { validators: this.emptyFavGameField }
      ),
    });
  }

  initUserGroup() {
    return this.formBuilder.group({
      username: [this.userData.username, Validators.required],
    });
  }

  initUserMainGroup() {
    return this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
    });
  }

  initForm() {
    if (!this.isEditMode) {
      this.userDataForm = this.formBuilder.group({
        userMain: this.initUserMainGroup(),
        user: this.initUserGroup(),
        userDetails: this.initUserDetailsGroup(),
      });
    } else {
      this.userDataForm = this.formBuilder.group({
        user: this.initUserGroup(),
        userDetails: this.initUserDetailsGroup(),
      });
    }
  }

  initFormData() {
    const formData = {
      title: 'Sign up',
      submitButtonName: 'Register',
      genders: ['male', 'female', 'other'],
      roles: ['recruiter', 'friend', 'gamer', 'tester', 'other']
    }

    if (this.isEditMode) {
      formData.title = 'Edit data';
      formData.submitButtonName = 'Edit';
    }

    this.formData = formData;
  }

  initAvatar() {
    const defaultContentString = '[["#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#000","#000","#347e2c","#347e2c","#000","#000","#347e2c","#347e2c"],["#347e2c","#347e2c","#000","#000","#347e2c","#347e2c","#000","#000","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#347e2c","#000","#000","#347e2c","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#000","#000","#000","#000","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#000","#000","#000","#000","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#000","#347e2c","#347e2c","#000","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c"]]';
    const clearContent = Array.from({ length: 10 }, () => Array(10).fill('#ccc'));

    this.avatar = {
      selectedColor: "black",
      isShowGrid: false,
      length: Array(10).fill(true),
      newContent: JSON.parse(defaultContentString),
      currentContentString: this.userData.avatar,
      defaultContentString: defaultContentString,
      clearContentString: JSON.stringify(clearContent)

    }
  }

  onAddFavGame() {
    const favGamesFormArray = <FormArray>this.userDataForm.get('userDetails.favGames');
    if (favGamesFormArray.length == 0) {
      favGamesFormArray.push(new FormControl(null, Validators.required));
    } else {
      favGamesFormArray.push(new FormControl(null));
    }
  }

  onDeleteFavGame(index: number) {
    (<FormArray>this.userDataForm.get('userDetails.favGames')).removeAt(index);
  }

  get favGamesControls() {
    return (this.userDataForm.get('userDetails.favGames') as FormArray).controls;
  }

  onChangeColor(row: number, column: number) {
    this.avatar.newContent[row][column] = this.avatar.selectedColor;
  }

  onChangeSelectedColor(event: any) {
    this.avatar.selectedColor = event.target.value;
  }

  onSetCurrentAvatar() {
    if(this.isEditMode) {
      this.avatar.newContent = JSON.parse(this.avatar.currentContentString);
    }
  }

  onSetDefaultAvatar() {
    this.avatar.newContent = JSON.parse(this.avatar.defaultContentString);
  }

  onResetAvatar() {
    this.avatar.newContent = JSON.parse(this.avatar.clearContentString);
  }

  onChangeGridMode() {
    this.avatar.isShowGrid = !this.avatar.isShowGrid;
  }

  convertCheckedRoles(rolesStatus: string[]) {
    const roles: string[] = [];
    rolesStatus.forEach((checked, index) => {
      if (checked) {
        roles.push(this.formData.roles[index]);
      }
    });

    return roles;
  }

  editUserData(user: User, userDetails: UserDetails) {
    this.userProfileService.editUserData(user, userDetails)
      .subscribe({
        next: resData => {
          this.isLoading = false;
          this.newUserData.emit({ ...user, ...userDetails, email: this.userData.email });
        },
        error: errorMessage => {
          this.error = errorMessage.message;
          this.isLoading = false;
        }
      });
  }

  signUp(userMain: UserMain, user: User, userDetails: UserDetails) {
    this.authService.signUp(userMain.email, userMain.password, user, userDetails).subscribe({
      next: resData => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: errorMessage => {
        this.error = errorMessage.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (!this.userDataForm.valid) {
      return;
    }

    const userMain: UserMain = { ...this.userDataForm.value.userMain };
    const avatar = JSON.stringify(this.avatar.newContent);
    const user: User = { ...this.userDataForm.value.user, avatar: avatar };
    const userDetails: UserDetails = { ...this.userDataForm.value.userDetails };
    userDetails.roles = this.convertCheckedRoles(userDetails.roles);

    this.isLoading = true;
    if (this.isEditMode) {
      this.editUserData(user, userDetails);
    } else {
      this.signUp(userMain, user, userDetails);
    }
   
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

  emptyFavGameField(control: AbstractControl): { [s: string]: boolean } | null {
    const values = Object.values(control.value);
    if (values[0] && values[0] != "") {
      return null;
    } else {
      return { emptyFavGameFieldExists: true };
    }
  }
}
