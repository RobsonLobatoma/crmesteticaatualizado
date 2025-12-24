-- Insert sample professionals
INSERT INTO public.professionals (user_id, name, role, color, is_active) VALUES
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Dra. Marina Silva', 'Dermatologista', '#3B82F6', true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Dr. Carlos Mendes', 'Cirurgião Plástico', '#10B981', true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Ana Paula Costa', 'Esteticista', '#F59E0B', true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Juliana Ferreira', 'Fisioterapeuta', '#EC4899', true);

-- Insert sample services
INSERT INTO public.services (user_id, name, price, duration_minutes, is_active) VALUES
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Limpeza de Pele', 150.00, 60, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Peeling Químico', 280.00, 45, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Botox', 800.00, 30, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Preenchimento Labial', 1200.00, 45, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Drenagem Linfática', 180.00, 60, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Massagem Modeladora', 200.00, 60, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Microagulhamento', 450.00, 90, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Consulta Avaliação', 0.00, 30, true);

-- Insert sample rooms
INSERT INTO public.rooms (user_id, name, capacity, is_active) VALUES
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Sala 1 - Procedimentos', 2, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Sala 2 - Massagem', 1, true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Sala 3 - Consultas', 3, true);

-- Insert sample equipments
INSERT INTO public.equipments (user_id, name, is_active) VALUES
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Laser CO2', true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Dermapen', true),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Radiofrequência', true);

-- Insert sample clients
INSERT INTO public.clients (user_id, name, phone, email, cpf, birth_date) VALUES
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Maria Oliveira Santos', '11987654321', 'maria.oliveira@email.com', '123.456.789-00', '1985-03-15'),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Fernanda Almeida Costa', '11976543210', 'fernanda.costa@email.com', '234.567.890-11', '1990-07-22'),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Beatriz Lima Pereira', '11965432109', 'beatriz.lima@email.com', '345.678.901-22', '1988-11-08'),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Camila Rodrigues Silva', '11954321098', 'camila.rodrigues@email.com', '456.789.012-33', '1992-05-30'),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Patrícia Souza Martins', '11943210987', 'patricia.souza@email.com', '567.890.123-44', '1983-09-12'),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Luciana Ferreira Gomes', '11932109876', 'luciana.gomes@email.com', '678.901.234-55', '1995-01-25'),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Amanda Nascimento', '11921098765', 'amanda.nascimento@email.com', '789.012.345-66', '1987-12-03'),
('2f39abf1-97c3-4d85-9eca-894485f244e5', 'Renata Barbosa Dias', '11910987654', 'renata.barbosa@email.com', '890.123.456-77', '1991-06-18');