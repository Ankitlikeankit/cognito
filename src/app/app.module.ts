import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// vendor components
import { AppVendorModule } from './app-vendor.module';

import {
  AmplifyAngularModule,
  AmplifyService,
  AmplifyModules,
} from 'aws-amplify-angular';
import Auth from '@aws-amplify/auth';
import { NavMainComponent } from './nav-main/nav-main.component';
import { SigninComponent } from './signin/signin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { SetupComponent } from './setup/setup.component';
import { UserCreateComponent } from './users/user-create/user-create.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserFormComponent } from './users/user-form/user-form.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { LoaderComponentComponent } from './shared/components/loader-component/loader-component.component';
import { UserAttributes } from './shared/pipes/user-attributes.pipe';
import { MatIconRegistry } from '@angular/material/icon';
import { UserSearchComponent } from './users/user-search/user-search.component';
import { UserGroupsComponent } from './users/user-form/user-groups/user-groups.component';
import { RecordComponent } from './record/record.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    DashboardComponent,
    NavMainComponent,
    UsersComponent,
    SetupComponent,
    UserCreateComponent,
    UserListComponent,
    UserFormComponent,
    UserEditComponent,
    LoaderComponentComponent,
    UserAttributes,
    UserSearchComponent,
    UserGroupsComponent,
    RecordComponent
  ],
  imports: [
    AmplifyAngularModule,
    AppRoutingModule,
    AppVendorModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: AmplifyService,
      useFactory: () => {
        return AmplifyModules({
          Auth,
        });
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    // add font awesome SVG icons
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/fa-icons.svg'),
      {
        viewBox: '0 0 640 640'
      }
    );
  }
}
