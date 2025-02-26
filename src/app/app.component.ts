import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClickerComponent } from './clicker/clicker.component';
import { MastermindComponent } from './mastermind/mastermind.component';
import { OtpComponent } from './otp/otp.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ClickerComponent, MastermindComponent, OtpComponent],
  template: `
    <div class="max-w-prose flex flex-col mx-auto">
      <header class="py-4">
        <h1>Angular playground</h1>
      </header>
      <div class="pb-4">
        <app-clicker></app-clicker>
      </div>
      <div class="pb-4">
        <app-mastermind></app-mastermind>
      </div>
      <div class="pb-4">
        <app-otp></app-otp>
      </div>
      <router-outlet />
    </div>
  `,
})
export class AppComponent {
  title = 'angular-starter';
}
