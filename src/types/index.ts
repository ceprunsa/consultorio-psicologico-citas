// Tipos de usuario
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL?: string | null;
  role: "admin" | "coordinator" | "psychologist" | "user";
  createdAt?: string;
  createdBy?: string;
}

// Tipos para el contexto de autenticación
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
  isPsychologist: boolean;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<boolean>;
}

// Tipos para los hooks de usuarios
export interface UsersHookReturn {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  userByIdQuery: (id: string | undefined) => any;
  saveUser: (userData: Partial<User>) => void;
  updateUserRole: ({
    userId,
    newRole,
  }: {
    userId: string;
    newRole: "admin" | "coordinator" | "psychologist" | "user";
  }) => void;
  deleteUser: (id: string) => void;
  isSaving: boolean;
  isUpdatingRole: boolean;
  isDeleting: boolean;
}

// Psicólogo
export interface Psychologist {
  id: string;
  fullName: string;
  dni: string;
  institutionalEmail: string;
  personalEmail: string;
  phone: string;
  userId?: string; // Referencia al usuario en caso de que tenga acceso al sistema
  createdAt: string;
  createdBy: string;
}

// Proceso CEPRUNSA
export interface Process {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

// Motivo de consulta
export interface ConsultationReason {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

// Cliente/Paciente (se incluye en la cita)
export interface Client {
  fullName: string;
  dni: string;
  situation: "ceprunsa" | "particular";
  phone: string;
  email: string;
}

// Cita psicológica
export interface Appointment {
  id: string;
  client: Client;
  processId?: string;
  processName?: string;
  reasonId: string;
  reasonName: string;
  /**
   * Fecha de la cita en formato YYYY-MM-DD (ISO 8601)
   * Se guarda en UTC para evitar problemas de zona horaria
   */
  date: string;
  /**
   * Hora de la cita en formato HH:MM (24h)
   */
  time: string;
  modality: "presential" | "virtual";
  location: string;
  psychologistId: string;
  psychologistName: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  diagnosis?: string;
  recommendations?: string;
  conclusions?: string;
  cancellationReason?: string;
  /**
   * Fecha y hora de creación en formato ISO 8601 completo
   */
  createdAt: string;
  createdBy: string;
  /**
   * Fecha y hora de última actualización en formato ISO 8601 completo
   */
  updatedAt?: string;
  updatedBy?: string;
}

// Hooks para psicólogos
export interface PsychologistsHookReturn {
  psychologists: Psychologist[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  psychologistByIdQuery: (id: string | undefined) => any;
  savePsychologist: (data: Partial<Psychologist>) => void;
  deletePsychologist: (id: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
}

// Hooks para procesos
export interface ProcessesHookReturn {
  processes: Process[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  processByIdQuery: (id: string | undefined) => any;
  saveProcess: (data: Partial<Process>) => void;
  deleteProcess: (id: string) => void;
  toggleProcessStatus: (id: string, isActive: boolean) => void;
  isSaving: boolean;
  isDeleting: boolean;
  isToggling: boolean;
}

// Hooks para motivos de consulta
export interface ConsultationReasonsHookReturn {
  reasons: ConsultationReason[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  reasonByIdQuery: (id: string | undefined) => any;
  saveReason: (data: Partial<ConsultationReason>) => void;
  deleteReason: (id: string) => void;
  toggleReasonStatus: (id: string, isActive: boolean) => void;
  isSaving: boolean;
  isDeleting: boolean;
  isToggling: boolean;
}

// Hooks para citas
export interface AppointmentsHookReturn {
  appointments: Appointment[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  appointmentByIdQuery: (id: string | undefined) => any;
  saveAppointment: (data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (
    id: string,
    status: Appointment["status"],
    data?: Partial<Appointment>
  ) => void;
  isSaving: boolean;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
  // Filtros
  filterByPsychologist: (psychologistId: string) => Appointment[];
  filterByDateRange: (startDate: string, endDate: string) => Appointment[];
  filterByStatus: (status: Appointment["status"]) => Appointment[];
}
