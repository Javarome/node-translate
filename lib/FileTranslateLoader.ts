import {BehaviorSubject, Observable} from "rxjs";
import * as fs from "fs";

import {TranslateLoader} from "./TranslateLoader";
import {TranslateFile} from "./TranslateService";

export class FileTranslateLoader extends TranslateLoader {

  getTranslation(lang: string): Observable<any> {
    try {
      const path = require("path");
      // @ts-ignore
      let buffer = fs.readFileSync(path.resolve(__dirname, `${lang}.json`));  // TODO: Use config to allow path/filename customization
      const file = <TranslateFile>JSON.parse(<any>buffer);
      return new BehaviorSubject(file);
    } catch (err) {
      throw Error(`Error while reading knowledge: ${err.message ? err.message : err}`);
    }
  }
};
