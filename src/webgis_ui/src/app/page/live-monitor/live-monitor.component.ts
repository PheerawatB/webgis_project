import { Component, OnInit } from '@angular/core';
import { GeoserverDataService } from '../../../services/geoserver/geoserver-data.service';

@Component({
  selector: 'app-live-monitor',
  templateUrl: './live-monitor.component.html',
  styleUrl: './live-monitor.component.scss'
})
export class LiveMonitorComponent implements OnInit{
  constructor(private GeoserDataService: GeoserverDataService){}
  ngOnInit(): void {
    // this.GeoserDataService.GetLayerLists().subscribe(res =>{
    //   // console.log(res);
    // });
  }
  eventsData = [
    { date: '2024-06-01 10:14:59', type: 'Alarm', system: 'SENSOR', details: 'Sensor 002 Alarm - Human Detection' },
    { date: '2024-06-01 08:02:40', type: 'Info', system: 'SENSOR', details: 'Sensor Health Check - On' },
    { date: '2024-06-01 07:10:00', type: 'Alarm', system: 'SENSOR', details: 'Sensor 001 Alarm - Vehicle Detection' },
    { date: '2024-06-01 07:04:20', type: 'Alarm', system: 'SENSOR', details: 'Sensor 004 Alarm - Vehicle Detection' },
    { date: '2024-06-01 06:43:41', type: 'Info', system: 'SERVER', details: 'Storage Update' },
    { date: '2024-06-01 06:16:00', type: 'Info', system: 'SENSOR', details: 'Sensor 003 Alarm - Human Detection' }
  ];

  columnsConfig = [
    { header: 'วันที่', field: 'date' },
    { header: 'ประเภท', field: 'type' },
    { header: 'ระบบ', field: 'system' },
    { header: 'รายละเอียด', field: 'details' }
  ];

  onSearch(term: string) {
    console.log('Searching for:', term);
  }

}
