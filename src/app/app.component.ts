import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClickerComponent } from './clicker/clicker.component';
import { MastermindComponent } from './mastermind/mastermind.component';
import { OtpComponent } from './otp/otp.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ClickerComponent, MastermindComponent, OtpComponent],
  styleUrl: 'app.component.scss',
  template: `
    <div class="fullscreen-bg"></div>
    <div class="h-full flex flex-col mx-auto max-w-prose">
      <header class="py-4 bg-sky-900 p-8 opacity-80 text-white">
        <h1>
          <img
            src="./images/angular-full.svg"
            height="3rem"
            class="h-12"
            alt="Angular logo"
          />Playground
        </h1>
      </header>
      <div class="flex-1 bg-slate-200 p-8 opacity-90">
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
      <footer class="bg-slate-200 p-8 text-xs opacity-50">
        <p>
          <a
            href="https://www.pexels.com/photo/purple-and-pink-diamond-on-blue-background-5011647/"
            >Background photo by Rostislav Uzunov</a
          >
        </p>
      </footer>
    </div>
  `,
})
export class AppComponent {
  title = 'Angular playground';
}
