import { Route } from 'react-router-dom';
import Admin from '@/modulos/admin/paginas/Admin';

// Painel interno: acessado só digitando /admin na barra de endereço (sem link no site).
export const rotasAdmin = [<Route key="admin" path="/admin" element={<Admin />} />];
