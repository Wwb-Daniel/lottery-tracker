import Link from 'next/link';
import { Ticket } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">Lottery Tracker</span>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Datos obtenidos de <a href="https://www.loteriasdominicanas.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">loteriasdominicanas.com</a></p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 text-sm text-muted-foreground">
            <Link href="/privacidad" className="hover:text-primary">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-primary">
              Términos
            </Link>
            <Link href="/contacto" className="hover:text-primary">
              Contacto
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lottery Tracker. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;