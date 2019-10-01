import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/models/user';
import { Company } from 'src/app/models/company';
import * as Chartist from 'chartist';
import { Statistics } from 'src/app/models/statistics';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public currentUser: User;
  public company: Company;
  public statistics: Statistics = new Statistics();

  constructor(private router: Router, private commonService: CommonService, private authenticationService: AuthenticationService,
              private usersService: UsersService, private adminService: AdminService) {

  }

  ngOnInit() {
    this.statistics = new Statistics();
    if (this.authenticationService.currentLoggedInUser) {
      this.commonService.setTitle('Dashboard');
      this.currentUser = this.authenticationService.currentLoggedInUser;
      this.company = this.authenticationService.currentCompany;

      this.init();
    } else {
      this.commonService.getAuthenticated().subscribe((obsrv: Company) => {
        this.commonService.setTitle('Dashboard');
        this.currentUser = this.authenticationService.currentLoggedInUser;
        this.company = this.authenticationService.currentCompany;

        this.init();
      });
    }
  }

  startAnimationForLineChart(chart) {
    let seq: any;
    let delays: any;
    let durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on('draw', (data) => {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
            seq++;
            data.element.animate({
              opacity: {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
    });

    seq = 0;
  }

  startAnimationForBarChart(chart) {
      let seq2: any;
      let delays2: any;
      let durations2: any;

      seq2 = 0;
      delays2 = 80;
      durations2 = 500;
      chart.on('draw', (data) => {
        if (data.type === 'bar') {
            seq2++;
            data.element.animate({
              opacity: {
                begin: seq2 * delays2,
                dur: durations2,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
      });

      seq2 = 0;
  }

  init() {
      this.getStatistics();
      /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */

      // const dataDailySalesChart: any = {
      //     labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      //     series: [
      //         [12, 17, 7, 17, 23, 18, 38]
      //     ]
      // };

      // const optionsDailySalesChart: any = {
      //     lineSmooth: Chartist.Interpolation.cardinal({
      //         tension: 0
      //     }),
      //     low: 0,
      //     high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      //     chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
      // };

      // const dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);

      // this.startAnimationForLineChart(dailySalesChart);


      /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

      // const dataCompletedTasksChart: any = {
      //     labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
      //     series: [
      //         [230, 750, 450, 300, 280, 240, 200, 190]
      //     ]
      // };

      // const optionsCompletedTasksChart: any = {
      //     lineSmooth: Chartist.Interpolation.cardinal({
      //         tension: 0
      //     }),
      //     low: 0,
      //     high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      //     chartPadding: { top: 0, right: 0, bottom: 0, left: 0}
      // };

      // const completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);

      // // start animation for the Completed Tasks Chart - Line Chart
      // this.startAnimationForLineChart(completedTasksChart);



      /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

      const datawebsiteViewsChart = {
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        series: [
          [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]

        ]
      };

      const optionswebsiteViewsChart = {
          axisX: {
              showGrid: false
          },
          low: 0,
          high: 1000,
          chartPadding: { top: 0, right: 5, bottom: 0, left: 0}
      };

      const responsiveOptions: any[] = [
        ['screen and (max-width: 640px)', {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: (value) => {
              return value[0];
            }
          }
        }]
      ];

      const websiteViewsChart = new Chartist.Bar('#websiteViewsChart', datawebsiteViewsChart, optionswebsiteViewsChart, responsiveOptions);

      // start animation for the Emails Subscription Chart
      this.startAnimationForBarChart(websiteViewsChart);
  }

  getStatistics() {
    const objParent = this;
    this.adminService.getStatistics({filter: {companyid: this.currentUser.companyid}}).subscribe((result: any) => {
      if (result) {
        const stats = result.stats;
        stats.forEach(stat => {
          switch (stat.code) {
            case 'BKNG_MTH':
              objParent.statistics.total_booking = parseInt(stat.value, 10);
              break;
            case 'BKNG':
              objParent.statistics.pending_booking = parseInt(stat.value, 10);
              break;
            case 'RVNU_MTH':
              objParent.statistics.total_revenue = parseInt(stat.value, 10);
              break;
            case 'WLSR':
              objParent.statistics.total_wholesaler = parseInt(stat.value, 10);
              break;
            case 'SUPL':
              objParent.statistics.total_suppliers = parseInt(stat.value, 10);
              break;
            case 'RL_CUST':
              objParent.statistics.total_retailers = parseInt(stat.value, 10);
              break;
            case 'TA_CUST':
              objParent.statistics.total_agents = parseInt(stat.value, 10);
              break;
            case 'TKTSRCH_MTH':
              objParent.statistics.total_ticket_enq = parseInt(stat.value, 10);
              break;
            case 'WLT_DUE':
              objParent.statistics.pending_wallet_trans = parseInt(stat.value, 10);
              break;
            case 'RQ_CUST':
              objParent.statistics.user_pending_req = parseInt(stat.value, 10);
              break;
            case 'NEW_MSG':
              objParent.statistics.new_message = parseInt(stat.value, 10);
              break;
            case 'USER':
              objParent.statistics.staff = parseInt(stat.value, 10);
              break;
            case 'OWN_TKT':
              objParent.statistics.own_ticket = parseInt(stat.value, 10);
              break;
            case 'SRC_TKT':
              objParent.statistics.sourced_ticket = parseInt(stat.value, 10);
              break;
            default:
              break;
          }
        });

        this.prepareSalesChart(result.historical_sales, '#dailySalesChart');
        this.prepareInventorySearchChart(result.inventory_search, '#websiteViewsChart');
        this.prepareInventoryByCircleChart(result.inventory_circle, '#completedTasksChart');
      }

      return objParent.statistics;
    }, (error: any) => {
      console.log(`Error : ${error}`);
    });
  }

  prepareSalesChart(chardata, element = '#dailySalesChart') {
    let maxvalue = 0;
    const dataDailySalesChart: any = {
      labels: [],
      series: [
          []
      ]
    };

    if (chardata) {
      let current_date = moment(new Date()).subtract({days: 7});
      let idx = 0;
      let recidx = 0;

      while (idx <= 7) {
        dataDailySalesChart.labels[idx] = current_date.format('MM-DD');
        if ((recidx < chardata.length) && (chardata[recidx].day === current_date.format('MM-DD'))) {
          dataDailySalesChart.series[0][idx] = parseFloat(chardata[recidx].total);

          if (maxvalue < parseFloat(chardata[recidx].total)) {
            maxvalue = parseFloat(chardata[recidx].total);
          }

          recidx++;
        } else {
          dataDailySalesChart.series[0][idx] = 0;
        }

        idx++;
        current_date = current_date.add({days: 1});
      }

      console.log(JSON.stringify(dataDailySalesChart));
      const optionsDailySalesChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0
          }),
          low: 0,
          high: maxvalue, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
      };

      const dailySalesChart = new Chartist.Line(element, dataDailySalesChart, optionsDailySalesChart);

      this.startAnimationForLineChart(dailySalesChart);
    }
  }

  prepareInventoryByCircleChart(chardata, element = '#completedTasksChart') {
    let maxvalue = 0;
    const dataDailySalesChart: any = {
      labels: [],
      series: [
          []
      ]
    };

    if (chardata) {
      chardata.forEach((inventoryData, idx) => {
        dataDailySalesChart.labels[idx] = inventoryData.circle;
        dataDailySalesChart.series[0][idx] = parseInt(inventoryData.inventory, 10);

        if (maxvalue < parseInt(inventoryData.inventory, 10)) {
          maxvalue = parseInt(inventoryData.inventory, 10);
        }
      });

      console.log(JSON.stringify(dataDailySalesChart));
      const optionsDailySalesChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0,
              showGrid: false
          }),
          low: 0,
          high: maxvalue, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
      };

      const chart = new Chartist.Bar(element, dataDailySalesChart, optionsDailySalesChart);

      this.startAnimationForLineChart(chart);
    }
  }

  prepareInventorySearchChart(chardata, element = '#websiteViewsChart') {
    let maxvalue = 0;
    const dataDailySalesChart: any = {
      labels: [],
      series: [
          []
      ]
    };

    if (chardata) {
      let current_date = moment(new Date()).subtract({days: 12});
      let idx = 0;
      let recidx = 0;

      while (idx <= 12) {
        dataDailySalesChart.labels[idx] = current_date.format('DD-MMM');
        if ((recidx < chardata.length) && (chardata[recidx].req_date === current_date.format('DD-MMM'))) {
          dataDailySalesChart.series[0][idx] = parseFloat(chardata[recidx].enquiry);

          if (maxvalue < parseFloat(chardata[recidx].enquiry)) {
            maxvalue = parseFloat(chardata[recidx].enquiry);
          }

          recidx++;
        } else {
          dataDailySalesChart.series[0][idx] = 0;
        }

        idx++;
        current_date = current_date.add({days: 1});
      }

      console.log(JSON.stringify(dataDailySalesChart));
      const optionsDailySalesChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0,
              showGrid: false
          }),
          low: 0,
          high: maxvalue, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
      };

      const dailySalesChart = new Chartist.Bar(element, dataDailySalesChart, optionsDailySalesChart);

      this.startAnimationForLineChart(dailySalesChart);
    }
  }
}
