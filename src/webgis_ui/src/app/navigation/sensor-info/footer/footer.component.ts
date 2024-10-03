import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartData, ChartType, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';
import { Chart } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement,BarController, Title, Tooltip, Legend);

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})

export class FooterComponent implements OnInit {
  
  barChart : any = []
  ngOnInit(): void {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // Get the current month (1-based)
    const year = currentDate.getFullYear();   // Get the current year
    const daysInMonth = this.getDaysInMonth(month, year);

    const dataForMonth = Array.from({ length: daysInMonth.length }, () => Math.floor(Math.random() * 100)); // Random data for each day
    this.barChart = new Chart('barChart', {
      type: "bar",
      data: {
        labels: daysInMonth,
        datasets: [{
          label: '',
          data: dataForMonth,
          backgroundColor: '#00FCFF',
          borderColor: '#00FCFF',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        },
        // plugins: {
        //   legend: {
        //     display: true,
        //     position: 'top' // Position of the chart legend
        //   },
        //   tooltip: {
        //     enabled: true
        //   }
        // }
      }
    });
  }

  getDaysInMonth(month: number, year: number): string[] {
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => (i + 1).toString()); // Generate array of days as strings
  }
}
