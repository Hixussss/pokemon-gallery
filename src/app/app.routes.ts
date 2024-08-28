import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ContactComponent } from './contact.component';

export const routes: Routes = [
    { path: '', component: AppComponent },
    { path: 'contact', component: ContactComponent}
    
];
