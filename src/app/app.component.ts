import {Component} from '@angular/core';
import {AccountService} from './services';
import {User} from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user: User;

  constructor(private accountService: AccountService) {
    this.accountService.user.subscribe(element => this.user = element);
  }

  logout(): void {
    this.accountService.logout();
  }
}
