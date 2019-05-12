import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule} from '@angular/common/http';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UsersComponent } from './components/users/users.component';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { CommonService } from './services/common.service';
import { ReplaceStringPipePipe } from './common/replace-string-pipe.pipe';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    UsersComponent,
    HeaderbarComponent,
    ReplaceStringPipePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AgGridModule.withComponents([]),
  ],
  providers: [CommonService],
  bootstrap: [AppComponent]
})
export class AppModule { }
