export interface Config {
  // General
  show_console: boolean;
  server_allowed_role: string;

  // Server Logging
  server_log: boolean;
  server_log_speed: number; // In seconds
  server_log_lines: number;
  server_log_channel: string;

  // Auto Restarting
  auto_restart: boolean;
  auto_restart_timing: string[]; // "HH:MM" 24-hour format
  auto_restart_countdown_options: CountdownOption[];

  // Backups
  auto_backup: boolean;
  auto_backup_speed: number; // In minutes
  auto_backup_retention: number;
}
export interface Backup {
  id: string;
  name?: string;
  protected: boolean;
  created_at: Date;
}

export interface CountdownOption {
  delay: number; // Seconds
  commands?: string[];
}
