import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import * as OTPAuth from 'otpauth';
import {
  from,
  interval,
  map,
  of,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import { generateTotp } from './otp';

@Component({
  selector: 'app-otp',
  imports: [],
  templateUrl: './otp.component.html',
})
export class OtpComponent implements OnInit, OnDestroy {
  // Must only contain characters found in the RFC4648 found here:
  // https://github.com/scttcper/ts-base32/blob/master/src/index.ts
  secret = 'somekey';
  digits = 6;
  period = 30;

  countdown = signal(this.period);
  otpGroup = signal<string[]>([]);

  otpPrevious = computed(() => this.otpGroup().at(0));
  otp = computed(() => this.otpGroup().at(1));
  otpNext = computed(() => this.otpGroup().at(2));

  #subscription = Subscription.EMPTY;

  ngOnInit(): void {
    const totp = this.createTotp(this.secret, this.digits, this.period);

    this.#subscription = interval(1000)
      .pipe(
        startWith(-1),
        map((x) => {
          return {
            tick: x + 1,
            countdown: Math.ceil(
              this.period - (new Date(Date.now()).getSeconds() % this.period),
            ),
          };
        }),
        switchMap((x) => {
          const timestamp = Date.now();
          return x.tick === 0 || x.countdown === this.period
            ? from(
                this.generateTotpRange(timestamp, this.secret, this.period),
              ).pipe(
                map((otpRange) => ({
                  ...x,
                  otpRange,
                  otp: otpRange[1],
                  refOtp: totp.generate({ timestamp }),
                })),
              )
            : of({ tick: x.tick, countdown: x.countdown, otpRange: null });
        }),
      )
      .subscribe((x) => {
        this.countdown.set(x.countdown);

        if (x.otpRange) {
          console.log(x.tick, x.otpRange, x.refOtp);
          this.otpGroup.set(x.otpRange);
        }
      });
  }

  protected createTotp(secret: string, digits = 6, period = 30): OTPAuth.TOTP {
    return new OTPAuth.TOTP({
      issuer: 'Greg',
      label: 'Greg',
      algorithm: 'SHA1',
      digits,
      period,
      secret,
    });
  }

  protected generateTotpRange = async (
    utcNow: number = Date.now(),
    secret: string,
    period: number,
  ): Promise<string[]> => {
    const step = period * 1000;
    return [
      await generateTotp(utcNow - step, secret),
      await generateTotp(utcNow, secret),
      await generateTotp(utcNow + step, secret),
    ];
  };

  ngOnDestroy() {
    this.#subscription.unsubscribe();
  }
}
