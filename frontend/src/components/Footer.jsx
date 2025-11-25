import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-5 py-4 bg-light border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h6>Informations</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-decoration-none text-muted">À propos</a></li>
              <li><a href="#" className="text-decoration-none text-muted">Conditions générales</a></li>
              <li><a href="#" className="text-decoration-none text-muted">Politique de confidentialité</a></li>
              <li><a href="#" className="text-decoration-none text-muted">Mentions légales</a></li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Contacts</h6>
            <ul className="list-unstyled">
              <li className="text-muted">Email: contact@livresgourmands.net</li>
              <li className="text-muted">Téléphone: +33 1 23 45 67 89</li>
              <li className="text-muted">Adresse: 123 Rue des Livres, 75001 Paris</li>
            </ul>
          </div>
        </div>
        <hr />
        <div className="text-center">
          <small className="text-muted">© {new Date().getFullYear()} LivresGourmands.net - Tous droits réservés</small>
        </div>
      </div>
    </footer>
  )
}
