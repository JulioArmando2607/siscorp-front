import { registerLocaleData } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import localeEs from '@angular/common/locales/es';

// 👇 Registrar el locale antes del bootstrap
registerLocaleData(localeEs);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err)
);
