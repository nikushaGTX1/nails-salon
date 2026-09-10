import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';

export type Language = 'en' | 'ka' | 'ru';
type Dictionary = Record<string, string>;

const en: Dictionary = {
  services:'Services', portfolio:'Portfolio', about:'About', locations:'Locations', book:'Book a visit', online:'BOOK\nONLINE', openNav:'Open navigation', closeNav:'Close navigation',
  heroLocation:'Tbilisi · Georgia', heroTitle:'Beauty\nin every\ndetail', explore:'Explore services', heroMeta:'NAILS\nSELF CARE\nCONFIDENCE', scroll:'SCROLL ─────',
  servicesTitle:'Care, shaped\naround you.', servicesIntro:'Thoughtful treatments, refined techniques and a slower kind of beauty ritual.', from:'From',
  s1:'Signature manicure', sd1:'Detailed cuticle care and your choice of finish.', s2:'Soft gel manicure', sd2:'Long-lasting color with a smooth, natural result.', s3:'Essential pedicure', sd3:'Restorative care for soft skin and polished toes.', s4:'Bespoke nail art', sd4:'Fine lines, tonal details and unique designs.',
  selectedWork:'Selected work', ourPortfolio:'Our portfolio', filterPortfolio:'Filter portfolio', all:'All', manicure:'Manicure', pedicure:'Pedicure', nailArt:'Nail art', viewPortfolio:'View portfolio',
  w1:'Velvet wine', w2:'Olive study', w3:'Blush steps', w4:'Quiet pink', w5:'Golden lines', w6:'Red hour',
  aboutUs:'About us', aboutTitle:'A quiet space\nfor beautiful\nrituals.', aboutText:'NAIL BAR 01 is a modern nail studio in Tbilisi, created for those who value quality, aesthetics and self-care. We pair precise technique with an unhurried, personal approach.', discover:'Discover our studios', studio:'Our studio · Tbilisi', quality:'Quality materials', artists:'Professional artists', calm:'A calm atmosphere',
  ourLocations:'Our locations', locationsTitle:'Three spaces.\nOne standard.', locationsText:'Find your nearest Nail Bar 01 in Tbilisi. Every studio offers the same considered care, trusted artists and calm atmosphere.', maps:'Open in Google Maps', daily:'Open daily',
  veraAddress:'2 Ivane Tarkhnishvili St.', vakeAddress:'17 Zakaria Paliashvili St.', saburtaloAddress:'24G Alexander Kazbegi Ave.',
  booking:'Booking', bookingTitle:'Your time\nfor beauty.', bookingText:"Choose a convenient date and time. We'll take care of the rest.", design:'Nail design', extras:'Care & extras', name:'Name', yourName:'Your name', phone:'Phone', studioField:'Studio', chooseLocation:'Choose a location', service:'Service', chooseService:'Choose a service', date:'Date', time:'Time', sent:'Request received ✓',
  rights:'© 2026 Nail Bar 01. All rights reserved.'
};

const ka: Dictionary = {
  services:'სერვისები', portfolio:'პორტფოლიო', about:'ჩვენ შესახებ', locations:'ფილიალები', book:'ვიზიტის დაჯავშნა', online:'ონლაინ\nდაჯავშნა', openNav:'ნავიგაციის გახსნა', closeNav:'ნავიგაციის დახურვა',
  heroLocation:'თბილისი · საქართველო', heroTitle:'სილამაზე\nყველა\nდეტალში', explore:'სერვისების ნახვა', heroMeta:'ფრჩხილები\nთავის მოვლა\nთავდაჯერება', scroll:'ჩამოსქროლე ─────',
  servicesTitle:'ზრუნვა, შექმნილი\nთქვენთვის.', servicesIntro:'გააზრებული პროცედურები, დახვეწილი ტექნიკა და მშვიდი სილამაზის რიტუალი.', from:'დან',
  s1:'კლასიკური მანიკური', sd1:'კუტიკულის დეტალური მოვლა და თქვენთვის სასურველი საფარი.', s2:'გელ-ლაქის მანიკური', sd2:'ხანგრძლივი ფერი, გლუვი და ბუნებრივი შედეგით.', s3:'კლასიკური პედიკური', sd3:'აღმდგენი მოვლა რბილი კანისა და მოვლილი ფრჩხილებისთვის.', s4:'ინდივიდუალური დიზაინი', sd4:'თხელი ხაზები, ტონალური დეტალები და უნიკალური დიზაინი.',
  selectedWork:'რჩეული ნამუშევრები', ourPortfolio:'ჩვენი პორტფოლიო', filterPortfolio:'პორტფოლიოს ფილტრი', all:'ყველა', manicure:'მანიკური', pedicure:'პედიკური', nailArt:'დიზაინი', viewPortfolio:'პორტფოლიოს ნახვა',
  w1:'ხავერდოვანი ღვინო', w2:'ზეთისხილის ეტიუდი', w3:'ვარდისფერი ნაბიჯები', w4:'ნაზი ვარდისფერი', w5:'ოქროს ხაზები', w6:'წითელი საათი',
  aboutUs:'ჩვენ შესახებ', aboutTitle:'მშვიდი სივრცე\nლამაზი\nრიტუალებისთვის.', aboutText:'NAIL BAR 01 თანამედროვე ფრჩხილის სტუდიაა თბილისში, მათთვის, ვინც აფასებს ხარისხს, ესთეტიკასა და თავის მოვლას. ზუსტ ტექნიკას მშვიდ და ინდივიდუალურ მიდგომას ვუთავსებთ.', discover:'აღმოაჩინეთ ჩვენი სტუდიები', studio:'ჩვენი სტუდია · თბილისი', quality:'ხარისხიანი მასალები', artists:'პროფესიონალი ოსტატები', calm:'მშვიდი ატმოსფერო',
  ourLocations:'ჩვენი ფილიალები', locationsTitle:'სამი სივრცე.\nერთი სტანდარტი.', locationsText:'იპოვეთ თქვენთან უახლოესი Nail Bar 01 თბილისში. ყველა სტუდიაში დაგხვდებათ თანაბარი ხარისხი, სანდო ოსტატები და მშვიდი გარემო.', maps:'Google Maps-ში გახსნა', daily:'ღიაა ყოველდღე',
  veraAddress:'ივანე თარხნიშვილის ქ. 2', vakeAddress:'ზაქარია ფალიაშვილის ქ. 17', saburtaloAddress:'ალექსანდრე ყაზბეგის გამზ. 24გ',
  booking:'დაჯავშნა', bookingTitle:'თქვენი დრო\nსილამაზისთვის.', bookingText:'აირჩიეთ მოსახერხებელი თარიღი და დრო. დანარჩენზე ჩვენ ვიზრუნებთ.', design:'ფრჩხილის დიზაინი', extras:'მოვლა და დამატებითი სერვისები', name:'სახელი', yourName:'თქვენი სახელი', phone:'ტელეფონი', studioField:'სტუდია', chooseLocation:'აირჩიეთ ფილიალი', service:'სერვისი', chooseService:'აირჩიეთ სერვისი', date:'თარიღი', time:'დრო', sent:'მოთხოვნა მიღებულია ✓',
  rights:'© 2026 Nail Bar 01. ყველა უფლება დაცულია.'
};

const ru: Dictionary = {
  services:'Услуги', portfolio:'Портфолио', about:'О нас', locations:'Адреса', book:'Записаться', online:'ЗАПИСАТЬСЯ\nОНЛАЙН', openNav:'Открыть меню', closeNav:'Закрыть меню',
  heroLocation:'Тбилиси · Грузия', heroTitle:'Красота\nв каждой\nдетали', explore:'Посмотреть услуги', heroMeta:'НОГТИ\nЗАБОТА О СЕБЕ\nУВЕРЕННОСТЬ', scroll:'ЛИСТАЙТЕ ─────',
  servicesTitle:'Забота, созданная\nдля вас.', servicesIntro:'Продуманные процедуры, отточенные техники и неспешный ритуал красоты.', from:'От',
  s1:'Классический маникюр', sd1:'Тщательный уход за кутикулой и покрытие на ваш выбор.', s2:'Маникюр с гель-лаком', sd2:'Стойкий цвет, гладкий и естественный результат.', s3:'Классический педикюр', sd3:'Восстанавливающий уход для мягкой кожи и ухоженных ногтей.', s4:'Авторский дизайн', sd4:'Тонкие линии, оттеночные детали и уникальные дизайны.',
  selectedWork:'Избранные работы', ourPortfolio:'Наше портфолио', filterPortfolio:'Фильтр портфолио', all:'Все', manicure:'Маникюр', pedicure:'Педикюр', nailArt:'Дизайн', viewPortfolio:'Смотреть портфолио',
  w1:'Бархатное вино', w2:'Оливковый этюд', w3:'Розовые шаги', w4:'Тихий розовый', w5:'Золотые линии', w6:'Красный час',
  aboutUs:'О нас', aboutTitle:'Тихое пространство\nдля красивых\nритуалов.', aboutText:'NAIL BAR 01 — современная студия маникюра в Тбилиси для тех, кто ценит качество, эстетику и заботу о себе. Мы сочетаем точную технику с неспешным персональным подходом.', discover:'Наши студии', studio:'Наша студия · Тбилиси', quality:'Качественные материалы', artists:'Профессиональные мастера', calm:'Спокойная атмосфера',
  ourLocations:'Наши адреса', locationsTitle:'Три пространства.\nОдин стандарт.', locationsText:'Найдите ближайший Nail Bar 01 в Тбилиси. В каждой студии вас ждут одинаково бережный уход, проверенные мастера и спокойная атмосфера.', maps:'Открыть в Google Maps', daily:'Открыто ежедневно',
  veraAddress:'ул. Иване Тархнишвили, 2', vakeAddress:'ул. Закария Палиашвили, 17', saburtaloAddress:'просп. Александра Казбеги, 24Г',
  booking:'Запись', bookingTitle:'Ваше время\nдля красоты.', bookingText:'Выберите удобные дату и время. Об остальном позаботимся мы.', design:'Дизайн ногтей', extras:'Уход и дополнения', name:'Имя', yourName:'Ваше имя', phone:'Телефон', studioField:'Студия', chooseLocation:'Выберите адрес', service:'Услуга', chooseService:'Выберите услугу', date:'Дата', time:'Время', sent:'Заявка получена ✓',
  rights:'© 2026 Nail Bar 01. Все права защищены.'
};

const dictionaries = { en, ka, ru };

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly language = signal<Language>(this.initialLanguage());
  constructor(@Inject(DOCUMENT) private readonly document: Document) { this.updateDocument(this.language()); }
  t(key: string): string { return dictionaries[this.language()][key] ?? en[key] ?? key; }
  setLanguage(language: Language): void { this.language.set(language); localStorage.setItem('nailbar-language', language); this.updateDocument(language); }
  private initialLanguage(): Language {
    const saved = localStorage.getItem('nailbar-language');
    if (saved === 'en' || saved === 'ka' || saved === 'ru') return saved;
    const browser = navigator.language.toLowerCase();
    return browser.startsWith('ka') ? 'ka' : browser.startsWith('ru') ? 'ru' : 'en';
  }
  private updateDocument(language: Language): void { this.document.documentElement.lang = language; }
}
