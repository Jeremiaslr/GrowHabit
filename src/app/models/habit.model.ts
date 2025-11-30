export type HabitFrequencyType =
  | 'daily'
  | 'weekly'
  | 'specificDays'
  | 'weekends'
  | 'weekdays';

export type HabitSpecificDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface HabitFrequency {
  type: HabitFrequencyType;
  // Número objetivo de días por semana cuando se selecciona la opción semanal
  daysPerWeek?: number;
  // Días específicos seleccionados cuando se marca la opción de días concretos
  selectedDays?: HabitSpecificDay[];
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  // Duración opcional del hábito en minutos
  durationMinutes?: number;
  // Categoría/etiqueta opcional para agrupar hábitos
  category?: string;
  completed: boolean;
  createdAt: Date;
  completedDates: Date[];
  // Configuración elegida para la frecuencia del hábito
  frequency?: HabitFrequency;
}

export interface HabitCategoryOption {
  label: string;
  emoji: string;
}

export interface HabitCategoryGroup {
  title: string;
  categories: HabitCategoryOption[];
}

export const HABIT_CATEGORY_GROUPS: HabitCategoryGroup[] = [
  {
    title: 'Categorías generales',
    categories: [
      { label: 'Salud', emoji: '💪' },
      { label: 'Productividad', emoji: '📈' },
      { label: 'Bienestar', emoji: '🌱' },
      { label: 'Estudio', emoji: '📚' },
      { label: 'Finanzas', emoji: '💰' },
      { label: 'Trabajo', emoji: '💼' },
      { label: 'Casa / Hogar', emoji: '🏡' },
      { label: 'Personal', emoji: '🧍' },
      { label: 'Creatividad', emoji: '🎨' },
      { label: 'Social', emoji: '🤝' },
      { label: 'Desarrollo personal', emoji: '🚀' }
    ]
  },
  {
    title: 'Categorías de salud y fitness',
    categories: [
      { label: 'Entrenamiento', emoji: '🏋️' },
      { label: 'Cardio', emoji: '🏃' },
      { label: 'Fuerza', emoji: '💪' },
      { label: 'Movilidad / Estiramientos', emoji: '🤸' },
      { label: 'Yoga / Pilates', emoji: '🧘' },
      { label: 'Nutrición', emoji: '🥗' },
      { label: 'Hidratación', emoji: '💧' },
      { label: 'Sueño / Descanso', emoji: '😴' },
      { label: 'Peso / Composición corporal', emoji: '⚖️' },
      { label: 'Salud mental', emoji: '🧠' },
      { label: 'Cuidado personal (skincare, higiene, etc.)', emoji: '🧴' }
    ]
  },
  {
    title: 'Categorías de productividad',
    categories: [
      { label: 'Organización', emoji: '🗂️' },
      { label: 'Planificación diaria', emoji: '🗓️' },
      { label: 'Rutina de mañana', emoji: '🌅' },
      { label: 'Rutina de noche', emoji: '🌙' },
      { label: 'Tareas del hogar', emoji: '🧽' },
      { label: 'Gestión del tiempo', emoji: '⏱️' },
      { label: 'Profesional / Trabajo', emoji: '💼' },
      { label: 'Concentración / Deep Work', emoji: '🎯' },
      { label: 'Lectura profesional', emoji: '📖' },
      { label: 'Aprender habilidades', emoji: '🛠️' },
      { label: 'Side Projects', emoji: '💡' }
    ]
  },
  {
    title: 'Categorías de aprendizaje',
    categories: [
      { label: 'Lectura', emoji: '📚' },
      { label: 'Idiomas', emoji: '🗣️' },
      { label: 'Tocar un instrumento', emoji: '🎸' },
      { label: 'Cursos online', emoji: '💻' },
      { label: 'Estudio académico', emoji: '🏫' },
      { label: 'Práctica de programación', emoji: '👨‍💻' },
      { label: 'Escritura', emoji: '✍️' },
      { label: 'Memorización / Flashcards', emoji: '🧠' }
    ]
  },
  {
    title: 'Categorías de bienestar y mentalidad',
    categories: [
      { label: 'Meditación', emoji: '🧘' },
      { label: 'Diario / Journaling', emoji: '📓' },
      { label: 'Gratitud', emoji: '🙏' },
      { label: 'Mindfulness', emoji: '🌼' },
      { label: 'Hábitos emocionales', emoji: '💖' },
      { label: 'Desintoxicación digital', emoji: '📵' },
      { label: 'Autoestima', emoji: '🌟' }
    ]
  },
  {
    title: 'Categorías financieras',
    categories: [
      { label: 'Ahorro', emoji: '💵' },
      { label: 'Inversiones', emoji: '📈' },
      { label: 'Control de gastos', emoji: '🧾' },
      { label: 'No gastar en X', emoji: '🚫' },
      { label: 'Finanzas personales', emoji: '💳' },
      { label: 'Revisión semanal de cuentas', emoji: '🗃️' }
    ]
  },
  {
    title: 'Categorías hogar y vida personal',
    categories: [
      { label: 'Limpieza', emoji: '🧼' },
      { label: 'Orden', emoji: '🗂️' },
      { label: 'Cocina', emoji: '🍳' },
      { label: 'Mascotas', emoji: '🐾' },
      { label: 'Jardinería', emoji: '🌿' },
      { label: 'Lavandería', emoji: '🧺' },
      { label: 'Compras', emoji: '🛒' },
      { label: 'Cuidado del hogar', emoji: '🛠️' }
    ]
  },
  {
    title: 'Categorías sociales',
    categories: [
      { label: 'Mantener contacto', emoji: '☎️' },
      { label: 'Familia', emoji: '👨‍👩‍👧‍👦' },
      { label: 'Pareja', emoji: '💞' },
      { label: 'Amistades', emoji: '🤗' },
      { label: 'Networking', emoji: '🤝' }
    ]
  },
  {
    title: 'Categorías especializadas',
    categories: [
      { label: 'Salud mental masculina/femenina', emoji: '🧠' },
      { label: 'Rutinas deportivas específicas (pierna, pecho, movilidad, core...)', emoji: '🏃‍♂️' },
      { label: 'Ejercicios de fisioterapia', emoji: '🩺' },
      { label: 'Aficiones: fotografía, pintura, modelado 3D, música', emoji: '🎨' },
      { label: 'Road to 10k pasos', emoji: '👟' },
      { label: 'Camino al objetivo X (ej. "Bajar grasa", "Subir masa muscular")', emoji: '🎯' },
      { label: 'Hábitos de mantenimiento físico: movilidad de cadera, rehabilitación, etc.', emoji: '🦵' },
      { label: 'Hábitos espirituales (si aplica)', emoji: '🕯️' },
      { label: 'Desintoxicación digital', emoji: '📵' },
      { label: 'Escritorio limpio', emoji: '🧽' },
      { label: 'Revisión semanal', emoji: '📋' },
      { label: 'Limpieza mental (inbox cero)', emoji: '🗑️' }
    ]
  }
];

export const HABIT_CATEGORY_EMOJIS: Record<string, string> = HABIT_CATEGORY_GROUPS.reduce(
  (acc, group) => {
    group.categories.forEach(category => {
      acc[category.label] = category.emoji;
    });
    return acc;
  },
  {} as Record<string, string>
);

export function getHabitCategoryEmoji(category?: string): string {
  if (!category) {
    return '🏷️';
  }
  return HABIT_CATEGORY_EMOJIS[category] ?? '🏷️';
}

