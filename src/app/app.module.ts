import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
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

import { MatToolbarModule, MatDialogModule, MatCheckboxModule, MatRadioModule, MatSelectModule, MatFormFieldModule, MatAutocompleteModule, MatFormFieldControl, MatRippleModule, MatTooltipModule, MatInputModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatSortModule } from '@angular/material';
import { CustomerinfoComponent } from './components/customers/customerinfo/customerinfo.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { WholesalerSearchComponent } from './components/wholesalers/search/wholesalersearch.component';
import { SuppliersearchComponent } from './components/suppliers/suppliersearch/suppliersearch.component';
import { InviteComponent } from './components/communication/invite/invite.component';

import { NgxEditorModule } from 'ngx-editor';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NotificationComponent } from './components/notification/notification.component';
import { ConfirmationComponent } from './components/shared/confirmation/confirmation.component';
import { RateplanComponent } from './components/general/rateplan/rateplan.component';
import { ProfileComponent } from './components/general/profile/profile.component';
import { RateplandetailComponent } from './components/general/rateplandetail/rateplandetail.component';
import { SafehtmlPipe } from './common/safehtml.pipe';
import { BookingsComponent } from './components/sales/bookings/bookings.component';
import { DatediffPipe } from './common/datediff.pipe';
import { CacheInterceptor } from './common/cache-inspector';
import { TicketviewComponent } from './components/tickets/ticketview/ticketview.component';
import { TicketFormComponent } from './components/tickets/ticket-form/ticket-form.component';
// import { DateTimePickerComponent } from './components/shared/date-time-picker/date-time-picker.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { WalletsComponent } from './components/wallets/wallets.component';
import { WalletinfoComponent } from './components/wallets/walletinfo/walletinfo.component';
import { UseractivityComponent } from './components/useractivity/useractivity.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PnrsearchComponent } from './components/pnrsearch/pnrsearch.component';

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
    NotificationComponent,
    ConfirmationComponent,
    RateplanComponent,
    ProfileComponent,
    RateplandetailComponent,
    SafehtmlPipe,
    BookingsComponent,
    DatediffPipe,
    TicketviewComponent,
    TicketFormComponent,
    WalletsComponent,
    WalletinfoComponent,
    UseractivityComponent,
    DashboardComponent,
    PnrsearchComponent,
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
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatRippleModule,
    MatTooltipModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    NgxEditorModule,
    TooltipModule.forRoot(),
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  entryComponents: [
    CustomerinfoComponent,
    InviteComponent,
    ConfirmationComponent
  ],
  providers: [CommonService,
      { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
