import {ChangeDetectorRef, Component, OnInit, OnDestroy, Input, ViewChild, NgZone, AfterViewInit} from '@angular/core';
import {IndexComponent} from './+index';
import {Routes, ROUTER_DIRECTIVES, Router} from '@angular/router';
import {ComponentsComponent} from './+components';
import {MATERIAL_DIRECTIVES, Media} from 'ng2-material';
import {NavigationService} from './shared/navigation.service';
import {MD_SIDENAV_DIRECTIVES, MdSidenav} from '@angular2-material/sidenav';
import {MdIcon, MdIconRegistry} from '@angular2-material/icon';
import {MdToolbar} from '@angular2-material/toolbar';
import {ComponentsService, IComponentMeta} from './shared/components.service';
import {Response, Http} from '@angular/http';
import {FooterComponent} from './shared/footer/footer.component';

@Component({
  moduleId: module.id,
  selector: 'site-app',
  templateUrl: 'site.component.html',
  styleUrls: ['site.component.css'],
  directives: [
    ROUTER_DIRECTIVES, MATERIAL_DIRECTIVES, MD_SIDENAV_DIRECTIVES, MdIcon, MdToolbar,
    FooterComponent
  ],
  providers: [MdIconRegistry]
})
@Routes([
  {path: '/', component: IndexComponent},
  {path: '/components/:id', component: ComponentsComponent}
])
export class SiteAppComponent implements OnInit,
  OnDestroy, AfterViewInit {
  static SIDE_MENU_BREAKPOINT: string = 'gt-md';

  @ViewChild(MdSidenav) private menu: MdSidenav;

  @Input()
  fullPage: boolean = this.media.hasMedia(SiteAppComponent.SIDE_MENU_BREAKPOINT);

  public site: string = 'Angular2 Material';

  version: string;

  angularVersion: string = null;
  linkTag: string = null;

  components: IComponentMeta[] = [];

  private _subscription = null;

  constructor(private http: Http, private navigation: NavigationService, private media: Media,
              private _components: ComponentsService) {
  }

  ngAfterViewInit(): any {
    let query = Media.getQuery(SiteAppComponent.SIDE_MENU_BREAKPOINT);
    this._subscription = this.media.listen(query).onMatched.subscribe((mql: MediaQueryList) => {
      this.menu.mode = mql.matches ? 'side' : 'over';

      this.menu.toggle(mql.matches).catch(() => undefined);
      this.cdr.detectChanges();
    });
  }

  get pushed(): boolean {
    return this.menu && this.menu.mode === 'side';
  }

  get over(): boolean {
    return this.menu && this.menu.mode === 'over' && this.menu.opened;
  }

  // TODO(jd): these two property hacks are to work around issues with the peekaboo fixed nav
  // overlapping the sidenav and toolbar.  They will not properly "fix" to the top if inside
  // md-sidenav-layout, and they will overlap the sidenav and scrollbar when outside.  So just
  // calculate left and right properties for fixed toolbars based on the media query and browser
  // scrollbar width.  :sob: :rage:
  @Input()
  get sidenavWidth(): number {
    return this.pushed ? 281 : 0;
  }

  @Input()
  get scrollWidth(): number {
    var inner = document.createElement('p');
    inner.style.width = '100%';
    inner.style.height = '200px';

    var outer = document.createElement('div');
    outer.style.position = 'absolute';
    outer.style.top = '0px';
    outer.style.left = '0px';
    outer.style.visibility = 'hidden';
    outer.style.width = '200px';
    outer.style.height = '150px';
    outer.style.overflow = 'hidden';
    outer.appendChild(inner);

    document.body.appendChild(outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;

    document.body.removeChild(outer);

    return (w1 - w2);
  };

  ngOnInit() {
    this.http.get('version.json').subscribe((res: Response) => {
      const json = res.json();
      this.version = json.version;
      this.angularVersion = json['@angular/core'];
      this.linkTag = this.angularVersion.replace(/[>=^~]/g, '');
    });
    this._components.getComponents().then((comps) => {
      this.components = comps;
      let title = 'Angular2 Material';
      document.title = title;
      this.navigation.currentTitle = title;
      this.navigation.prevLink = this.navigation.componentLink(comps[comps.length - 1]);
      this.navigation.nextLink = this.navigation.componentLink(comps[0]);
    });
  }


  ngOnDestroy(): any {
    this._subscription.unsubscribe();
  }
}
