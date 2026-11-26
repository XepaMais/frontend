import { Route } from 'react-router-dom';
import Admin from '@/modulos/admin/paginas/Admin';

// Acessado só por /admin (sem link no site).
export const rotasAdmin = [<Route key="admin" path="/admin" element={<Admin />} />];
