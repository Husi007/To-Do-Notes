import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '../../../services';

@Component({
  templateUrl: 'add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  public form: FormGroup;
  public id: string;
  public isAddMode: boolean;
  public loading: boolean = false;
  public submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) { }

  get formControls() { return this.form.controls; }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.isAddMode = !this.id;

    const passwordValidators = [Validators.minLength(6)];
    if (this.isAddMode) {
      passwordValidators.push(Validators.required);
    }

    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', passwordValidators]
    });

    if (!this.isAddMode) {
      this.accountService.getById(this.id)
        .pipe(first())
        .subscribe(item => {
          this.formControls.firstName.setValue(item.firstName);
          this.formControls.lastName.setValue(item.lastName);
          this.formControls.username.setValue(item.username);
          this.formControls.email.setValue(item.email);
        });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    if (this.isAddMode) {
      this.createUser();
    } else {
      this.updateUser();
    }
  }

  private createUser(): void {
    this.accountService.register(this.form.value)
      .pipe(first())
      .subscribe(
        () => {
          this.alertService.success('User added successfully', { keepAfterRouteChange: true });
          this.router.navigate(['.', { relativeTo: this.route }]);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

  private updateUser(): void {
    this.accountService.update(this.id, this.form.value)
      .pipe(first())
      .subscribe(() => {
        this.alertService.success('Update successful', { keepAfterRouteChange: true });
        this.router.navigate(['..', { relativeTo: this.route }]);
      },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }
}
