import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment.dev';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  ngOnInit(): void {
    const title = environment.geosever;
    console.log(title);
    
  }
  
}
