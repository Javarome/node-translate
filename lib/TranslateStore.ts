import {BehaviorSubject} from "rxjs";
import {DefaultLangChangeEvent, LangChangeEvent, TranslationChangeEvent} from "./TranslateService";

export class TranslateStore {
  /**
   * The default lang to fallback when translations are missing on the current lang
   */
  public defaultLang: string;

  /**
   * The lang currently used
   */
  public currentLang: string = this.defaultLang;

  /**
   * a list of translations per lang
   */
  public translations: any = {};

  /**
   * an array of langs
   */
  public langs: Array<string> = [];

  /**
   * An EventEmitter to listen to translation change events
   * onTranslationChange.subscribe((params: TranslationChangeEvent) => {
   *     // do something
   * });
   */
  public onTranslationChange = new BehaviorSubject<TranslationChangeEvent | undefined>(undefined);

  /**
   * An EventEmitter to listen to lang change events
   * onLangChange.subscribe((params: LangChangeEvent) => {
   *     // do something
   * });
   */
  public onLangChange = new BehaviorSubject<LangChangeEvent | undefined>(undefined);

  /**
   * An EventEmitter to listen to default lang change events
   * onDefaultLangChange.subscribe((params: DefaultLangChangeEvent) => {
   *     // do something
   * });
   */
  public onDefaultLangChange = new BehaviorSubject<DefaultLangChangeEvent | undefined>(undefined);
}
