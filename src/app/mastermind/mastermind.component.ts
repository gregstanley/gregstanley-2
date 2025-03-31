import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { faker } from '@faker-js/faker';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faAngry,
  faCircle,
  faCircleCheck,
  faXmarkCircle,
} from '@fortawesome/free-regular-svg-icons';

const guessValidator = (correctValue: string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;

    if (!value) {
      return null;
    }

    const valueUpper = value.toUpperCase();
    const correctValueUpper = correctValue.toUpperCase();

    const isCorrect = valueUpper === correctValueUpper;

    if (isCorrect) return null;

    if (valueUpper.length < 3) return { incorrect: [] };

    const tokens = valueUpper.split('').map((char, index) => {
      let token = 0;

      if (correctValueUpper.length >= index) {
        if (correctValueUpper.charAt(index) === char) token = 2;
        else if (correctValueUpper.includes(char)) token = 1;
      }
      return token;
    });

    return { incorrect: tokens };
  };
};

interface MastermindForm {
  guess: FormControl<string>;
}

@Component({
  selector: 'app-mastermind',
  imports: [ReactiveFormsModule, FaIconComponent],
  templateUrl: './mastermind.component.html',
  host: { '[class.flex]': 'true', '[class.flex-col]': 'true' },
})
export class MastermindComponent implements OnInit {
  #fb = inject(NonNullableFormBuilder);

  protected textValue = signal('');

  protected formGroup: FormGroup<MastermindForm> = this.#fb.group({
    guess: this.#fb.control(''),
  });

  protected get guessIncorrectError(): number[] | null {
    return this.formGroup.controls.guess.getError('incorrect');
  }
  protected faXmarkCircle = faXmarkCircle;
  protected faCircle = faCircle;
  protected faCircleCheck = faCircleCheck;
  protected faAngry = faAngry;

  ngOnInit(): void {
    const f = faker.animal.type();
    this.textValue.set(f);

    this.formGroup.controls.guess.setValidators([
      Validators.required,
      guessValidator(f),
    ]);
  }
}
