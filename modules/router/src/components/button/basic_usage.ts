import {Component} from "angular2/core";
import {MATERIAL_DIRECTIVES} from "ng2-material/all";


@Component({
  selector: 'button-basic-usage',
  templateUrl: 'src/components/button/basic_usage.html',
  styleUrls: ['src/components/button/basic_usage.css'],
  directives: [MATERIAL_DIRECTIVES]
})
export class ButtonBasicUsage {
  googleUrl: string = 'https://www.google.com';
  title1: string = 'Button';
  title4: string = 'Warn';
  isDisabled: boolean = true;

}
