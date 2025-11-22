import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>'
})
export class App {
  constructor(private themeService: ThemeService) {
    // La simple inyección garantiza que el servicio inicialice el tema.
  }
}
