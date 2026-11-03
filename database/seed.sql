SET NAMES utf8mb4;
INSERT INTO objetivos VALUES (1,'Emagrecer'),(2,'Ganhar massa muscular'),(3,'Manter e melhorar o condicionamento');
INSERT INTO exercicios (nome,grupo_muscular,equipamento) VALUES
('Agachamento livre','Pernas','Peso corporal'),
('Supino reto','Peito','Barra e banco'),
('Remada com halteres','Costas','Halteres'),
('Desenvolvimento com halteres','Ombros','Halteres'),
('Rosca direta','Bíceps','Barra'),
('Tríceps na polia','Tríceps','Polia'),
('Flexão de braços','Peito','Peso corporal'),
('Avanço','Pernas','Peso corporal'),
('Elevação de panturrilha','Panturrilhas','Peso corporal'),
('Puxada frontal','Costas','Polia'),
('Levantamento terra','Posteriores','Barra'),
('Abdominal curto','Abdômen','Colchonete');
-- Valores por 100 g de parte comestível; ID original da TACO 4ª edição (2011).
INSERT INTO alimentos VALUES
(3,'Arroz, tipo 1, cozido',128,2.5,28.1,0.2,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf'),
(182,'Banana, prata, crua',98,1.3,26,0.1,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf');
INSERT INTO dicas (objetivo_id,titulo,conteudo,categoria,fonte) VALUES
(1,'Força também faz parte','Inclua fortalecimento na rotina, com orientação para adaptar os exercícios.','Treino','https://www.who.int/news-room/fact-sheets/detail/physical-activity'),
(1,'Movimente o dia','Caminhar e pedalar também contam como atividade física.','Rotina','https://www.who.int/news-room/fact-sheets/detail/physical-activity'),
(1,'Variedade no prato','Uma alimentação variada ajuda a atender necessidades de nutrientes.','Alimentação','https://www.who.int/news-room/fact-sheets/detail/healthy-diet'),
(1,'Encontre regularidade','Escolha atividades que consiga repetir ao longo da semana.','Consistência','https://www.who.int/news-room/fact-sheets/detail/physical-activity'),
(2,'Registre seu treino','Acompanhar as sessões ajuda a organizar uma rotina de fortalecimento.','Treino','https://www.who.int/news-room/fact-sheets/detail/physical-activity'),
(2,'Aprenda os movimentos','Busque orientação qualificada para adaptar sua prática e execução.','Execução','https://www.who.int/news-room/fact-sheets/detail/physical-activity'),
(2,'Proteínas na alimentação','Proteínas participam da construção e manutenção de estruturas do corpo.','Alimentação','https://www.who.int/news-room/fact-sheets/detail/healthy-diet'),
(2,'Organize suas refeições','Combine variedade e equilíbrio na organização alimentar.','Rotina','https://www.who.int/news-room/fact-sheets/detail/healthy-diet'),
(3,'Combine atividades','Uma rotina pode reunir atividades aeróbicas e fortalecimento.','Condicionamento','https://www.who.int/news-room/fact-sheets/detail/physical-activity'),
(3,'Comece pelo possível','Alguma atividade é melhor que nenhuma. Avance conforme sua condição.','Consistência','https://www.who.int/news-room/fact-sheets/detail/physical-activity'),
(3,'Varie suas escolhas','Diversifique os alimentos respeitando sua cultura e disponibilidade.','Alimentação','https://www.who.int/news-room/fact-sheets/detail/healthy-diet'),
(3,'Mais movimento','Reduza períodos prolongados sentado com oportunidades de movimento.','Hábitos','https://www.who.int/news-room/fact-sheets/detail/physical-activity');

INSERT INTO alimentos VALUES
(163,'Abacate, cru',96,1.2,6,8.4,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf'),
(164,'Abacaxi, cru',48,0.9,12.3,0.1,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf'),
(469,'Queijo, ricota',140,12.6,3.8,8.1,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf'),
(488,'Ovo, de galinha, inteiro, cozido/10minutos',146,13.3,0.6,9.5,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf'),
(561,'Feijão, carioca, cozido',76,4.8,13.6,0.5,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf'),
(567,'Feijão, preto, cozido',77,4.5,14,0.5,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf'),
(577,'Lentilha, cozida',93,6.3,16.3,0.5,'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf');

INSERT INTO dicas (objetivo_id,titulo,conteudo,categoria,fonte) VALUES
(1,'Sono faz parte do cuidado','Reserve uma rotina regular para dormir e valorize a qualidade do sono.','Recuperação','https://www.cdc.gov/sleep/about/'),
(2,'Recuperar também é rotina','Sono de qualidade é parte do cuidado com seu corpo e seu bem-estar.','Recuperação','https://www.cdc.gov/sleep/about/'),
(2,'Progrida com orientação','Ajuste o estímulo de treino ao longo do tempo com orientação profissional, respeitando sua condição.','Progressão','https://acsm.org/resistance-training-guidelines-update-2026/'),
(3,'Movimento com qualidade','Converse com um profissional sobre mobilidade e movimentos adequados à sua rotina.','Mobilidade','https://www.who.int/news-room/fact-sheets/detail/physical-activity');
