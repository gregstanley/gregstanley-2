import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-clicker',
  imports: [],
  templateUrl: './clicker.component.html',
})
export class ClickerComponent {
  protected counter = signal(0);

  protected onClick(): void {
    this.counter.set(this.counter() + 1);
  }
}
