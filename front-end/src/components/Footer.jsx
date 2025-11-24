import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-5 py-4 bg-light">
      <div className="container text-center">
        <small>© {new Date().getFullYear()} Bookstore</small>
      </div>
    </footer>
  )
}
