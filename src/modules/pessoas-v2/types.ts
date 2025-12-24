export interface PeopleKpiSummary {
  professionalsCount: number;
  activeGoals: number;
  averageAttendanceRate: number;
}

export interface ProfessionalCard {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  appointmentsThisMonth: number;
  revenueThisMonth: number;
  attendanceRate: number;
}

export interface ScheduleRow {
  id: string;
  professional: string;
  weekday: string;
  period: string;
}

export interface GoalRow {
  id: string;
  professional: string;
  goal: number;
  realized: number;
}
