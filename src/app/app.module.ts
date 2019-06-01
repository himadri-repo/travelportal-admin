import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule} from '@angular/common/http';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UsersComponent } from './components/users/users.component';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { CommonService } from './services/common.service';
import { ReplaceStringPipePipe } from './common/replace-string-pipe.pipe';
import { AgGridModule } from 'ag-grid-angular';
import { WholesalersComponent } from './components/wholesalers/wholesalers.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { CustomersComponent } from './components/customers/customers.component';
import { TicketsComponent } from './components/tickets/tickets.component';

import { MatToolbarModule, MatDialogModule, MatCheckboxModule, MatRadioModule, MatSelectModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CustomerinfoComponent } from './components/customers/customerinfo/customerinfo.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WholesalerSearchComponent } from './components/wholesalers/search/wholesalersearch.component';
import { SuppliersearchComponent } from './components/suppliers/suppliersearch/suppliersearch.component';
import { InviteComponent } from './components/communication/invite/invite.component';

import { NgxEditorModule } from 'ngx-editor';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NotificationComponent } from './components/notification/notification.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    UsersComponent,
    HeaderbarComponent,
    ReplaceStringPipePipe,
    WholesalersComponent,
    SuppliersComponent,
    CustomersComponent,
    TicketsComponent,
    CustomerinfoComponent,
    SuppliersearchComponent,
    WholesalerSearchComponent,
    InviteComponent,
    NotificationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AgGridModule.withComponents([]),
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgxEditorModule,
    TooltipModule.forRoot()
  ],
  entryComponents: [
    CustomerinfoComponent,
    InviteComponent
  ],
  providers: [CommonService],
  bootstrap: [AppComponent]
})
export class AppModule { }
