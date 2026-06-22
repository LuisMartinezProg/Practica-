// data.js — Contenido estático de la app: palabras, frases, logros, misiones, teclado.
// Todo el contenido está en español (variante latinoamericana neutra).

// ---------- Layout de teclado (para el Mapa de Errores) ----------
// Distribución QWERTY en español. Cada fila es un array de teclas físicas.
export const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];
export const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// ---------- Bancos de palabras ----------
export const WORDS_COMMON = [
  'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con',
  'no','una','su','al','lo','como','más','pero','sus','le','ya','o','este','sí',
  'porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta','hay',
  'donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra',
  'otros','ese','eso','ante','ellos','esto','antes','algunos','qué','unos','yo',
  'otro','otras','otra','él','tanto','esa','estos','mucho','nada','muchos','cual',
  'poco','ella','estas','algunas','algo','nosotros','mi','tú','ellas','ser','estar',
  'tener','hacer','decir','ir','ver','dar','saber','querer','llegar','pasar','deber',
  'poner','parecer','quedar','creer','hablar','llevar','dejar','seguir','encontrar',
  'llamar','venir','pensar','salir','volver','tomar','conocer','vivir','sentir',
  'tratar','mirar','contar','empezar','esperar','buscar','existir','entrar',
  'trabajar','escribir','perder','entender','pedir','recibir','recordar','terminar',
  'permitir','conseguir','comenzar','servir','sacar','necesitar','mantener',
  'resultar','leer','cambiar','crear','abrir','considerar','oír','ganar','formar',
  'traer','aceptar','explicar','preguntar','tocar','estudiar','correr','utilizar',
  'pagar','ayudar','gustar','jugar','escuchar','cumplir','ofrecer','descubrir',
  'intentar','usar','decidir','repetir','mostrar','soñar','casa','tiempo','vida',
  'mundo','mano','parte','día','agua','forma','trabajo','ojo','palabra','hombre',
  'mujer','número','año','grupo','problema','hecho','lugar','noche','familia',
  'gobierno','momento','historia','derecho','medio','padre','país','sistema',
  'programa','cuestión','ciudad','libro','punto','nivel','cabeza','idea','línea',
];

export const WORDS_HARD = [
  'arroz','carro','perro','guerra','águila','pingüino','llave','calle','amarillo',
  'caballo','ferrocarril','cigüeña','exquisito','excepción','construcción',
  'transporte','instrucción','extraño','pequeño','murciélago','desarrollo',
  'arrullo','subrayar','asfixiar','psicólogo','obstrucción','transcripción',
  'bilingüe','vergüenza','pingüinera','zarigüeya','quirúrgico','quórum',
  'inequívoco','paragüero','antigüedad','averigüe','güisqui','enredadera',
  'desenrollar','irreconocible','corresponsabilidad','perpendicularmente',
];

export const WORDS_LONG = [
  'extraordinario','responsabilidad','electrocardiograma','paralelepípedo',
  'desafortunadamente','internacionalización','desconsideradamente',
  'anticonstitucional','impresionantemente','sobrealimentación',
  'electroencefalograma','interdisciplinariedad','contrarrevolucionario',
  'incomprensiblemente','telecomunicaciones','reestructuración',
  'sobreabundantemente','característicamente','aproximadamente','administrativo',
];

export const PHRASES_SHORT = [
  'El café estaba frío esta mañana.',
  '¿Vienes a la fiesta el sábado?',
  'Necesito comprar pan y leche.',
  'La luna brilla sobre el mar.',
  'Hoy hace mucho calor en la ciudad.',
  'Mi celular se quedó sin batería.',
  'Vamos a llegar tarde al cine.',
  'El perro durmió todo el día.',
  'Quiero aprender a tocar guitarra.',
  '¿A qué hora abre la tienda?',
  'El examen fue más fácil de lo esperado.',
  'Tengo que estudiar para el parcial.',
  'La música japonesa me inspira mucho.',
  'Subí un nuevo video al canal.',
  'El bus pasó antes de lo previsto.',
  'Ayer llovió toda la tarde.',
  'Practica un poco cada día y mejorarás.',
  'La conexión a internet está lenta.',
  'Guardé el proyecto antes de cerrar.',
  'Esa canción me recuerda a un anime.',
];

export const PHRASES_LONG = [
  'La práctica constante es la clave para escribir más rápido en el celular. ' +
  'Al principio los dedos se sienten torpes, pero con el tiempo el cerebro aprende ' +
  'a anticipar la posición de cada letra en el teclado táctil, y la velocidad llega sola.',

  'En Barranquilla las tardes suelen ser calurosas y húmedas, por lo que mucha gente ' +
  'prefiere salir a caminar cuando el sol empieza a bajar. Las calles se llenan de vida, ' +
  'música y vendedores ambulantes ofreciendo jugos fríos en cada esquina.',

  'Aprender un nuevo idioma, como el japonés, exige mucha paciencia: primero los ' +
  'silabarios, después el vocabulario básico y, poco a poco, las estructuras gramaticales ' +
  'más complejas. Escuchar canciones y ver anime con subtítulos ayuda a acostumbrar el oído.',

  'Un buen desarrollador no es el que nunca comete errores, sino el que aprende a ' +
  'depurarlos con calma. Revisar la consola, leer el mensaje completo y probar cambios ' +
  'pequeños suele ser más efectivo que reescribir todo el código desde cero.',

  'La tecnología avanza tan rápido que cada año aparecen nuevas herramientas para crear ' +
  'aplicaciones sin necesidad de un computador potente. Hoy en día es posible programar, ' +
  'diseñar y publicar un proyecto completo usando apenas un teléfono y conexión a internet.',

  'Mantener una racha diaria de práctica, aunque sea de pocos minutos, suele rendir más ' +
  'que sesiones largas y esporádicas. La constancia entrena la memoria muscular de los ' +
  'dedos y reduce poco a poco la cantidad de errores al escribir.',

  'Antes de un examen importante conviene repasar los temas con ejemplos prácticos en ' +
  'lugar de memorizar definiciones sueltas. Explicar un concepto con tus propias palabras ' +
  'es una buena señal de que realmente lo entendiste y no solo lo recuerdas de memoria.',

  'Componer música electrónica desde cero implica decidir el tempo, elegir los ' +
  'instrumentos virtuales y construir la estructura de la canción paso a paso. Cada ' +
  'pequeño ajuste en el volumen o el ritmo puede cambiar por completo la sensación final.',
];

// ---------- Plantillas para generar números y símbolos en tiempo de ejecución ----------
export const NUMBER_TEMPLATES = [
  () => String(Math.floor(Math.random() * 9000) + 1000),
  () => (Math.random() * 100).toFixed(2),
  () => `${Math.floor(Math.random() * 90) + 10}%`,
  () => `$${(Math.floor(Math.random() * 900) + 10) * 100}`,
  () => {
    const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    return `${d}/${m}/2026`;
  },
  () => `+57 3${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
  () => `${Math.floor(Math.random() * 90 + 10)} + ${Math.floor(Math.random() * 90 + 10)} = ${Math.floor(Math.random() * 180 + 20)}`,
  () => `Cap. ${Math.floor(Math.random() * 20 + 1)}`,
  () => `${Math.floor(Math.random() * 9 + 1)}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')} p.m.`,
];

export const SYMBOL_SNIPPETS = [
  '¡Hola! ¿Cómo estás? Todo bien, ¿no?',
  'Precio: $45.000 (10% dcto.) — ¡aprovecha!',
  'Usuario: luis_99 / Clave: #Abc123!',
  'Lista: 1) pan, 2) leche; 3) huevos.',
  'E-mail: contacto@dominio.com — Tel: +57 (300) 123-4567',
  'Cita: 25/12/2026 @ 3:00 p.m.',
  'Total = (15 + 7) * 2 — ¿correcto?',
  'Hashtags: #typing #práctica #meta100ppm',
  'Ruta: /home/usuario/docs/archivo_final-v2.txt',
  'Nota: *importante* — revisar [sección 3].',
  '¿Vamos a las 5:30? ¡Sí, claro! — confirmado.',
  'Código: AB-12-XZ // estado: activo (✓)',
];

// ---------- Logros ----------
// check(ctx) recibe { profile, sessions, last, charStats, wordStats } y devuelve boolean.
export const ACHIEVEMENTS = [
  { id: 'primer_paso', name: 'Primer paso', desc: 'Completa tu primera sesión.', xp: 20,
    check: (c) => c.sessions.length >= 1 },
  { id: 'velocidad_20', name: 'Arrancando', desc: 'Alcanza 20 PPM en una sesión.', xp: 20,
    check: (c) => c.sessions.some(s => s.wpm >= 20) },
  { id: 'velocidad_40', name: 'Ritmo firme', desc: 'Alcanza 40 PPM en una sesión.', xp: 30,
    check: (c) => c.sessions.some(s => s.wpm >= 40) },
  { id: 'velocidad_60', name: 'Dedos veloces', desc: 'Alcanza 60 PPM en una sesión.', xp: 50,
    check: (c) => c.sessions.some(s => s.wpm >= 60) },
  { id: 'velocidad_80', name: 'Casi profesional', desc: 'Alcanza 80 PPM en una sesión.', xp: 70,
    check: (c) => c.sessions.some(s => s.wpm >= 80) },
  { id: 'velocidad_100', name: 'Manos de rayo', desc: 'Alcanza 100 PPM en una sesión.', xp: 100,
    check: (c) => c.sessions.some(s => s.wpm >= 100) },
  { id: 'precision_95', name: 'Puntería fina', desc: '95% de precisión en una sesión de 30s o más.', xp: 30,
    check: (c) => c.sessions.some(s => s.accuracy >= 95 && s.durationSec >= 30) },
  { id: 'precision_perfecta', name: 'Cero errores', desc: '100% de precisión en una sesión de 15s o más.', xp: 50,
    check: (c) => c.sessions.some(s => s.accuracy >= 100 && s.durationSec >= 15) },
  { id: 'racha_3', name: 'Tres días seguidos', desc: 'Consigue una racha de 3 días.', xp: 30,
    check: (c) => c.profile.streak >= 3 },
  { id: 'racha_7', name: 'Una semana completa', desc: 'Consigue una racha de 7 días.', xp: 60,
    check: (c) => c.profile.streak >= 7 },
  { id: 'racha_30', name: 'Hábito de hierro', desc: 'Consigue una racha de 30 días.', xp: 200,
    check: (c) => c.profile.streak >= 30 },
  { id: 'sesiones_10', name: 'Calentando motores', desc: 'Completa 10 sesiones en total.', xp: 30,
    check: (c) => c.sessions.length >= 10 },
  { id: 'sesiones_50', name: 'Veterano del teclado', desc: 'Completa 50 sesiones en total.', xp: 80,
    check: (c) => c.sessions.length >= 50 },
  { id: 'sesiones_100', name: 'Maestro de la práctica', desc: 'Completa 100 sesiones en total.', xp: 150,
    check: (c) => c.sessions.length >= 100 },
  { id: 'maratonista', name: 'Maratonista', desc: 'Escribe más de 500 caracteres en Modo Libre.', xp: 50,
    check: (c) => c.sessions.some(s => s.mode === 'free' && s.charsTyped >= 500) },
  { id: 'domina_numeros', name: 'Numérico', desc: '95% de precisión en un ejercicio de números.', xp: 40,
    check: (c) => c.sessions.some(s => s.exerciseType === 'numbers' && s.accuracy >= 95) },
  { id: 'domina_simbolos', name: 'Maestro de símbolos', desc: '95% de precisión en un ejercicio de símbolos.', xp: 40,
    check: (c) => c.sessions.some(s => s.exerciseType === 'symbols' && s.accuracy >= 95) },
  { id: 'explorador', name: 'Explorador', desc: 'Prueba los 6 tipos de ejercicio.', xp: 50,
    check: (c) => new Set(c.sessions.map(s => s.exerciseType)).size >= 6 },
  { id: 'personalizador', name: 'A mi medida', desc: 'Crea tu primera lista de palabras personalizada.', xp: 20,
    check: (c) => c.profile.hasCustomWords === true },
  { id: 'cazador_errores', name: 'Cazador de errores', desc: 'Usa la práctica enfocada del Mapa de Errores.', xp: 30,
    check: (c) => c.sessions.some(s => s.exerciseType === 'focus') },
  { id: 'madrugador', name: 'Madrugador', desc: 'Practica antes de las 6:00 a.m.', xp: 20,
    check: (c) => c.sessions.some(s => new Date(s.date).getHours() < 6) },
  { id: 'nocturno', name: 'Búho nocturno', desc: 'Practica después de medianoche.', xp: 20,
    check: (c) => c.sessions.some(s => new Date(s.date).getHours() >= 0 && new Date(s.date).getHours() < 4) },
];

// ---------- Plantillas de misiones semanales ----------
export const MISSION_TEMPLATES = [
  { id: 'mision_sesiones', desc: (n) => `Completa ${n} sesiones esta semana`, metric: 'sessions',
    target: (avgWpm, rnd) => 3 + Math.floor(rnd() * 4), xp: 40 },
  { id: 'mision_palabras', desc: (n) => `Escribe ${n} palabras en total esta semana`, metric: 'words',
    target: (avgWpm, rnd) => 300 + Math.floor(rnd() * 500), xp: 40 },
  { id: 'mision_precision', desc: (n) => `Logra ${n}% de precisión promedio esta semana`, metric: 'accuracy',
    target: (avgWpm, rnd) => 88 + Math.floor(rnd() * 8), xp: 40 },
  { id: 'mision_constancia', desc: (n) => `Practica en ${n} días distintos esta semana`, metric: 'days',
    target: (avgWpm, rnd) => 3 + Math.floor(rnd() * 3), xp: 50 },
  { id: 'mision_numeros', desc: (n) => `Completa ${n} ejercicios de números`, metric: 'numberEx',
    target: (avgWpm, rnd) => 2 + Math.floor(rnd() * 3), xp: 30 },
  { id: 'mision_simbolos', desc: (n) => `Completa ${n} ejercicios de símbolos`, metric: 'symbolEx',
    target: (avgWpm, rnd) => 2 + Math.floor(rnd() * 3), xp: 30 },
  { id: 'mision_velocidad', desc: (n) => `Supera ${n} PPM en alguna sesión`, metric: 'maxWpm',
    target: (avgWpm) => Math.round((avgWpm || 15) + 8), xp: 50 },
];

// ---------- Plantillas de desafío diario ----------
export const DAILY_CHALLENGE_TEMPLATES = [
  { id: 'reto_precision', desc: (n) => `Completa una sesión de 60s con al menos ${n}% de precisión`, xp: 30,
    target: (avgWpm, rnd) => 90 + Math.floor(rnd() * 8) },
  { id: 'reto_numeros', desc: () => 'Completa un ejercicio de números con al menos 90% de precisión', xp: 25,
    target: () => 90 },
  { id: 'reto_simbolos', desc: () => 'Completa un ejercicio de símbolos con al menos 90% de precisión', xp: 25,
    target: () => 90 },
  { id: 'reto_velocidad', desc: (n) => `Alcanza ${n} PPM en una sesión de frases`, xp: 35,
    target: (avgWpm) => Math.round((avgWpm || 15) + 5) },
  { id: 'reto_constancia', desc: () => 'Completa 3 sesiones hoy', xp: 30, target: () => 3 },
  { id: 'reto_perfecto', desc: () => 'Consigue una sesión corta (15s o más) con 100% de precisión', xp: 35, target: () => 100 },
];
