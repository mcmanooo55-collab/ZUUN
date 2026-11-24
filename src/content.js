import { identityPalettes } from './identities.js';

export const pages = [
  { id: 'home', path: '', name: { ar: 'الرئيسية', en: 'Home' } },
  { id: 'work', path: 'work', name: { ar: 'الأعمال', en: 'Work' } },
  { id: 'team', path: 'team', name: { ar: 'الفريق', en: 'Team' } },
  { id: 'founder', path: 'founder', name: { ar: 'المؤسس', en: 'Founder' } },
  { id: 'contact', path: 'contact', name: { ar: 'تواصل', en: 'Contact' } },
];

export const services = [
  {
    id: 'frontend', no: '01', icon: 'code',
    short: { ar: 'تطوير الواجهات', en: 'Front-end' },
    title: { ar: 'تطوير واجهات الويب', en: 'Front-end Development' },
    text: {
      ar: 'واجهات ويب سريعة ومتجاوبة، بتنفيذ دقيق يحافظ على تفاصيل التصميم.',
      en: 'Fast, responsive web experiences that stay true to the details of the design.',
    },
  },
  {
    id: 'design', no: '02', icon: 'design',
    short: { ar: 'تصميم UI/UX', en: 'UI/UX Design' },
    title: { ar: 'تصميم الواجهات وتجربة المستخدم', en: 'UI/UX Design' },
    text: {
      ar: 'نصمّم رحلات استخدام واضحة، ونختبرها بنماذج تفاعلية قبل التنفيذ.',
      en: 'Clear user journeys, thoughtful interfaces, and interactive prototypes to test before building.',
    },
  },
  {
    id: 'automation', no: '03', icon: 'automation',
    short: { ar: 'أتمتة بالذكاء الاصطناعي', en: 'AI Automation' },
    title: { ar: 'الأتمتة بالذكاء الاصطناعي', en: 'AI Automation' },
    text: {
      ar: 'نربط الأدوات ونؤتمت الخطوات المتكررة، ليبقى لفريقك وقت أكثر للشغل المهم.',
      en: 'We connect your tools and automate repetitive tasks so your team has more time for meaningful work.',
    },
  },
  {
    id: 'mobile', no: '04', icon: 'mobile',
    short: { ar: 'تطبيقات الموبايل', en: 'Mobile Apps' },
    title: { ar: 'تطوير تطبيقات الموبايل', en: 'Mobile App Development' },
    text: {
      ar: 'تطبيقات موبايل سهلة الاستخدام، بتجربة متسقة من أول شاشة لحد الإطلاق.',
      en: 'Intuitive mobile apps with a consistent experience from the first screen to launch.',
    },
  },
  {
    id: 'identity', no: '05', icon: 'identity',
    short: { ar: 'الهويات البصرية', en: 'Visual Identity' },
    title: { ar: 'تصميم الهويات البصرية', en: 'Visual Identity Design' },
    text: { ar: 'شعار وألوان وخطوط تتكامل في نظام واحد، من أول بطاقة لحد التغليف.', en: 'Logo, color, and type that work as one system, from the first card to the packaging.' },
  },
];

export const projects = [
  {
    id: 'orbit', no: '01', service: 'frontend', name: 'Orbit Dashboard', image: '/media/orbit.webp', color: '#5ecaff',
    alt: { ar: 'لوحة تحليلات تعرض رسمًا بيانيًا أزرق ومؤشرات أداء', en: 'Analytics dashboard with a cyan area chart and performance metrics' },
    summary: { ar: 'لوحة تحليلات تجمع مؤشرات الأداء في واجهة واحدة.', en: 'A web dashboard that brings key performance metrics into one view.' },
    brief: { ar: 'ماذا لو أمكن لفريق صغير متابعة أهم الأرقام من شاشة واحدة، بدل التنقل بين تقارير منفصلة؟ يستكشف النموذج واجهة تجمع مؤشرات الأداء والاتجاهات والفلاتر في مساحة واحدة قابلة للتوسّع.', en: 'What if a small team could find its most important numbers on one screen instead of moving through separate reports? This concept brings KPIs, trends, and useful filters into a single, extensible workspace.' },
    scope: { ar: ['هيكلة لوحة التحكم وترتيب المؤشرات', 'تصميم مكوّنات متجاوبة للواجهة', 'تصوّر لحالات التحميل والبيانات غير المتاحة'], en: ['Dashboard layout and metric hierarchy', 'Responsive interface component design', 'Loading and empty state concepts'] },
  },
  {
    id: 'forma', no: '02', service: 'design', name: 'Forma Studio', image: '/media/forma.webp', color: '#b8cddd',
    alt: { ar: 'واجهة متجر أثاث بتصميم هادئ وصورة كرسي جلدي', en: 'Minimal furniture storefront with a sunlit leather lounge chair' },
    summary: { ar: 'تجربة تسوّق للأثاث تبدأ من الصورة وتسهّل الاختيار.', en: 'An editorial furniture storefront designed to make browsing and choosing easier.' },
    brief: { ar: 'تصوّر لمتجر أثاث يعطي المساحة للصور والخامات، من غير ما يخفي المعلومات اللي يحتاجها المشتري. يبدأ المسار باستكشاف المجموعة وينتهي بصفحة منتج تجمع المقاسات والمواصفات وخيارات الخامات.', en: 'A furniture storefront concept that gives photography and materials room to breathe without burying the information buyers need. It follows the journey from browsing a collection to checking dimensions, finishes, and product details.' },
    scope: { ar: ['رحلة تصفّح المتجر', 'تصميم الصفحات والمكوّنات', 'تصوّر لصفحة المنتج واختيار الخامة'], en: ['Store browsing and discovery flow', 'Page and component design', 'Product detail and finish selection concept'] },
  },
  {
    id: 'relay', no: '03', service: 'automation', name: 'Relay', image: '/media/relay.webp', color: '#ba9aff',
    alt: { ar: 'وحدات زجاجية متصلة تمثّل خطوات سير عمل آلي', en: 'Connected glass nodes representing steps in an automated workflow' },
    summary: { ar: 'سير عمل مقترح لفرز الاستفسارات واختصار وقت المتابعة.', en: 'A workflow concept for sorting incoming requests and reducing follow-up work.' },
    brief: { ar: 'تصوّر لأتمتة تبدأ باستلام استفسار، ثم تصنيفه وإعداد ملخّص قبل توجيهه للشخص المناسب. تظل الحالات غير الواضحة تحت المراجعة البشرية بدل توجيهها تلقائيًا.', en: 'A proposed workflow that receives an inquiry, classifies it, and drafts a summary before routing it. Ambiguous requests go to a person for review instead of being routed automatically.' },
    scope: { ar: ['رسم مسار الاستلام والتصنيف', 'تصوّر لتلخيص الرسائل وتوجيهها', 'نقطة مراجعة بشرية للحالات غير الواضحة'], en: ['Intake and classification flow', 'Summary and routing concept', 'Human review for ambiguous cases'] },
  },
  {
    id: 'masar', no: '04', service: 'mobile', name: 'Masar', image: '/media/masar.webp', color: '#68e2be',
    alt: { ar: 'هاتفان يعرضان خريطة ومسارًا باللون الأخضر وقائمة وجهات', en: 'Two phones showing a mint-green map route and an itinerary' },
    summary: { ar: 'تصوّر لتطبيق يساعدك تخطّط مشاويرك وتستكشف المدينة.', en: 'A mobile concept for planning city trips and exploring new places.' },
    brief: { ar: 'تجربة موبايل تقلّل الخطوات بين اختيار مكان ورؤية طريق الوصول إليه. يجمع التصوّر بين خريطة واضحة وقائمة وجهات سهلة التعديل، مع إمكانية العودة للخطة أثناء التنقل.', en: 'A mobile experience that shortens the path from picking a place to seeing how to get there. The concept pairs a legible map with an editable itinerary that stays easy to reference while moving.' },
    scope: { ar: ['رحلة اختيار الوجهات', 'شاشات الخريطة وخطة الرحلة', 'حالات تغيير خط السير'], en: ['Destination selection flow', 'Map and itinerary screens', 'Rerouting states'] },
  },
  {
    id: 'riwaq', no: '05', service: 'identity', name: 'Riwaq Roastery', nameAr: 'رِواق للقهوة', image: '/media/riwaq.webp', cover: '/media/riwaq-cover.webp', color: '#ad482b',
    palette: identityPalettes.riwaq, typefaces: ['Cormorant Garamond', 'IBM Plex Sans Arabic'],
    alt: { ar: 'لوحة هوية رِواق للقهوة بشعار أقواس متداخلة وألوان ترابية وتطبيقات على كيس بن وكوب وبطاقة', en: 'Riwaq coffee identity featuring a nested arch mark, earthy colors, a coffee pouch, a cup and a card' },
    summary: { ar: 'هوية لمحمصة قهوة تستلهم دفء الرِواق في الشعار والتغليف.', en: 'A coffee roastery identity that takes the warmth of an archway into the mark and packaging.' },
    brief: { ar: 'تصوّر لمحمصة صغيرة تهتم بطقوس القهوة اليومية. الشعار مبني على أقواس متداخلة مستوحاة من الرِواق، وتتكرر تفاصيله على كيس البن والكوب وبطاقة التعريف. الطين المحروق والورق الكريمي والبُن الغامق يخلّوا الهوية مميزة حتى من غير صور.', en: 'A concept for a small roastery built around the everyday ritual of coffee. The nested arches of the mark reappear on the pouch, cup, and brand card. Terracotta, oat paper, and a deep roast tone make the system recognizable without relying on photography.' },
    scope: { ar: ['الشعار وعلامة الأقواس', 'لوحة ألوان ترابية ونمط مستوحى من الأقواس', 'تغليف البن وأكواب القهوة وبطاقة التعريف'], en: ['Wordmark and nested arch symbol', 'Earth tones and a pattern drawn from the arches', 'Coffee pouch, takeaway cup, and brand card'] },
  },
  {
    id: 'tayf', no: '06', service: 'identity', name: 'Tayf Festival', nameAr: 'مهرجان طَيْف', image: '/media/tayf.webp', cover: '/media/tayf-cover.webp', color: '#6959d9',
    palette: identityPalettes.tayf, typefaces: ['Manrope', 'IBM Plex Sans Arabic'],
    alt: { ar: 'لوحة هوية طَيْف بتدرجات بنفسجية ولمسة ليمونية، على ملصق وبطاقة دخول وتذكرة', en: 'Tayf festival identity in violet and citrus on a poster, event pass and printed ticket' },
    summary: { ar: 'هوية لمهرجان فنون بتحوّل شكل الطيف لملصقات وتذاكر وبطاقات دخول.', en: 'An arts festival identity that turns the spectrum motif into posters, tickets, and event passes.' },
    brief: { ar: 'تصوّر لمهرجان فنون في المدينة. الرمز المتشعّب زي الطيف بيشتغل بمقاسات مختلفة: يملأ الملصق، ويتبسط على التذكرة، ويفضل واضح على بطاقة الدخول. البنفسجي واللافندر مع الليموني بيفرّقوا بين الاستخدامات من غير ما يقطعوا الصلة بالهوية.', en: 'A concept for a city arts festival. The branching spectrum scales from a large poster to a ticket and stays recognizable on an event pass. Night violet, lavender, and citrus give each application its own emphasis while keeping the family together.' },
    scope: { ar: ['شعار ورمز هندسي قابل للتكرار', 'ألوان جريئة ونظام خطّي عربي وإنجليزي', 'ملصق المهرجان وتذكرة وبطاقة دخول'], en: ['Wordmark and a repeatable geometric symbol', 'High-contrast color and a bilingual type system', 'Festival poster, ticket, and event pass'] },
  },
];

export const people = [
  {
    id: 'omran', no: '01', initials: 'MO', accent: '#3bbaff', icon: 'design',
    name: { ar: 'محمد عمران', en: 'Mohamed Omran' },
    role: { ar: 'المؤسس وقائد التصميم والتطوير', en: 'Founder · Design & Development Lead' },
    text: { ar: 'يقود تصميم الواجهات وتجربة المستخدم، ويعمل على تطوير الويب والأتمتة.', en: 'Leads UI/UX design and works across front-end development and automation.' },
    tags: { ar: ['UI/UX', 'الفرونت إند', 'الأتمتة'], en: ['UI/UX', 'Front-end', 'Automation'] },
  },
  {
    id: 'hamdy', no: '02', initials: 'MH', accent: '#61dcd8', icon: 'mobile',
    name: { ar: 'محمد حمدي', en: 'Mohamed Hamdy' },
    role: { ar: 'مسؤول تطوير تطبيقات الموبايل', en: 'Mobile App Developer' },
    text: { ar: 'يتولّى بناء تطبيقات الموبايل وتحويل الشاشات ومسارات الاستخدام إلى تجربة على الهاتف.', en: 'Develops mobile apps, turning screens and user journeys into usable experiences on the phone.' },
    tags: { ar: ['تطوير الموبايل', 'واجهات التطبيقات'], en: ['Mobile Development', 'App Interfaces'] },
  },
  {
    id: 'amir', no: '03', initials: 'A', accent: '#ab9bff', icon: 'media',
    name: { ar: 'أمير', en: 'Amir' },
    role: { ar: 'مسؤول المونتاج والمحتوى البصري', en: 'Video Editor · Visual Content' },
    text: { ar: 'يتولّى مونتاج الفيديوهات وتجهيز الصور المخصّصة لكل مشروع، بما يناسب أسلوبه وهويته.', en: 'Edits videos and prepares project-specific imagery to match each product’s tone and identity.' },
    tags: { ar: ['مونتاج الفيديو', 'تحرير الصور'], en: ['Video Editing', 'Image Editing'] },
  },
];

export const strengths = [
  { icon: 'speed', title: { ar: 'سرعة من غير اختصار للجودة', en: 'Speed without shortcuts' }, text: { ar: 'نقسّم الشغل لمراحل واضحة، ونشاركك ما تم تنفيذه مبكرًا عشان القرار ما يتأخّرش.', en: 'We break the work into clear stages and share progress early so decisions don’t hold up delivery.' } },
  { icon: 'precision', title: { ar: 'دقة في التفاصيل', en: 'Precision in the details' }, text: { ar: 'من المسافات وحالات التفاعل إلى الأداء والاستجابة، نراجع التفاصيل اللي بتغيّر تجربة الاستخدام.', en: 'From spacing and interaction states to performance, we check the details that change how a product feels.' } },
  { icon: 'market', title: { ar: 'قرارات تبدأ بفهم السوق', en: 'Decisions grounded in the market' }, text: { ar: 'نفهم جمهورك ونراجع البدائل في السوق قبل ما نحدد اتجاه التصميم أو نبدأ التنفيذ.', en: 'We look at your audience and the alternatives in your market before committing to a design or build direction.' } },
];

export const copy = {
  ar: {
    skip: 'انتقل إلى المحتوى', nav: 'التنقّل الرئيسي', menu: 'القائمة', close: 'إغلاق', language: 'Switch to English', start: 'ابدأ مشروعك', gallery: 'استكشف أعمالنا', allWork: 'كل الأعمال', browse: 'عرض معرض الأعمال', featured: 'مختارات من أعمالنا', sample: 'نموذج توضيحي',
    editorial: { motion: 'الحركة', auto: 'تشغيل', pause: 'إيقاف', language: 'اللغة', heroRail: 'الاستوديو', heroArt: 'علامة ZUUN ثلاثية الأبعاد بتتغيّر مع التمرير', heroTitle: 'تصميم. تطوير. أتمتة.', heroDescription: 'هويات بصرية، تصميم UI/UX، تطوير ويب وموبايل، وأتمتة بالذكاء الاصطناعي.', startScroll: 'استكشف الاستوديو', statement: ['نبني تجارب رقمية', 'تشتغل زي ما الناس بتتوقّع.'], disciplines: 'خمس تخصصات، فريق واحد.', projectLabel: 'المعرض التفاعلي', projectTitle: 'أعمالنا في حركة.', projectIntro: 'من لوحات التحليلات وتطبيقات الموبايل للهويات البصرية. دوّر أي مجسّم وشوف فكرة المشروع.', next: 'النموذج التالي', previous: 'النموذج السابق', viewCase: 'عرض النموذج', stageNote: 'اسحب المجسّم للتدوير', touchOrbit: 'تدوير المجسّم', carouselSwipe: 'اسحب لتصفّح النماذج', index: 'مؤشّر الاستوديو', process: 'طريقة العمل', ending: 'نبدأ بإيه؟' },
    scene: { pause: 'أوقف الحركة', play: 'شغّل الحركة', core: 'مجسّم ZUUN ثلاثي الأبعاد', drag: 'اسحب للتدوير', help: 'اسحب لتدوير المجسّم. يمكنك أيضًا استخدام مفاتيح الأسهم أو ضغط Home لإعادة زاوية العرض.', explode: 'فكّ الطبقات', assemble: 'جمّع الطبقات', reset: 'إعادة ضبط المجسّم', project: 'مجسّم ثلاثي الأبعاد', founder: 'مجسّم هوية المؤسس', signal: 'قناة استفسارات المشاريع', received: 'تم تسجيل الاستفسار' },
    hero: { label: 'استوديو رقمي مستقل', title: ['نبني تجارب رقمية', 'تسبق التوقّعات.'], description: 'نصمّم ونطوّر مواقع وتطبيقات، ونبني أتمتة مدعومة بالذكاء الاصطناعي. من أول فكرة لحد الإطلاق، مع فريق واحد.' },
    about: { label: 'عن ZUUN', title: 'من الفكرة إلى الإطلاق.', intro: 'ZUUN وكالة رقمية تجمع التصميم والتطوير والأتمتة. نبدأ بفهم هدفك واحتياجات المستخدم، ونختار معك إيه اللي يستحق يتبني الأول.' },
    homeWork: { label: 'نماذج من الاستوديو', description: 'نماذج تصوّر طريقة تفكيرنا في التصميم والتطوير، من لوحات التحكم إلى تجارب التسوّق.' },
    numbers: { label: 'لوحة الاستوديو', title: 'ZUUN بالأرقام.', text: 'نبذة سريعة عن الفريق والأعمال المعروضة.', units: ['نماذج أعمال', 'أعضاء الفريق', 'عدد العملاء', 'آراء العملاء'], notes: ['نماذج توضيحية في المعرض', 'الفريق الحالي', 'غير مُعلن بعد', 'غير منشورة بعد'] },
    why: { label: 'طريقة شغلنا', title: 'ليه تختار ZUUN؟', text: 'تتحرّك بسرعة، وتنفّذ بدقة، وتعرف ليه كل قرار اتاخد.' },
    cta: { label: 'الخطوة الجاية', title: 'عندك فكرة تستحق التنفيذ؟', text: 'احكِ لنا عنها، ونحدّد معًا إيه اللي محتاجه مشروعك عشان يبدأ.', button: 'احكِ لنا عن مشروعك' },
    work: { label: 'معرض الأعمال', title: ['أفكار بتاخد', 'شكلها.'], text: 'استكشف نماذج تطوير الويب وواجهات المستخدم والأتمتة والموبايل والهويات البصرية. المعرض فيه نماذج توضيحية من الاستوديو، مش شغل منفّذ لعملاء.', filter: 'فلترة الأعمال حسب التخصص', count: 'عدد النماذج المعروضة', brief: 'فكرة المشروع', scope: 'محاور النموذج', palette: 'ألوان الهوية', typefaces: 'الخطوط', identityAsk: 'اطلب تصميم هوية بصرية', ask: 'ناقش فكرة مشابهة' },
    team: { label: 'فريق العمل', title: ['فريق صغير.', 'مهارات بتكمّل بعض.'], text: 'ثلاثة أشخاص يجمعون التصميم والتطوير والمحتوى البصري، عشان يطلع المشروع بتجربة متّسقة من أول شاشة لآخر لقطة.', people: 'فريق ZUUN', founderLink: 'تعرّف على المؤسس', how: 'بنشتغل إزاي مع بعض؟', details: 'نحدّد أهداف المشروع معك الأول، وبعدها نوزّع الشغل حسب التخصّص ونراجع التصميم والتنفيذ والمحتوى مع بعض قبل التسليم.' },
    founder: { label: 'المؤسس / ZUUN', title: 'محمد عمران', role: 'مؤسس ZUUN · تصميم وتطوير المنتجات الرقمية', text: 'أنا محمد عمران. بشتغل في التصميم وتطوير صفحات الويب والأتمتة من أكتر من 10 سنين. أسّست ZUUN عشان أجمع التخصّصات دي في فريق واحد، وأبني منتجات تحلّ مشكلة واضحة للمستخدم.', years: 'سنوات خبرة', meet: 'تعرّف على الفريق', focus: 'المجالات اللي بشتغل فيها', focusIntro: 'من رسم مسار الاستخدام، لكتابة الكود، وربط أدوات الشغل ببعض.', idea: 'التصميم والتطوير من أول يوم', ideaText: 'لما التصميم والتنفيذ يمشوا مع بعض من البداية، نقدر نختبر الفكرة بدري ونحسم التفاصيل قبل ما إعادة الشغل تكلّف وقت أكتر.' },
    contact: { label: 'تواصل معنا', title: ['خلّينا نتكلم', 'عن مشروعك.'], text: 'محتاج موقع، تطبيق، أتمتة، أو هوية بصرية؟ احكِ لنا إيه اللي عايز تغيّره، حتى لو تفاصيل المشروع لسه مش كاملة.', noteTitle: 'إيه اللي يساعدنا نبدأ؟', noteText: 'شاركنا هدف المشروع، اللي هيستخدمه، وأي موعد مهم عندك. ولو لسه مش عارف تختار الخدمة، اختار «لسه مش محدد».', formTitle: 'نبذة عن مشروعك', formText: 'املأ البيانات التالية لإرسال استفسارك إلى صندوق رسائل ZUUN.', name: 'الاسم', namePlaceholder: 'اسمك الكامل', email: 'البريد الإلكتروني', service: 'الخدمة المطلوبة', choose: 'اختار الخدمة', unsure: 'لسه مش محدد', message: 'تفاصيل المشروع', messagePlaceholder: 'احكِ لنا عن الفكرة والنتيجة اللي عايز توصل لها…', privacy: 'نستخدم بياناتك للتواصل معك بشأن استفسارك فقط.', send: 'أرسل الاستفسار', sending: 'جاري الإرسال…', success: 'تم تسجيل استفسارك.', successText: 'وصلت رسالتك إلى صندوق استفسارات الموقع.', reference: 'رقم الاستفسار', another: 'أرسل استفسارًا آخر', invalid: 'راجع الاسم والبريد والخدمة. أضف نبذة عن مشروعك لا تقل عن 15 حرفًا.', limited: 'وصلتنا عدة محاولات في وقت قصير. جرّب مرة أخرى بعد قليل.', failed: 'لم يتم الإرسال. احتفظنا بما كتبته؛ جرّب مرة أخرى.' },
    footer: { intro: 'وكالة للتصميم والتطوير وبناء الأتمتة.', studio: 'الوكالة', disciplines: 'الخدمات', rights: 'ZUUN. جميع الحقوق محفوظة.', top: 'العودة لأعلى' },
    missing: { title: 'الصفحة غير موجودة.', text: 'يمكنك العودة للرئيسية أو استكشاف معرض الأعمال.' },
  },
  en: {
    skip: 'Skip to content', nav: 'Main navigation', menu: 'Menu', close: 'Close', language: 'التبديل إلى العربية', start: 'Start a project', gallery: 'Explore our work', allWork: 'All work', browse: 'View the portfolio', featured: 'Selected work', sample: 'Studio concept',
    editorial: { motion: 'Motion', auto: 'Auto', pause: 'Pause', language: 'Language', heroRail: 'Studio', heroArt: 'Interactive ZUUN wordmark that transforms as you scroll', heroTitle: 'Design. Develop. Automate.', heroDescription: 'Visual identities, UI/UX, web development, AI automation, and mobile apps.', startScroll: 'Explore the studio', statement: ['We build digital experiences', 'that work the way people expect.'], disciplines: 'Five disciplines. One team.', projectLabel: 'Interactive portfolio', projectTitle: 'Design in motion.', projectIntro: 'From web dashboards and mobile apps to visual identities. Rotate a model and look inside the concept.', next: 'Next concept', previous: 'Previous concept', viewCase: 'View concept', stageNote: 'Drag the model to rotate', touchOrbit: 'Rotate model', carouselSwipe: 'Swipe to browse', index: 'Studio Index', process: 'Our process', ending: 'What’s next?' },
    scene: { pause: 'Pause motion', play: 'Play motion', core: 'ZUUN 3D core', drag: 'Drag to rotate', help: 'Drag to rotate the model. You can also use the arrow keys or press Home to reset the angle.', explode: 'Separate layers', assemble: 'Assemble layers', reset: 'Reset the model', project: '3D model', founder: 'Founder’s 3D identity', signal: 'Project inquiry channel', received: 'Inquiry recorded' },
    hero: { label: 'Independent Digital Studio', title: ['Digital experiences.', 'Built to go further.'], description: 'We design and build websites, mobile apps, and AI-powered workflows. One team from the first idea to launch.' },
    about: { label: 'About ZUUN', title: 'From idea to launch.', intro: 'ZUUN is a digital agency bringing design, development, and automation together. We start with your goal and your users’ needs, then decide what’s worth building first.' },
    homeWork: { label: 'From the studio', description: 'A look at how we approach design and development, from analytics dashboards to online storefronts.' },
    numbers: { label: 'Studio snapshot', title: 'ZUUN in numbers.', text: 'A quick look at the team and the work on display.', units: ['Portfolio concepts', 'Team members', 'Client count', 'Client reviews'], notes: ['Illustrative work in the gallery', 'Current team', 'Not yet published', 'Not yet published'] },
    why: { label: 'How we work', title: 'Why choose ZUUN?', text: 'Move quickly, get the details right, and know why each decision was made.' },
    cta: { label: 'Next step', title: 'Have an idea worth building?', text: 'Tell us about it, and we’ll work out together what your project needs to get started.', button: 'Tell us about your project' },
    work: { label: 'The portfolio', title: ['Ideas made', 'visible.'], text: 'Explore our front-end, UI/UX, automation, mobile, and visual identity concepts. The gallery shows studio explorations, not commissioned client work.', filter: 'Filter work by discipline', count: 'Concepts shown', brief: 'The idea', scope: 'Scope of the concept', palette: 'Identity palette', typefaces: 'Typefaces', identityAsk: 'Start a visual identity project', ask: 'Discuss a similar idea' },
    team: { label: 'The people', title: ['Small team.', 'Complementary skills.'], text: 'Three people working across design, development, and visual content to keep each project consistent from the first screen to the final frame.', people: 'The ZUUN team', founderLink: 'Meet the founder', how: 'How we work together', details: 'We agree on the project’s goals with you first. Then we divide the work by specialty and review design, code, and content together before handoff.' },
    founder: { label: 'Founder / ZUUN', title: 'Mohamed Omran', role: 'ZUUN Founder · Digital Product Design & Development', text: 'I’m Mohamed Omran. I’ve spent more than 10 years working in design, web development, and automation. I started ZUUN to bring those disciplines together and build products that solve a clear problem for the people using them.', years: 'Years of experience', meet: 'Meet the team', focus: 'What I work on', focusIntro: 'From mapping the user journey to writing code and connecting the tools people work with.', idea: 'Design and development from day one', ideaText: 'Keeping design and implementation close from the start makes it easier to test an idea early and settle details before rework gets expensive.' },
    contact: { label: 'Get in touch', title: ['Let’s talk about', 'your project.'], text: 'Need a website, an app, an automated workflow, or a visual identity? Tell us what you want to change, even if the details aren’t set yet.', noteTitle: 'What helps us get started?', noteText: 'Share the goal, who it’s for, and any important deadlines. If you’re not sure which service you need, select “Not sure yet.”', formTitle: 'Project inquiry', formText: 'Fill in the details below to send your inquiry to the ZUUN inbox.', name: 'Name', namePlaceholder: 'Your full name', email: 'Email', service: 'Service of interest', choose: 'Choose a service', unsure: 'Not sure yet', message: 'Project details', messagePlaceholder: 'Tell us about the idea and what you want it to achieve…', privacy: 'We’ll use your details only to respond to your inquiry.', send: 'Send inquiry', sending: 'Sending…', success: 'Your inquiry was recorded.', successText: 'Your message reached the website’s inquiry inbox.', reference: 'Inquiry reference', another: 'Send another inquiry', invalid: 'Check your name, email, and service. Add at least 15 characters about your project.', limited: 'There have been several attempts in a short time. Please try again later.', failed: 'We couldn’t send your inquiry. Your draft is still here; please try again.' },
    footer: { intro: 'A digital agency for design, development, and automation.', studio: 'Studio', disciplines: 'Disciplines', rights: 'ZUUN. All rights reserved.', top: 'Back to top' },
    missing: { title: 'Page not found.', text: 'Head back home or explore the portfolio.' },
  },
};
