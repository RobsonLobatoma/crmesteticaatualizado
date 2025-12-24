-- Insert default appointment form configuration
INSERT INTO app_settings (key, value) 
VALUES ('appointment_form_config', '{
  "fields": [
    {"id": "client", "label": "Cliente", "visible": true, "required": true, "order": 1},
    {"id": "service", "label": "Serviço", "visible": true, "required": true, "order": 2},
    {"id": "date", "label": "Data", "visible": true, "required": true, "order": 3},
    {"id": "time", "label": "Hora", "visible": true, "required": true, "order": 4},
    {"id": "duration", "label": "Duração", "visible": true, "required": false, "order": 5},
    {"id": "professional", "label": "Profissional", "visible": true, "required": true, "order": 6},
    {"id": "room", "label": "Sala", "visible": true, "required": false, "order": 7},
    {"id": "equipment", "label": "Equipamento", "visible": true, "required": false, "order": 8},
    {"id": "notes", "label": "Observação", "visible": true, "required": false, "order": 9},
    {"id": "recurrence", "label": "Repetir", "visible": true, "required": false, "order": 10},
    {"id": "status", "label": "Status", "visible": true, "required": false, "order": 11}
  ]
}'::jsonb)
ON CONFLICT (key) DO NOTHING;