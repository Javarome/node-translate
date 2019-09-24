import {Observable, of} from "rxjs";
import {TranslateLoader} from "../lib/TranslateLoader";
import {TranslateService} from "../lib/TranslateService";
import {MissingTranslationHandler, MissingTranslationHandlerParams} from "../lib/MissingTranslationHandler";
import {TranslateStore} from "../lib/TranslateStore";
import {TranslateDefaultParser, TranslateParser} from "../lib/TranslateParser";
import {TranslateFakeCompiler} from "../lib/TranslateCompiler";

let mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const expect = require('chai').assert;
const jasmine = require('jasmine');
const spyOn = require('jasmine').spyOn;
const afterEach = require('jasmine').afterEach;

let translations: any = {"TEST": "This is a test"};
let fakeTranslation: any = {"NOT_USED": "not used"};

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    if (lang === 'fake') {
      return of(fakeTranslation);
    }
    return of(translations);
  }
}

describe('MissingTranslationHandler', () => {
  let translate: TranslateService;
  let missingTranslationHandler: MissingTranslationHandler;

  const store: TranslateStore = new TranslateStore();
  const parser: TranslateParser = new TranslateDefaultParser();

  class Missing implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
      return "handled";
    }
  }

  class MissingObs implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams): Observable<any> {
      return of(`handled: ${params.key}`);
    }
  }

  let prepare = ((handlerClass: MissingTranslationHandler, defaultLang: boolean = true) => {
    translate = new TranslateService(store, new FakeLoader(), new TranslateFakeCompiler(), parser, handlerClass, defaultLang);
    missingTranslationHandler = handlerClass;
  });

  afterEach(() => {
    translate = undefined;
    translations = {"TEST": "This is a test"};
    missingTranslationHandler = undefined;
  });

  it('should use the MissingTranslationHandler when the key does not exist', () => {
    prepare(new Missing());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();

    translate.get('nonExistingKey').subscribe((res: string) => {
      expect(missingTranslationHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining({key: 'nonExistingKey'}));
      //test that the instance of the last called argument is string
      expect(res).toEqual('handled');
    });
  });

  it('should propagate interpolation params when the key does not exist', () => {
    prepare(new Missing());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();
    let interpolateParams = {some: 'params'};

    translate.get('nonExistingKey', interpolateParams).subscribe((res: string) => {
      expect(missingTranslationHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining({interpolateParams: interpolateParams}));
      //test that the instance of the last called argument is string
      expect(res).toEqual('handled');
    });
  });

  it('should propagate TranslationService params when the key does not exist', () => {
    prepare(new Missing());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();
    let interpolateParams = {some: 'params'};

    translate.get('nonExistingKey', interpolateParams).subscribe((res: string) => {
      expect(missingTranslationHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining({translateService: translate}));
      //test that the instance of the last called argument is string
      expect(res).toEqual('handled');
    });
  });

  it('should return the key when using MissingTranslationHandler & the handler returns nothing', () => {
    class MissingUndef implements MissingTranslationHandler {
      handle(params: MissingTranslationHandlerParams) {
      }
    }

    prepare(new MissingUndef());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();

    translate.get('nonExistingKey').subscribe((res: string) => {
      expect(missingTranslationHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining({key: 'nonExistingKey'}));
      expect(res).toEqual('nonExistingKey');
    });
  });

  it('should not call the MissingTranslationHandler when the key exists', () => {
    prepare(new Missing());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();

    translate.get('TEST').subscribe(() => {
      expect(missingTranslationHandler.handle).not.toHaveBeenCalled();
    });
  });

  it('should use the MissingTranslationHandler when the key does not exist & we use instant translation', () => {
    prepare(new Missing());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();

    expect(translate.instant('nonExistingKey')).toEqual('handled');
    expect(missingTranslationHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining({key: 'nonExistingKey'}));
  });

  it('should wait for the MissingTranslationHandler when it returns an observable & we use get', () => {
    prepare(new MissingObs());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();

    translate.get('nonExistingKey').subscribe((res: string) => {
      expect(missingTranslationHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining({key: 'nonExistingKey'}));
      expect(res).toEqual('handled: nonExistingKey');
    });
  });

  it('should wait for the MissingTranslationHandler when it returns an observable & we use get with an array', () => {
    let tr = {
      nonExistingKey1: 'handled: nonExistingKey1',
      nonExistingKey2: 'handled: nonExistingKey2',
      nonExistingKey3: 'handled: nonExistingKey3'
    };

    prepare(new MissingObs());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();

    translate.get(Object.keys(tr)).subscribe((res: string) => {
      expect(missingTranslationHandler.handle).toHaveBeenCalledTimes(3);
      expect(res).toEqual(tr as any);
    });
  });

  it('should not wait for the MissingTranslationHandler when it returns an observable & we use instant', () => {
    prepare(new MissingObs());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();

    expect(translate.instant('nonExistingKey')).toEqual('nonExistingKey');
  });

  it('should not wait for the MissingTranslationHandler when it returns an observable & we use instant with an array', () => {
    let tr = {
      nonExistingKey1: 'handled: nonExistingKey1',
      nonExistingKey2: 'handled: nonExistingKey2',
      nonExistingKey3: 'handled: nonExistingKey3'
    };

    prepare(new MissingObs());
    translate.use('en');
    spyOn(missingTranslationHandler, 'handle').and.callThrough();

    expect(translate.instant(Object.keys(tr))).toEqual({
      nonExistingKey1: 'nonExistingKey1',
      nonExistingKey2: 'nonExistingKey2',
      nonExistingKey3: 'nonExistingKey3'
    } as any);
  });

  it('should not return default translation, but missing handler', () => {
    prepare(new Missing(), false);
    translate.use('en');
    translate.use('fake');

    spyOn(missingTranslationHandler, 'handle').and.callThrough();
    translate.get('TEST').subscribe((res: string) => {
      expect(missingTranslationHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining({key: 'TEST'}));
      //test that the instance of the last called argument is string
      expect(res).toEqual('handled');
    });
  });

  it('should return default translation', () => {
    prepare(new Missing(), true);
    translate.use('en');
    translate.use('fake');

    spyOn(missingTranslationHandler, 'handle').and.callThrough();
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test');
    });
  });
});
