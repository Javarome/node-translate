import {Subscription} from 'rxjs';
import {DefaultLangChangeEvent, LangChangeEvent, TranslateService, TranslationChangeEvent} from "./TranslateService";
import {equals, isDefined} from "./util";

export class TranslateDirective {
  key: string;
  lastParams: any;
  currentParams: any;
  onLangChangeSub: Subscription;
  onDefaultLangChangeSub: Subscription;
  onTranslationChangeSub: Subscription;

  constructor(private translateService: TranslateService, translate: string, translateParams: any) {
    // subscribe to onTranslationChange event, in case the translations of the current lang change
    if (!this.onTranslationChangeSub) {
      this.onTranslationChangeSub = this.translateService.onTranslationChange.subscribe((event: TranslationChangeEvent) => {
        if (event.lang === this.translateService.currentLang) {
          //  this.checkNodes(true, event.translations);
        }
      });
    }

    // subscribe to onLangChange event, in case the language changes
    if (!this.onLangChangeSub) {
      this.onLangChangeSub = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        // this.checkNodes(true, event.translations);
      });
    }

    // subscribe to onDefaultLangChange event, in case the default language changes
    if (!this.onDefaultLangChangeSub) {
      this.onDefaultLangChangeSub = this.translateService.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
        // this.checkNodes(true);
      });
    }
    this.translate = translate;
    this.translateParams = translateParams;
  }

  set translate(key: string) {
    if (key) {
      this.key = key;
      // this.checkNodes();
    }
  }

  set translateParams(params: any) {
    if (!equals(this.currentParams, params)) {
      this.currentParams = params;
      //this.checkNodes(true);
    }
  }


  updateValue(key: string, node: any, translations: any) {
    if (key) {
      if (node.lastKey === key && this.lastParams === this.currentParams) {
        return;
      }

      this.lastParams = this.currentParams;

      let onTranslation = (res: string) => {
        if (res !== key) {
          node.lastKey = key;
        }
        if (!node.originalContent) {
          node.originalContent = this.getContent(node);
        }
        node.currentValue = isDefined(res) ? res : (node.originalContent || key);
        // we replace in the original content to preserve spaces that we might have trimmed
        this.setContent(node, this.key ? node.currentValue : node.originalContent.replace(key, node.currentValue));
        // this._ref.markForCheck();
      };

      if (isDefined(translations)) {
        let res = this.translateService.getParsedResult(translations, key, this.currentParams);
        if (typeof res.subscribe === "function") {
          res.subscribe(onTranslation);
        } else {
          onTranslation(res);
        }
      } else {
        this.translateService.get(key, this.currentParams).subscribe(onTranslation);
      }
    }
  }

  getContent(node: any): string {
    return isDefined(node.textContent) ? node.textContent : node.data;
  }

  setContent(node: any, content: string): void {
    if (isDefined(node.textContent)) {
      node.textContent = content;
    } else {
      node.data = content;
    }
  }

  ngOnDestroy() {
    if (this.onLangChangeSub) {
      this.onLangChangeSub.unsubscribe();
    }

    if (this.onDefaultLangChangeSub) {
      this.onDefaultLangChangeSub.unsubscribe();
    }

    if (this.onTranslationChangeSub) {
      this.onTranslationChangeSub.unsubscribe();
    }
  }
}
