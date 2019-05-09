import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public modules = [];
  public activeClass = '';
  constructor(private commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.commonService.get_menus('140').subscribe((res: any[]) => {
      this.modules = res;
      // alert(JSON.stringify(this.route.snapshot.params.id));
      // this.modules.forEach(module => {
      //   console.log(module.display_name);
      // });
    });
  }

  public get_activeClass(category: string): any {
    if (category.toLowerCase() === 'communication') {
      return {activeClass: 'active', show: 'show', expand: 'true'};
    } else {
      return {activeClass: '', show: '', expand: 'false'};
    }
  }
}
