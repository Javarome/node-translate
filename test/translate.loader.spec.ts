import {Observable, of} from "rxjs";
import {TranslateLoader} from "../lib/TranslateLoader";
import {TranslateService} from "../lib/TranslateService";
import {TranslateStore} from "../lib/TranslateStore";
import {TranslateDefaultParser, TranslateParser} from "../lib/TranslateParser";
import {FakeMissingTranslationHandler} from "../lib/MissingTranslationHandler";
import {TranslateFakeCompiler} from "../lib/TranslateCompiler";

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').assert;

let translations: any = {"TEST": "This is a test"};

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(translations);
  }
}

describe('TranslateLoader', () => {
  let translate: TranslateService;

  const store: TranslateStore = new TranslateStore();
  const compiler = new TranslateFakeCompiler();
  const parser: TranslateParser = new TranslateDefaultParser();
  const missingTranslationHandler = new FakeMissingTranslationHandler();

  it('should be able to provide TranslateStaticLoader', () => {
    translate = new TranslateService(store, new FakeLoader(), compiler, parser, missingTranslationHandler);

    expect(translate).toBeDefined();
    expect(translate.currentLoader).toBeDefined();
    expect(translate.currentLoader instanceof FakeLoader).toBeTruthy();

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test');
    });
  });

  it('should be able to provide any TranslateLoader', () => {
    class CustomLoader implements TranslateLoader {
      getTranslation(lang: string): Observable<any> {
        return of({"TEST": "This is also a test"});
      }
    }

    translate = new TranslateService(store, new CustomLoader(), compiler, parser, missingTranslationHandler);

    expect(translate).toBeDefined();
    expect(translate.currentLoader).toBeDefined();
    expect(translate.currentLoader instanceof CustomLoader).toBeTruthy();

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');

    // this will request the translation from the CustomLoader
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is also a test');
    });
  });

});
