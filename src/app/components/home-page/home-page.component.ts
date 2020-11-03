import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccountService, TodoService } from '../../services';
import { select, Store } from '@ngrx/store';
import { SET_USER } from '../../reducers/user-reducer';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { cloneDeep, set } from 'lodash';
import { User } from 'src/app/models';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})

export class HomePageComponent implements OnInit {
  public allTasks: Array<string> = [];
  public todo: Array<any> = [];
  public done: Array<any> = [];
  public user: User;
  public addImagesToggle: boolean = false;

  constructor(
    public dialog: MatDialog,
    private accountService: AccountService,
    private todoService: TodoService,
    private store: Store<any>) {
    store.pipe(select('user'))
      .subscribe(user => {
        if (user && user.todo) {
          this.todo = user.todo.filter(element => !element.done);
          this.done = user.todo.filter(element => element.done);
          this.user = user;
        }
      });
  }

  ngOnInit(): void {
    this.getUserTodo();
  }

  getUserTodo(): void {
    this.accountService.currentUser()
      .subscribe(res => {
        this.store.dispatch({ type: SET_USER, payload: res });
      });
  }

  drop(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

    let tempDone = cloneDeep(this.done);
    let tempTodo = cloneDeep(this.todo);

    tempDone = tempDone.map(item => set(item, 'done', true));
    tempTodo = tempTodo.map(item => set(item, 'done', false));

    const tempUser = cloneDeep(this.user);
    tempUser.todo = [...tempTodo, ...tempDone];

    this.todoService.editTodo(tempUser)
      .subscribe(user => {
        this.store.dispatch({ type: SET_USER, payload: user });
      });
  }

  buttonToggle(): void {
    this.addImagesToggle = !this.addImagesToggle;
  }
}
