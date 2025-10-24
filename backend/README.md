Installation des dépendance
npm install express mysql2 bcrypt jsonwebtoken dotenv


INSERT INTO categories (nom, description) VALUES
('Littérature classique', 'Livres classiques de la littérature mondiale'),
('Science-fiction', 'Romans de science-fiction et dystopie'),
('Jeunesse', 'Livres pour enfants et adolescents');

INSERT INTO ouvrages (titre, auteur, isbn, description, prix, stock, categorie_id) VALUES
('Le Petit Prince', 'Antoine de Saint-Exupéry', '9782070612758', 'Un conte poétique et philosophique pour tous les âges.', 12.99, 50, 1),
('1984', 'George Orwell', '9780451524935', 'Un roman dystopique sur la surveillance et le totalitarisme.', 15.50, 30, 2),
('Harry Potter à l\'école des sorciers', 'J.K. Rowling', '9780747532743', 'Le premier tome des aventures de Harry Potter.', 20.00, 100, 3),
('Le Comte de Monte-Cristo', 'Alexandre Dumas', '9782070409349', 'Une histoire de vengeance et de justice.', 18.75, 25, 2),
('La Peste', 'Albert Camus', '9782070360427', 'Roman philosophique sur la condition humaine.', 14.20, 40, 2);


postman script:

https://.postman.co/workspace/Livres~8da73148-4307-4f33-9261-8b8ff8879a91/collection/39558089-9a63d76a-0cb4-401a-b446-ab1ae44d029a?action=share&creator=39558089&active-environment=39558089-449c2c56-bc66-49c2-bed1-eb5f2b7524ff