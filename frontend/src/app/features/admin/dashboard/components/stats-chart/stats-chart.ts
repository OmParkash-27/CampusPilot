import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { NgChartsModule } from 'ng2-charts';
import { ChartModule } from 'primeng/chart';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-stats-chart',
  imports: [ChartModule, CommonModule],
  templateUrl: './stats-chart.html',
  styleUrl: './stats-chart.scss'
})
export class StatsChart {
   public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    }
  };

  public barChartLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data']['datasets'] = [
    {
      data: [10, 20, 15, 30, 25, 35],
      label: 'New Users',
      backgroundColor: '#2196F3'
    },
    {
      data: [5, 10, 8, 15, 12, 18],
      label: 'New Students',
      backgroundColor: '#4CAF50'
    }
  ];
}
