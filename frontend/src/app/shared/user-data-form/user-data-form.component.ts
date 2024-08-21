import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AUTH_ERROR_MESSAGES, ERROR_PRIORITIES } from 'src/app/auth/auth-error-messages';

import { AuthService } from 'src/app/auth/auth.service';
import { EditUser } from 'src/app/auth/edit-user.model';
import { SignUpUser } from 'src/app/auth/sign-up-user.model';
import { User } from 'src/app/auth/user.model';
import { UserData } from 'src/app/user-profile/user-data.model';
import { UserDetails } from 'src/app/user-profile/user-details.model';
import { UserProfile } from 'src/app/user-profile/user-profile';
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
  @Input() userData!: UserProfile;
  @Output() newUserData = new EventEmitter<UserProfile>();

  isEditMode = false;
  isLoading = false;
  userDataForm!: FormGroup;
  error: Record<string, string> = {};
  formData!: {
    title: string,
    submitButtonName: string,
    genders: string[],
    joinReasons: string[]
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
    if (this.userData.username) {
      this.isEditMode = true;
    }

    this.initFormData();
    this.initForm();
    this.initAvatar();
  }

  initFavGamesArrayContent(): any {
    const favGames = this.userData.favGames;

    if (favGames.length === 0) {
      return [[null, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]]];
    }

    return this.userData.favGames.map((favGame, index) =>
      [favGame, index === 0 ? [Validators.required, Validators.minLength(3), Validators.maxLength(20)] : [Validators.minLength(3), Validators.maxLength(20)]]);
  }

  initUserDetailsGroup() {
    return this.formBuilder.group({
      birthdate: [this.userData.birthdate, [Validators.required, this.invalidBirthdate]],
      gender: [this.userData.gender],
      joinReasons: this.formBuilder.array(
        this.formData.joinReasons.map(joinReason => this.formBuilder.control(this.userData.joinReasons.includes(joinReason))),
        { validators: this.invalidRoles.bind(this) }
      ),
      favGames: this.formBuilder.array(
        this.initFavGamesArrayContent()
      ),
    });
  }

  initUserGroup() {
    return this.formBuilder.group({
      username: [this.userData.username, [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    });
  }

  initUserMainGroup() {
    return this.formBuilder.group({
      email: [null, [Validators.required, Validators.email, Validators.maxLength(254)]],
      password: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(20),  Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]*$/)]],
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
      joinReasons: ['recruiter', 'friend', 'gamer', 'tester', 'other']
    }

    if (this.isEditMode) {
      formData.title = 'Edit data';
      formData.submitButtonName = 'Edit';
    }

    this.formData = formData;
  }

  initAvatar() {
    const defaultContentString = '[["#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#000000","#000000","#347e2c","#347e2c","#000000","#000000","#347e2c","#347e2c"],["#347e2c","#347e2c","#000000","#000000","#347e2c","#347e2c","#000000","#000000","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#347e2c","#000000","#000000","#347e2c","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#000000","#000000","#000000","#000000","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#000000","#000000","#000000","#000000","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#000000","#347e2c","#347e2c","#000000","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c"],["#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c","#347e2c"]]';
    const clearContent = Array.from({ length: 10 }, () => Array(10).fill('#ccc'));

    this.avatar = {
      selectedColor: "black",
      isShowGrid: false,
      length: Array(10).fill(true),
      newContent: JSON.parse(defaultContentString),
      currentContentString: JSON.stringify(this.userData.avatar),
      defaultContentString: defaultContentString,
      clearContentString: JSON.stringify(clearContent)

    }
  }

  onAddFavGame() {

    const favGamesFormArray = <FormArray>this.userDataForm.get('userDetails.favGames');

    if(favGamesFormArray.length == 10) {
      return;
    }

    if (favGamesFormArray.length == 0) {
      favGamesFormArray.push(new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]));
    } else {
      favGamesFormArray.push(new FormControl(null, [Validators.minLength(3), Validators.maxLength(20)]));
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
    const joinReasons: string[] = [];
    rolesStatus.forEach((checked, index) => {
      if (checked) {
        joinReasons.push(this.formData.joinReasons[index]);
      }
    });

    return joinReasons;
  }

  editUserData(userProfile: UserProfile) {
    this.userProfileService.editUserData(userProfile)
      .subscribe({
        next: resData => {
          this.isLoading = false;
          this.newUserData.emit(userProfile);
        },
        error: errorMessage => {
          this.error = errorMessage.message;
          this.isLoading = false;
        }
      });
  }

  signUp(signUpUser: SignUpUser) {
    this.authService.signUp(signUpUser).subscribe({
      next: resData => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: errorMessage => {
        this.error = JSON.parse(errorMessage.message);;
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
   
    if (!this.userDataForm.valid) {
      return;
    }
    
    const editUser: UserProfile = 
    {  
      avatar: 
        this.avatar.newContent.flat(),
      ...this.userDataForm.value.user,
      ...this.userDataForm.value.userDetails
    };
    editUser.joinReasons = this.convertCheckedRoles(editUser.joinReasons);

    this.isLoading = true;
    
    if (this.isEditMode) {
      this.editUserData(editUser);
    } else {
      const signUpUser: SignUpUser = 
      {
        email: this.userDataForm.value.userMain.email,
        password: this.userDataForm.value.userMain.password,
        ...editUser,
      }
     
      this.signUp(signUpUser);
    }
   
    //this.userDataForm.reset();
  }


  invalidBirthdate(control: FormControl): { [s: string]: boolean } | null {
    if (new Date(control.value) > new Date() || new Date(control.value) < new Date(new Date().getTime() - 3784320000000)) { //120 years
      return { "invalid": true };
    }          
    return null;
  }

  invalidRoles(control: AbstractControl): { [s: string]: boolean } | null {
    const values = Object.values(control.value);
    if (values.some(value => value === true)) {
      return null;
    } else {
      return { minsize: true };
    }
  }

  emptyFavGameField(control: AbstractControl): { [s: string]: boolean } | null {
    const values = Object.values(control.value);
    if (values[0] && values[0] != "") {
      return null;
    } else {
      return { minsize: true };
    }
  }


  getErrorMessage(controlName: string, control: AbstractControl | null): string {
  
    if(!control) {
      return "";
    }

    if (control.errors) {
      // Pobierz klucze błędów i przypisz im priorytety
      const errorKeys = Object.keys(control.errors);

      if (errorKeys.length === 0) {
        return 'An unknown error occurred!';
      }

      // Znajdź błąd o najwyższym priorytecie
      const highestPriorityError = errorKeys.reduce((highest, errorKey) => {
        const errorPriority = ERROR_PRIORITIES[errorKey] || Number.MAX_VALUE;
        const highestPriority = ERROR_PRIORITIES[highest] || Number.MAX_VALUE;
        return errorPriority < highestPriority ? errorKey : highest;
      }, errorKeys[0]);
      
      // Mapuj kod błędu na komunikat
      const messageTemplate = AUTH_ERROR_MESSAGES[controlName + "." + highestPriorityError];
      if (messageTemplate) {
        return this.formatErrorMessage(messageTemplate, control.errors[highestPriorityError]);
      }
    }
    return this.error?.[controlName] || 'An unknown error occurred!';
  }

  getServerErrorMessage() {
    return this.error?.['account'] || this.error?.['error'] || null;
  }

  // Funkcja do formatowania komunikatu błędu
  private formatErrorMessage(template: string, params: any): string {
    // Przykład: formatowanie komunikatu błędu z parametrami
    return template.replace(/{(.*?)}/g, (_, key) => params[key] || '');
  }

}
